import React, { useEffect, useState } from 'react';
import { OrdemServico } from '../types';
import { formatCurrency, formatDate, getEquipmentLabel } from '../utils/formatters';
import { Printer, X, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface PrintTicketModalProps {
  os: OrdemServico | null;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ os, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [trackingUrlText, setTrackingUrlText] = useState<string>('');

  useEffect(() => {
    if (os) {
      // Consulta se há URL pública configurada para o QR Code funcionar pela internet de casa/4G
      fetch('/api/network-info')
        .then(res => res.json())
        .then(info => {
          const baseUrl = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
            ? window.location.origin
            : (info.publicUrl || `${window.location.protocol}//${window.location.host}`);

          const trackingUrl = `${baseUrl}/consulta/${os.codigo_os}`;
          setTrackingUrlText(trackingUrl);

          QRCode.toDataURL(trackingUrl, {
            width: 140,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          })
            .then((url) => setQrCodeUrl(url))
            .catch((err) => console.error('Erro ao gerar QR Code:', err));
        })
        .catch(() => {
          const trackingUrl = `${window.location.protocol}//${window.location.host}/consulta/${os.codigo_os}`;
          setTrackingUrlText(trackingUrl);
          QRCode.toDataURL(trackingUrl, { width: 140, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
            .then((url) => setQrCodeUrl(url))
            .catch(() => {});
        });
    }
  }, [os]);

  if (!os) return null;

  const handlePrint = () => {
    window.print();
  };

  let checklist: Record<string, boolean> = {};
  try {
    checklist = typeof os.checklist_entrada === 'string' ? JSON.parse(os.checklist_entrada || '{}') : os.checklist_entrada || {};
  } catch {}

  const valorExibicao = os.valor_final || os.orcamento_valor || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header do Modal na Tela */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Comprovante de Entrada A4 & Etiqueta de Bancada</h3>
              <p className="text-[11px] text-slate-400">Folha A4 oficial com QR Code de consulta online e protocolo de retirada</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-teal transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Folha A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visualização da Folha A4 (Perfeita para Impressão) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 bg-white m-4 rounded-xl print:m-0 print:p-0 print:shadow-none print:text-black">
          
          {/* ============================================================ */}
          {/* VIA 1: VIA DO CLIENTE (Comprovante Oficial de Entrada)        */}
          {/* ============================================================ */}
          <div className="border-2 border-slate-800 p-4 rounded-xl space-y-3 bg-white">
            
            {/* Cabeçalho da Loja */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
              <div>
                <h1 className="font-black text-xl tracking-tight text-slate-950">
                  SCOOBY INFORMÁTICA & ASSISTÊNCIA TÉCNICA
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  Especializada em Notebooks, Celulares, Impressoras, PCs e Consoles
                </p>
                <p className="text-xs text-slate-600">
                  WhatsApp: <strong>(41) 3565-2008</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-lg text-slate-950 bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-800 inline-block">
                  {os.codigo_os}
                </span>
                <p className="text-[10px] text-slate-600 mt-1">
                  Entrada: <strong>{formatDate(os.createdAt)}</strong>
                </p>
              </div>
            </div>

            {/* Dados do Cliente e Equipamento + QR Code de Consulta */}
            <div className="grid grid-cols-12 gap-3 items-center">
              
              <div className="col-span-8 space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Cliente:</span>
                    <span className="font-bold text-slate-900 text-sm">{os.cliente_nome}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">WhatsApp / Telefone:</span>
                    <span className="font-bold text-slate-900">{os.cliente_whatsapp || os.cliente_telefone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Equipamento / Modelo:</span>
                    <span className="font-bold text-slate-900">{os.marca_modelo} ({getEquipmentLabel(os.tipo_equipamento)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Nº de Série / IMEI:</span>
                    <span className="font-mono text-slate-900">{os.numero_serie || 'Não informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Acessórios Deixados:</span>
                    <span className="text-slate-800">{os.acessorios_inclusos || 'Apenas o aparelho'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Condições Visuais / Avarias:</span>
                    <span className="text-slate-800">{os.condicoes_visuais || 'Sem avarias aparentes'}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Defeito Relatado pelo Cliente:</span>
                  <p className="font-medium text-slate-900 bg-slate-50 p-1.5 rounded border border-slate-200">
                    {os.defeito_relatado}
                  </p>
                </div>
              </div>

              {/* Bloco de QR Code de Consulta em Tempo Real */}
              <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code de Consulta" className="w-24 h-24 object-contain rounded" />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 flex items-center justify-center rounded">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-tight mt-1">
                  📱 Acompanhe Online
                </span>
                <span className="text-[9px] text-slate-600 leading-tight">
                  Aponte a câmera para ver o status no celular
                </span>
                {trackingUrlText && (
                  <span className="text-[7.5px] text-slate-500 font-mono break-all mt-1 px-1 py-0.5 bg-slate-100 rounded border border-slate-200 block max-w-[130px] leading-tight">
                    {trackingUrlText.replace('https://', '')}
                  </span>
                )}
              </div>

            </div>

            {/* Valores e Prazos */}
            <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-xs">
              <div>
                <span className="text-slate-600 font-medium">Previsão de Conclusão (SLA): </span>
                <span className="font-bold text-slate-950">{formatDate(os.prazo_entrega)}</span>
              </div>
              <div>
                <span className="text-slate-600 font-medium">Orçamento Estimado: </span>
                <span className="font-black text-slate-950 text-sm">{formatCurrency(valorExibicao)}</span>
              </div>
            </div>

            {/* Termo Jurídico de Garantia */}
            <p className="text-[8.5px] text-slate-600 leading-tight border-t border-slate-200 pt-1.5 text-justify">
              <strong>* TERMO DE GARANTIA E CONDIÇÕES:</strong> Garantia legal de 90 (noventa) dias sobre os serviços e peças substituídas (Art. 26, II do CDC). A garantia não cobre danos por quedas, umidade, mau uso ou violação dos lacres internos. Equipamentos não retirados em até 90 dias após notificação de conclusão serão considerados abandonados nos termos da legislação vigente.
            </p>
          </div>

          {/* Linha de Corte / Destaque */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="border-t-2 border-dashed border-slate-400 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
              ✂ Destacar Aqui • Via da Loja / Bancada
            </span>
          </div>

          {/* ============================================================ */}
          {/* VIA 2: VIA DA OFICINA & PROTOCOLO DE RETIRADA                */}
          {/* ============================================================ */}
          <div className="border-2 border-slate-900 p-4 rounded-xl space-y-3 bg-amber-50/50">
            
            <div className="flex justify-between items-center border-b border-slate-300 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-950 tracking-wider">
                  VIA DA OFICINA / BANCADA TÉCNICA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold border border-amber-300">
                  {getEquipmentLabel(os.tipo_equipamento)}
                </span>
              </div>

              <span className="font-mono font-black text-base bg-slate-900 text-white px-3 py-0.5 rounded">
                {os.codigo_os}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold text-[10px] block">CLIENTE:</span>
                <span className="font-bold text-slate-900">{os.cliente_nome}</span>
                <span className="text-slate-600 block text-[11px] font-mono">{os.cliente_whatsapp || os.cliente_telefone}</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold text-[10px] block">EQUIPAMENTO & MODELO:</span>
                <span className="font-bold text-slate-900">{os.marca_modelo}</span>
                <span className="text-slate-600 block text-[11px]">Série: {os.numero_serie || 'N/A'}</span>
              </div>

              <div className="bg-white p-2 rounded-lg border-2 border-slate-900 text-center">
                <span className="text-slate-500 font-semibold text-[9px] block uppercase">SENHA DO APARELHO / PIN:</span>
                <span className="font-mono font-black text-base text-slate-950 block">
                  {os.senha_aparelho || 'SEM SENHA'}
                </span>
              </div>
            </div>

            {/* Checklist de Entrada Resumido */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
              <span className="font-bold text-slate-800 block text-[10px] uppercase mb-1">
                Checklist de Entrada Realizado no Balcão:
              </span>
              <div className="flex flex-wrap gap-2 text-slate-700">
                {Object.keys(checklist).map(k => (
                  <span key={k} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    <span className={`w-2 h-2 rounded-full ${checklist[k] ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                    <span className="capitalize">{k.replace(/_/g, ' ')}: {checklist[k] ? 'OK' : 'Defeito/Ausente'}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Campo de Assinatura na Retirada */}
            <div className="pt-2 border-t-2 border-slate-300 text-xs flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">PROTOCOLO DE RETIRADA & ENTREGA:</p>
                <p className="text-[10px] text-slate-600">
                  Declaro que conferi e retirei o equipamento em perfeito estado de funcionamento.
                </p>
                <p className="text-[10px] text-slate-700 pt-1">
                  Data de Retirada: ____ / ____ / 2026 • Valor Pago: <strong>{formatCurrency(valorExibicao)}</strong>
                </p>
              </div>

              <div className="text-center w-56 pt-6">
                <div className="border-t-2 border-slate-900 pt-1">
                  <span className="text-[10px] font-bold text-slate-900 block">Assinatura do Cliente</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};