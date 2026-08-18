import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notificacao, OrdemServico } from '../types';
import { soundEffects } from '../utils/audio';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notificacao[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  clearNotification: (id: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (user) {
        socketInstance.emit('auth:register', {
          userId: user.id,
          cargo: user.cargo
        });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('os:criada', (os: OrdemServico) => {
      triggerRefresh();
      if (soundEnabledRef.current) {
        soundEffects.playNewOS();
      }
    });

    socketInstance.on('os:atribuida', (data: { os: OrdemServico; mensagem: string; prioridade: string }) => {
      triggerRefresh();
      if (soundEnabledRef.current) {
        soundEffects.playAssigned();
      }
      setNotifications(prev => [
        {
          id: Date.now(),
          titulo: '🛠️ Nova OS na sua Bancada!',
          mensagem: data.mensagem,
          tipo: 'ATRIBUICAO',
          os_id: data.os.id,
          lida: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    });

    socketInstance.on('os:status_alterado', (data: { os: OrdemServico; logDescricao: string }) => {
      triggerRefresh();
      if (data.os.status === 'CONCLUIDO' && soundEnabledRef.current) {
        soundEffects.playSuccess();
      }
    });

    socketInstance.on('alerta:prazo_proximo', (data: { os_id: number; codigo_os: string; titulo: string; mensagem: string; isVencida: boolean }) => {
      if (soundEnabledRef.current) {
        soundEffects.playUrgent();
      }
      setNotifications(prev => [
        {
          id: Date.now(),
          titulo: data.titulo,
          mensagem: data.mensagem,
          tipo: 'ALERTA',
          os_id: data.os_id,
          lida: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    });

    socketInstance.on('notificacao:nova', (notif: any) => {
      setNotifications(prev => [
        {
          id: notif.id || Date.now(),
          titulo: notif.titulo,
          mensagem: notif.mensagem,
          tipo: notif.tipo || 'INFO',
          os_id: notif.os_id,
          lida: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, triggerRefresh]);

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        clearNotification,
        soundEnabled,
        setSoundEnabled,
        refreshTrigger,
        triggerRefresh
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket deve ser usado dentro de SocketProvider');
  return context;
};
