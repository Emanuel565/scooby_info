import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPublicOSByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      res.status(400).json({ error: 'Código da OS é obrigatório.' });
      return;
    }

    const cleanCode = String(codigo).trim().toUpperCase();

    const os = await prisma.ordemServico.findFirst({
      where: {
        codigo_os: {
          equals: cleanCode
        }
      },
      select: {
        id: true,
        codigo_os: true,
        cliente_nome: true,
        tipo_equipamento: true,
        marca_modelo: true,
        defeito_relatado: true,
        laudo_tecnico: true,
        orcamento_valor: true,
        valor_final: true,
        status: true,
        prioridade: true,
        prazo_entrega: true,
        fotos_equipamento: true,
        tempo_bancada_segundos: true,
        createdAt: true,
        updatedAt: true,
        concluidoEm: true,
        entregueEm: true,
        orcamento_enviado_em: true
      }
    });

    if (!os) {
      res.status(404).json({ error: 'Ordem de Serviço não encontrada. Verifique o código e tente novamente.' });
      return;
    }

    res.json({ os });
  } catch (error) {
    console.error('Erro ao consultar OS pública:', error);
    res.status(500).json({ error: 'Erro ao consultar status da OS.' });
  }
};