import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, BellRing } from 'lucide-react';

interface VoiceCallModalProps {
  activeCall: {
    isIncoming: boolean;
    otherUser: { id: number; nome: string; cargo: string };
  } | null;
  onClose: () => void;
}

// Sintetizador de Som de Chamada / Toque via Web Audio API Nativo
const playRingtone = (isIncoming: boolean): (() => void) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return () => {};
    const audioCtx = new AudioContextClass();

    let isPlaying = true;

    const playCycle = () => {
      if (!isPlaying || audioCtx.state === 'closed') return;

      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      if (isIncoming) {
        // Toque de chamada recebida (Acorde harmônico Dó-Mi 523Hz + 659Hz)
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime);
      } else {
        // Tom de chamada saindo (Padrão telefônico 440Hz + 480Hz)
        osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(480, audioCtx.currentTime);
      }

      osc1.type = 'sine';
      osc2.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.20, audioCtx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.20, audioCtx.currentTime + 1.2);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.4);
      osc2.stop(audioCtx.currentTime + 1.4);

      if (isPlaying) {
        setTimeout(playCycle, 3000); // Repete a cada 3 segundos
      }
    };

    playCycle();

    return () => {
      isPlaying = false;
      try {
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      } catch {}
    };
  } catch {
    return () => {};
  }
};

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ activeCall, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const stopRingtoneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!activeCall || !socket || !user) return;

    const otherUserId = activeCall.otherUser.id;

    // Inicia som de toque / chamada
    stopRingtoneRef.current = playRingtone(activeCall.isIncoming);

    // Configura WebRTC Peer Connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    peerConnectionRef.current = pc;

    // Captura áudio do microfone local
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        if (!activeCall.isIncoming) {
          // Quem liga cria a oferta SDP
          pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
              socket.emit('chamada:iniciar', {
                toUserId: otherUserId,
                callerId: user.id,
                callerName: user.nome,
                callerCargo: user.cargo
              });
            })
            .catch(err => console.error('Erro ao criar oferta WebRTC:', err));
        }
      })
      .catch(err => {
        console.error('Erro ao acessar microfone:', err);
        alert('Não foi possível acessar o microfone para a chamada.');
        handleEndCall();
      });

    // Quando recebe áudio remoto
    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    // ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('chamada:signal', {
          toUserId: otherUserId,
          fromUserId: user.id,
          signal: { candidate: event.candidate }
        });
      }
    };

    // Listeners do Socket
    const handleChamadaAceita = async () => {
      if (stopRingtoneRef.current) {
        stopRingtoneRef.current();
        stopRingtoneRef.current = null;
      }
      setCallStatus('connected');
      // Inicia timer
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('chamada:signal', {
          toUserId: otherUserId,
          fromUserId: user.id,
          signal: { sdp: pc.localDescription }
        });
      } catch (err) {
        console.error('Erro ao sincronizar SDP:', err);
      }
    };

    const handleChamadaRecusada = () => {
      if (stopRingtoneRef.current) {
        stopRingtoneRef.current();
        stopRingtoneRef.current = null;
      }
      setCallStatus('ended');
      setTimeout(onClose, 1500);
    };

    const handleChamadaEncerrada = () => {
      if (stopRingtoneRef.current) {
        stopRingtoneRef.current();
        stopRingtoneRef.current = null;
      }
      setCallStatus('ended');
      setTimeout(onClose, 1000);
    };

    const handleChamadaSignal = async (data: { signal: any; fromUserId: number }) => {
      if (data.fromUserId !== otherUserId) return;

      if (data.signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
        if (data.signal.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('chamada:signal', {
            toUserId: otherUserId,
            fromUserId: user.id,
            signal: { sdp: pc.localDescription }
          });
        }
      } else if (data.signal.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        } catch (e) {}
      }
    };

    socket.on('chamada:aceita', handleChamadaAceita);
    socket.on('chamada:recusada', handleChamadaRecusada);
    socket.on('chamada:encerrada', handleChamadaEncerrada);
    socket.on('chamada:signal', handleChamadaSignal);

    return () => {
      socket.off('chamada:aceita', handleChamadaAceita);
      socket.off('chamada:recusada', handleChamadaRecusada);
      socket.off('chamada:encerrada', handleChamadaEncerrada);
      socket.off('chamada:signal', handleChamadaSignal);
      cleanupCall();
    };
  }, [activeCall, socket, user]);

  const cleanupCall = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleAcceptCall = () => {
    if (!socket || !activeCall || !user) return;
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    setCallStatus('connected');
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    socket.emit('chamada:aceitar', {
      toUserId: activeCall.otherUser.id,
      fromUserId: user.id
    });
  };

  const handleRejectCall = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    if (socket && activeCall && user) {
      socket.emit('chamada:recusar', {
        toUserId: activeCall.otherUser.id,
        fromUserId: user.id
      });
    }
    cleanupCall();
    onClose();
  };

  const handleEndCall = () => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
    if (socket && activeCall && user) {
      socket.emit('chamada:encerrar', {
        toUserId: activeCall.otherUser.id,
        fromUserId: user.id
      });
    }
    cleanupCall();
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <audio ref={remoteAudioRef} autoPlay />

      <div className="bg-navy-950 border border-brand-500/30 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Avatar e Status */}
        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-teal-400 mx-auto flex items-center justify-center shadow-glow-teal ring-4 ring-white/10 animate-pulse">
            <User className="w-10 h-10 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              {activeCall.otherUser.nome}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold uppercase tracking-wider">
              {activeCall.otherUser.cargo}
            </span>
          </div>

          <div className="text-sm font-medium text-brand-300">
            {callStatus === 'ringing' && (
              <div className="flex items-center justify-center gap-2 text-brand-300 animate-pulse font-semibold">
                <BellRing className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>
                  {activeCall.isIncoming ? '📞 Recebendo Interfone da Oficina...' : '⏳ Chamando técnico na bancada...'}
                </span>
              </div>
            )}
            {callStatus === 'connected' && (
              <span className="text-emerald-400 font-mono font-bold text-base flex items-center justify-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-bounce" />
                {formatTimer(callDuration)}
              </span>
            )}
            {callStatus === 'ended' && 'Chamada finalizada.'}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="relative z-10 flex items-center justify-center gap-4 pt-2">
          {callStatus === 'ringing' && activeCall.isIncoming ? (
            <>
              <button
                onClick={handleRejectCall}
                className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Recusar"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-glow-teal transition-transform hover:scale-110 cursor-pointer animate-bounce"
                title="Atender Chamada"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              {callStatus === 'connected' && (
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${isMuted ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title={isMuted ? 'Desmutar' : 'Mutar Microfone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Desligar"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
