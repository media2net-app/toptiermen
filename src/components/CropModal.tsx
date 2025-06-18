import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface CropModalProps {
  image: string;
  aspect: number;
  onClose: () => void;
  onCrop: (cropped: string) => void;
}

function getCroppedImg(imageSrc: string, crop: any, zoom: number, aspect: number): Promise<string> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      let outW = 400, outH = 400;
      if (aspect === 3) { outW = 1200; outH = 400; }
      if (aspect === 1) { outW = 400; outH = 400; }
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          outW,
          outH
        );
        resolve(canvas.toDataURL('image/jpeg'));
      }
    };
  });
}

const CropModal: React.FC<CropModalProps> = ({ image, aspect, onClose, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedArea) return;
    const croppedImg = await getCroppedImg(image, croppedArea, zoom, aspect);
    onCrop(croppedImg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#232D1A] rounded-2xl shadow-2xl p-6 w-full max-w-lg relative flex flex-col items-center">
        <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#8BAE5A]" onClick={onClose}>&times;</button>
        <div className="w-full h-72 relative bg-black rounded-xl overflow-hidden mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="w-full accent-[#8BAE5A] mb-4"
        />
        <div className="flex gap-4 w-full">
          <button className="flex-1 px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold shadow border border-[#3A4D23]/40 hover:bg-[#2A341F]" onClick={onClose}>Annuleren</button>
          <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A]" onClick={handleCrop}>Opslaan</button>
        </div>
      </div>
    </div>
  );
};

export default CropModal; 