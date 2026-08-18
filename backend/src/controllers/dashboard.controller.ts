import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index.js';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalOS = await prisma.ordemServico.count();
    
    const statusCounts = await prisma.ordemServico.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusMap: Record<string, number> = {
      TRIAGEM: 0,
      EM_ANDAMENTO: 0,
      AGUARDANDO_PECA: 0,
      AGUARDANDO_APROVACAO: 0,
      TESTES: 0,
      CONCLUIDO: 0,
      ENTREGUE: 0,
      CANCELADO: 0
    };

    statusCounts.forEach((item) => {
      statusMap[item.status] = item._count.id;
    });

    const prioridadeCounts = await prisma.ordemServico.groupBy({
      by: ['prioridade'],
      _count: { id: true }
    });

    const prioridadeMap: Record<string, number> = {
      BAIXA: 0,
      MEDIA: 0,
      ALTA: 0,
      URGENTE: 0
    };

    prioridadeCounts.forEach((item) => {
      prioridadeMap[item.prioridade] = item._count.id;
    });

    const now = new Date();
    const em24Horas = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const vencidasCount = await prisma.ordemServico.count({
      where: {
        status: { in: ['TRIAGEM', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES'] },
        prazo_entrega: { lt: now }
      }
    });

    const criticas24hCount = await prisma.ordemServico.count({
      where: {
        status: { in: ['TRIAGEM', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES'] },
        prazo_entrega: { gte: now, lte: em24Horas }
      }
    });

    const tecnicos = await prisma.usuario.findMany({
      where: {
        cargo: { in: ['TECNICO', 'TECNICO_CELULAR', 'ADMIN', 'GERENTE'] }
      },
      select: {
        id: true,
        nome: true,
        cargo: true,
        status: true,
        especialidades: true,
        _count: {
          select: {
            os_atribuidas: {
              where: {
                status: { in: ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES', 'AGUARDANDO_APROVACAO'] }
              }
            }
          }
        }
      }
    });

    const parsedTecnicos = tecnicos.map((t) => {
      let especialidades = [];
      try {
        especialidades = JSON.parse(t.especialidades);
      } catch {
        especialidades = [];
      }
      return {
        ...t,
        especialidades,
        os_ativas: t._count.os_atribuidas
      };
    });

    const financeiro = await prisma.ordemServico.aggregate({
      _sum: {
        orcamento_valor: true,
        valor_final: true
      },
      where: {
        status: { in: ['CONCLUIDO', 'ENTREGUE'] }
      }
    });

    const isAdmin = req.user?.cargo === 'ADMIN';

    res.json({
      totalOS,
      statusMap,
      prioridadeMap,
      sla: {
        vencidas: vencidasCount,
        criticas24h: criticas24hCount
      },
      tecnicosCarga: parsedTecnicos,
      faturamento: isAdmin ? {
        totalConcluido: financeiro._sum.valor_final || 0
      } : null
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao gerar dashboard de métricas' });
  }
};

export const getAdminReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { periodo } = req.query; // 'semanal' | 'mensal' | 'mes_anterior' | 'geral'
    
    const now = new Date();
    let dataInicio: Date;
    let dataFim: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let periodoLabel = 'Esta Semana (Últimos 7 dias)';

    if (periodo === 'diario') {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      dataFim = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const dataFormatada = now.toLocaleDateString('pt-BR');
      periodoLabel = `Relatório Diário (Hoje - ${dataFormatada})`;
    } else if (periodo === 'mensal') {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const nomeMes = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      periodoLabel = `Mês Atual (${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)})`;
    } else if (periodo === 'mes_anterior') {
      const anoAnterior = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const mesAnterior = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      dataInicio = new Date(anoAnterior, mesAnterior, 1, 0, 0, 0, 0);
      dataFim = new Date(anoAnterior, mesAnterior + 1, 0, 23, 59, 59, 999);
      const nomeMesAnt = dataInicio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      periodoLabel = `Mês Anterior (${nomeMesAnt.charAt(0).toUpperCase() + nomeMesAnt.slice(1)})`;
    } else if (periodo === 'geral') {
      dataInicio = new Date(2020, 0, 1);
      periodoLabel = 'Todo o Período / Histórico Completo';
    } else {
      // Padrão: Semanal (últimos 7 dias)
      dataInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dataInicio.setHours(0, 0, 0, 0);
      periodoLabel = 'Relatório Semanal (Últimos 7 dias)';
    }

    const whereDateFilter = {
      createdAt: {
        gte: dataInicio,
        lte: dataFim
      }
    };

    // 1. Contagens de OS no período
    const totalCriadas = await prisma.ordemServico.count({ where: whereDateFilter });
    
    const concluidas = await prisma.ordemServico.findMany({
      where: {
        ...whereDateFilter,
        status: { in: ['CONCLUIDO', 'ENTREGUE'] }
      },
      include: {
        tecnico: { select: { id: true, nome: true, cargo: true } },
        concluido_por: { select: { id: true, nome: true, cargo: true } },
        criado_por: { select: { id: true, nome: true, cargo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const entreguesCount = concluidas.filter(o => o.status === 'ENTREGUE').length;
    const canceladasCount = await prisma.ordemServico.count({
      where: { ...whereDateFilter, status: 'CANCELADO' }
    });
    const emAndamentoCount = await prisma.ordemServico.count({
      where: { ...whereDateFilter, status: { in: ['TRIAGEM', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'AGUARDANDO_APROVACAO', 'TESTES'] } }
    });

    // 2. Faturamento, Custos e Lucro Líquido
    const faturamentoTotal = concluidas.reduce((acc, curr) => acc + (curr.valor_final || curr.orcamento_valor || 0), 0);
    const custoTotalPecas = concluidas.reduce((acc, curr) => acc + (curr.custo_pecas || 0), 0);
    const lucroLiquidoTotal = concluidas.reduce((acc, curr) => {
      const lucro = curr.lucro_liquido || ((curr.valor_final || 0) - (curr.custo_pecas || 0));
      return acc + (lucro > 0 ? lucro : (curr.valor_final || curr.orcamento_valor || 0));
    }, 0);
    const ticketMedio = concluidas.length > 0 ? faturamentoTotal / concluidas.length : 0;
    const margemLucro = faturamentoTotal > 0 ? ((lucroLiquidoTotal / faturamentoTotal) * 100).toFixed(1) : '100';

    // 3. Distribuição por Tipo de Equipamento
    const equipamentoMap: Record<string, { total: number; faturamento: number }> = {};
    const labelsEquipamento: Record<string, string> = {
      NOTEBOOK: 'Notebooks',
      SMARTPHONE: 'Smartphones / Celulares',
      IMPRESSORA: 'Impressoras / Multifuncionais',
      PC_DESKTOP: 'PCs / Desktops',
      CONSOLE: 'Consoles / Games',
      TABLET: 'Tablets',
      MONITOR: 'Monitores',
      OUTRO: 'Outros'
    };

    concluidas.forEach(o => {
      const tipo = o.tipo_equipamento || 'OUTRO';
      if (!equipamentoMap[tipo]) {
        equipamentoMap[tipo] = { total: 0, faturamento: 0 };
      }
      equipamentoMap[tipo].total += 1;
      equipamentoMap[tipo].faturamento += (o.valor_final || o.orcamento_valor || 0);
    });

    const faturamentoPorEquipamento = Object.keys(equipamentoMap).map(tipo => {
      const info = equipamentoMap[tipo];
      return {
        tipo,
        label: labelsEquipamento[tipo] || tipo,
        total: info.total,
        faturamento: info.faturamento,
        percentual: faturamentoTotal > 0 ? ((info.faturamento / faturamentoTotal) * 100).toFixed(1) : '0'
      };
    }).sort((a, b) => b.faturamento - a.faturamento);

    // 4. Desempenho por Técnico QUE FINALIZOU O SERVIÇO
    const tecnicoMap: Record<number, { id: number; nome: string; cargo: string; totalOS: number; faturamento: number; tempoTotalSegundos: number }> = {};

    concluidas.forEach(o => {
      // Prioriza quem concluiu o serviço, seguido pelo técnico atribuído ou criador
      const techFinalizou = o.concluido_por || o.tecnico || o.criado_por;
      const tId = techFinalizou?.id || 0;
      const tNome = techFinalizou?.nome || 'Técnico';
      const tCargo = techFinalizou?.cargo || 'TECNICO';

      if (!tecnicoMap[tId]) {
        tecnicoMap[tId] = { id: tId, nome: tNome, cargo: tCargo, totalOS: 0, faturamento: 0, tempoTotalSegundos: 0 };
      }
      tecnicoMap[tId].totalOS += 1;
      tecnicoMap[tId].faturamento += (o.valor_final || o.orcamento_valor || 0);
      tecnicoMap[tId].tempoTotalSegundos += (o.tempo_bancada_segundos || 0);
    });

    const desempenhoTecnicos = Object.values(tecnicoMap).sort((a, b) => b.faturamento - a.faturamento);

    // 5. Relatório Estruturado
    res.json({
      periodo: {
        tipo: periodo || 'semanal',
        label: periodoLabel,
        inicio: dataInicio.toISOString(),
        fim: dataFim.toISOString()
      },
      metricas: {
        totalCriadas,
        totalConcluidas: concluidas.length,
        totalEntregues: entreguesCount,
        totalCanceladas: canceladasCount,
        totalEmAndamento: emAndamentoCount,
        faturamentoTotal,
        custoTotalPecas,
        lucroLiquidoTotal,
        margemLucro,
        ticketMedio,
        taxaAprovacao: totalCriadas > 0 ? (((concluidas.length + emAndamentoCount) / totalCriadas) * 100).toFixed(1) : '100'
      },
      faturamentoPorEquipamento,
      desempenhoTecnicos,
      ordensConcluidas: concluidas.map(o => {
        const techFinal = o.concluido_por?.nome || o.tecnico?.nome || 'Técnico';
        const vFinal = o.valor_final || o.orcamento_valor || 0;
        const cPecas = o.custo_pecas || 0;
        const lLiq = o.lucro_liquido || (vFinal - cPecas);
        return {
          id: o.id,
          codigo_os: o.codigo_os,
          cliente_nome: o.cliente_nome,
          cliente_telefone: o.cliente_whatsapp || o.cliente_telefone,
          tipo_equipamento: o.tipo_equipamento,
          marca_modelo: o.marca_modelo,
          valor_final: vFinal,
          custo_pecas: cPecas,
          lucro_liquido: lLiq,
          status: o.status,
          tecnico: techFinal,
          concluido_por: techFinal,
          dataConclusao: o.concluidoEm || o.updatedAt,
          dataCriacao: o.createdAt
        };
      })
    });
  } catch (error) {
    console.error('Erro ao gerar relatório administrativo:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};