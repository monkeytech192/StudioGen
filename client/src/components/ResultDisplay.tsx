
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Font, ColorOption, Position, FilterOption } from '../types';
import { FONTS, FONT_SIZES_PRESET, FILTERS, TRANSLATIONS } from '../constants';
import { ResetIcon } from './icons/ResetIcon';
import { CompareIcon } from './icons/CompareIcon';
import { TypeIcon } from './icons/TypeIcon';
import { FilterIcon } from './icons/FilterIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface ResultDisplayProps {
  generatedImage: string | null;
  logo: string | null;
  isLoading: boolean;
  error: string | null;
  aspectRatioClass: string;
  overlayText: string;
  setOverlayText: (text: string) => void;
  isTextActive: boolean;
  setIsTextActive: (isActive: boolean) => void;
  selectedFont: Font;
  setSelectedFont: (font: Font) => void;
  suggestedTextColors: ColorOption[];
  selectedTextColor: ColorOption | null;
  setSelectedTextColor: (color: ColorOption | null) => void;
  isFetchingColors: boolean;
  textSize: number;
  setTextSize: (size: number) => void;
  textDimensions: { width: number, height: number };
  onTextDimensionsChange: (dimensions: { width: number, height: number }) => void;
  logoPosition: Position;
  onLogoPositionChange: (position: Position) => void;
  textPosition: Position;
  onTextPositionChange: (position: Position) => void;
  onReset: () => void;
  onSave: (finalImage: string) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const SNAP_THRESHOLD = 5;
