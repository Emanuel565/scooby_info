import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { cache } from '../services/cache.service.js';

const prisma = new PrismaClient();

let ioInstance: any = null;
export const setVendaSocketIO = (io: any) => {
  ioInstance = io;
};

// Gera código sequencial de venda (ex: V-2026-0001)
const generateVendaCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.venda.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `V-${currentYear}-${nextNum}`;
};

// Cria uma nova venda balcão (PDV)
export const createVenda = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const {
      cliente_nome,
      cliente_telefone,
      cliente_documento,
      forma_pagamento,
      desconto,
      troco_para,
      observacao,
      itens
    } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ error: 'A venda deve conter pelo menos 1 item.' });
      return;
    }

    const codigo_venda = await generateVendaCode();
    const cleanFormaPagto = forma_pagamento ? String(forma_pagamento).toUpperCase() : 'DINHEIRO';
    const descVal = parseFloat(desconto) || 0;
    const trocoParaVal = troco_para ? parseFloat(troco_para) : null;

    let subtotalGeral = 0;
    let custoGeral = 0;

    // Processa os itens e valida estoque
    const itensProcessados: any[] = [];

    for (const it of itens) {
      const qtd = parseInt(it.quantidade) || 1;
      const precoUnit = parseFloat(it.preco_unitario || it.preco_venda || it.preco) || 0;
      let precoCusto = parseFloat(it.preco_custo) || 0;
      let estoqueId = it.estoque_item_id || it.id || null;
      let nomeProduto = String(it.nome || it.nome_produto || 'Produto Balcão').trim();
      let condicao = it.condicao ? String(it.condicao).toUpperCase() : 'NOVO';
      let numSerie = it.numero_serie ? String(it.numero_serie).trim() : null;
      let garantiaMeses = it.garantia_meses !== undefined ? parseInt(it.garantia_meses) : (condicao === 'USADO' ? 3 : 12);

      const isServico = it.is_servico || it.categoria === 'SERVICO_BALCAO' || it.categoria === 'SERVICO' || it.tipo === 'SERVICO';

      if (estoqueId && !isServico) {
        const itemDb = await prisma.itemEstoque.findUnique({
          where: { id: Number(estoqueId) }
        });

        if (itemDb) {
          const isItemServico = itemDb.categoria === 'SERVICO_BALCAO' || itemDb.categoria === 'SERVICO';
          
          if (!isItemServico && itemDb.quantidade < qtd) {
            res.status(400).json({
              error: `Estoque insuficiente para "${itemDb.nome}". Saldo disponível: ${itemDb.quantidade}, Solicitado: ${qtd}.`
            });
            return;
          }

          precoCusto = itemDb.preco_custo;
          nomeProduto = itemDb.nome;
          condicao = itemDb.condicao;
          numSerie = itemDb.numero_serie || numSerie;
          garantiaMeses = itemDb.garantia_meses;

          // Baixa imediata de estoque apenas se for produto físico
          if (!isItemServico) {
            await prisma.itemEstoque.update({
              where: { id: itemDb.id },
              data: {
                quantidade: Math.max(0, itemDb.quantidade - qtd)
              }
            });
          }
        }
      }

      const subtotalItem = precoUnit * qtd;
      const custoTotalItem = precoCusto * qtd;
      const lucroItem = Math.max(0, subtotalItem - custoTotalItem);

      subtotalGeral += subtotalItem;
      custoGeral += custoTotalItem;

      itensProcessados.push({
        estoque_item_id: estoqueId ? Number(estoqueId) : null,
        nome_produto: nomeProduto,
        condicao,
        numero_serie: numSerie,
        garantia_meses: garantiaMeses,
        quantidade: qtd,
        preco_custo: precoCusto,
        preco_unitario: precoUnit,
        subtotal: subtotalItem,
        lucro_item: lucroItem
      });
    }

    const valorFinalVenda = Math.max(0, subtotalGeral - descVal);
    const lucroFinalVenda = Math.max(0, valorFinalVenda - custoGeral);
    const trocoCalculado = (cleanFormaPagto === 'DINHEIRO' && trocoParaVal && trocoParaVal > valorFinalVenda)
      ? (trocoParaVal - valorFinalVenda)
      : 0;

    const novaVenda = await prisma.venda.create({
      data: {
        codigo_venda,
        cliente_nome: cliente_nome ? String(cliente_nome).trim() : 'Cliente Balcão',
        cliente_telefone: cliente_telefone ? String(cliente_telefone).trim() : null,
        cliente_documento: cliente_documento ? String(cliente_documento).trim() : null,
        forma_pagamento: cleanFormaPagto,
        valor_total: valorFinalVenda,
        custo_total: custoGeral,
        lucro_total: lucroFinalVenda,
        desconto: descVal,
        troco_para: trocoParaVal,
        troco_devolvido: trocoCalculado,
        observacao: observacao ? String(observacao).trim() : null,
        vendedor_id: req.user.id,
        itens: {
          create: itensProcessados
        }
      },
      include: {
        vendedor: { select: { id: true, nome: true, login: true, cargo: true } },
        itens: true
      }
    });

    try {
      await cache.delPrefix('estoque:');
      await cache.delPrefix('dashboard:');
    } catch (e) {}

    if (ioInstance) {
      ioInstance.emit('venda:realizada', novaVenda);
    }

    res.status(201).json({
      message: `Venda ${novaVenda.codigo_venda} finalizada com sucesso!`,
      venda: novaVenda
    });
  } catch (error) {
    console.error('Erro ao finalizar venda balcão:', error);
    res.status(500).json({ error: 'Erro ao processar venda balcão.' });
  }
};

