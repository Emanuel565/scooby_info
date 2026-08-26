import React, { useRef } from 'react';
import { Venda } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, Send, ShieldCheck, ShoppingBag, CheckCircle, Tag } from 'lucide-react';

interface PrintVendaModalProps {
  venda: Venda | null;
  onClose: () => void;
}

export const PrintVendaModal: React.FC<PrintVendaModalProps> = ({ venda, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!venda) return null;

  const handlePrint = () => {
    window.print();
  };

  const getFormaPagtoLabel = (forma: string) => {
    switch (forma) {
      case 'DINHEIRO': return '💵 Dinheiro';
      case 'PIX': return '⚡ PIX';
      case 'CARTAO_DEBITO': return '💳 Cartão de Débito';
      case 'CARTAO_CREDITO': return '💳 Cartão de Crédito';
      default: return forma;
    }
  };

  const cleanPhone = (venda.cliente_telefone || '').replace(/\D/g, '');
  const itensResumo = venda.itens.map(i => {
    const isServ = i.garantia_meses === 0 || i.nome_produto.toLowerCase().includes('impress') || i.nome_produto.toLowerCase().includes('curr') || i.nome_produto.toLowerCase().includes('foto');
    const tipoLabel = isServ ? 'Serviço' : i.condicao === 'USADO' ? 'Usado' : 'Novo';
    return `• ${i.quantidade}x ${i.nome_produto} (${tipoLabel}) - ${formatCurrency(i.subtotal)}`;
  }).join('\n');

  const msgWhatsApp = encodeURIComponent(
    `Olá, *${venda.cliente_nome || 'Cliente'}*! Aqui está o comprovante da sua compra na *Scooby Assistência Técnica*:\n\n` +
    `🧾 *Venda:* ${venda.codigo_venda}\n` +
    `📅 *Data:* ${formatDate(venda.createdAt)}\n` +
    `💳 *Pagamento:* ${getFormaPagtoLabel(venda.forma_pagamento)}\n\n` +
    `🛍️ *Itens:*\n${itensResumo}\n\n` +
    `💰 *Total Pago:* ${formatCurrency(venda.valor_total)}\n` +
    `🛡️ *Garantia:* 90 dias sobre peças/acessórios e garantia legal sobre serviços.\n\n` +
    `Obrigado pela preferência! Qualquer dúvida, estamos à disposição no WhatsApp (41) 3565-2008.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 no-print">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-sm">Comprovante de Venda Balcão</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Comprovante (Área de Impressão) */}
        <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-950/50">
          <div 
            ref={printRef}
            className="w-full max-w-[340px] bg-white text-slate-950 p-5 rounded-2xl shadow-md text-xs font-mono border border-slate-200 print:max-w-full print:p-0 print:border-none print:shadow-none"
          >
            {/* Topo do Recibo */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
              <h2 className="text-sm font-black tracking-tight text-slate-900">SCOOBY INFORMÁTICA</h2>
              <p className="text-[10px] text-slate-600">Assistência Técnica & Venda de Peças</p>
              <p className="text-[10px] text-slate-600">WhatsApp: (41) 3565-2008</p>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                  CUPOM NÃO FISCAL
                </span>
              </div>
            </div>

            {/* Informações da Venda */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Código:</span>
                <span className="font-bold">{venda.codigo_venda}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Data/Hora:</span>
                <span>{formatDate(venda.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Vendedor:</span>
                <span className="font-semibold">{venda.vendedor ? venda.vendedor.nome : 'Balcão'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cliente:</span>
                <span className="font-semibold">{venda.cliente_nome || 'Cliente Balcão'}</span>
              </div>
              {venda.cliente_telefone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Telefone:</span>
                  <span>{venda.cliente_telefone}</span>
                </div>
              )}
            </div>

            {/* Lista de Itens */}
            <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Itens da Compra:</span>
              
              <div className="space-y-2">
                {venda.itens.map((it, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-1.5 last:border-none">
                    <div className="flex justify-between items-start font-bold text-[11.5px]">
                      <span>{it.quantidade}x {it.nome_produto}</span>
                      <span>{formatCurrency(it.subtotal)}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[9.5px] text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-500" />
                        Condição: <strong>{it.condicao === 'USADO' ? 'Usado / Seminovo' : 'Novo'}</strong>
                      </span>
                      <span>Unit: {formatCurrency(it.preco_unitario)}</span>
                    </div>

                    {it.numero_serie && (
                      <p className="text-[9px] text-slate-500 font-mono">
                        Serial/IMEI: {it.numero_serie}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totais e Pagamento */}
            <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-1.5 text-xs">
              {venda.desconto > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(venda.desconto)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black pt-1">
                <span>TOTAL PAGO:</span>
                <span className="text-slate-900">{formatCurrency(venda.valor_total)}</span>
              </div>

              <div className="flex justify-between text-[11px] pt-1 text-slate-700">
                <span>Forma de Pagamento:</span>
                <span className="font-bold">{getFormaPagtoLabel(venda.forma_pagamento)}</span>
              </div>

              {venda.forma_pagamento === 'DINHEIRO' && venda.troco_para && (
                <>
                  <div className="flex justify-between text-[10.5px] text-slate-600">
                    <span>Valor Recebido:</span>
                    <span>{formatCurrency(venda.troco_para)}</span>
                  </div>
                  <div className="flex justify-between text-[10.5px] font-bold text-slate-800">
                    <span>Troco:</span>
                    <span>{formatCurrency(venda.troco_devolvido || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Termo de Garantia */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-slate-600 leading-tight">
              <p className="font-bold text-slate-800 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                TERMO DE GARANTIA LEGAL
              </p>
              <p>Garantia de 90 dias sobre produtos usados/seminovos revisados e garantia de fábrica para itens novos contra defeitos de fabricação.</p>
              <p className="pt-2 font-bold text-slate-700">Obrigado pela preferência!</p>
            </div>
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="p-4 border-t border-white/10 bg-navy-950 flex flex-wrap items-center justify-between gap-2 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={`https://wa.me/55${cleanPhone}?text=${msgWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-teal cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Recibo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
