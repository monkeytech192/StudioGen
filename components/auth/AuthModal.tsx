
import React, { useState, useEffect } from 'react';
import Login from './Login';
import SignUpStep1 from './SignUpStep1';
import SignUpStep2 from './SignUpStep2';
import ForgotPassword from './ForgotPassword';
import CheckEmail from './CheckEmail';
import { SparklesIcon } from '../icons/SparklesIcon';
import { USFlagIcon } from '../icons/USFlagIcon';
import { VNFlagIcon } from '../icons/VNFlagIcon';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { TRANSLATIONS } from '../../constants';

interface AuthModalProps {
    onLogin: (identifier: string, pass: string) => Promise<void>;
    onSignUp: (identifier: string, pass: string) => Promise<void>;
    onGoogleLogin: () => Promise<void>;
    lang: 'en' | 'vi';
    setLang: (lang: 'en' | 'vi') => void;
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
}

type AuthView = 'login' | 'signup-step-1' | 'signup-step-2' | 'forgot-password' | 'check-email';

// 3D Tech Bubble Component - Adaptive to Theme
const TechBubble = ({ className }: { className: string }) => (
    <div className={`absolute rounded-full pointer-events-none transition-colors duration-500 ${className}`} 
         style={{
             background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05), transparent)',
         }}
    />
);

