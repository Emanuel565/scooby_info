import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { OrdemServico } from '../types';
import { StatusBadge } from './Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  X, 
  Send, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Paperclip, 
  Phone, 
  Users, 
  MessageSquare, 
  Wrench, 
  Volume2,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOSDetails?: (osId: number) => void;
  onStartVoiceCall?: (targetUser: { id: number; nome: string; cargo: string }) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOpenOSDetails,
  onStartVoiceCall 
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeChannel, setActiveChannel] = useState<string>('GERAL'); // GERAL, BANCADA, DIRETO
  const [selectedUser, setSelectedUser] = useState<{ id: number; nome: string; cargo: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de Gravação de Áudio de Voz
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Estados de Reprodução de Áudio
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Estados de Vínculo de OS
  const [activeOSList, setActiveOSList] = useState<OrdemServico[]>([]);
  const [showOSSelector, setShowOSSelector] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Carrega lista de colaboradores
  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/chat/membros', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTeamMembers(data.usuarios || []);
      }
    } catch {}
  };

  // Carrega lista de OSs recentes para anexar
  const fetchRecentOS = async () => {
    try {
      const res = await fetch('/api/os', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveOSList(data.os || []);
      }
    } catch {}
  };

  // Carrega mensagens do canal ativo
  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = `/api/chat/mensagens?canal=${activeChannel}`;
      if (activeChannel === 'DIRETO' && selectedUser) {
        url += `&destinatarioId=${selectedUser.id}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.mensagens || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeam();
      fetchRecentOS();
      fetchMessages();
    }
  }, [isOpen, activeChannel, selectedUser]);

  // Listener para novas mensagens via Socket.io
  useEffect(() => {
    if (!socket || !user) return;

    const handleNovaMensagem = (msg: any) => {
      const isCurrentChannel = 
        (activeChannel === msg.canal && msg.canal !== 'DIRETO') ||
        (activeChannel === 'DIRETO' && selectedUser && (
          (msg.remetente_id === user.id && msg.destinatario_id === selectedUser.id) ||
          (msg.remetente_id === selectedUser.id && msg.destinatario_id === user.id)
        ));

      if (isCurrentChannel) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('chat:nova_mensagem', handleNovaMensagem);

    return () => {
      socket.off('chat:nova_mensagem', handleNovaMensagem);
    };
  }, [socket, activeChannel, selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar Mensagem de Texto
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedOS) return;

    const textToSend = inputText.trim();
    const osToSend = selectedOS;

    setInputText('');
    setSelectedOS(null);
    setShowOSSelector(false);

    try {
      await fetch('/api/chat/mensagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          conteudo: textToSend,
          tipo: 'TEXTO',
          canal: activeChannel,
          destinatario_id: activeChannel === 'DIRETO' ? selectedUser?.id : null,
          os_id: osToSend ? osToSend.id : null
        })
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // Iniciar Gravação de Áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          // Envia o áudio gravado
          await fetch('/api/chat/mensagens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
            },
            body: JSON.stringify({
              conteudo: '🎙️ Mensagem de Áudio',
              tipo: 'AUDIO',
              audio_url: base64Audio,
              audio_duracao: recordingSeconds,
              canal: activeChannel,
              destinatario_id: activeChannel === 'DIRETO' ? selectedUser?.id : null,
              os_id: selectedOS ? selectedOS.id : null
            })
          });
          setSelectedOS(null);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      alert('Não foi possível acessar o microfone para gravar áudio.');
    }
  };

  // Parar Gravação e Enviar
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Cancelar Gravação
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Tocar Áudio
  const togglePlayAudio = (msgId: number, audioUrl: string) => {
    if (playingAudioId === msgId) {
      currentAudioElementRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      currentAudioElementRef.current = audio;
      setPlayingAudioId(msgId);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-navy-950 border-l border-white/10 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
        
        {/* Header do Chat */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-navy-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                Scooby Chat & Interfone
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Comunicação direta balcão ↔ bancada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Canais e Colaboradores */}
        <div className="p-2 border-b border-white/10 bg-slate-950/60 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => { setActiveChannel('GERAL'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${activeChannel === 'GERAL' ? 'bg-brand-500 text-white shadow-glow-teal' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>#Geral</span>
          </button>

          <button
            onClick={() => { setActiveChannel('BANCADA'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${activeChannel === 'BANCADA' ? 'bg-brand-500 text-white shadow-glow-teal' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>#Bancada Técnica</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

          {/* Lista de Colaboradores para DM e Ligação */}
          {teamMembers.filter(m => m.id !== user?.id).map((member) => (
            <button
              key={member.id}
              onClick={() => { setActiveChannel('DIRETO'); setSelectedUser(member); }}
              className={`px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all whitespace-nowrap text-xs cursor-pointer ${activeChannel === 'DIRETO' && selectedUser?.id === member.id ? 'bg-teal-500 text-white font-bold' : 'bg-white/5 text-slate-300 hover:text-white'}`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{member.nome}</span>
            </button>
          ))}
        </div>

        {/* Topo do Canal Ativo */}
        <div className="px-4 py-2 bg-black/30 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Conversando em:</span>
            <strong className="text-white">
              {activeChannel === 'GERAL' && '📢 Canal Geral da Oficina'}
              {activeChannel === 'BANCADA' && '🔧 Suporte e Bancada Técnica'}
              {activeChannel === 'DIRETO' && selectedUser && `💬 ${selectedUser.nome} (${selectedUser.cargo})`}
            </strong>
          </div>

          {/* Botão de Chamada de Voz Direta */}
          {activeChannel === 'DIRETO' && selectedUser && onStartVoiceCall && (
            <button
              onClick={() => onStartVoiceCall(selectedUser)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Ligar para este colaborador via Interfone WebRTC"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>📞 Interfone</span>
            </button>
          )}
        </div>

        {/* Feed de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {loading ? (
            <div className="text-center text-slate-500 py-10">Carregando mensagens...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-500 py-10 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p>Nenhuma mensagem ainda neste canal.</p>
              <p className="text-[11px] text-slate-600">Envie uma mensagem ou grave um áudio para a equipe!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.remetente_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">
                      {isMe ? 'Você' : msg.remetente?.nome}
                    </span>
                    <span>•</span>
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl space-y-2 shadow-md ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {/* Mensagem de Áudio */}
                    {msg.tipo === 'AUDIO' && msg.audio_url ? (
                      <div className="flex items-center gap-2.5 py-0.5">
                        <button
                          onClick={() => togglePlayAudio(msg.id, msg.audio_url)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isMe
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-teal'
                          }`}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-semibold">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Mensagem de Voz</span>
                          </div>
                          <span className="text-[9px] opacity-80 block">
                            {msg.audio_duracao ? `${msg.audio_duracao}s` : 'Áudio gravado'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Mensagem de Texto */
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                    )}

                    {/* Card de OS Vinculada */}
                    {msg.os && (
                      <div
                        onClick={() => onOpenOSDetails && onOpenOSDetails(msg.os.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                          isMe
                            ? 'bg-black/30 border-white/20 hover:bg-black/40'
                            : 'bg-slate-950/80 border-brand-500/30 hover:border-brand-500/60'
                        }`}
                        title="Clique para abrir os detalhes desta OS"
                      >
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[10px] text-brand-300">
                              {msg.os.codigo_os}
                            </span>
                            <StatusBadge status={msg.os.status} />
                          </div>
                          <span className="text-[11px] font-semibold block text-white truncate max-w-[180px]">
                            {msg.os.marca_modelo}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Seletor Flutuante de OS para Vínculo */}
        {showOSSelector && (
          <div className="p-3 bg-navy-900 border-t border-white/10 space-y-2 text-xs animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Selecione uma OS para vincular:</span>
              <button onClick={() => setShowOSSelector(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {activeOSList.slice(0, 10).map((os) => (
                <button
                  key={os.id}
                  onClick={() => { setSelectedOS(os); setShowOSSelector(false); }}
                  className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-black/70 border border-white/5 flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-mono font-bold text-brand-300">{os.codigo_os}</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{os.marca_modelo}</span>
                  <span className="text-slate-500 text-[10px]">{os.cliente_nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card de OS Selecionada para envio */}
        {selectedOS && (
          <div className="px-4 py-2 bg-brand-950/60 border-t border-brand-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-slate-300">Vinculando:</span>
              <strong className="text-white font-mono">{selectedOS.codigo_os}</strong>
              <span className="text-slate-400 truncate max-w-[120px]">- {selectedOS.marca_modelo}</span>
            </div>
            <button onClick={() => setSelectedOS(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Barra de Digitação e Gravação de Áudio */}
        <div className="p-3 bg-navy-900 border-t border-white/10">
          {isRecording ? (
            /* Modo Gravação Ativo */
            <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs animate-pulse">
              <div className="flex items-center gap-2 text-rose-300 font-bold px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Gravando: {recordingSeconds}s</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Áudio</span>
                </button>
              </div>
            </div>
          ) : (
            /* Modo Digitação Normal */
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOSSelector(!showOSSelector)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${showOSSelector || selectedOS ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'}`}
                title="Vincular Ordem de Serviço"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={startRecording}
                className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                title="Gravar Mensagem de Áudio de Voz"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeChannel === 'GERAL' ? 'Mensagem para toda a oficina...' :
                  activeChannel === 'BANCADA' ? 'Dúvida para os técnicos...' :
                  `Mensagem para ${selectedUser?.nome}...`
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !selectedOS}
                className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition-all cursor-pointer shadow-glow-teal"
                title="Enviar Mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
