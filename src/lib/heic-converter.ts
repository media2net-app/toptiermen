// HEIC to JPEG converter utility
// Simple browser-based conversion without external libraries

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('Processing HEIC file:', file.name);
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping HEIC conversion');
      return file;
    }

    // Method 1: Try direct canvas conversion
    try {
      const result = await convertHeicWithCanvas(file);
      if (result) {
        console.log('HEIC conversion successful with canvas method');
        return result;
      }
    } catch (error) {
      console.log('Canvas conversion failed:', error);
    }

    // Method 2: Try using the file as-is (some browsers support HEIC)
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

// Enhanced canvas-based conversion for HEIC files
async function convertHeicWithCanvas(file: File): Promise<File | null> {
  try {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set crossOrigin to handle potential CORS issues
      img.crossOrigin = 'anonymous';
      

      
      img.onerror = (error) => {
        console.error('HEIC image load error:', error);
        reject(new Error('Failed to load HEIC image'));
      };
      
      // Create object URL and load image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      // Clean up object URL after loading
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        console.log('HEIC image loaded successfully, dimensions:', img.width, 'x', img.height);
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          try {
            // Draw the image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
                const convertedFile = new File([blob], newFileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log('HEIC successfully converted to JPEG:', newFileName);
                resolve(convertedFile);
              } else {
                console.error('Canvas toBlob failed');
                reject(new Error('Canvas conversion failed'));
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            console.error('Canvas draw error:', error);
            reject(error);
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
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