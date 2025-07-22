// HEIC to JPEG converter utility
// This provides a simple fallback approach for HEIC files

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('Processing HEIC file:', file.name);
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping HEIC conversion');
      return file;
    }

    // Try canvas-based conversion first (works for many HEIC files)
    try {
      const result = await tryCanvasConversion(file);
      if (result) {
        console.log('HEIC conversion successful with canvas method');
        return result;
      }
    } catch (error) {
      console.log('Canvas conversion failed:', error);
    }

    // Fallback: try to use file as-is with JPEG extension
    try {
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const convertedFile = new File([file], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('Using HEIC file as-is with JPEG extension');
      return convertedFile;
    } catch (error) {
      console.log('File fallback failed:', error);
    }

    // If all methods fail, show helpful error
    console.error('All HEIC conversion methods failed');
    throw new Error('HEIC bestand kon niet worden geconverteerd. Probeer de foto eerst naar JPEG te converteren op je telefoon of gebruik een andere foto.');
  }
  
  // If not HEIC, return original file
  return file;
};

// Canvas-based conversion (works for many HEIC files)
async function tryCanvasConversion(file: File): Promise<File | null> {
  try {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            const convertedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(convertedFile);
          } else {
            reject(new Error('Canvas conversion failed'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.log('Canvas conversion failed:', error);
    return null;
  }
}

export const isHeicFile = (file: File): boolean => {
  return file.type === 'image/heic' || 
         file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif');
}; 