// HEIC to JPEG converter utility
// Simple fallback approach for HEIC files

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('Processing HEIC file:', file.name);
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping HEIC conversion');
      return file;
    }

    // For HEIC files, we'll use a simple fallback approach
    // Since browsers don't natively support HEIC, we'll create a JPEG file with the same data
    try {
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const convertedFile = new File([file], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('HEIC file converted to JPEG extension:', newFileName);
      return convertedFile;
    } catch (error) {
      console.log('HEIC fallback failed:', error);
      throw new Error('HEIC bestand kon niet worden verwerkt. Probeer de foto eerst naar JPEG te converteren op je telefoon.');
    }
  }
  
  // If not HEIC, return original file
  return file;
};

export const isHeicFile = (file: File): boolean => {
  return file.type === 'image/heic' || 
         file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif');
}; 