import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, prisma: PrismaClient): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Novo cliente conectado ao Socket.io: ${socket.id}`);

    // Cliente se registra com seu perfil e ID
    socket.on('auth:register', (data: { userId: number; cargo: string }) => {
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
      }
      if (data?.cargo) {
        socket.join(`role:${data.cargo}`);
      }
      console.log(`👤 Socket registrado: Usuário #${data?.userId} no cargo [${data?.cargo}]`);
    });

    // ==========================================
    // SINALIZAÇÃO DE VOZ (INTERFONE / WEBRTC)
    // ==========================================
    socket.on('chamada:iniciar', (data: { toUserId: number; callerName: string; callerCargo: string; callerId: number }) => {
      console.log(`📞 Chamada de voz iniciada por #${data.callerId} (${data.callerName}) para #${data.toUserId}`);
      io?.to(`user:${data.toUserId}`).emit('chamada:recebida', data);
    });

    socket.on('chamada:aceitar', (data: { toUserId: number; fromUserId: number }) => {
      console.log(`📞 Chamada aceita por #${data.fromUserId} para #${data.toUserId}`);
      io?.to(`user:${data.toUserId}`).emit('chamada:aceita', data);
    });

    socket.on('chamada:recusar', (data: { toUserId: number; fromUserId: number }) => {
      console.log(`📞 Chamada recusada por #${data.fromUserId}`);
      io?.to(`user:${data.toUserId}`).emit('chamada:recusada', data);
    });

    socket.on('chamada:encerrar', (data: { toUserId: number; fromUserId: number }) => {
      console.log(`📞 Chamada encerrada entre #${data.fromUserId} e #${data.toUserId}`);
      io?.to(`user:${data.toUserId}`).emit('chamada:encerrada', data);
    });

    socket.on('chamada:signal', (data: { toUserId: number; signal: any; fromUserId: number }) => {
      io?.to(`user:${data.toUserId}`).emit('chamada:signal', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  // Checagem periódica de prazos (a cada 5 minutos)
  setInterval(async () => {
    try {
      await checkDeadlines(prisma);
    } catch (e) {
      console.error('Erro ao verificar prazos periódicos:', e);
    }
  }, 5 * 60 * 1000);

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado!');
  }
  return io;
};

// Helpers de emissão
export const emitOSCreated = (os: any) => {
  if (!io) return;
  console.log(`📢 Emitindo evento 'os:criada' para ${os.codigo_os}`);
  io.emit('os:criada', os);
  // Notifica gerentes e admin
  io.to('role:GERENTE').to('role:ADMIN').emit('notificacao:nova', {
    titulo: 'Nova OS Recebida!',
    mensagem: `${os.codigo_os} - ${os.cliente_nome} (${os.marca_modelo}) em Triagem.`,
    tipo: 'INFO',
    os_id: os.id
  });
};

export const emitOSAssigned = (tecnicoId: number, os: any, nomeAtribuidor: string) => {
  if (!io) return;
  console.log(`📢 Emitindo evento 'os:atribuida' para Técnico #${tecnicoId} - OS: ${os.codigo_os}`);
  io.emit('os:atualizada', os);
  io.to(`user:${tecnicoId}`).emit('os:atribuida', {
    os,
    mensagem: `Você recebeu uma nova OS: ${os.codigo_os} (${os.marca_modelo}) atribuída por ${nomeAtribuidor}.`,
    prioridade: os.prioridade
  });
};

export const emitOSStatusChanged = (os: any, logDescricao: string) => {
  if (!io) return;
  console.log(`📢 Emitindo evento 'os:status_alterado' para ${os.codigo_os} -> ${os.status}`);
  io.emit('os:status_alterado', { os, logDescricao });
  io.emit('os:atualizada', os);
};

export const emitGeneralNotification = (userId: number | null, cargo: string | null, notificacao: any) => {
  if (!io) return;
  if (userId) {
    io.to(`user:${userId}`).emit('notificacao:nova', notificacao);
  } else if (cargo) {
    io.to(`role:${cargo}`).emit('notificacao:nova', notificacao);
  } else {
    io.emit('notificacao:nova', notificacao);
  }
};

// Verificação de prazos críticos (<24h ou vencidos)
export const checkDeadlines = async (prisma: PrismaClient) => {
  if (!io) return;
  const now = new Date();
  const em24Horas = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const osCriticas = await prisma.ordemServico.findMany({
    where: {
      status: {
        in: ['TRIAGEM', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES']
      },
      prazo_entrega: {
        lte: em24Horas
      }
    },
    include: {
      tecnico: true
    }
  });

  for (const os of osCriticas) {
    if (os.prazo_entrega) {
      const isVencida = new Date(os.prazo_entrega) < now;
      const titulo = isVencida ? '⚠️ OS com Prazo Vencido!' : '⏰ OS Próxima do Prazo!';
      const mensagem = `${os.codigo_os} (${os.marca_modelo}) do cliente ${os.cliente_nome} precisa de atenção!`;

      if (os.tecnico_id) {
        io.to(`user:${os.tecnico_id}`).emit('alerta:prazo_proximo', {
          os_id: os.id,
          codigo_os: os.codigo_os,
          titulo,
          mensagem,
          isVencida
        });
      }

      io.to('role:GERENTE').to('role:ADMIN').emit('alerta:prazo_proximo', {
        os_id: os.id,
        codigo_os: os.codigo_os,
        titulo,
        mensagem,
        isVencida
      });
    }
  }
};
