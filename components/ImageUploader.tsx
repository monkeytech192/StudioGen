
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TRANSLATIONS } from '../constants';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
  uploadedImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  onRemoveBackground: () => void;
  error: string | null;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, uploadedImage, processedImage, isProcessing, onRemoveBackground, error, t
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    handleDrag(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [handleDrag]);
  
  const handleDragOut = useCallback((e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
  }, [handleDrag]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    handleDrag(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
       if (file.type.startsWith('image/')) {
         const reader = new FileReader();
         reader.onloadend = () => {
           onImageUpload(reader.result as string);
         };
         reader.readAsDataURL(file);
       }
      e.dataTransfer.clearData();
    }
  }, [handleDrag, onImageUpload]);

  const openFileDialog = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const imageToDisplay = processedImage || uploadedImage;

  return (
    <div className="flex flex-col gap-4">
      <div 
        onClick={openFileDialog}
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-dashed ${
            isDragging 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />

          {imageToDisplay ? (
            <div className="w-full h-full relative group">
                <img src={imageToDisplay} alt="Uploaded product" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">{t('changeImage')}</span>
                </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                   <UploadIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">{t('clickOrDrop')}</p>
                <p className="text-xs">{t('imageTypes')}</p>
            </div>
          )}
      </div>

      {uploadedImage && !processedImage && !isProcessing && (
         <div className="w-full">
            {error ? (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">{t('removalFailed')}</span>
                    <button onClick={onRemoveBackground} className="text-xs font-bold text-red-700 underline">{t('retry')}</button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('removeBackground')}</span>
                            <span className="text-[10px] text-gray-500">{t('autoMasking')}</span>
                        </div>
                     </div>
                     <button 
                        onClick={onRemoveBackground}
                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-gray-300 dark:bg-gray-600"
                    >
                        <span className="translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                </div>
            )}
        </div>
      )}
      
      {isProcessing && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
               <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-medium text-gray-500">{t('removingBg')}</span>
          </div>
      )}
    </div>
  );
};

export default ImageUploader;
