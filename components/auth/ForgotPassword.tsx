
import React, { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { sendPasswordResetEmail } from '../../services/authService';
import { TRANSLATIONS } from '../../constants';

interface ForgotPasswordProps {
    onBack: () => void;
    onSendResetLink: (email: string) => void;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSendResetLink, t }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(email);
            onSendResetLink(email);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
             <div className="flex items-center mb-8">
                <button onClick={onBack} className="text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                </button>
                <div className="flex-1 flex justify-center mr-8">
                     <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">StudioGen AI</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-inner">
                    <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{t('resetPassword')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 px-4">
                {t('resetDesc')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('emailAddress')}</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('emailPlaceholder')}
                            className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                     {isLoading ? t('sending') : (
                        <>
                            {t('sendResetLink')}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </>
                     )}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                 <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    {t('backToLogin')}
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;
