
import React, { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TRANSLATIONS } from '../../constants';

interface SignUpStep2Props {
    onBack: () => void;
    onComplete: () => Promise<void>;
    t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const IndustryCard = ({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer aspect-square ${selected ? 'bg-gray-800 dark:bg-gray-800 border-primary-500 ring-2 ring-primary-500/20 dark:ring-0' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
    >
        {selected && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
            </div>
        )}
        <div className={`mb-2 ${selected ? 'text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-medium text-center ${selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
    </div>
);

const SignUpStep2: React.FC<SignUpStep2Props> = ({ onBack, onComplete, t }) => {
    const [selectedIndustry, setSelectedIndustry] = useState('Fashion');
    const [selectedPlan, setSelectedPlan] = useState('1-50');
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        await onComplete();
        setIsLoading(false);
    };

    return (
        <div className="animate-fade-in">
             <div className="flex items-center justify-center gap-2 mb-6">
                <SparklesIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">StudioGen AI</span>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('customizeStudio')}</h2>
                     <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-widest">{t('almostDone')}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('step2Desc')}</p>
                 {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full mt-4 flex gap-1">
                    <div className="h-full w-1/3 bg-primary-500 rounded-full"></div>
                    <div className="h-full w-1/3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                    <div className="h-full w-1/3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                     <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.8l6.8 11.2H5.2L12 5.8z"/></svg>
                        {t('primaryIndustry')}
                     </label>
                     <div className="grid grid-cols-3 gap-3">
                        <IndustryCard 
                            label="Fashion" 
                            selected={selectedIndustry === 'Fashion'} 
                            onClick={() => setSelectedIndustry('Fashion')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />
                         <IndustryCard 
                            label="Electronics" 
                            selected={selectedIndustry === 'Electronics'} 
                            onClick={() => setSelectedIndustry('Electronics')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                        />
                         <IndustryCard 
                            label="Food & Bev" 
                            selected={selectedIndustry === 'Food & Bev'} 
                            onClick={() => setSelectedIndustry('Food & Bev')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>}
                        />
                         <IndustryCard 
                            label="Home Decor" 
                            selected={selectedIndustry === 'Home Decor'} 
                            onClick={() => setSelectedIndustry('Home Decor')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                        />
                         <IndustryCard 
                            label="Beauty" 
                            selected={selectedIndustry === 'Beauty'} 
                            onClick={() => setSelectedIndustry('Beauty')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                         <IndustryCard 
                            label="Other" 
                            selected={selectedIndustry === 'Other'} 
                            onClick={() => setSelectedIndustry('Other')}
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        />
                     </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z"/></svg>
                        {t('estGenerations')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['Just exploring', '1-50 images', '50-200 images', '200+ images'].map(plan => (
                             <button 
                                key={plan}
                                onClick={() => setSelectedPlan(plan)}
                                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedPlan === plan ? 'bg-primary-600 border-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                             >
                                {plan}
                             </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 mt-4"
                >
                     {isLoading ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                     ) : (
                        <>
                            {t('completeRegistration')}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </>
                     )}
                </button>
            </div>
             
             <div className="mt-6 text-center">
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {t('goBackStep1')}
                </button>
            </div>

            <div className="flex justify-center gap-2 mt-6 opacity-50">
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                <span className="text-xs text-gray-500">{t('secureConnection')}</span>
            </div>
        </div>
    );
};

export default SignUpStep2;
