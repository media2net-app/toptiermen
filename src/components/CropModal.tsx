"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface CropModalProps {
  image: string;
  aspect: number;
  onClose: () => void;
  onCrop: (cropped: string) => void;
}

function getCroppedImg(imageSrc: string, crop: any, zoom: number, aspect: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Starting crop process with image length:', imageSrc.length);
    
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      console.log('Image loaded successfully, dimensions:', image.width, 'x', image.height);
      
      let outW = 400, outH = 400;
      if (aspect === 3) { outW = 1200; outH = 400; }
      if (aspect === 1) { outW = 400; outH = 400; }
      
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        try {
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
          const result = canvas.toDataURL('image/jpeg', 0.8);
          console.log('Crop successful, result length:', result.length);
          resolve(result);
        } catch (error) {
          console.error('Canvas draw error:', error);
          reject(error);
        }
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    image.onerror = (error) => {
      console.error('Image load error:', error);
      reject(new Error('Failed to load image for cropping'));
    };
    
    image.src = imageSrc;
  });
}

const CropModal: React.FC<CropModalProps> = ({ image, aspect, onClose, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [isCropperReady, setIsCropperReady] = useState(false);

  console.log('CropModal received image:', image ? 'Image provided' : 'No image', 'Length:', image?.length);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    console.log('Crop complete, area:', croppedAreaPixels);
    setCroppedArea(croppedAreaPixels);
  }, []);

  const onMediaLoaded = useCallback(() => {
    console.log('Media loaded in cropper');
    // Add a small delay to ensure the cropper is fully ready
    setTimeout(() => {
      setIsCropperReady(true);
    }, 500);
  }, []);

  const handleCrop = async () => {
    console.log('Handle crop called, croppedArea:', croppedArea, 'isCropperReady:', isCropperReady);
    
    if (!croppedArea) {
      console.error('No cropped area available');
      // Try to create a default crop area
      if (isCropperReady) {
        console.log('Creating default crop area');
        const defaultCrop = { x: 0, y: 0, width: 100, height: 100 };
        try {
          const croppedImg = await getCroppedImg(image, defaultCrop, zoom, aspect);
          console.log('Default crop successful, result length:', croppedImg.length);
          onCrop(croppedImg);
          return;
        } catch (error) {
          console.error('Default crop failed:', error);
        }
      }
      return;
    }
    
    try {
      const croppedImg = await getCroppedImg(image, croppedArea, zoom, aspect);
      console.log('Crop successful, result length:', croppedImg.length);
      onCrop(croppedImg);
    } catch (error) {
      console.error('Crop failed:', error);
    }
  };

  const handleImageError = () => {
    console.error('Image failed to load in CropModal');
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#232D1A] rounded-2xl shadow-2xl p-6 w-full max-w-lg relative flex flex-col items-center">
        <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#8BAE5A]" onClick={onClose}>&times;</button>
        <div className="w-full h-72 relative bg-black rounded-xl overflow-hidden mb-4">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <div>Afbeelding kon niet worden geladen</div>
                <div className="text-sm text-gray-400 mt-1">Probeer een andere afbeelding</div>
              </div>
            </div>
          ) : (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              onMediaLoaded={onMediaLoaded}
              cropShape="rect"
              showGrid={true}
            />
          )}
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
          <button 
            className={`flex-1 px-4 py-2 rounded-xl font-semibold shadow transition-all ${
              isCropperReady 
                ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] hover:from-[#FFD700] hover:to-[#8BAE5A]' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`} 
            onClick={handleCrop}
            disabled={!isCropperReady}
          >
            {isCropperReady ? 'Opslaan' : 'Laden...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal; 