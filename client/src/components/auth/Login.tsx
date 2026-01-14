
import React, { useState } from 'react';
import { GoogleIcon } from '../icons/GoogleIcon';
import PasswordInput from './PasswordInput';
import { TRANSLATIONS } from '../../constants';

interface LoginProps {
    onLogin: (identifier: string, pass: string) => Promise<void>;
    onGoogleLogin: () => Promise<void>;
    onForgotPassword: () => void;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoogleLogin, onForgotPassword, t }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(identifier && password) {
            setIsLoading(true);
            try {
                await onLogin(identifier, password);
            } catch (error) {
                // Error is handled in App.tsx with a toast
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleClick = async () => {
        setIsGoogleLoading(true);
        await onGoogleLogin();
        setIsGoogleLoading(false);
    };

    return (
        <div className="flex flex-col">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('emailAddress')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            value={identifier} 
                            onChange={e => setIdentifier(e.target.value)} 
                            required 
                            placeholder={t('emailPlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm" 
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('password')}</label>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <PasswordInput 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            placeholder={t('passwordPlaceholder')}
                            className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                    <div className="flex justify-end mt-1">
                        <button type="button" onClick={onForgotPassword} className="text-xs text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{t('forgotPassword')}</button>
                    </div>
                </div>
                
                <button type="submit" disabled={isLoading || isGoogleLoading} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2 group">
                    {isLoading ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                    ) : (
                        <>
                            {t('signIn')}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </>
                    )}
                </button>
            </form>

            <div className="my-5 flex items-center w-full">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700/50"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase">{t('or')}</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700/50"></div>
            </div>

            <button onClick={handleGoogleClick} disabled={isGoogleLoading || isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 dark:border-transparent text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-100 disabled:opacity-50 transition font-bold text-sm rounded-lg shadow-sm">
                <GoogleIcon className="w-4 h-4" />
                {isGoogleLoading ? t('connecting') : t('continueWithGoogle')}
            </button>
        </div>
    );
};

export default Login;
