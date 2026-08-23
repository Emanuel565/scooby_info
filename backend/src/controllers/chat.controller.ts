import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { io } from '../server.js';

const prisma = new PrismaClient();

// Listar usuários da equipe para conversa direta e interfone
export const listTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        cargo: true,
        status: true,
        avatar: true
      },
      orderBy: { nome: 'asc' }
    });

    res.json({ usuarios });
  } catch (error) {
    console.error('Erro ao listar equipe para o chat:', error);
    res.status(500).json({ error: 'Erro ao carregar colaboradores.' });
  }
};

// Listar mensagens de um canal ou conversa direta
export const listMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { canal = 'GERAL', destinatarioId } = req.query;
    const currentUserId = req.user.id;

    let whereClause: any = {};

    if (canal === 'DIRETO' && destinatarioId) {
      const destId = Number(destinatarioId);
      whereClause = {
        canal: 'DIRETO',
        OR: [
          { remetente_id: currentUserId, destinatario_id: destId },
          { remetente_id: destId, destinatario_id: currentUserId }
        ]
      };
    } else {
      whereClause = { canal: String(canal) };
    }

    const mensagens = await prisma.mensagemChat.findMany({
      where: whereClause,
      include: {
        remetente: { select: { id: true, nome: true, login: true, cargo: true } },
        destinatario: { select: { id: true, nome: true, login: true, cargo: true } },
        os: { select: { id: true, codigo_os: true, marca_modelo: true, status: true, valor_final: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    });

    res.json({ mensagens });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao carregar mensagens do chat.' });
  }
};

// Enviar mensagem (Texto ou Áudio de Voz)
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const {
      conteudo,
      tipo = 'TEXTO',
      audio_url,
      audio_duracao,
      canal = 'GERAL',
      destinatario_id,
      os_id
    } = req.body;

    if (tipo === 'TEXTO' && (!conteudo || !conteudo.trim())) {
      res.status(400).json({ error: 'Mensagem vazia.' });
      return;
    }

    const novaMensagem = await prisma.mensagemChat.create({
      data: {
        conteudo: conteudo ? conteudo.trim() : (tipo === 'AUDIO' ? '🎙️ Mensagem de Áudio' : ''),
        tipo: tipo || 'TEXTO',
        audio_url: audio_url || null,
        audio_duracao: audio_duracao ? Number(audio_duracao) : null,
        canal: canal || 'GERAL',
        remetente_id: req.user.id,
        destinatario_id: destinatario_id ? Number(destinatario_id) : null,
        os_id: os_id ? Number(os_id) : null
      },
      include: {
        remetente: { select: { id: true, nome: true, login: true, cargo: true } },
        destinatario: { select: { id: true, nome: true, login: true, cargo: true } },
        os: { select: { id: true, codigo_os: true, marca_modelo: true, status: true, valor_final: true } }
      }
    });

    // Emite evento Socket.io em tempo real
    if (io) {
      io.emit('chat:nova_mensagem', novaMensagem);
    }

    res.status(201).json({ message: 'Mensagem enviada', mensagem: novaMensagem });
  } catch (error) {
    console.error('Erro ao enviar mensagem no chat:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
};

// Marcar mensagens como lidas
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { canal = 'GERAL', remetente_id } = req.body;

    if (canal === 'DIRETO' && remetente_id) {
      await prisma.mensagemChat.updateMany({
        where: {
          canal: 'DIRETO',
          destinatario_id: req.user.id,
          remetente_id: Number(remetente_id),
          lida: false
        },
        data: { lida: true }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({ error: 'Erro ao atualizar leitura.' });
  }
};
