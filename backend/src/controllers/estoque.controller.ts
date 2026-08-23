import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { cache } from '../services/cache.service.js';

const prisma = new PrismaClient();

const invalidateEstoqueCache = async () => {
  try {
    await cache.delPrefix('estoque:');
  } catch (e) {}
};

// Listagem de Itens em Estoque com busca, filtro e totais
export const listEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, categoria } = req.query;
    const cacheKey = `estoque:list:${categoria || 'TODAS'}:${search || 'ALL'}`;
    const cachedEstoque = await cache.get(cacheKey);

    if (cachedEstoque) {
      res.json(cachedEstoque);
      return;
    }

    const where: any = {};

    if (categoria && categoria !== 'TODAS') {
      where.categoria = String(categoria);
    }

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { nome: { contains: s } },
        { categoria: { contains: s } },
        { codigo_barras: { contains: s } },
        { localizacao: { contains: s } }
      ];
    }

    const itens = await prisma.itemEstoque.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { nome: 'asc' }
      ]
    });

    // Totais calculados
    let totalItensQuantidade = 0;
    let custoTotalEstoque = 0;
    let valorTotalVendaEstoque = 0;
    let itensBaixoEstoque = 0;

    itens.forEach(item => {
      totalItensQuantidade += item.quantidade;
      custoTotalEstoque += (item.quantidade * item.preco_custo);
      valorTotalVendaEstoque += (item.quantidade * item.preco_venda);
      if (item.quantidade <= item.estoque_minimo) {
        itensBaixoEstoque += 1;
      }
    });

    const lucroPotencialEstoque = valorTotalVendaEstoque - custoTotalEstoque;

    const result = {
      itens,
      metricas: {
        totalProdutosCadastrados: itens.length,
        totalUnidadesEstoque: totalItensQuantidade,
        custoTotalEstoque,
        valorTotalVendaEstoque,
        lucroPotencialEstoque,
        itensBaixoEstoque
      }
    };

    await cache.set(cacheKey, result, 60);

    res.json(result);
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    res.status(500).json({ error: 'Erro ao carregar estoque.' });
  }
};

// Cadastro de Novo Item no Estoque
export const createEstoqueItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nome, categoria, quantidade, estoque_minimo, preco_custo, preco_venda, codigo_barras, localizacao } = req.body;

    if (!nome || !categoria) {
      res.status(400).json({ error: 'Nome e Categoria são obrigatórios.' });
      return;
    }

    const item = await prisma.itemEstoque.create({
      data: {
        nome: String(nome).trim(),
        categoria: String(categoria).trim().toUpperCase(),
        quantidade: Number(quantidade) || 0,
        estoque_minimo: Number(estoque_minimo) || 2,
        preco_custo: parseFloat(preco_custo) || 0,
        preco_venda: parseFloat(preco_venda) || 0,
        codigo_barras: codigo_barras ? String(codigo_barras).trim() : null,
        localizacao: localizacao ? String(localizacao).trim() : null
      }
    });

    invalidateEstoqueCache();

    res.status(201).json({ message: 'Item cadastrado no estoque com sucesso!', item });
  } catch (error) {
    console.error('Erro ao criar item no estoque:', error);
    res.status(500).json({ error: 'Erro ao cadastrar item no estoque.' });
  }
};

// Atualização de Item ou Ajuste de Saldo
export const updateEstoqueItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, categoria, quantidade, estoque_minimo, preco_custo, preco_venda, codigo_barras, localizacao, ajuste_quantidade } = req.body;

    const existing = await prisma.itemEstoque.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      res.status(404).json({ error: 'Item não encontrado no estoque.' });
      return;
    }

    let novaQtd = existing.quantidade;
    if (ajuste_quantidade !== undefined) {
      novaQtd = Math.max(0, existing.quantidade + Number(ajuste_quantidade));
    } else if (quantidade !== undefined) {
      novaQtd = Number(quantidade);
    }

    const item = await prisma.itemEstoque.update({
      where: { id: Number(id) },
      data: {
        nome: nome ? String(nome).trim() : undefined,
        categoria: categoria ? String(categoria).trim().toUpperCase() : undefined,
        quantidade: novaQtd,
        estoque_minimo: estoque_minimo !== undefined ? Number(estoque_minimo) : undefined,
        preco_custo: preco_custo !== undefined ? parseFloat(preco_custo) : undefined,
        preco_venda: preco_venda !== undefined ? parseFloat(preco_venda) : undefined,
        codigo_barras: codigo_barras !== undefined ? String(codigo_barras).trim() : undefined,
        localizacao: localizacao !== undefined ? String(localizacao).trim() : undefined
      }
    });

    invalidateEstoqueCache();

    res.json({ message: 'Item atualizado com sucesso!', item });
  } catch (error) {
    console.error('Erro ao atualizar item do estoque:', error);
    res.status(500).json({ error: 'Erro ao atualizar item do estoque.' });
  }
};

// Exclusão de Item do Estoque
export const deleteEstoqueItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.itemEstoque.delete({
      where: { id: Number(id) }
    });

    invalidateEstoqueCache();

    res.json({ message: 'Item removido do estoque com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar item do estoque:', error);
    res.status(500).json({ error: 'Erro ao excluir item do estoque.' });
  }
};

