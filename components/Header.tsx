
import React, { useState, useEffect, useRef } from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { User, Project } from '../types';
import UserAvatar from './UserAvatar';
import { USFlagIcon } from './icons/USFlagIcon';
import { VNFlagIcon } from './icons/VNFlagIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  user: User | null;
  onLogout: () => void;
  lang: 'en' | 'vi';
  setLang: (lang: 'en' | 'vi') => void;
  currentProject: Project | null;
  onRenameProject: (name: string) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const Header: React.FC<HeaderProps> = ({ 
    darkMode, setDarkMode, user, onLogout, lang, setLang, currentProject, onRenameProject, t 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentProject) {
        setTempName(currentProject.name);
    } else {
        setTempName(t('untitledProject'));
    }
  }, [currentProject, t]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveName = () => {
      if (tempName.trim()) {
          onRenameProject(tempName.trim());
      } else {
          // Revert if empty
          setTempName(currentProject?.name || t('untitledProject'));
      }
      setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSaveName();
      } else if (e.key === 'Escape') {
          setTempName(currentProject?.name || t('untitledProject'));
          setIsEditing(false);
      }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-transparent bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Left side: Project Management / Branding */}
      <div className="flex items-center flex-1 min-w-0 mr-2">
         {/* Desktop Brand */}
         <div className="hidden lg:flex items-center gap-2 mr-4">
            <span className="text-xl font-playfair-display font-bold text-gray-900 dark:text-white">StudioGen</span>
         </div>
         
         {/* Project Context */}
         <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 min-w-0 flex-1">
            <div className="hidden sm:flex items-center shrink-0">
                <span className="hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors">{t('projects')}</span>
                <span className="mx-2 text-gray-300">/</span>
            </div>
            
            {/* Mobile Icon */}
            <div className="sm:hidden mr-2 text-primary-500">
                <ProjectIcon className="w-5 h-5" />
            </div>

            {isEditing ? (
                <div className="relative flex-1 max-w-[250px]">
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleSaveName}
                        onKeyDown={handleKeyDown}
                        className="w-full font-medium text-lg sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-primary-500 rounded px-2 py-0.5 outline-none shadow-sm"
                    />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none hidden sm:block">↵</div>
                </div>
            ) : (
                <div 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 group cursor-pointer py-1 px-1 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0"
                >
                    <span className="font-bold sm:font-medium text-gray-900 dark:text-white truncate text-lg sm:text-base">
                        {currentProject ? currentProject.name : t('untitledProject')}
                    </span>
                    <PencilIcon className="w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
            )}
         </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* Language Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setLang('en')}
                className={`p-1.5 rounded-full transition-all ${lang === 'en' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                title="English"
            >
                <USFlagIcon className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover" />
            </button>
            <button 
                onClick={() => setLang('vi')}
                className={`p-1.5 rounded-full transition-all ${lang === 'vi' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                title="Tiếng Việt"
            >
                <VNFlagIcon className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover" />
            </button>
        </div>

        <div className="hidden md:flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">120 {t('credits')}</span>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        
        {user && <UserAvatar user={user} onLogout={onLogout} />}
      </div>
    </header>
  );
};

export default Header;
