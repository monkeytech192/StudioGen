
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { HomeIcon } from './icons/HomeIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { TRANSLATIONS } from '../constants';

type ActiveView = 'studio' | 'account' | 'settings' | 'projects';

interface NavbarProps {
    activeView: ActiveView;
    onNavigate: (view: ActiveView) => void;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate, t }) => {

    const NavItemSidebar = ({ icon, label, isActive, onClick, href }: { icon: any, label: string, isActive?: boolean, onClick?: () => void, href?: string }) => (
        <div className={`relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 group cursor-pointer
            ${isActive 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
            onClick={onClick}
        >
            {href ? <a href={href} target="_blank" rel="noopener noreferrer">{icon}</a> : icon}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                {label}
                <div className="absolute right-full top-1/2 -mt-1 -mr-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Left) - Unchanged Layout */}
            <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col items-center py-8 z-40">
                <div className="mb-10">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                         <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 w-full px-4">
                    <NavItemSidebar href="https://monkeytech192.vn" icon={<HomeIcon className="w-6 h-6" />} label={t('home')} />
                    <NavItemSidebar 
                        icon={<SparklesIcon className="w-6 h-6" />} 
                        label={t('studio')} 
                        isActive={activeView === 'studio'}
                        onClick={() => onNavigate('studio')}
                    />
                    <NavItemSidebar 
                        icon={<ProjectIcon className="w-6 h-6" />} 
                        label={t('projects')} 
                        isActive={activeView === 'projects'}
                        onClick={() => onNavigate('projects')}
                    />
                    <NavItemSidebar 
                        icon={<UserIcon className="w-6 h-6" />} 
                        label={t('account')}
                        isActive={activeView === 'account'}
                        onClick={() => onNavigate('account')}
                    />
                    <NavItemSidebar 
                        icon={<SettingsIcon className="w-6 h-6" />} 
                        label={t('settings')}
                        isActive={activeView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />
                </div>
            </nav>

            {/* Mobile Bottom Floating Bar (Native Island Style) */}
            <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <nav className="pointer-events-auto bg-white dark:bg-gray-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center gap-6 relative">
                    
                    {/* Left Group */}
                    <a href="https://monkeytech192.vn" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                        <HomeIcon className="w-6 h-6" />
                    </a>
                    
                    <button 
                        onClick={() => onNavigate('projects')}
                        className={`transition-colors ${activeView === 'projects' ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        <ProjectIcon className="w-6 h-6" />
                    </button>

                    {/* Spacer for Center Button */}
                    <div className="w-10"></div>

                    {/* Center Floating Action Button (FAB) */}
                    <button 
                        onClick={() => onNavigate('studio')}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-teal-500 hover:bg-teal-400 active:scale-95 rounded-full shadow-lg shadow-teal-500/40 flex items-center justify-center text-white transition-all duration-200"
                    >
                        <PlusIcon className="w-8 h-8" />
                    </button>

                    {/* Right Group */}
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                        <BookmarkIcon className="w-6 h-6" />
                    </button>

                    <button 
                        onClick={() => onNavigate('account')}
                         className={`transition-colors ${activeView === 'account' ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        <UserIcon className="w-6 h-6" />
                    </button>

                </nav>
            </div>
        </>
    );
};

export default Navbar;
