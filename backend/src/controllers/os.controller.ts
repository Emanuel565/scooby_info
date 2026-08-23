import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { io } from '../server.js';
import { cache } from '../services/cache.service.js';

const prisma = new PrismaClient();

const invalidateDashboardCache = async () => {
  try {
    await cache.delPrefix('dashboard:');
  } catch (e) {}
};

const generateOSCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.ordemServico.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `OS-${currentYear}-${nextNum}`;
};

export const createOS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const {
      cliente_nome,
      cliente_telefone,
      cliente_whatsapp,
      cliente_documento,
      cliente_email,
      tipo_equipamento,
      marca_modelo,
      numero_serie,
      senha_aparelho,
      acessorios_inclusos,
      condicoes_visuais,
      defeito_relatado,
      orcamento_valor,
      prioridade,
      prazo_entrega,
      checklist_entrada,
      fotos_equipamento,
      auto_atribuir_me
    } = req.body;

    if (!cliente_nome || !cliente_telefone || !marca_modelo) {
      res.status(400).json({ error: 'Preencha os campos obrigatórios (*)' });
      return;
    }

    const codigo_os = await generateOSCode();

    let statusInicial = 'TRIAGEM';
    let tecnicoId: number | null = null;

    if (auto_atribuir_me && (req.user.cargo === 'TECNICO_CELULAR' || req.user.cargo === 'ADMIN' || req.user.cargo === 'GERENTE')) {
      statusInicial = 'EM_ANDAMENTO';
      tecnicoId = req.user.id;
    }

    const novaOS = await prisma.ordemServico.create({
      data: {
        codigo_os,
        cliente_nome,
        cliente_telefone,
        cliente_whatsapp: cliente_whatsapp || null,
        cliente_documento: cliente_documento || null,
        cliente_email: cliente_email || null,
        tipo_equipamento: tipo_equipamento || 'NOTEBOOK',
        marca_modelo,
        numero_serie: numero_serie || null,
        senha_aparelho: senha_aparelho || null,
        acessorios_inclusos: acessorios_inclusos || null,
        condicoes_visuais: condicoes_visuais || null,
        defeito_relatado: defeito_relatado || 'Análise técnica para diagnóstico e elaboração de orçamento.',
        orcamento_valor: orcamento_valor ? parseFloat(orcamento_valor) : 0,
        prioridade: prioridade || 'MEDIA',
        prazo_entrega: prazo_entrega ? new Date(prazo_entrega) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        checklist_entrada: JSON.stringify(checklist_entrada || {}),
        checklist_saida: JSON.stringify({}),
        fotos_equipamento: typeof fotos_equipamento === 'string' ? fotos_equipamento : JSON.stringify(fotos_equipamento || []),
        status: statusInicial,
        tecnico_id: tecnicoId,
        criado_por_id: req.user.id
      },
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    await prisma.logHistorico.create({
      data: {
        os_id: novaOS.id,
        usuario_id: req.user.id,
        acao: 'CRIACAO',
        descricao: `OS criada por ${req.user.nome}. Status: ${statusInicial}.`,
        status_novo: statusInicial
      }
    });

    if (io) {
      io.emit('os:criada', novaOS);
      if (tecnicoId) {
        io.emit('os:atribuida', { os: novaOS, tecnicoId });
      }
    }

    invalidateDashboardCache();

    res.status(201).json({
      message: 'Ordem de Serviço criada com sucesso!',
      os: novaOS
    });
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar Ordem de Serviço.' });
  }
};

export const listOS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, tipo_equipamento, prioridade, tecnico_id, search } = req.query;

    const where: any = {};

    if (status && status !== 'TODOS') where.status = String(status);
    
    if (tipo_equipamento && tipo_equipamento !== 'TODOS') {
      const tiposStr = String(tipo_equipamento);
      if (tiposStr.includes(',')) {
        where.tipo_equipamento = { in: tiposStr.split(',').map(t => t.trim()) };
      } else {
        where.tipo_equipamento = tiposStr;
      }
    } else if (req.user?.cargo === 'TECNICO_CELULAR') {
      // Técnico de celulares e híbrido tem acesso focado em Smartphones, Tablets e Consoles/Games
      where.tipo_equipamento = { in: ['SMARTPHONE', 'TABLET', 'CONSOLE'] };
    }

    if (prioridade && prioridade !== 'TODAS') where.prioridade = String(prioridade);
    if (tecnico_id) where.tecnico_id = Number(tecnico_id);

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { codigo_os: { contains: s } },
        { cliente_nome: { contains: s } },
        { cliente_telefone: { contains: s } },
        { cliente_whatsapp: { contains: s } },
        { marca_modelo: { contains: s } },
        { numero_serie: { contains: s } }
      ];
    }

    const ordens = await prisma.ordemServico.findMany({
      where,
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      },
      orderBy: [
        { prioridade: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ os: ordens });
  } catch (error) {
    console.error('Erro ao listar OS:', error);
    res.status(500).json({ error: 'Erro ao buscar Ordens de Serviço.' });
  }
};

