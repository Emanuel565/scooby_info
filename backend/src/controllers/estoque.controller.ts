import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';
import { cache } from '../services/cache.service.js';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

const invalidateEstoqueCache = async () => {
  try {
    await cache.delPrefix('estoque:');
  } catch (e) {}
};

// Listagem de Itens em Estoque com busca, filtro por Categoria e Condição (NOVO / USADO)
export const listEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, categoria, condicao } = req.query;
    const cacheKey = `estoque:list:${categoria || 'TODAS'}:${condicao || 'TODAS'}:${search || 'ALL'}`;
    const cachedEstoque = await cache.get(cacheKey);

    if (cachedEstoque) {
      res.json(cachedEstoque);
      return;
    }

    const where: any = {};

    if (categoria && categoria !== 'TODAS') {
      where.categoria = String(categoria);
    }

    if (condicao && condicao !== 'TODAS') {
      where.condicao = String(condicao).toUpperCase();
    }

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { nome: { contains: s } },
        { categoria: { contains: s } },
        { codigo_barras: { contains: s } },
        { numero_serie: { contains: s } },
        { localizacao: { contains: s } }
      ];
    }

    const itens = await prisma.itemEstoque.findMany({
      where,
      orderBy: [
        { condicao: 'asc' },
        { categoria: 'asc' },
        { nome: 'asc' }
      ]
    });

    // Totais calculados
    let totalItensQuantidade = 0;
    let custoTotalEstoque = 0;
    let valorTotalVendaEstoque = 0;
    let itensBaixoEstoque = 0;
    let totalNovos = 0;
    let totalUsados = 0;

    itens.forEach(item => {
      totalItensQuantidade += item.quantidade;
      custoTotalEstoque += (item.quantidade * item.preco_custo);
      valorTotalVendaEstoque += (item.quantidade * item.preco_venda);
      if (item.quantidade <= item.estoque_minimo) {
        itensBaixoEstoque += 1;
      }
      if (item.condicao === 'USADO' || item.condicao === 'SEMINOVO') {
        totalUsados += item.quantidade;
      } else {
        totalNovos += item.quantidade;
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
        itensBaixoEstoque,
        totalNovos,
        totalUsados
      }
    };

    await cache.set(cacheKey, result, 30);

    res.json(result);
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    res.status(500).json({ error: 'Erro ao carregar estoque.' });
  }
};

