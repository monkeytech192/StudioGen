
import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TRANSLATIONS } from '../../constants';

interface CheckEmailProps {
    email: string;
    onBackToLogin: () => void;
    onResend: () => void;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const CheckEmail: React.FC<CheckEmailProps> = ({ email, onBackToLogin, onResend, t }) => {
    return (
        <div className="animate-fade-in text-center py-4">
             <div className="flex items-center justify-center gap-2 mb-8">
                <SparklesIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">StudioGen AI</span>
            </div>

            <div className="flex justify-center mb-6 relative">
                 <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-2xl">
                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7.171-4.122a2 2 0 011.878 0l7.171 4.122a2 2 0 01.89 1.664V19a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l6 5 6-5" />
                    </svg>
                     <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-gray-900">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                     </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('checkEmail')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t('checkEmailDesc')} <strong className="text-gray-900 dark:text-white">{email}</strong>.
            </p>

            <button 
                onClick={onBackToLogin}
                className="mt-8 w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-500/20"
            >
                {t('backToLogin')}
            </button>
            
            <div className="mt-6 text-sm text-gray-500">
                {t('didntReceive')} <button onClick={onResend} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold ml-1">{t('clickToResend')}</button>
            </div>
             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-600 flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                {t('needHelp')}
            </div>
        </div>
    );
};

export default CheckEmail;
