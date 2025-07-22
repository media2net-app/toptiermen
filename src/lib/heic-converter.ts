// HEIC to JPEG converter utility
// This uses the heic2any library to convert HEIC files to JPEG

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    try {
      // Dynamic import of heic2any to avoid SSR issues
      const heic2any = (await import('heic2any')).default;
      
      // Convert HEIC to JPEG
      const convertedBlob = await (heic2any as any)({
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
      
      console.log('HEIC file converted to JPEG:', newFileName);
      return convertedFile;
    } catch (error) {
      console.error('Error converting HEIC file:', error);
      throw new Error('Kon HEIC bestand niet converteren naar JPEG. Probeer een andere afbeelding.');
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