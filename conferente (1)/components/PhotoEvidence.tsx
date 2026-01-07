import React, { useRef, useState } from 'react';

interface Props {
    onPhotoCaptured: (base64: string | null) => void;
}

const PhotoEvidence: React.FC<Props> = ({ onPhotoCaptured }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMainButtonClick = () => {
    if (!preview) cameraInputRef.current?.click();
  };

  const clearPhoto = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      onPhotoCaptured(null);
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                const dateStr = new Date().toLocaleString('pt-BR');
                const metrics = ctx.measureText(dateStr);
                ctx.fillRect(canvas.width - metrics.width - 30, canvas.height - 45, metrics.width + 20, 35);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(dateStr, canvas.width - metrics.width - 20, canvas.height - 20);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setPreview(dataUrl);
                onPhotoCaptured(dataUrl);
            }
            setIsProcessing(false);
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processImage(e.target.files[0]);
    e.target.value = ''; 
  };

  return (
    <section className="w-full">
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />

      {isProcessing ? (
          <div className="w-full h-40 flex flex-col items-center justify-center bg-surface-container-high rounded-[2rem] border border-outline-variant/10">
              <span className="material-symbols-rounded animate-spin text-primary text-4xl mb-2">progress_activity</span>
              <span className="text-xs font-bold text-on-surface-variant">Processando...</span>
          </div>
      ) : preview ? (
         <div className="relative w-full h-48 rounded-[2rem] overflow-hidden shadow-md group border border-outline-variant/20 bg-black">
             <img src={preview} alt="Evidence" className="w-full h-full object-cover opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
             <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                 <span className="material-symbols-rounded text-sm">check_circle</span> Salvo
             </div>
             <button onClick={clearPhoto} className="absolute bottom-4 right-4 bg-error text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 transform active:scale-95 transition-all">
                 <span className="material-symbols-rounded">delete</span>
                 <span className="text-xs font-bold">Remover</span>
             </button>
         </div>
      ) : (
         <div className="w-full bg-surface-container-high rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-sm relative group hover:bg-surface-container-highest transition-colors">
            <button onClick={handleMainButtonClick} className="w-full h-40 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-all rounded-[2rem]">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-[32px]">add_a_photo</span>
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-wide">Evidência Visual</h3>
                    <p className="text-[10px] text-on-surface-variant font-medium">Toque para capturar</p>
                </div>
            </button>
            <button onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }} className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 bg-surface shadow-sm rounded-xl text-[10px] font-bold text-on-surface-variant border border-outline-variant/10">
                <span className="material-symbols-rounded text-[16px]">photo_library</span>
                <span>Galeria</span>
            </button>
         </div>
      )}
    </section>
  );
};

export default PhotoEvidence;