export const getOSById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const os = await prisma.ordemServico.findUnique({
      where: { id: Number(id) },
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        logs: {
          include: {
            usuario: { select: { id: true, nome: true, cargo: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!os) {
      res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
      return;
    }

    res.json({ os });
  } catch (error) {
    console.error('Erro ao buscar detalhes da OS:', error);
    res.status(500).json({ error: 'Erro ao buscar OS.' });
  }
};

export const markOrcamentoEnviado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;

    const currentOS = await prisma.ordemServico.findUnique({
      where: { id: Number(id) }
    });

    if (!currentOS) {
      res.status(404).json({ error: 'OS não encontrada.' });
      return;
    }

    const updatedOS = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: {
        orcamento_enviado_em: new Date(),
        orcamento_enviado_por_id: req.user.id
      },
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    await prisma.logHistorico.create({
      data: {
        os_id: updatedOS.id,
        usuario_id: req.user.id,
        acao: 'ORCAMENTO_ENVIADO',
        descricao: `Orçamento via WhatsApp enviado para o cliente por ${req.user.nome}.`
      }
    });

    if (io) {
      io.emit('os:atualizada', updatedOS);
    }

    res.json({ message: 'Envio de orçamento registrado com sucesso!', os: updatedOS });
  } catch (error) {
    console.error('Erro ao registrar envio de orçamento:', error);
    res.status(500).json({ error: 'Erro ao registrar envio de orçamento.' });
  }
};

export const updateOSStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const { status, observacao } = req.body;

    const currentOS = await prisma.ordemServico.findUnique({
      where: { id: Number(id) }
    });

    if (!currentOS) {
      res.status(404).json({ error: 'OS não encontrada.' });
      return;
    }

    const statusAnterior = currentOS.status;
    const updateData: any = { status };

    if (status === 'CONCLUIDO') {
      updateData.concluidoEm = new Date();
      updateData.concluido_por_id = req.user.id; // Guarda o técnico exato que finalizou!
      // Se não havia técnico atribuído, define quem finalizou como técnico
      if (!currentOS.tecnico_id) {
        updateData.tecnico_id = req.user.id;
      }
    } else if (status === 'ENTREGUE') {
      updateData.entregueEm = new Date();
    } else {
      // Se a OS estava finalizada ou entregue e voltou para bancada/testes/peça/triagem, limpa conclusão
      if (statusAnterior === 'CONCLUIDO' || statusAnterior === 'ENTREGUE') {
        updateData.concluidoEm = null;
        updateData.entregueEm = null;
      }
    }

    const updatedOS = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    const isReabertura = (statusAnterior === 'CONCLUIDO' || statusAnterior === 'ENTREGUE') && status !== 'CONCLUIDO' && status !== 'ENTREGUE';

    await prisma.logHistorico.create({
      data: {
        os_id: updatedOS.id,
        usuario_id: req.user.id,
        acao: isReabertura ? 'REABERTURA_OS' : status === 'CONCLUIDO' ? 'FINALIZADO' : 'MUDANCA_STATUS',
        descricao: observacao || (isReabertura 
          ? `Ordem de Serviço REABERTA por ${req.user.nome} e movida de ${statusAnterior} para ${status}.` 
          : `Status alterado de ${statusAnterior} para ${status} por ${req.user.nome}${status === 'CONCLUIDO' ? ' (Serviço finalizado por ' + req.user.nome + ')' : ''}`),
        status_anterior: statusAnterior,
        status_novo: status
      }
    });

    if (io) {
      io.emit('os:status_alterado', { os: updatedOS, statusAnterior, statusNovo: status });
    }

    invalidateDashboardCache();

    res.json({ message: 'Status atualizado com sucesso!', os: updatedOS });
  } catch (error) {
    console.error('Erro ao atualizar status da OS:', error);
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};

