
import React, { useState } from 'react';
import { Quality, GenerationFormat, BackgroundStyle } from '../types';
import { QUALITIES, GENERATION_FORMATS, BACKGROUND_STYLES, TRANSLATIONS } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface SettingsPanelProps {
  quality: Quality;
  setQuality: (quality: Quality) => void;
  generationFormat: GenerationFormat;
  setGenerationFormat: (format: GenerationFormat) => void;
  background: BackgroundStyle;
  setBackground: (background: BackgroundStyle) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isImageReady: boolean;
  useUnifiedBackground: boolean;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  quality,
  setQuality,
  generationFormat,
  setGenerationFormat,
  background,
  setBackground,
  onGenerate,
  isLoading,
  isImageReady,
  useUnifiedBackground,
  t
}) => {
  const [showAllStyles, setShowAllStyles] = useState(false);
  const INITIAL_VISIBLE_COUNT = 4;

  const displayedStyles = showAllStyles ? BACKGROUND_STYLES : BACKGROUND_STYLES.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex-grow space-y-6">
        <div>
           <h3 className="font-playfair-display font-bold text-lg text-gray-900 dark:text-white mb-1">{t('configuration')}</h3>
           <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('tuneParameters')}</p>
        </div>

        {/* Quality Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('quality')}</h4>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {QUALITIES.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuality(q)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  quality.id === q.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {q.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('dimensions')}</h4>
           <div className="grid grid-cols-3 gap-2">
            {GENERATION_FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setGenerationFormat(format)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  generationFormat.id === format.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Visual Icon for Ratio */}
                <div className={`border-2 rounded-sm mb-2 transition-colors ${
                     generationFormat.id === format.id ? 'border-primary-500 bg-primary-200 dark:bg-primary-800' : 'border-gray-400 dark:border-gray-500'
                } ${format.id === 'poster' ? 'w-3 h-5' : format.id === 'square' ? 'w-4 h-4' : 'w-5 h-3'}`}></div>
                
                <span className={`text-[10px] font-medium ${generationFormat.id === format.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    {format.value}
                </span>
                
                {generationFormat.id === format.id && (
                     <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Style Preset Section */}
         <div className={`relative transition-opacity duration-300 ${useUnifiedBackground ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-end mb-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('stylePreset')}</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pb-2">
            {displayedStyles.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackground(bg)}
                className={`relative group aspect-video rounded-xl overflow-hidden focus:outline-none ring-offset-2 dark:ring-offset-gray-900 transition-all ${
                     !useUnifiedBackground && background.id === bg.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className={`w-full h-full ${bg.previewClass} transition-transform duration-500 group-hover:scale-110`}></div>
                
                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                <span className="absolute bottom-2 left-2 text-xs font-semibold text-white shadow-sm">
                    {bg.name}
                </span>

                {background.id === bg.id && !useUnifiedBackground && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white p-0.5 rounded-full">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
              </button>
            ))}
          </div>

          {!useUnifiedBackground && (
              <button 
                onClick={() => setShowAllStyles(!showAllStyles)}
                className="w-full py-2 mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                 {showAllStyles ? (
                    <>
                        {t('showLess')}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </>
                 ) : (
                    <>
                        {t('viewAll')}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </>
                 )}
              </button>
          )}

           {useUnifiedBackground && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-lg border border-primary-500/30">
              <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {t('unifiedActive')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 z-10">
        <button
          onClick={onGenerate}
          disabled={isLoading || !isImageReady}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-primary-600 to-teal-400 hover:from-primary-500 hover:to-teal-300 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary-900/20 transition-all duration-300 transform active:scale-[0.98]"
        >
          <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('generating')}
                </>
              ) : (
                <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t('generateImage')}</span>
                </>
              )}
          </span>
          {/* Shine Effect */}
          {!isLoading && <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">{t('costTime')}</p>
      </div>
    </div>
  );
};

export default SettingsPanel;
