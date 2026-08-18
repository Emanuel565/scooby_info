import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { ChatDrawer } from './components/ChatDrawer';
import { VoiceCallModal } from './components/VoiceCallModal';
import { OSDetailsModal } from './components/OSDetailsModal';
import { PrintTicketModal } from './components/PrintTicketModal';
import { OrdemServico } from './types';
import { Login } from './pages/Login';
import { AtendenteDashboard } from './pages/AtendenteDashboard';
import { GerenteKanban } from './pages/GerenteKanban';
import { TecnicoBancada } from './pages/TecnicoBancada';
import { TecnicoCelularHibrido } from './pages/TecnicoCelularHibrido';
import { AdminUsers } from './pages/AdminUsers';
import { AdminReports } from './pages/AdminReports';
import { AdminEstoque } from './pages/AdminEstoque';
import { PublicOSLookup } from './pages/PublicOSLookup';

// Layout protegido com Chat Drawer e Interfone de Voz Global
const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { socket } = useSocket();

  // Estados Globais de Chat e Interfone de Voz
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeVoiceCall, setActiveVoiceCall] = useState<{
    isIncoming: boolean;
    otherUser: { id: number; nome: string; cargo: string };
  } | null>(null);

  // Estados para abrir OS a partir do chat
  const [selectedOSModal, setSelectedOSModal] = useState<OrdemServico | null>(null);
  const [printOS, setPrintOS] = useState<OrdemServico | null>(null);

  // Escuta chamadas de voz recebidas e novas mensagens
  useEffect(() => {
    if (!socket || !user) return;

    const handleChamadaRecebida = (data: { callerId: number; callerName: string; callerCargo: string }) => {
      setActiveVoiceCall({
        isIncoming: true,
        otherUser: {
          id: data.callerId,
          nome: data.callerName,
          cargo: data.callerCargo
        }
      });
    };

    const handleNovaMensagem = (msg: any) => {
      if (!isChatOpen && msg.remetente_id !== user.id) {
        setUnreadChatCount(prev => prev + 1);
      }
    };

    socket.on('chamada:recebida', handleChamadaRecebida);
    socket.on('chat:nova_mensagem', handleNovaMensagem);

    return () => {
      socket.off('chamada:recebida', handleChamadaRecebida);
      socket.off('chat:nova_mensagem', handleNovaMensagem);
    };
  }, [socket, user, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadChatCount(0);
  };

  const handleStartVoiceCall = (targetUser: { id: number; nome: string; cargo: string }) => {
    setActiveVoiceCall({
      isIncoming: false,
      otherUser: targetUser
    });
  };

  const handleOpenOSFromChat = async (osId: number) => {
    try {
      const res = await fetch(`/api/os/${osId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok && data.os) {
        setSelectedOSModal(data.os);
      }
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white text-xs">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mr-3" />
        Carregando Scooby OS...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.cargo) && user.cargo !== 'ADMIN') {
    if (user.cargo === 'GERENTE') return <Navigate to="/gerente" replace />;
    if (user.cargo === 'ATENDENTE') return <Navigate to="/atendente" replace />;
    if (user.cargo === 'TECNICO') return <Navigate to="/tecnico" replace />;
    if (user.cargo === 'TECNICO_CELULAR') return <Navigate to="/celular-hibrido" replace />;
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar onOpenChat={handleOpenChat} unreadChatCount={unreadChatCount} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Drawer de Chat da Equipe */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenOSDetails={handleOpenOSFromChat}
        onStartVoiceCall={handleStartVoiceCall}
      />

      {/* Modal de Chamada de Voz e Interfone WebRTC */}
      <VoiceCallModal
        activeCall={activeVoiceCall}
        onClose={() => setActiveVoiceCall(null)}
      />

      {/* Modal de Detalhes da OS (quando clicado dentro do chat) */}
      {selectedOSModal && (
        <OSDetailsModal
          os={selectedOSModal}
          onClose={() => setSelectedOSModal(null)}
          onOpenPrint={(os) => setPrintOS(os)}
        />
      )}

      {/* Modal de Impressão de Comprovante */}
      {printOS && (
        <PrintTicketModal
          os={printOS}
          onClose={() => setPrintOS(null)}
        />
      )}
    </div>
  );
};

// Redirecionador da raiz '/' para a tela inicial adequada
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.cargo === 'GERENTE' || user.cargo === 'ADMIN') return <Navigate to="/gerente" replace />;
  if (user.cargo === 'TECNICO_CELULAR') return <Navigate to="/gerente" replace />;
  if (user.cargo === 'ATENDENTE') return <Navigate to="/atendente" replace />;
  if (user.cargo === 'TECNICO') return <Navigate to="/tecnico" replace />;

  return <Navigate to="/atendente" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/consulta" element={<PublicOSLookup />} />
            <Route path="/consulta/:codigo" element={<PublicOSLookup />} />
            
            <Route path="/" element={<RootRedirect />} />

            <Route
              path="/gerente"
              element={
                <ProtectedLayout allowedRoles={['GERENTE', 'ADMIN', 'TECNICO_CELULAR']}>
                  <GerenteKanban />
                </ProtectedLayout>
              }
            />

            <Route
              path="/atendente"
              element={
                <ProtectedLayout allowedRoles={['ATENDENTE', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR']}>
                  <AtendenteDashboard />
                </ProtectedLayout>
              }
            />

            <Route
              path="/tecnico"
              element={
                <ProtectedLayout allowedRoles={['TECNICO', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR']}>
                  <TecnicoBancada />
                </ProtectedLayout>
              }
            />

            <Route
              path="/celular-hibrido"
              element={
                <ProtectedLayout allowedRoles={['TECNICO_CELULAR', 'ADMIN', 'GERENTE']}>
                  <TecnicoCelularHibrido />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/usuarios"
              element={
                <ProtectedLayout allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/estoque"
              element={
                <ProtectedLayout allowedRoles={['ADMIN', 'GERENTE']}>
                  <AdminEstoque />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/relatorios"
              element={
                <ProtectedLayout allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;