export const assignTechnician = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const { tecnico_id, prioridade, prazo_entrega } = req.body;

    const tecnico = await prisma.usuario.findUnique({
      where: { id: Number(tecnico_id) }
    });

    if (!tecnico) {
      res.status(404).json({ error: 'Técnico não encontrado.' });
      return;
    }

    const currentOS = await prisma.ordemServico.findUnique({
      where: { id: Number(id) }
    });

    const novoStatus = currentOS?.status === 'TRIAGEM' ? 'EM_ANDAMENTO' : currentOS?.status || 'EM_ANDAMENTO';
    const updateData: any = {
      tecnico_id: Number(tecnico_id),
      status: novoStatus
    };

    if (prioridade) updateData.prioridade = prioridade;
    if (prazo_entrega) updateData.prazo_entrega = new Date(prazo_entrega);

    const updatedOS = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    const desc = req.user.id === Number(tecnico_id)
      ? `Técnico ${tecnico.nome} assumiu a OS para manutenção na bancada.`
      : `OS direcionada para o técnico ${tecnico.nome} por ${req.user.nome}.`;

    await prisma.logHistorico.create({
      data: {
        os_id: updatedOS.id,
        usuario_id: req.user.id,
        acao: 'ATRIBUICAO',
        descricao: desc,
        status_novo: novoStatus
      }
    });

    if (io) {
      io.emit('os:atribuida', { os: updatedOS, tecnicoId: Number(tecnico_id) });
    }

    invalidateDashboardCache();

    res.json({ message: `OS direcionada para ${tecnico.nome} com sucesso!`, os: updatedOS });
  } catch (error) {
    console.error('Erro ao atribuir técnico:', error);
    res.status(500).json({ error: 'Erro ao atribuir técnico.' });
  }
};

export const updateLaudoAndParts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const {
      laudo_tecnico,
      pecas_utilizadas,
      orcamento_valor,
      valor_final,
      tempo_bancada_segundos,
      checklist_saida,
      fotos_equipamento
    } = req.body;

    const pecasArray = pecas_utilizadas || [];
    const custoPecas = pecasArray.reduce((acc: number, p: any) => acc + ((parseFloat(p.preco_custo) || 0) * (parseInt(p.quantidade) || 1)), 0);
    const vendaPecas = pecasArray.reduce((acc: number, p: any) => acc + ((parseFloat(p.preco_venda || p.preco) || 0) * (parseInt(p.quantidade) || 1)), 0);
    const maoDeObra = orcamento_valor !== undefined ? parseFloat(orcamento_valor) : 0;
    const valorTotalCalculado = valor_final !== undefined ? parseFloat(valor_final) : (maoDeObra + vendaPecas);
    const lucroLiquidoCalculado = Math.max(0, valorTotalCalculado - custoPecas);

    const updateData: any = {
      laudo_tecnico: laudo_tecnico || null,
      pecas_utilizadas: JSON.stringify(pecasArray),
      orcamento_valor: maoDeObra,
      valor_final: valorTotalCalculado,
      custo_pecas: custoPecas,
      lucro_liquido: lucroLiquidoCalculado,
      tempo_bancada_segundos: tempo_bancada_segundos !== undefined ? Number(tempo_bancada_segundos) : undefined,
      checklist_saida: checklist_saida ? JSON.stringify(checklist_saida) : undefined
    };

    if (fotos_equipamento !== undefined) {
      updateData.fotos_equipamento = typeof fotos_equipamento === 'string' ? fotos_equipamento : JSON.stringify(fotos_equipamento);
    }

    const updatedOS = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    const tempoSeg = Number(tempo_bancada_segundos) || 0;
    const tempoMin = Math.round(tempoSeg / 60);
    const tempoTxt = tempoMin >= 60 ? `${Math.floor(tempoMin / 60)}h ${tempoMin % 60}m` : `${tempoMin} min (${tempoSeg}s)`;

    await prisma.logHistorico.create({
      data: {
        os_id: updatedOS.id,
        usuario_id: req.user.id,
        acao: 'LAUDO_ATUALIZADO',
        descricao: `Laudo e bancada atualizados por ${req.user.nome}. Tempo de bancada registrado: ${tempoTxt}. Total: R$ ${updatedOS.valor_final} (Peças: R$ ${updatedOS.custo_pecas} | Lucro: R$ ${updatedOS.lucro_liquido})`
      }
    });

    if (io) {
      io.emit('os:atualizada', updatedOS);
    }

    invalidateDashboardCache();

    res.json({ message: 'Laudo técnico salvo com sucesso!', os: updatedOS });
  } catch (error) {
    console.error('Erro ao atualizar laudo:', error);
    res.status(500).json({ error: 'Erro ao salvar laudo e peças.' });
  }
};

