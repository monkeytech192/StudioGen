
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import PasswordInput from './PasswordInput';
import { TRANSLATIONS } from '../../constants';

interface SignUpStep1Props {
    onNext: (data: { fullName: string; email: string; password: string }) => void;
    onLoginClick: () => void;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const SignUpStep1: React.FC<SignUpStep1Props> = ({ onNext, onLoginClick, t }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Password Strength State
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('');
    const [strengthColor, setStrengthColor] = useState('bg-gray-300 dark:bg-gray-700');

    useEffect(() => {
        if (!password) {
            setStrengthScore(0);
            setStrengthLabel('');
            return;
        }

        let score = 0;
        if (password.length > 5) score += 1;
        if (password.length > 8) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

        setStrengthScore(score);

        switch (score) {
            case 0:
            case 1:
                setStrengthLabel(t('weak'));
                setStrengthColor('bg-red-500');
                break;
            case 2:
                setStrengthLabel(t('fair'));
                setStrengthColor('bg-yellow-500');
                break;
            case 3:
                setStrengthLabel(t('good'));
                setStrengthColor('bg-blue-400');
                break;
            case 4:
                setStrengthLabel(t('strong'));
                setStrengthColor('bg-green-500');
                break;
        }
    }, [password, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fullName && email && password) {
            onNext({ fullName, email, password });
        }
    };

    return (
        <div className="animate-fade-in">
             <div className="flex items-center justify-center gap-2 mb-6">
                <SparklesIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">StudioGen AI</span>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('createAccount')}</h2>
                     <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-widest">{t('step1')}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('step1Desc')}</p>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full mt-4 flex gap-1">
                    <div className="h-full w-1/3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                    <div className="h-full w-1/3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-full w-1/3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('fullName')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('workEmail')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('workEmailPlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{t('createPassword')}</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <PasswordInput 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                             className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm"
                        />
                     </div>
                     {/* Strength Meter Real */}
                     <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map((step) => (
                             <div 
                                key={step} 
                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strengthScore >= step ? strengthColor : 'bg-gray-200 dark:bg-gray-800'}`}
                             ></div>
                        ))}
                        <span className={`ml-2 text-[10px] font-bold uppercase transition-colors duration-300 ${strengthScore > 0 ? strengthColor.replace('bg-', 'text-') : 'text-gray-400'}`}>
                            {strengthLabel || 'Empty'}
                        </span>
                     </div>
                     <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{t('passwordHint')}</p>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 mt-4"
                >
                    {t('nextStep')}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alreadyHaveAccount')} <button onClick={onLoginClick} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-white font-semibold transition-colors">{t('signIn')}</button></p>
            </div>
            
            <div className="flex justify-center gap-3 mt-6">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            </div>
        </div>
    );
};

export default SignUpStep1;
