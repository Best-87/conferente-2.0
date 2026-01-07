import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory } from '../utils/historyStorage';
import { WeighingRecord } from '../types';

const TicketScreen: React.FC = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);

  useEffect(() => {
    // Load all history records. This is "permanent" (from localStorage) until cleared.
    setRecords(getHistory());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleClearTicket = () => {
    // Warning before deletion
    if (window.confirm("⚠️ ATENÇÃO: Deseja apagar este ticket?\n\nIsso limpará todo o histórico de pesagens permanentemente.\nEsta ação não pode ser desfeita.")) {
        clearHistory();
        setRecords([]);
    }
  };

  const calculateTotalNet = () => records.reduce((acc, r) => acc + r.netWeight, 0);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-on-surface-variant/50">
        <span className="material-symbols-rounded text-6xl mb-4 opacity-50">receipt_long</span>
        <p className="text-sm font-medium">Nenhum registro para gerar ticket</p>
      </div>
    );
  }

  return (
    <>
    <style>{`
      @media print {
        @page { margin: 0; size: auto; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        body * { visibility: hidden; }
        #ticket-view, #ticket-view * { visibility: visible; }
        #ticket-view { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 0;
            background: white; 
            color: black;
            overflow: visible;
        }
        .no-print { display: none !important; }
      }
      .font-mono { font-family: 'Courier New', Courier, monospace; }
      .ticket-paper {
        background-color: #fff;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      /* Dotted leader implementation for filling spaces */
      .leader-row {
        display: flex;
        align-items: baseline;
        width: 100%;
      }
      .leader-dots {
        flex: 1;
        border-bottom: 1px dotted #000;
        margin: 0 4px;
        position: relative;
        top: -4px;
        opacity: 0.5;
      }
    `}</style>

    <div className="flex flex-col items-center pb-24 px-4 pt-2 animate-in zoom-in-95 duration-300 h-full overflow-y-auto w-full">
      
      {/* Continuous Paper Container */}
      <div id="ticket-view" className="ticket-paper w-full max-w-[360px] bg-white text-black relative p-5 text-xs font-mono leading-tight mb-4 mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 border-b-2 border-black pb-4 text-center">
            <h1 className="text-2xl font-black uppercase tracking-widest mb-1">CONFERENTE</h1>
            <p className="text-[10px] uppercase tracking-wide">Relatório de Pesagem</p>
            <p className="text-[10px] mt-1">{new Date().toLocaleString('pt-BR')}</p>
            <div className="w-full border-b border-black border-dashed mt-2"></div>
        </div>

        {/* List of Tickets */}
        <div className="flex flex-col gap-6">
            {records.map((record, index) => {
                const diff = record.netWeight - record.targetWeight;
                const dateObj = new Date(record.timestamp);
                const itemNum = records.length - index;
                
                return (
                    <div key={record.id} className="flex flex-col relative">
                         {/* Item Separator if not first */}
                         {index > 0 && <div className="absolute -top-3 w-full border-t border-dashed border-black/30"></div>}

                        {/* Item Header */}
                        <div className="flex justify-between items-center mb-1 font-bold">
                            <span className="text-sm">ITEM #{String(itemNum).padStart(3, '0')}</span>
                            <span className="text-[10px]">{dateObj.toLocaleTimeString('pt-BR')}</span>
                        </div>

                        {/* Supplier & Product - Full Width Block */}
                        <div className="bg-black text-white p-2 mb-2">
                            <div className="font-bold uppercase text-xs truncate">{record.supplier}</div>
                            <div className="uppercase text-[10px] truncate opacity-90">{record.product}</div>
                        </div>

                        {/* Data Rows with Leaders */}
                        <div className="flex flex-col gap-1 mb-2 px-1">
                             <div className="leader-row">
                                <span>PESO BRUTO</span>
                                <div className="leader-dots"></div>
                                <span className="font-bold">{record.grossWeight.toFixed(2)} kg</span>
                             </div>
                             <div className="leader-row">
                                <span>TARA ({record.boxQuantity}cx)</span>
                                <div className="leader-dots"></div>
                                <span>{record.tare.toFixed(3)} kg</span>
                             </div>
                             
                             <div className="leader-row font-black text-sm mt-1">
                                <span>LÍQUIDO</span>
                                <div className="leader-dots border-black opacity-100"></div>
                                <span>{record.netWeight.toFixed(2)} kg</span>
                             </div>
                        </div>

                        {/* Footer info for item (Difference) */}
                        <div className="flex justify-between items-center bg-gray-100 p-1.5 text-[10px] border border-gray-300">
                             <span>NOTA: {record.targetWeight > 0 ? record.targetWeight.toFixed(2) : '---'}</span>
                             <span className={`font-bold ${diff < -0.01 ? 'text-black' : ''}`}>
                                DIF: {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                             </span>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Global Footer / Totals */}
        <div className="mt-8 pt-4 border-t-4 border-double border-black flex flex-col gap-1">
            <div className="leader-row font-bold text-sm">
                <span>ITENS CONFERIDOS</span>
                <div className="leader-dots"></div>
                <span>{records.length}</span>
            </div>
            <div className="leader-row font-black text-lg mt-2">
                <span>TOTAL LÍQUIDO</span>
                <div className="leader-dots border-black opacity-100"></div>
                <span>{calculateTotalNet().toFixed(2)} kg</span>
            </div>
            
            {/* Barcode / End Marker */}
            <div className="mt-8 flex flex-col items-center opacity-80">
                <div className="flex gap-1 h-8 items-end mb-2 w-full justify-center px-4">
                    {[...Array(25)].map((_, i) => (
                        <div key={i} className="bg-black w-1" style={{height: Math.random() > 0.4 ? '100%' : '60%'}}></div>
                    ))}
                </div>
                <p className="text-[10px] uppercase">*** Fim do Relatório ***</p>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col w-full max-w-[360px] gap-3 no-print">
          <div className="flex gap-3 w-full">
            <button 
                onClick={handlePrint}
                className="flex-1 bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
                <span className="material-symbols-rounded">print</span>
                Imprimir
            </button>
            <button 
                onClick={() => {
                    if (navigator.share) {
                        const total = calculateTotalNet().toFixed(2);
                        const text = `Relatório Conferente\nItens: ${records.length}\nTotal Liq: ${total}kg`;
                        navigator.share({ title: 'Relatório', text: text });
                    }
                }}
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
                <span className="material-symbols-rounded">share</span>
                Enviar
            </button>
          </div>

          <button 
            onClick={handleClearTicket}
            className="w-full bg-error-container text-error hover:bg-error-container/80 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 opacity-90 hover:opacity-100"
          >
            <span className="material-symbols-rounded">delete_forever</span>
            Limpar Ticket e Histórico
          </button>
      </div>

    </div>
    </>
  );
};

export default TicketScreen;