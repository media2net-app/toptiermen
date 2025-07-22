// HEIC to JPEG converter utility
// This uses the heic2any library to convert HEIC files to JPEG

// Test function to check if heic2any is available
export const testHeic2Any = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') {
      console.log('Not in browser environment');
      return false;
    }
    
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;
    
    if (!heic2any) {
      console.log('heic2any not found in module');
      return false;
    }
    
    console.log('heic2any library is available');
    return true;
  } catch (error) {
    console.error('Error testing heic2any:', error);
    return false;
  }
};

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    try {
      console.log('Converting HEIC file:', file.name);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log('Not in browser environment, skipping HEIC conversion');
        return file;
      }
      
      // Test if heic2any is available first
      const isAvailable = await testHeic2Any();
      if (!isAvailable) {
        throw new Error('HEIC converter niet beschikbaar');
      }
      
      // Dynamic import of heic2any to avoid SSR issues
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      
      if (!heic2any) {
        throw new Error('heic2any library niet beschikbaar');
      }
      
      // Convert HEIC to JPEG
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob;
      
      // Create new file with JPEG extension
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const convertedFile = new File([convertedBlob], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('HEIC file successfully converted to JPEG:', newFileName);
      return convertedFile;
    } catch (error) {
      console.error('Error converting HEIC file:', error);
      
      // Show user-friendly error message
      console.log('HEIC conversion failed, showing error to user');
      throw new Error('HEIC bestand kon niet worden geconverteerd. Probeer de foto eerst naar JPEG te converteren op je telefoon.');
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