import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, UserTokenPayload } from '../types/index.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'scooby_super_secret_jwt_key_2026_tech_flow';

const generateToken = (user: any): string => {
  let especialidades: string[] = [];
  try {
    especialidades = typeof user.especialidades === 'string' ? JSON.parse(user.especialidades) : user.especialidades;
  } catch (e) {
    especialidades = [];
  }

  const payload: UserTokenPayload = {
    id: user.id,
    nome: user.nome,
    login: user.login,
    cargo: user.cargo,
    especialidades
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Lista pública de colaboradores para tela de login
export const getPublicUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        cargo: true
      },
      orderBy: [
        { cargo: 'asc' },
        { nome: 'asc' }
      ]
    });
    res.json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários públicos:', error);
    res.status(500).json({ error: 'Erro ao listar colaboradores' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      res.status(400).json({ error: 'Informe seu usuário e senha individual para entrar.' });
      return;
    }

    const user = await prisma.usuario.findUnique({
      where: { login: login.trim().toLowerCase() }
    });

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado no sistema.' });
      return;
    }

    const isMatch = await bcrypt.compare(senha, user.senha_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Senha incorreta. Tente novamente.' });
      return;
    }

    const token = generateToken(user);

    let especialidades = [];
    try {
      especialidades = JSON.parse(user.especialidades);
    } catch {
      especialidades = [];
    }

    res.json({
      message: `Bem-vindo(a), ${user.nome}!`,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        cargo: user.cargo,
        especialidades,
        status: user.status,
        telefone: user.telefone
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao autenticar usuário.' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    let especialidades = [];
    try {
      especialidades = JSON.parse(user.especialidades);
    } catch {
      especialidades = [];
    }

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        cargo: user.cargo,
        especialidades,
        status: user.status,
        telefone: user.telefone
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};

export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        cargo: true,
        especialidades: true,
        status: true,
        telefone: true,
        _count: {
          select: {
            os_atribuidas: {
              where: {
                status: {
                  in: ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES']
                }
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    const parsedUsers = users.map((u) => {
      let especialidades = [];
      try {
        especialidades = JSON.parse(u.especialidades);
      } catch {
        especialidades = [];
      }
      return {
        ...u,
        especialidades,
        os_ativas_count: u._count.os_atribuidas
      };
    });

    res.json({ users: parsedUsers });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar lista de usuários' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nome, login, senha, cargo, especialidades, telefone } = req.body;

    if (!nome || !login || !senha || !cargo) {
      res.status(400).json({ error: 'Preencha os campos obrigatórios: Nome e Sobrenome, Login, Senha e Cargo.' });
      return;
    }

    const cleanLogin = login.trim().toLowerCase();

    const existingUser = await prisma.usuario.findUnique({
      where: { login: cleanLogin }
    });

    if (existingUser) {
      res.status(400).json({ error: `O login "${cleanLogin}" já está em uso por outro colaborador.` });
      return;
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        login: cleanLogin,
        senha_hash,
        cargo,
        especialidades: JSON.stringify(especialidades || []),
        status: 'ONLINE',
        telefone: telefone || null,
        avatar: null
      }
    });

    res.status(201).json({
      message: `Colaborador(a) "${user.nome}" cadastrado(a) com sucesso!`,
      user: {
        id: user.id,
        nome: user.nome,
        login: user.login,
        cargo: user.cargo,
        especialidades: especialidades || [],
        telefone: user.telefone,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
};

// Edição de perfil do colaborador (Nome, Login, Cargo, Especialidades, Telefone)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, login, cargo, especialidades, telefone } = req.body;

    const targetUser = await prisma.usuario.findUnique({
      where: { id: Number(id) }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Colaborador não encontrado.' });
      return;
    }

    const updateData: any = {};

    if (nome) updateData.nome = nome.trim();
    if (telefone !== undefined) updateData.telefone = telefone || null;
    if (cargo) updateData.cargo = cargo;
    if (especialidades !== undefined) {
      updateData.especialidades = JSON.stringify(especialidades || []);
    }

    if (login && login.trim().toLowerCase() !== targetUser.login) {
      const cleanLogin = login.trim().toLowerCase();
      const duplicate = await prisma.usuario.findUnique({
        where: { login: cleanLogin }
      });
      if (duplicate) {
        res.status(400).json({ error: `O login "${cleanLogin}" já está em uso por outro colaborador.` });
        return;
      }
      updateData.login = cleanLogin;
    }

    const updated = await prisma.usuario.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.json({
      message: `Perfil de "${updated.nome}" atualizado com sucesso!`,
      user: {
        id: updated.id,
        nome: updated.nome,
        login: updated.login,
        cargo: updated.cargo,
        especialidades: JSON.parse(updated.especialidades || '[]'),
        telefone: updated.telefone,
        status: updated.status
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do colaborador.' });
  }
};

// Redefinição de senha de qualquer colaborador por um Administrador
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.trim().length < 3) {
      res.status(400).json({ error: 'A nova senha deve conter pelo menos 3 caracteres.' });
      return;
    }

    const targetUser = await prisma.usuario.findUnique({
      where: { id: Number(id) }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Colaborador não encontrado.' });
      return;
    }

    const senha_hash = await bcrypt.hash(novaSenha.trim(), 10);

    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { senha_hash }
    });

    res.json({
      message: `Senha de "${targetUser.nome}" redefinida com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao alterar a senha do colaborador.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.id === Number(id)) {
      res.status(400).json({ error: 'Você não pode excluir seu próprio usuário logado.' });
      return;
    }

    const activeOS = await prisma.ordemServico.count({
      where: {
        tecnico_id: Number(id),
        status: { in: ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES'] }
      }
    });

    if (activeOS > 0) {
      res.status(400).json({ 
        error: `Não é possível excluir este técnico pois ele possui ${activeOS} OS ativa(s) na bancada. Reatribua as OS antes de excluir.` 
      });
      return;
    }

    const targetUser = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!targetUser) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    await prisma.usuario.delete({
      where: { id: Number(id) }
    });

    res.json({ message: `Colaborador "${targetUser.nome}" removido com sucesso.` });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({ error: 'Erro ao remover colaborador.' });
  }
};

export const downloadDatabaseBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const possiblePaths = [
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(process.cwd(), 'backend/prisma/dev.db'),
      path.resolve(process.cwd(), 'dev.db'),
      path.resolve(process.cwd(), 'backend/dev.db')
    ];
    const dbPath = possiblePaths.find(p => fs.existsSync(p));

    if (!dbPath) {
      res.status(404).json({ error: 'Arquivo de banco de dados não encontrado.' });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    res.download(dbPath, `scooby_backup_${timestamp}.db`);
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    res.status(500).json({ error: 'Erro ao gerar download de backup.' });
  }
};