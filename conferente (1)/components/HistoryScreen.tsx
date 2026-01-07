import React, { useState, useEffect, useMemo } from 'react';
import { WeighingRecord } from '../types';
import { getHistory, clearHistory } from '../utils/historyStorage';
import * as XLSX from 'xlsx';

type FilterType = 'day' | 'week' | 'month' | 'year';

const HistoryScreen: React.FC = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('day');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    setRecords(getHistory());
  }, []);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    // Reset hours to start of day
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of Week (Sunday as start)
    const weekStart = new Date(now);
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartTime = weekStart.getTime();
    
    // Start of Month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Start of Year
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    return records.filter(r => {
        if (filter === 'day') return r.timestamp >= todayStart;
        if (filter === 'week') return r.timestamp >= weekStartTime;
        if (filter === 'month') return r.timestamp >= monthStart;
        if (filter === 'year') return r.timestamp >= yearStart;
        return true;
    });
  }, [records, filter]);

  const handleClearHistory = () => {
    if (window.confirm('⚠️ ATENÇÃO: Tem certeza que deseja apagar todo o histórico de pesagem?\n\nEsta ação também apagará o Ticket atual e não pode ser desfeita.')) {
        clearHistory();
        setRecords([]);
    }
  };

  const exportToWhatsApp = () => {
    if (filteredRecords.length === 0) return;
    let text = `*Relatório Conferente (${getFilterLabel(filter)})*\n------------------\n`;
    filteredRecords.forEach(r => {
        text += `📦 *${r.supplier}* - ${r.product}\n`;
        text += `   Líquido: ${r.netWeight.toFixed(2)}kg | Nota: ${r.targetWeight}kg\n`;
        const diff = r.netWeight - r.targetWeight;
        text += `   Dif: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}kg\n\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const exportToXLSX = () => {
    if (filteredRecords.length === 0) return;
    const data = filteredRecords.map(r => {
        const diff = r.netWeight - r.targetWeight;
        return {
            "Data": new Date(r.timestamp).toLocaleDateString('pt-BR'),
            "Hora": new Date(r.timestamp).toLocaleTimeString('pt-BR'),
            "Fornecedor": r.supplier,
            "Produto": r.product,
            "Peso Nota (kg)": r.targetWeight,
            "Peso Bruto (kg)": r.grossWeight,
            "Tara (kg)": r.tare,
            "Qtd Cx": r.boxQuantity || 1,
            "Peso Líquido (kg)": r.netWeight,
            "Diferença (kg)": diff,
            "Status": diff < -0.01 ? "Falta" : diff > 0.01 ? "Sobra" : "Exato",
            "Com Foto": r.hasPhoto ? "Sim" : "Não"
        };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Conferente");
    XLSX.writeFile(wb, `Conferente_Relatorio_${filter}.xlsx`);
  };

  const printPDF = () => {
    window.print();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getFilterLabel = (f: FilterType) => {
      switch(f) {
          case 'day': return 'Hoje';
          case 'week': return 'Esta Semana';
          case 'month': return 'Este Mês';
          case 'year': return 'Este Ano';
          default: return '';
      }
  };

  const renderDifference = (net: number, target: number) => {
    if (!target || target === 0) return null;
    const diff = net - target;
    const isNeg = diff < -0.01;
    const isPos = diff > 0.01;
    
    let colorClass = 'text-on-surface-variant';
    let icon = 'check';
    
    if (isNeg) {
        colorClass = 'text-error';
        icon = 'arrow_downward';
    } else if (isPos) {
        colorClass = 'text-emerald-600';
        icon = 'arrow_upward';
    }

    return (
        <div className={`flex items-center gap-1 text-sm font-bold ${colorClass} bg-surface-container px-2 py-1 rounded-lg`}>
            <span>{isPos ? '+' : ''}{diff.toFixed(2)} kg</span>
            {diff !== 0 && Math.abs(diff) > 0.01 && (
                 <span className="material-symbols-rounded text-[14px]">{icon}</span>
            )}
        </div>
    );
  };

  return (
    <>
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #history-content, #history-content * { visibility: visible; }
        #history-content { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
        .no-print { display: none !important; }
      }
    `}</style>

    <div id="history-content" className="flex flex-col gap-4 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-on-surface">Histórico</h2>
            <span className="text-xs font-bold text-on-secondary-container bg-secondary-container px-3 py-1 rounded-full">
            {filteredRecords.length} registros
            </span>
        </div>

        {/* Filter Tabs */}
        <div className="bg-surface-container rounded-2xl p-1 flex no-print">
            {(['day', 'week', 'month', 'year'] as FilterType[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                        flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200
                        ${filter === f 
                            ? 'bg-primary text-on-primary shadow-sm' 
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                        }
                    `}
                >
                    {getFilterLabel(f)}
                </button>
            ))}
        </div>

        {filteredRecords.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 no-print">
                <button onClick={exportToWhatsApp} className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-800 p-2.5 rounded-2xl active:scale-95 transition-all hover:bg-emerald-200">
                    <span className="material-symbols-rounded text-[24px]">chat</span>
                    <span className="text-[10px] font-bold uppercase mt-1">Whats</span>
                </button>
                <button onClick={exportToXLSX} className="flex flex-col items-center justify-center bg-surface-container-high text-primary p-2.5 rounded-2xl active:scale-95 transition-all hover:bg-surface-container-highest">
                    <span className="material-symbols-rounded text-[24px]">table_view</span>
                    <span className="text-[10px] font-bold uppercase mt-1">Excel</span>
                </button>
                <button onClick={printPDF} className="flex flex-col items-center justify-center bg-surface-container-high text-on-surface-variant p-2.5 rounded-2xl active:scale-95 transition-all hover:bg-surface-container-highest">
                    <span className="material-symbols-rounded text-[24px]">print</span>
                    <span className="text-[10px] font-bold uppercase mt-1">PDF</span>
                </button>
                <button onClick={handleClearHistory} className="flex items-center justify-center w-16 bg-error-container text-error rounded-2xl active:scale-95 transition-all hover:bg-error-container/80" title="Apagar TUDO">
                    <span className="material-symbols-rounded text-[24px]">delete</span>
                </button>
            </div>
        )}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/50">
            <span className="material-symbols-rounded text-6xl mb-4 opacity-50">filter_list_off</span>
            <p className="text-sm font-medium">Nenhum registro neste período</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-surface-container rounded-3xl p-4 break-inside-avoid shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{formatDate(record.timestamp)} • {formatTime(record.timestamp)}</span>
                    <h3 className="text-base font-bold text-on-surface leading-tight mt-0.5">{record.supplier}</h3>
                    <p className="text-sm text-on-surface-variant">{record.product}</p>
                  </div>
                  {renderDifference(record.netWeight, record.targetWeight)}
                </div>

                <div className="flex gap-2 mb-3">
                    <div className="flex-1 bg-surface rounded-xl p-2 text-center">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase">Líquido</p>
                        <p className="text-lg font-bold text-on-surface">{record.netWeight.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 bg-surface-container-high rounded-xl p-2 text-center">
                         <p className="text-[9px] font-bold text-on-surface-variant uppercase">Bruto</p>
                         <p className="text-sm font-bold text-on-surface-variant">{record.grossWeight.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 bg-surface-container-high rounded-xl p-2 text-center">
                         <p className="text-[9px] font-bold text-on-surface-variant uppercase">Tara</p>
                         <p className="text-sm font-bold text-on-surface-variant">{record.tare.toFixed(2)}</p>
                    </div>
                </div>

                {record.hasPhoto && record.photoData && (
                     <button 
                        onClick={() => setSelectedPhoto(record.photoData || null)} 
                        className="w-full flex items-center justify-center gap-2 bg-surface text-primary py-2 rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors no-print"
                     >
                        <span className="material-symbols-rounded text-[18px]">visibility</span>
                        Ver Evidência Salva
                     </button>
                   )}
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 no-print" onClick={() => setSelectedPhoto(null)}>
            <div className="relative bg-surface p-2 rounded-3xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <img src={selectedPhoto} alt="Evidence" className="w-full rounded-2xl aspect-[3/4] object-contain bg-black" />
                <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md text-on-surface p-2 rounded-full shadow-lg"
                >
                    <span className="material-symbols-rounded text-xl">close</span>
                </button>
            </div>
        </div>
      )}
    </div>
    </>
  );
};

export default HistoryScreen;