import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WeightCard from './components/WeightCard';
import IdentificationForm from './components/IdentificationForm';
import TareControl from './components/TareControl';
import PhotoEvidence from './components/PhotoEvidence';
import ActionFooter from './components/ActionFooter';
import HistoryScreen from './components/HistoryScreen';
import TicketScreen from './components/TicketScreen';
import Toast from './components/Toast';
import { TareMode, IdentificationData, WeightData, AppView, WeighingRecord } from './types';
import { learn, predict, predictProductTare } from './utils/learningSystem';
import { saveRecord } from './utils/historyStorage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('weighing');
  const [tareMode, setTareMode] = useState<TareMode>('auto');
  const [boxQuantity, setBoxQuantity] = useState<number>(1);
  const [unitTare, setUnitTare] = useState<number>(0);
  const [packagingQuantity, setPackagingQuantity] = useState<number>(0);
  const [packagingUnitWeight, setPackagingUnitWeight] = useState<number>(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [identification, setIdentification] = useState<IdentificationData>({
    supplier: '',
    product: '',
    targetWeight: ''
  });

  const [weightData, setWeightData] = useState<WeightData>({
    current: 0.00,
    tare: 0.00, 
    net: 0.00,
    isStable: true
  });

  useEffect(() => {
    const productTotalTare = unitTare * boxQuantity;
    const packagingTotalTare = packagingUnitWeight * packagingQuantity;
    const newTotalTare = productTotalTare + packagingTotalTare;
    
    setWeightData(prev => ({
        ...prev,
        tare: newTotalTare,
        net: prev.current - newTotalTare
    }));
  }, [boxQuantity, unitTare, packagingQuantity, packagingUnitWeight]);

  const handleWeightChange = (newCurrent: number) => {
      setWeightData(prev => ({
          ...prev,
          current: newCurrent,
          net: newCurrent - prev.tare
      }));
  };

  const handleResetTare = () => {
    setUnitTare(0);
    setBoxQuantity(1);
    setPackagingUnitWeight(0);
    setPackagingQuantity(0);
    setTareMode('auto');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
  };

  const handleSupplierBlur = () => {
    const prediction = predict(identification.supplier);
    if (prediction) {
      setIdentification(prev => ({ ...prev, product: prediction.product }));
      setUnitTare(prediction.tare);
      setTareMode('manual');
    }
  };

  const handleProductBlur = () => {
    const knownTare = predictProductTare(identification.supplier, identification.product);
    if (knownTare !== null) {
      setUnitTare(knownTare);
      setTareMode('manual');
    }
  };

  const handleRegister = () => {
    if (currentView !== 'weighing') {
        setCurrentView('weighing');
        return;
    }
    if (!identification.supplier || !identification.product) {
        showToast("Preencha fornecedor e produto", 'error');
        return;
    }
    if (weightData.current <= 0) {
        showToast("Peso deve ser maior que zero", 'error');
        return;
    }

    learn(identification.supplier, identification.product, unitTare);
    const newRecord: WeighingRecord = {
        id: crypto.randomUUID(),
        supplier: identification.supplier,
        product: identification.product,
        targetWeight: parseFloat(identification.targetWeight) || 0,
        grossWeight: weightData.current,
        tare: weightData.tare,
        boxQuantity: boxQuantity,
        netWeight: weightData.net,
        timestamp: Date.now(),
        hasPhoto: !!capturedPhoto,
        photoData: capturedPhoto || undefined
    };
    
    try {
        saveRecord(newRecord);
        showToast("Pesagem registrada!", 'success');
        setIdentification({ supplier: '', product: '', targetWeight: '' });
        handleResetTare();
        setCapturedPhoto(null);
        setWeightData({ current: 0.00, tare: 0.00, net: 0.00, isStable: true });
    } catch (error) {
        showToast("Erro ao salvar", 'error');
    }
  };

  const renderContent = () => {
      switch(currentView) {
          case 'history':
              return <HistoryScreen />;
          case 'ticket':
              return <TicketScreen />;
          case 'weighing':
          default:
              return (
                <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                    <WeightCard 
                        data={weightData} 
                        targetWeight={parseFloat(identification.targetWeight) || 0}
                        onWeightChange={handleWeightChange} 
                    />
                    <IdentificationForm 
                        data={identification} 
                        onChange={setIdentification} 
                        onSupplierBlur={handleSupplierBlur}
                        onProductBlur={handleProductBlur}
                    />
                    <TareControl 
                        mode={tareMode} 
                        onChange={setTareMode} 
                        onResetTare={handleResetTare}
                        currentTare={unitTare} 
                        onTareChange={setUnitTare} 
                        quantity={boxQuantity}
                        onQuantityChange={setBoxQuantity}
                        packagingUnitWeight={packagingUnitWeight}
                        onPackagingUnitWeightChange={setPackagingUnitWeight}
                        packagingQuantity={packagingQuantity}
                        onPackagingQuantityChange={setPackagingQuantity}
                    />
                    <PhotoEvidence 
                        key={capturedPhoto ? 'has-photo' : 'no-photo'}
                        onPhotoCaptured={setCapturedPhoto} 
                    />
                </div>
              );
      }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-surface font-display text-on-surface antialiased overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="relative flex h-full flex-col max-w-md mx-auto w-full bg-surface-container-low sm:border-x sm:border-outline-variant/20 shadow-2xl">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1 overflow-y-auto no-scrollbar px-3 pt-2 pb-32">
            {renderContent()}
        </main>
        <ActionFooter 
            activeView={currentView}
            onRegister={handleRegister} 
            onHistory={() => setCurrentView('history')}
            onTicket={() => setCurrentView('ticket')}
            onWeighing={() => setCurrentView('weighing')}
        />
      </div>
    </div>
  );
};

export default App;