// Cadastro de Novo Item no Estoque (Novos ou Usados/Seminovos)
export const createEstoqueItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      nome, 
      categoria, 
      condicao, 
      quantidade, 
      estoque_minimo, 
      preco_custo, 
      preco_venda, 
      codigo_barras, 
      numero_serie,
      garantia_meses,
      detalhes_condicao,
      localizacao 
    } = req.body;

    if (!nome || !categoria) {
      res.status(400).json({ error: 'Nome e Categoria são obrigatórios.' });
      return;
    }

    const item = await prisma.itemEstoque.create({
      data: {
        nome: String(nome).trim(),
        categoria: String(categoria).trim().toUpperCase(),
        condicao: condicao ? String(condicao).trim().toUpperCase() : 'NOVO',
        quantidade: Number(quantidade) || 0,
        estoque_minimo: Number(estoque_minimo) || 2,
        preco_custo: parseFloat(preco_custo) || 0,
        preco_venda: parseFloat(preco_venda) || 0,
        codigo_barras: codigo_barras ? String(codigo_barras).trim() : null,
        numero_serie: numero_serie ? String(numero_serie).trim() : null,
        garantia_meses: garantia_meses !== undefined ? Number(garantia_meses) : (condicao === 'USADO' ? 3 : 12),
        detalhes_condicao: detalhes_condicao ? String(detalhes_condicao).trim() : null,
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
    const { 
      nome, 
      categoria, 
      condicao,
      quantidade, 
      estoque_minimo, 
      preco_custo, 
      preco_venda, 
      codigo_barras, 
      numero_serie,
      garantia_meses,
      detalhes_condicao,
      localizacao, 
      ajuste_quantidade 
    } = req.body;

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
        condicao: condicao ? String(condicao).trim().toUpperCase() : undefined,
        quantidade: novaQtd,
        estoque_minimo: estoque_minimo !== undefined ? Number(estoque_minimo) : undefined,
        preco_custo: preco_custo !== undefined ? parseFloat(preco_custo) : undefined,
        preco_venda: preco_venda !== undefined ? parseFloat(preco_venda) : undefined,
        codigo_barras: codigo_barras !== undefined ? String(codigo_barras).trim() : undefined,
        numero_serie: numero_serie !== undefined ? String(numero_serie).trim() : undefined,
        garantia_meses: garantia_meses !== undefined ? Number(garantia_meses) : undefined,
        detalhes_condicao: detalhes_condicao !== undefined ? String(detalhes_condicao).trim() : undefined,
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

// Importação em Massa de Planilha Excel (.xlsx, .xls, .csv)
export const importarExcelEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, base64File } = req.body;

    let rowsToProcess: any[] = [];

    if (Array.isArray(items) && items.length > 0) {
      rowsToProcess = items;
    } else if (base64File) {
      const buffer = Buffer.from(base64File.replace(/^data:.*;base64,/, ''), 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rowsToProcess = XLSX.utils.sheet_to_json(worksheet);
    } else {
      res.status(400).json({ error: 'Nenhum dado de planilha recebido.' });
      return;
    }

    let criados = 0;
    let atualizados = 0;
    let ignorados = 0;

    for (const row of rowsToProcess) {
      // Normalização inteligente de nomes de colunas
      const nome = row['Nome'] || row['NOME'] || row['nome'] || row['Produto'] || row['PRODUTO'] || row['Descricao'] || row['DESCRICAO'] || row['Item'] || row['ITEM'];
      if (!nome || String(nome).trim() === '') {
        ignorados++;
        continue;
      }

      const cleanNome = String(nome).trim();
      const categoria = (row['Categoria'] || row['CATEGORIA'] || row['categoria'] || row['Tipo'] || 'OUTRO').toString().trim().toUpperCase();
      const condicao = (row['Condição'] || row['CONDIÇÃO'] || row['Condicao'] || row['CONDICAO'] || row['Estado'] || 'NOVO').toString().trim().toUpperCase();
      const quantidade = parseInt(row['Quantidade'] || row['QUANTIDADE'] || row['qtd'] || row['Qtd'] || row['Estoque'] || 1) || 0;
      const estoqueMinimo = parseInt(row['Estoque Mínimo'] || row['Estoque Minimo'] || row['ESTOQUE_MINIMO'] || row['Minimo'] || 2) || 2;
      const precoCusto = parseFloat(String(row['Preço Custo'] || row['Preco Custo'] || row['Custo'] || row['PRECO_CUSTO'] || 0).replace('R$', '').replace(',', '.')) || 0;
      const precoVenda = parseFloat(String(row['Preço Venda'] || row['Preco Venda'] || row['Venda'] || row['PRECO_VENDA'] || row['Valor'] || 0).replace('R$', '').replace(',', '.')) || 0;
      const codigoBarras = (row['Código de Barras'] || row['Codigo de Barras'] || row['Codigo'] || row['EAN'] || row['CODIGO_BARRAS'] || '').toString().trim() || null;
      const numeroSerie = (row['Nº de Série'] || row['Numero de Serie'] || row['Serial'] || row['IMEI'] || row['NUMERO_SERIE'] || '').toString().trim() || null;
      const garantiaMeses = parseInt(row['Garantia (Meses)'] || row['Garantia'] || row['GARANTIA'] || (condicao.includes('USADO') ? 3 : 12)) || 3;
      const detalhesCondicao = (row['Detalhes'] || row['Observações'] || row['Observacao'] || row['Condição Detalhes'] || '').toString().trim() || null;
      const localizacao = (row['Localização'] || row['Localizacao'] || row['Gaveta'] || row['Prateleira'] || row['LOCALIZACAO'] || '').toString().trim() || null;

      // Verifica se produto já existe por código de barras ou nome
      const existing = await prisma.itemEstoque.findFirst({
        where: {
          OR: [
            ...(codigoBarras ? [{ codigo_barras: codigoBarras }] : []),
            { nome: cleanNome }
          ]
        }
      });

      if (existing) {
        await prisma.itemEstoque.update({
          where: { id: existing.id },
          data: {
            quantidade: existing.quantidade + quantidade,
            preco_custo: precoCusto > 0 ? precoCusto : existing.preco_custo,
            preco_venda: precoVenda > 0 ? precoVenda : existing.preco_venda,
            condicao: condicao.includes('USAD') ? 'USADO' : existing.condicao,
            numero_serie: numeroSerie || existing.numero_serie,
            localizacao: localizacao || existing.localizacao
          }
        });
        atualizados++;
      } else {
        await prisma.itemEstoque.create({
          data: {
            nome: cleanNome,
            categoria,
            condicao: condicao.includes('USAD') ? 'USADO' : 'NOVO',
            quantidade,
            estoque_minimo: estoqueMinimo,
            preco_custo: precoCusto,
            preco_venda: precoVenda,
            codigo_barras: codigoBarras,
            numero_serie: numeroSerie,
            garantia_meses: garantiaMeses,
            detalhes_condicao: detalhesCondicao,
            localizacao
          }
        });
        criados++;
      }
    }

    invalidateEstoqueCache();

    res.json({
      message: `Planilha processada com sucesso! ${criados} produtos criados, ${atualizados} atualizados.`,
      criados,
      atualizados,
      ignorados,
      totalProcessado: rowsToProcess.length
    });
  } catch (error) {
    console.error('Erro ao importar planilha Excel no estoque:', error);
    res.status(500).json({ error: 'Erro ao importar planilha. Verifique o formato do arquivo.' });
  }
};

// Exportação de Todo o Catálogo em Planilha Excel
export const exportarExcelEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itens = await prisma.itemEstoque.findMany({
      orderBy: [
        { condicao: 'asc' },
        { categoria: 'asc' },
        { nome: 'asc' }
      ]
    });

    const exportData = itens.map(i => ({
      'ID': i.id,
      'Nome': i.nome,
      'Categoria': i.categoria,
      'Condição': i.condicao,
      'Quantidade': i.quantidade,
      'Estoque Mínimo': i.estoque_minimo,
      'Preço Custo (R$)': i.preco_custo,
      'Preço Venda (R$)': i.preco_venda,
      'Margem Lucro (R$)': (i.preco_venda - i.preco_custo),
      'Código de Barras': i.codigo_barras || '',
      'Nº de Série / IMEI': i.numero_serie || '',
      'Garantia (Meses)': i.garantia_meses,
      'Detalhes Condição': i.detalhes_condicao || '',
      'Localização': i.localizacao || '',
      'Cadastrado Em': i.createdAt.toISOString().slice(0, 10)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque_Scooby');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Estoque_Scooby_OS.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar estoque para Excel:', error);
    res.status(500).json({ error: 'Erro ao gerar planilha do estoque.' });
  }
};

// Importação rápida dos itens mais frequentes da assistência técnica (Novos + Usados/Seminovos)
export const importDefaultEstoqueItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itensPadrao = [
      // PRODUTOS USADOS / SEMINOVOS REVISADOS
      { nome: 'Notebook Dell Latitude Core i5 8GB SSD 256GB (Usado Revisado)', categoria: 'NOTEBOOK', condicao: 'USADO', quantidade: 2, estoque_minimo: 1, preco_custo: 850.00, preco_venda: 1450.00, garantia_meses: 3, detalhes_condicao: 'Bateria 90%, carcaça impecável, acompanha carregador original', localizacao: 'Vitrine 1' },
      { nome: 'Notebook Lenovo ThinkPad Core i7 16GB SSD 512GB (Usado Revisado)', categoria: 'NOTEBOOK', condicao: 'USADO', quantidade: 1, estoque_minimo: 1, preco_custo: 1200.00, preco_venda: 1990.00, garantia_meses: 3, detalhes_condicao: 'Excelente estado, teclado retroiluminado', localizacao: 'Vitrine 1' },
      { nome: 'Placa Mãe Asus H110M LGA 1151 DDR4 (Usada Testada 100%)', categoria: 'PLACA_MAE', condicao: 'USADO', quantidade: 3, estoque_minimo: 1, preco_custo: 180.00, preco_venda: 340.00, garantia_meses: 3, detalhes_condicao: 'Testada em estresse de bancada, todos os slots e saídas 100%', localizacao: 'Prateleira Peças Usadas' },
      { nome: 'Placa de Vídeo GTX 1660 Super 6GB GDDR6 (Usada Revisada)', categoria: 'PLACA_VIDEO', condicao: 'USADO', quantidade: 2, estoque_minimo: 1, preco_custo: 550.00, preco_venda: 890.00, garantia_meses: 3, detalhes_condicao: 'Pasta térmica trocada, ventoinhas novas', localizacao: 'Vitrine 2' },
      { nome: 'Memória RAM 8GB DDR3 Desktop 1600MHz Kingston (Usada)', categoria: 'MEMORIA', condicao: 'USADO', quantidade: 8, estoque_minimo: 2, preco_custo: 40.00, preco_venda: 95.00, garantia_meses: 3, localizacao: 'Gaveta Usados A' },
      { nome: 'SSD 240GB Kingston SATA III (Usado Saudável 100%)', categoria: 'SSD', condicao: 'USADO', quantidade: 5, estoque_minimo: 2, preco_custo: 60.00, preco_venda: 130.00, garantia_meses: 3, detalhes_condicao: 'Saúde CrystalDiskInfo 100%', localizacao: 'Gaveta Usados A' },

      // PRODUTOS NOVOS - SSDs
      { nome: 'SSD 240GB Kingston / Crucial SATA III (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 150.00, preco_venda: 300.00, garantia_meses: 12, localizacao: 'Armário A1' },
      { nome: 'SSD 480GB Kingston / WD Green SATA III (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 5, estoque_minimo: 2, preco_custo: 210.00, preco_venda: 390.00, garantia_meses: 12, localizacao: 'Armário A1' },
      { nome: 'SSD 1TB NVMe M.2 Kingston NV2 (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 360.00, preco_venda: 580.00, garantia_meses: 12, localizacao: 'Armário A1' },

      // PRODUTOS NOVOS - Memórias RAM
      { nome: 'Memória RAM 8GB DDR4 3200MHz Notebook / SODIMM (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 120.00, preco_venda: 240.00, garantia_meses: 12, localizacao: 'Gaveta B1' },
      { nome: 'Memória RAM 16GB DDR4 3200MHz Notebook / SODIMM (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 4, estoque_minimo: 1, preco_custo: 220.00, preco_venda: 410.00, garantia_meses: 12, localizacao: 'Gaveta B1' },
      { nome: 'Memória RAM 8GB DDR4 3200MHz Desktop (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 5, estoque_minimo: 2, preco_custo: 115.00, preco_venda: 230.00, garantia_meses: 12, localizacao: 'Gaveta B1' },

      // Telas e Celulares
      { nome: 'Tela Frontal iPhone 11 Incell Premium', categoria: 'TELA', condicao: 'NOVO', quantidade: 2, estoque_minimo: 1, preco_custo: 160.00, preco_venda: 340.00, garantia_meses: 3, localizacao: 'Gaveta Telas C1' },
      { nome: 'Tela Frontal Samsung A10 / A20 / A30 OLED', categoria: 'TELA', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 140.00, preco_venda: 290.00, garantia_meses: 3, localizacao: 'Gaveta Telas C2' },
      { nome: 'Bateria iPhone 11 com Chip', categoria: 'BATERIA', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 90.00, preco_venda: 220.00, garantia_meses: 3, localizacao: 'Gaveta Baterias' },
      { nome: 'Conector de Carga USB-C Universal', categoria: 'CONECTOR', condicao: 'NOVO', quantidade: 15, estoque_minimo: 5, preco_custo: 10.00, preco_venda: 90.00, garantia_meses: 3, localizacao: 'Gaveteiro Miudezas' },

      // Insumos & Impressoras
      { nome: 'Pasta Térmica Prata Alta Condutividade (Seringa)', categoria: 'INSUMO', condicao: 'NOVO', quantidade: 8, estoque_minimo: 3, preco_custo: 25.00, preco_venda: 60.00, garantia_meses: 12, localizacao: 'Bancada Insumos' },
      { nome: 'Tinta Refil Epson 664 / 544 Black 70ml', categoria: 'INSUMO', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 28.00, preco_venda: 65.00, garantia_meses: 12, localizacao: 'Prateleira Impressoras' }
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

};

// Lista serviços de balcão pré-configurados (ou padrões caso ainda não cadastrados no banco)
export const listServicosBalcao = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const servicosDb = await prisma.itemEstoque.findMany({
      where: { categoria: 'SERVICO_BALCAO' },
      orderBy: { id: 'asc' }
    });

    if (servicosDb.length > 0) {
      res.json({ servicos: servicosDb });
      return;
    }

    // Se ainda não houver nenhum no banco, popula os 8 padrões automaticamente
    const servicosPadrao = [
      { nome: 'Impressão Preto & Branco (A4)', preco_venda: 1.00, preco_custo: 0.10, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '📄 Xerox ou impressão monocromática por folha' },
      { nome: 'Impressão Colorida (A4 Gráfica)', preco_venda: 2.50, preco_custo: 0.35, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '🎨 Impressão de imagens ou texto colorido em alta resolução' },
      { nome: 'Elaboração e Impressão de Currículo', preco_venda: 20.00, preco_custo: 0.50, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '📝 Digitação, formatação profissional e 2 vias impressas' },
      { nome: 'Montagem & Edição de Fotos / Imagens', preco_venda: 15.00, preco_custo: 0.00, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '🖼️ Foto 3x4, restauração, recorte, ajuste de imagem ou arte' },
      { nome: 'Digitalização / Scanner de Documentos', preco_venda: 3.00, preco_custo: 0.00, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '📂 Escaneamento em PDF e envio por WhatsApp ou E-mail' },
      { nome: 'Aplicação de Película (Mão de Obra)', preco_venda: 10.00, preco_custo: 0.00, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '🛡️ Instalação profissional alinhada sem bolhas' },
      { nome: 'Backup de Arquivos em Pen Drive', preco_venda: 20.00, preco_custo: 0.00, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '💾 Cópia e organização de fotos, documentos e arquivos' },
      { nome: 'Limpeza & Desoxidação de Conector', preco_venda: 35.00, preco_custo: 0.00, categoria: 'SERVICO_BALCAO', condicao: 'NOVO', quantidade: 99999, estoque_minimo: 0, garantia_meses: 0, detalhes_condicao: '🧹 Higienização de conector de carga e fones' }
    ];

    const criados = [];
    for (const s of servicosPadrao) {
      const item = await prisma.itemEstoque.create({ data: s });
      criados.push(item);
    }

    invalidateEstoqueCache();
    res.json({ servicos: criados });
  } catch (error) {
    console.error('Erro ao listar serviços de balcão:', error);
    res.status(500).json({ error: 'Erro ao carregar serviços de balcão.' });
  }
};

// Salva/Atualiza a tabela de preços de serviços de balcão (Exclusivo ADMIN / GERENTE)
export const saveServicosBalcao = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { servicos } = req.body;
    if (!Array.isArray(servicos)) {
      res.status(400).json({ error: 'Lista de serviços inválida.' });
      return;
    }

    for (const s of servicos) {
      const precoVenda = parseFloat(s.preco_venda) || 0;
      const precoCusto = parseFloat(s.preco_custo) || 0;
      const nome = String(s.nome).trim();
      const detalhes = s.detalhes_condicao ? String(s.detalhes_condicao).trim() : null;

      if (s.id && s.id > 0) {
        await prisma.itemEstoque.update({
          where: { id: Number(s.id) },
          data: {
            nome,
            preco_venda: precoVenda,
            preco_custo: precoCusto,
            detalhes_condicao: detalhes
          }
        });
      } else if (nome) {
        await prisma.itemEstoque.create({
          data: {
            nome,
            categoria: 'SERVICO_BALCAO',
            condicao: 'NOVO',
            quantidade: 99999,
            estoque_minimo: 0,
            preco_venda: precoVenda,
            preco_custo: precoCusto,
            garantia_meses: 0,
            detalhes_condicao: detalhes
          }
        });
      }
    }

    invalidateEstoqueCache();

    const servicosAtualizados = await prisma.itemEstoque.findMany({
      where: { categoria: 'SERVICO_BALCAO' },
      orderBy: { id: 'asc' }
    });

    res.json({
      message: 'Preços de serviços de balcão atualizados com sucesso!',
      servicos: servicosAtualizados
    });
  } catch (error) {
    console.error('Erro ao salvar serviços de balcão:', error);
    res.status(500).json({ error: 'Erro ao salvar tabela de preços.' });
  }
};