const AuthModal: React.FC<AuthModalProps> = ({ 
    onLogin, onSignUp, onGoogleLogin,
    lang, setLang, darkMode, setDarkMode 
}) => {
    const [view, setView] = useState<AuthView>('login');
    const [signupData, setSignupData] = useState({ fullName: '', email: '', password: '' });
    const [resetEmail, setResetEmail] = useState('');

    // Lock body scroll on mount to remove the browser scrollbar
    useEffect(() => {
        // Prevent scrolling on the body when modal is open
        document.body.style.overflow = 'hidden';
        // Also fix the body height to 100% to prevent rubber-banding on some mobile browsers
        document.body.style.height = '100%';
        
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        };
    }, []);

    // Local translation helper
    const t = (key: keyof typeof TRANSLATIONS['en']) => {
        return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
    };

    const handleSignupStep1 = (data: { fullName: string; email: string; password: string }) => {
        setSignupData(data);
        setView('signup-step-2');
    };

    const handleSignupComplete = async () => {
        await onSignUp(signupData.email, signupData.password); 
    };

    const handleForgotPassword = (email: string) => {
        setResetEmail(email);
        setView('check-email');
    }

    // Wrap content in a consistent padding container
    const renderContent = () => {
        switch (view) {
            case 'login':
                return (
                    <Login 
                        onLogin={onLogin} 
                        onGoogleLogin={onGoogleLogin} 
                        onForgotPassword={() => setView('forgot-password')}
                        t={t}
                    />
                );
            case 'forgot-password':
                return (
                     <ForgotPassword 
                        onBack={() => setView('login')}
                        onSendResetLink={handleForgotPassword}
                        t={t}
                     />
                );
            case 'check-email':
                 return (
                    <CheckEmail 
                        email={resetEmail}
                        onBackToLogin={() => setView('login')}
                        onResend={() => {/* Handle Resend Logic */}}
                        t={t}
                    />
                 );
            case 'signup-step-1':
                return (
                     <SignUpStep1 
                        onNext={handleSignupStep1}
                        onLoginClick={() => setView('login')}
                        t={t}
                     />
                );
            case 'signup-step-2':
                return (
                    <SignUpStep2 
                        onBack={() => setView('signup-step-1')}
                        onComplete={handleSignupComplete}
                        t={t}
                    />
                );
            default:
                return null;
        }
    };

    const isLoginView = view === 'login';
    const isSignupView = view === 'signup-step-1';
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-[#050b14] overflow-hidden transition-colors duration-500">
            <style>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
             
             {/* Header Controls */}
             <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 pointer-events-none">
                 {/* Left spacer to keep controls right-aligned */}
                 <div></div> 
                 
                 <div className="flex items-center gap-3 pointer-events-auto">
                    {/* Language */}
                    <div className="flex items-center bg-white/50 dark:bg-gray-900/60 backdrop-blur-md rounded-full p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                        <button 
                            onClick={() => setLang('en')}
                            className={`p-1.5 rounded-full transition-all ${lang === 'en' ? 'bg-white dark:bg-white/20 shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'opacity-50 hover:opacity-100'}`}
                            title="English"
                        >
                            <USFlagIcon className="w-4 h-4 rounded-full object-cover" />
                        </button>
                        <button 
                            onClick={() => setLang('vi')}
                            className={`p-1.5 rounded-full transition-all ${lang === 'vi' ? 'bg-white dark:bg-white/20 shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'opacity-50 hover:opacity-100'}`}
                            title="Tiếng Việt"
                        >
                            <VNFlagIcon className="w-4 h-4 rounded-full object-cover" />
                        </button>
                    </div>

                    {/* Dark Mode */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full bg-white/50 dark:bg-gray-900/60 backdrop-blur-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors shadow-sm"
                    >
                        {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
                 </div>
             </div>

             {/* Background Tech Bubbles - Theme Adaptive */}
            <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none">
                <TechBubble className="w-64 h-64 md:w-96 md:h-96 top-[5%] -left-10 md:left-[10%] bg-gray-200/50 dark:bg-gray-900 animate-float opacity-80" />
                <TechBubble className="w-56 h-56 md:w-80 md:h-80 bottom-[5%] -right-10 md:right-[15%] bg-gray-200/50 dark:bg-gray-800 animate-float-delayed opacity-80" />
                <TechBubble className="w-40 h-40 md:w-60 md:h-60 top-[40%] right-[10%] md:right-[30%] bg-gray-200/50 dark:bg-gray-800 animate-float-slow opacity-60" />
                <TechBubble className="w-24 h-24 md:w-32 md:h-32 bottom-[15%] left-[5%] bg-primary-200/20 dark:bg-primary-900/20 animate-float" />
                <div className="absolute top-1/4 left-1/2 w-3 h-3 rounded-full bg-primary-500/50 blur-[2px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-teal-400/40 blur-[1px] animate-pulse delay-1000" />
                {/* Overlay gradient for dark mode, transparent for light mode */}
                <div className="absolute inset-0 bg-transparent dark:bg-gradient-radial dark:from-transparent dark:via-transparent dark:to-black/80 pointer-events-none transition-colors duration-500" />
            </div>

            {/* Scrollable Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
                {/* Modal Card - Flex Column Structure for internal scrolling */}
                {/* max-h-[85dvh] ensures it fits within the dynamic viewport (accounting for address bars) */}
                <div className="relative w-full max-w-md bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/5 transition-all duration-500 flex flex-col max-h-[85dvh]">
                    
                    {/* 1. FIXED HEADER SECTION (Logo & Tabs) - Does not scroll */}
                    <div className="shrink-0 pt-8 rounded-t-3xl bg-inherit z-20">
                        {(isLoginView || isSignupView) && (
                            <>
                                <div className="pb-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <SparklesIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">StudioGen AI</h1>
                                    </div>
                                    <p className="text-xs text-primary-600/80 dark:text-primary-300/80 uppercase tracking-widest font-semibold">AI-Powered Studio Photography</p>
                                </div>

                                {/* Tabs */}
                                <div className="flex px-8 border-b border-gray-200 dark:border-white/5">
                                    <button 
                                        onClick={() => setView('login')}
                                        className={`flex-1 pb-3 text-sm font-medium transition-all relative ${isLoginView ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        {t('login')}
                                        {isLoginView && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] rounded-full" />}
                                    </button>
                                    <button 
                                        onClick={() => setView('signup-step-1')}
                                        className={`flex-1 pb-3 text-sm font-medium transition-all relative ${isSignupView ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        {t('signUp')}
                                        {isSignupView && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] rounded-full" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 2. SCROLLABLE CONTENT AREA (Form & Footer) */}
                    {/* Use 'no-scrollbar' class to hide the internal scrollbar visually but keep functionality */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                        {renderContent()}

                        {/* Footer - placed inside scroll view to ensure it flows with content on small screens */}
                        {(isLoginView || isSignupView) && (
                            <div className="mt-8 text-center">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {t('protectedBy')}
                                    <br />© 2024 StudioGen AI. {t('rightsReserved')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