// Importação rápida dos itens mais frequentes da assistência técnica (SSDs, Memórias, Telas, Baterias, etc.)
export const importDefaultEstoqueItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itensPadrao = [
      // SSDs
      { nome: 'SSD 240GB Kingston / Crucial SATA III', categoria: 'SSD', quantidade: 6, estoque_minimo: 2, preco_custo: 150.00, preco_venda: 300.00, localizacao: 'Armário A1' },
      { nome: 'SSD 480GB Kingston / WD Green SATA III', categoria: 'SSD', quantidade: 5, estoque_minimo: 2, preco_custo: 210.00, preco_venda: 390.00, localizacao: 'Armário A1' },
      { nome: 'SSD 1TB NVMe M.2 Kingston NV2', categoria: 'SSD', quantidade: 3, estoque_minimo: 1, preco_custo: 360.00, preco_venda: 580.00, localizacao: 'Armário A1' },
      { nome: 'SSD 120GB SATA III', categoria: 'SSD', quantidade: 4, estoque_minimo: 2, preco_custo: 90.00, preco_venda: 190.00, localizacao: 'Armário A1' },

      // Memórias RAM
      { nome: 'Memória RAM 8GB DDR4 3200MHz Notebook / SODIMM', categoria: 'MEMORIA', quantidade: 6, estoque_minimo: 2, preco_custo: 120.00, preco_venda: 240.00, localizacao: 'Gaveta B1' },
      { nome: 'Memória RAM 16GB DDR4 3200MHz Notebook / SODIMM', categoria: 'MEMORIA', quantidade: 4, estoque_minimo: 1, preco_custo: 220.00, preco_venda: 410.00, localizacao: 'Gaveta B1' },
      { nome: 'Memória RAM 8GB DDR4 3200MHz Desktop', categoria: 'MEMORIA', quantidade: 5, estoque_minimo: 2, preco_custo: 115.00, preco_venda: 230.00, localizacao: 'Gaveta B1' },
      { nome: 'Memória RAM 8GB DDR3L 1600MHz Notebook', categoria: 'MEMORIA', quantidade: 4, estoque_minimo: 2, preco_custo: 95.00, preco_venda: 195.00, localizacao: 'Gaveta B1' },

      // Telas e Celulares
      { nome: 'Tela Frontal iPhone 11 Incell Premium', categoria: 'TELA', quantidade: 2, estoque_minimo: 1, preco_custo: 160.00, preco_venda: 340.00, localizacao: 'Gaveta Telas C1' },
      { nome: 'Tela Frontal iPhone XR Incell Premium', categoria: 'TELA', quantidade: 2, estoque_minimo: 1, preco_custo: 150.00, preco_venda: 320.00, localizacao: 'Gaveta Telas C1' },
      { nome: 'Tela Frontal Samsung A10 / A20 / A30 OLED', categoria: 'TELA', quantidade: 3, estoque_minimo: 1, preco_custo: 140.00, preco_venda: 290.00, localizacao: 'Gaveta Telas C2' },
      { nome: 'Tela Frontal Samsung A51 / A52 OLED', categoria: 'TELA', quantidade: 2, estoque_minimo: 1, preco_custo: 190.00, preco_venda: 380.00, localizacao: 'Gaveta Telas C2' },
      { nome: 'Tela Frontal Moto G8 / G9 Play', categoria: 'TELA', quantidade: 2, estoque_minimo: 1, preco_custo: 110.00, preco_venda: 250.00, localizacao: 'Gaveta Telas C3' },

      // Baterias e Conectores
      { nome: 'Bateria iPhone 11 com Chip', categoria: 'BATERIA', quantidade: 3, estoque_minimo: 1, preco_custo: 90.00, preco_venda: 220.00, localizacao: 'Gaveta Baterias' },
      { nome: 'Bateria Samsung Linha A (Diversos)', categoria: 'BATERIA', quantidade: 4, estoque_minimo: 2, preco_custo: 75.00, preco_venda: 180.00, localizacao: 'Gaveta Baterias' },
      { nome: 'Conector de Carga USB-C Universal', categoria: 'CONECTOR', quantidade: 15, estoque_minimo: 5, preco_custo: 10.00, preco_venda: 90.00, localizacao: 'Gaveteiro Miudezas' },
      { nome: 'Conector de Carga Micro USB V8', categoria: 'CONECTOR', quantidade: 12, estoque_minimo: 5, preco_custo: 8.00, preco_venda: 75.00, localizacao: 'Gaveteiro Miudezas' },

      // Insumos & Impressoras
      { nome: 'Pasta Térmica Alta Condutividade Prata (Seringa)', categoria: 'INSUMO', quantidade: 8, estoque_minimo: 3, preco_custo: 25.00, preco_venda: 60.00, localizacao: 'Bancada Insumos' },
      { nome: 'Tinta Refil Epson 664 / 544 Black 70ml', categoria: 'INSUMO', quantidade: 6, estoque_minimo: 2, preco_custo: 28.00, preco_venda: 65.00, localizacao: 'Prateleira Impressoras' },
      { nome: 'Tinta Refil Epson 664 / 544 Color (Kit C,M,Y)', categoria: 'INSUMO', quantidade: 4, estoque_minimo: 2, preco_custo: 70.00, preco_venda: 150.00, localizacao: 'Prateleira Impressoras' }
    ];

    let criados = 0;
    for (const item of itensPadrao) {
      const existe = await prisma.itemEstoque.findFirst({
        where: { nome: item.nome }
      });
      if (!existe) {
        await prisma.itemEstoque.create({ data: item });
        criados++;
      }
    }

    invalidateEstoqueCache();

    res.json({
      message: `Catálogo importado com sucesso! ${criados} novos itens cadastrados.`,
      totalImportados: criados
    });
  } catch (error) {
    console.error('Erro ao importar itens padrão de estoque:', error);
    res.status(500).json({ error: 'Erro ao importar itens padrão.' });
  }
};