const GUIDE_THRESHOLD = 15;

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  generatedImage, logo, isLoading, error, aspectRatioClass,
  overlayText, setOverlayText, isTextActive, setIsTextActive,
  selectedFont, setSelectedFont, suggestedTextColors, selectedTextColor, 
  setSelectedTextColor, isFetchingColors, textSize, setTextSize,
  textDimensions, onTextDimensionsChange, logoPosition, onLogoPositionChange,
  textPosition, onTextPositionChange, onReset, onSave, t
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textMeasurerRef = useRef<HTMLSpanElement>(null);
  const resizeStartRef = useRef<{startX: number, startY: number, startWidth: number, startHeight: number} | null>(null);
  
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeGuides, setActiveGuides] = useState({ x: false, y: false });

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTERS[0]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Progress Bar Simulation State
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const isInitialState = !generatedImage && !isLoading;

  // Simulate progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.2;
          if (prev >= 95) return 95;
          return prev + increment;
        });
      }, 100);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Update loading message based on progress
  useEffect(() => {
      if (progress < 25) setLoadingMessage(t('analyzing'));
      else if (progress < 50) setLoadingMessage(t('composing'));
      else if (progress < 80) setLoadingMessage(t('infusing'));
      else setLoadingMessage(t('polishing'));
  }, [progress, t]);

  useEffect(() => {
    if (generatedImage) {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = generatedImage;
        setSelectedFilter(FILTERS[0]);
    }
  }, [generatedImage]);

  useEffect(() => {
    if (!isTextActive || !containerRef.current || containerRef.current.offsetWidth === 0 || !textMeasurerRef.current || isResizing || isInteracting) {
        return;
    }

    const containerEl = containerRef.current;
    const textWidth = textMeasurerRef.current.offsetWidth;
    const newWidth = Math.min(textWidth + 40, containerEl.offsetWidth * 0.95);
    
    onTextDimensionsChange({ ...textDimensions, width: newWidth });
    
  }, [overlayText, textSize, selectedFont, isTextActive]);

  const getTextLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
  };


  const generateCanvas = async (): Promise<string | null> => {
    if (!generatedImage || !imageRef.current || !containerRef.current) return null;
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
  
    const { naturalWidth, naturalHeight } = imageRef.current;
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
  
    const { width: displayWidth, height: displayHeight } = imageRef.current.getBoundingClientRect();
    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;
  
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src = generatedImage;
    await bgImage.decode();
    
    if (selectedFilter.value !== 'none') {
        ctx.filter = selectedFilter.value;
    }
    ctx.drawImage(bgImage, 0, 0, naturalWidth, naturalHeight);
    ctx.filter = 'none';
  
    if (logo && logoRef.current) {
      const logoImage = new Image();
      logoImage.crossOrigin = 'anonymous';
      logoImage.src = logo;
      await logoImage.decode();
      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const logoX = (logoRect.left - containerRect.left) * scaleX;
      const logoY = (logoRect.top - containerRect.top) * scaleY;
      const logoWidth = logoRect.width * scaleX;
      const logoHeight = logoRect.height * scaleY;
      
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
    }
  
    if ((isTextActive || (overlayText && overlayText.trim().length > 0)) && textRef.current && selectedTextColor) {
      const textRect = textRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const scaledFontSize = textSize * scaleX;
      const lineHeight = scaledFontSize * 1.2;
      
      ctx.font = `${selectedFont.cssValue.split(' ')[0]} ${scaledFontSize}px ${selectedFont.cssValue.split(' ').slice(2).join(' ')}`;
      
      ctx.fillStyle = selectedTextColor.value;
      if (selectedTextColor.isGradient && selectedTextColor.value.startsWith('linear-gradient')) {
          const gradientColors = selectedTextColor.value.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
          if (gradientColors && gradientColors.length >= 2) {
              const textX_px = (textRect.left - containerRect.left) * scaleX;
              const textWidth_px = textRect.width * scaleX;
              const gradient = ctx.createLinearGradient(textX_px, 0, textX_px + textWidth_px, 0);
              gradient.addColorStop(0, gradientColors[0]);
              gradient.addColorStop(1, gradientColors[1]);
              ctx.fillStyle = gradient;
          }
      }

      const textX_relative = textRect.left - containerRect.left;
      const textY_relative = textRect.top - containerRect.top;
      
      const textCenterX_scaled = (textX_relative + textRect.width / 2) * scaleX;
      const maxWidth_scaled = textDimensions.width * scaleX;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8 * scaleX;
      ctx.shadowOffsetX = 1 * scaleX;
      ctx.shadowOffsetY = 1 * scaleY;
      
      const lines = getTextLines(ctx, overlayText, maxWidth_scaled);
      const totalTextHeight = lines.length * lineHeight;
      const textHeight_scaled = textRect.height * scaleY;
      const textY_scaled = textY_relative * scaleY;

      const startY = textY_scaled + (textHeight_scaled - totalTextHeight) / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      let currentY = startY;
      for (const line of lines) {
        ctx.fillText(line, textCenterX_scaled, currentY);
        currentY += lineHeight;
      }
    }
  
    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
      const dataUrl = await generateCanvas();
      if(dataUrl) {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'studiogen-image.png';
          link.click();
      }
  };

  const handleSaveToProject = async () => {
      const dataUrl = await generateCanvas();
      if(dataUrl) {
          onSave(dataUrl);
      }
  };

  const finalAspectRatioClass = imageDimensions.width > 0 
    ? `aspect-[${imageDimensions.width}/${imageDimensions.height}]`
    : aspectRatioClass;

  const handleDragEvent = (e: DraggableEvent, data: DraggableData, type: 'logo' | 'text') => {
    let { x, y } = data;
    if (!containerRef.current || !imageRef.current) return;

    const targetEl = (type === 'logo' ? logoRef.current : textRef.current);
    if (!targetEl) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const imageRelCenterX = (imageRect.left - containerRect.left) + (imageRect.width / 2);
    const imageRelCenterY = (imageRect.top - containerRect.top) + (imageRect.height / 2);

    const targetWidth = targetEl.offsetWidth;
    const targetHeight = targetEl.offsetHeight;

    const proposedCenterX = x + (targetWidth / 2);
    const proposedCenterY = y + (targetHeight / 2);

    let newGuides = { x: false, y: false };
    
    const distX = Math.abs(proposedCenterX - imageRelCenterX);
    if (distX < SNAP_THRESHOLD) {
        x = imageRelCenterX - (targetWidth / 2);
        newGuides.x = true;
    } else if (distX < GUIDE_THRESHOLD) {
        newGuides.x = true;
    }

    const distY = Math.abs(proposedCenterY - imageRelCenterY);
    if (distY < SNAP_THRESHOLD) {
        y = imageRelCenterY - (targetHeight / 2);
        newGuides.y = true;
    } else if (distY < GUIDE_THRESHOLD) {
        newGuides.y = true;
    }
    
    if (newGuides.x !== activeGuides.x || newGuides.y !== activeGuides.y) {
        setActiveGuides(newGuides);
    }

    if(type === 'logo') onLogoPositionChange({ x, y });
    else onTextPositionChange({ x, y });
  };
    
  const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setIsInteracting(true);
      resizeStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: textDimensions.width,
        startHeight: textDimensions.height,
      };
    };

    const handleResizeMove = useCallback((e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;
      const { startX, startY, startWidth, startHeight } = resizeStartRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onTextDimensionsChange({
        width: Math.max(80, startWidth + dx),
        height: Math.max(40, startHeight + dy),
      });
    }, [isResizing, onTextDimensionsChange]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        setIsInteracting(false);
        resizeStartRef.current = null;
    }, []);

    useEffect(() => {
        if(isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd, { once: true });
        }
        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);


  const textStyle: React.CSSProperties = {
    fontSize: `${textSize}px`,
    lineHeight: 1.2,
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
  };
  
  if (selectedTextColor) {
    if (selectedTextColor.isGradient) {
      textStyle.background = selectedTextColor.value;
      textStyle.WebkitBackgroundClip = 'text';
      textStyle.backgroundClip = 'text';
      textStyle.color = 'transparent';
    } else {
      textStyle.color = selectedTextColor.value;
    }
  }

  const handleAddText = () => {
    setIsTextActive(true);
    setIsFilterMenuOpen(false);

    if (overlayText && overlayText.trim().length > 0) {
      return;
    }

    setOverlayText(t('enterText'));
    setTextSize(48);

    if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const initialTextWidth = 300;
        const initialTextHeight = 80;
        
        onTextPositionChange({
            x: (containerRect.width - initialTextWidth) / 2,
            y: (containerRect.height - initialTextHeight) / 2
        });
        onTextDimensionsChange({ width: initialTextWidth, height: initialTextHeight });
    }
  };

  const toggleFilterMenu = () => {
      if (!isFilterMenuOpen) {
          setIsTextActive(false); 
      }
      setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const handleResetInternal = () => {
      setSelectedFilter(FILTERS[0]);
      setIsFilterMenuOpen(false);
      onReset();
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
       {/* Top Toolbar */}
       <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
           <div className="flex gap-2">
               <button onClick={handleResetInternal} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Undo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
               </button>
               <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Redo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
               </button>
           </div>
           <div className="text-xs font-mono text-gray-400">
               {t('zoom')}: {zoomLevel}%
           </div>
           <div>
               <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                   <CompareIcon className="w-4 h-4" />
                   {t('compare')}
               </button>
           </div>
       </div>

      {/* Main Canvas Area */}
      <div className="relative flex-grow bg-dot-pattern flex items-center justify-center p-8 overflow-hidden">
         <span 
            ref={textMeasurerRef} 
            className={`absolute opacity-0 pointer-events-none -z-10 whitespace-nowrap ${selectedFont.className}`}
            style={{ fontSize: `${textSize}px`, paddingLeft: '20px', paddingRight: '20px' }}
            >
            {overlayText}
          </span>
          
         {isLoading ? (
            /* Loading State */
            <div className="z-10 w-full max-w-[420px] flex flex-col gap-2">
                 <div className="flex justify-between items-end px-1 mb-1">
                     <span className="text-xs font-bold tracking-[0.2em] text-primary-500 uppercase">
                         {t('generatingLabel')}
                     </span>
                     <span className="text-xs font-bold text-white tabular-nums">
                         {Math.floor(progress)}%
                     </span>
                 </div>
                 
                 <div className="h-1 w-full bg-gray-800/80 rounded-full overflow-hidden relative">
                     <div 
                        className="absolute top-0 left-0 h-full bg-primary-500 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.8)] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                     ></div>
                 </div>

                 <div className="text-center mt-2">
                    <p className="text-gray-400 text-sm font-playfair-display italic tracking-wider animate-pulse">
                      {loadingMessage}
                    </p>
                 </div>
            </div>
         ) : (
             <div ref={containerRef} className={`relative shadow-2xl transition-all duration-300 ease-out bg-white dark:bg-gray-800 ${!isInitialState ? finalAspectRatioClass : 'aspect-[9/16] w-full max-w-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700'}`}>
                  {error && (
                      <div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg z-20">
                          <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                            <p className="font-bold mb-1">{t('generationError')}</p>
                            <p className="text-sm">{error}</p>
                          </div>
                      </div>
                  )}
                  
                  {!error && generatedImage && (
                    <>
                      <img 
                        ref={imageRef} 
                        src={generatedImage} 
                        alt="Generated studio result" 
                        className="w-full h-full object-cover rounded-sm transition-all duration-300" 
                        style={{ filter: selectedFilter.value }}
                      />
                      
                      {activeGuides.x && <div className="absolute top-0 left-1/2 w-px h-full bg-primary-500 z-30 pointer-events-none"></div>}
                      {activeGuides.y && <div className="absolute left-0 top-1/2 h-px w-full bg-primary-500 z-30 pointer-events-none"></div>}

                      {logo && (
                        <Draggable nodeRef={logoRef} position={logoPosition} onDrag={(e,d) => handleDragEvent(e, d, 'logo')} onStart={()=>setIsInteracting(true)} onStop={()=>{ setIsInteracting(false); setActiveGuides({x:false, y:false}); }}>
                          <img ref={logoRef} src={logo} alt="Brand logo" className="absolute w-1/6 max-w-[80px] opacity-85 cursor-move" style={{ top: 0, left: 0 }} />
                        </Draggable>
                      )}
                      
                      {(isTextActive || (overlayText && overlayText.trim().length > 0)) && (
                        <Draggable 
                            nodeRef={textRef} 
                            position={textPosition} 
                            onDrag={(e, d) => handleDragEvent(e, d, 'text')} 
                            onStart={()=>{ setIsInteracting(true); setIsTextActive(true); setIsFilterMenuOpen(false); }} 
                            onStop={()=>{ setIsInteracting(false); setActiveGuides({x:false, y:false}); }}
                            disabled={isResizing}
                        >
                            <div
                              ref={textRef}
                              onClick={(e) => { e.stopPropagation(); setIsTextActive(true); setIsFilterMenuOpen(false); }}
                              className={`absolute cursor-move group p-2 select-none ${isTextActive ? 'border border-primary-500' : 'border border-transparent hover:border-primary-500/30'}`}
                              style={{ left: 0, top: 0, width: textDimensions.width, height: textDimensions.height }}
                            >
                                <p
                                  style={textStyle}
                                  className={`w-full h-full flex items-center justify-center text-center break-words ${selectedFont.className} leading-tight select-none`}
                                 >
                                    {overlayText}
                                </p>
                                {isTextActive && (
                                    <div
                                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full cursor-se-resize opacity-100"
                                        onMouseDown={handleResizeStart}
                                    />
                                )}
                            </div>
                        </Draggable>
                      )}
                    </>
                  )}
                  {!error && !generatedImage && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                           <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                               <SparklesIcon className="w-8 h-8 opacity-50"/>
                           </div>
                           <p className="text-sm font-medium">{t('yourMasterpiece')}</p>
                      </div>
                  )}
             </div>
         )}

         {/* Floating Action Bar (Bottom Center) */}
         {generatedImage && !isLoading && (
             <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 z-40 transition-all duration-300 origin-bottom ${isTextActive ? 'flex-col gap-3 p-4 w-[90vw] max-w-md' : 'gap-2 max-w-[95vw] overflow-x-auto no-scrollbar lg:hover:scale-105'}`}>
                 {!isTextActive && !isFilterMenuOpen ? (
                     <>
                        <button onClick={handleAddText} className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition flex-shrink-0">
                             <span className="sr-only">Add Text</span>
                             <TypeIcon className="w-6 h-6" />
                        </button>
                        <div className="w-px h-6 bg-gray-700 mx-1 flex-shrink-0"></div>
                        <button onClick={toggleFilterMenu} className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition flex-shrink-0">
                             <span className="sr-only">Filters</span>
                             <FilterIcon className="w-6 h-6" />
                        </button>
                        <div className="w-px h-6 bg-gray-700 mx-1 flex-shrink-0"></div>
                        
                        {/* Save Button */}
                         <button onClick={handleSaveToProject} className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition flex-shrink-0" title="Save to Project">
                             <BookmarkIcon className="w-6 h-6"/>
                        </button>
                        
                        <div className="w-px h-6 bg-gray-700 mx-1 flex-shrink-0"></div>

                        <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl shadow-lg transition flex-shrink-0">
                             <DownloadIcon className="w-4 h-4" />
                             {t('download')}
                        </button>
                     </>
                 ) : isFilterMenuOpen ? (
                    <div className="flex items-center gap-3 px-2 overflow-x-auto max-w-[90vw] sm:max-w-md w-full">
                        <button onClick={() => setIsFilterMenuOpen(false)} className="mr-2 text-gray-400 hover:text-white flex-shrink-0">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        {FILTERS.map(filter => (
                            <button 
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter)}
                                className={`flex flex-col items-center gap-1 p-1 rounded-lg transition flex-shrink-0 ${selectedFilter.id === filter.id ? 'bg-gray-800 ring-1 ring-primary-500' : 'hover:bg-gray-800'}`}
                            >
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-700 relative">
                                    <img src={generatedImage!} alt={filter.name} className="w-full h-full object-cover" style={{ filter: filter.value }} />
                                </div>
                                <span className="text-[10px] text-gray-300 whitespace-nowrap">{filter.name}</span>
                            </button>
                        ))}
                         <button onClick={() => setIsFilterMenuOpen(false)} className="ml-2 text-gray-400 hover:text-white flex-shrink-0">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                         </button>
                    </div>
                 ) : (
                    // Expanded Text Editing Mode
                     <div className="flex flex-col w-full gap-3">
                         {/* Row 1: Input */}
                         <div className="w-full bg-gray-800/50 rounded-lg p-1 border border-gray-700 focus-within:border-primary-500 transition-colors">
                             <input 
                                value={overlayText}
                                onChange={(e) => setOverlayText(e.target.value)}
                                className="w-full bg-transparent text-white text-base px-3 py-2 outline-none placeholder-gray-500"
                                placeholder={t('enterText')}
                             />
                         </div>
                         
                         {/* Row 2: Controls */}
                         <div className="flex items-center justify-between gap-1.5 overflow-x-hidden">
                             {/* Font Selector */}
                             <div className="shrink-1 min-w-0">
                                 <select 
                                    value={selectedFont.id} 
                                    onChange={(e) => setSelectedFont(FONTS.find(f => f.id === e.target.value) || FONTS[0])}
                                    className="w-full bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-700 focus:border-primary-500 truncate"
                                 >
                                    {FONTS.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                                 </select>
                             </div>

                             <div className="w-px h-5 bg-gray-700 shrink-0"></div>

                             {/* Colors */}
                             <div className="flex gap-1 shrink-0">
                                {suggestedTextColors.slice(0,3).map(color => (
                                    <button key={color.id} onClick={() => setSelectedTextColor(color)} className={`w-6 h-6 rounded-full border border-gray-600 ${selectedTextColor?.id === color.id ? 'ring-2 ring-white scale-110' : ''}`} style={{background: color.value}}></button>
                                ))}
                             </div>
                             
                             <div className="w-px h-5 bg-gray-700 shrink-0"></div>
                             
                             {/* Size */}
                             <select 
                                value={textSize} 
                                onChange={(e) => setTextSize(Number(e.target.value))}
                                className="bg-transparent text-gray-300 text-xs font-mono outline-none cursor-pointer p-1 shrink-0"
                            >
                                {FONT_SIZES_PRESET.map(size => <option key={size} value={size}>{size}px</option>)}
                             </select>

                             <div className="w-px h-5 bg-gray-700 shrink-0"></div>

                             {/* Close / Done */}
                             <button onClick={() => setIsTextActive(false)} className="p-1.5 text-primary-500 hover:bg-gray-800 rounded-lg transition shrink-0">
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                             </button>
                         </div>
                     </div>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};

export default ResultDisplay;
