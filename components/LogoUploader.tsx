import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface LogoUploaderProps {
  logo: string | null;
  onLogoUpload: (imageDataUrl: string) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ logo, onLogoUpload }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">2. Logo (Optional)</h2>
        <div className="flex flex-col items-center gap-3">
            <button 
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
                <UploadIcon className="w-5 h-5"/>
                Upload Logo
            </button>
            <input
                ref={logoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleLogoFileChange}
                className="hidden"
            />
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                {logo ? (
                    <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain"/>
                ) : (
                    <span className="text-xs text-center text-gray-500 dark:text-gray-400">Preview</span>
                )}
            </div>
        </div>
    </div>
  );
};

export default LogoUploader;