// Lista histórico de vendas balcão com filtros
export const listVendas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, forma_pagamento, data_inicio, data_fim } = req.query;

    const where: any = {};

    if (forma_pagamento && forma_pagamento !== 'TODAS') {
      where.forma_pagamento = String(forma_pagamento).toUpperCase();
    }

    if (data_inicio || data_fim) {
      where.createdAt = {};
      if (data_inicio) where.createdAt.gte = new Date(String(data_inicio));
      if (data_fim) {
        const dFim = new Date(String(data_fim));
        dFim.setHours(23, 59, 59, 999);
        where.createdAt.lte = dFim;
      }
    }

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { codigo_venda: { contains: s } },
        { cliente_nome: { contains: s } },
        { cliente_telefone: { contains: s } },
        { cliente_documento: { contains: s } },
        { itens: { some: { nome_produto: { contains: s } } } }
      ];
    }

    const vendas = await prisma.venda.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        vendedor: { select: { id: true, nome: true, login: true, cargo: true } },
        itens: true
      },
      take: 100
    });

    let totalVendido = 0;
    let lucroTotal = 0;
    let custoTotal = 0;

    vendas.forEach(v => {
      totalVendido += v.valor_total;
      lucroTotal += v.lucro_total;
      custoTotal += v.custo_total;
    });

    res.json({
      vendas,
      resumo: {
        totalVendas: vendas.length,
        totalVendido,
        lucroTotal,
        custoTotal,
        ticketMedio: vendas.length > 0 ? (totalVendido / vendas.length) : 0
      }
    });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico de vendas.' });
  }
};

// Detalhes de uma venda específica para comprovante/recibo
export const getVendaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const venda = await prisma.venda.findUnique({
      where: { id: Number(id) },
      include: {
        vendedor: { select: { id: true, nome: true, login: true, cargo: true } },
        itens: true
      }
    });

    if (!venda) {
      res.status(404).json({ error: 'Venda não encontrada.' });
      return;
    }

    res.json({ venda });
  } catch (error) {
    console.error('Erro ao buscar detalhes da venda:', error);
    res.status(500).json({ error: 'Erro ao carregar detalhes da venda.' });
  }
};