// Edição completa dos dados da OS (Admin / Gerente / Atendente)
export const updateOS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const {
      cliente_nome,
      cliente_telefone,
      cliente_whatsapp,
      cliente_documento,
      cliente_email,
      tipo_equipamento,
      marca_modelo,
      numero_serie,
      senha_aparelho,
      acessorios_inclusos,
      condicoes_visuais,
      defeito_relatado,
      prioridade,
      prazo_entrega,
      orcamento_valor,
      valor_final,
      status
    } = req.body;

    const osExistente = await prisma.ordemServico.findUnique({ where: { id: Number(id) } });
    if (!osExistente) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada.' });
      return;
    }

    const updatedOS = await prisma.ordemServico.update({
      where: { id: Number(id) },
      data: {
        cliente_nome: cliente_nome !== undefined ? cliente_nome : undefined,
        cliente_telefone: cliente_telefone !== undefined ? cliente_telefone : undefined,
        cliente_whatsapp: cliente_whatsapp !== undefined ? cliente_whatsapp : undefined,
        cliente_documento: cliente_documento !== undefined ? cliente_documento : undefined,
        cliente_email: cliente_email !== undefined ? cliente_email : undefined,
        tipo_equipamento: tipo_equipamento !== undefined ? tipo_equipamento : undefined,
        marca_modelo: marca_modelo !== undefined ? marca_modelo : undefined,
        numero_serie: numero_serie !== undefined ? numero_serie : undefined,
        senha_aparelho: senha_aparelho !== undefined ? senha_aparelho : undefined,
        acessorios_inclusos: acessorios_inclusos !== undefined ? acessorios_inclusos : undefined,
        condicoes_visuais: condicoes_visuais !== undefined ? condicoes_visuais : undefined,
        defeito_relatado: defeito_relatado !== undefined ? defeito_relatado : undefined,
        prioridade: prioridade !== undefined ? prioridade : undefined,
        prazo_entrega: prazo_entrega ? new Date(prazo_entrega) : undefined,
        orcamento_valor: orcamento_valor !== undefined ? parseFloat(orcamento_valor) : undefined,
        valor_final: valor_final !== undefined ? parseFloat(valor_final) : undefined,
        status: status !== undefined ? status : undefined
      },
      include: {
        tecnico: { select: { id: true, nome: true, login: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, login: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, login: true, cargo: true } },
        orcamento_enviado_por: { select: { id: true, nome: true, login: true, cargo: true } }
      }
    });

    await prisma.logHistorico.create({
      data: {
        os_id: updatedOS.id,
        usuario_id: req.user.id,
        acao: 'EDICAO_GERAL',
        descricao: `Dados da OS editados por ${req.user.nome} (${req.user.cargo}).`
      }
    });

    if (io) {
      io.emit('os:atualizada', updatedOS);
    }

    invalidateDashboardCache();

    res.json({ message: 'Ordem de Serviço atualizada com sucesso!', os: updatedOS });
  } catch (error) {
    console.error('Erro ao editar OS:', error);
    res.status(500).json({ error: 'Erro ao salvar alterações da OS.' });
  }
};

// Exclusão de OS (Administradores, Gerentes e Atendentes)
export const deleteOS = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !['ADMIN', 'GERENTE', 'ATENDENTE'].includes(req.user.cargo)) {
      res.status(403).json({ error: 'Você não tem permissão para excluir ordens de serviço.' });
      return;
    }

    const { id } = req.params;
    const osId = Number(id);

    const osExistente = await prisma.ordemServico.findUnique({ where: { id: osId } });
    if (!osExistente) {
      res.status(404).json({ error: 'Ordem de serviço não encontrada.' });
      return;
    }

    // 1. Remove logs e histórico relacionados
    await prisma.logHistorico.deleteMany({ where: { os_id: osId } });
    
    // 2. Remove a OS
    await prisma.ordemServico.delete({ where: { id: osId } });

    if (io) {
      io.emit('os:excluida', { id: osId, codigo_os: osExistente.codigo_os });
    }

    invalidateDashboardCache();

    res.json({ message: `Ordem de Serviço ${osExistente.codigo_os} excluída com sucesso.` });
  } catch (error) {
    console.error('Erro ao excluir OS:', error);
    res.status(500).json({ error: 'Erro interno ao excluir Ordem de Serviço.' });
  }
};