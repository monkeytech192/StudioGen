
import React from 'react';
import { BrandSettings, FeatureToggles, Industry, BrandModel } from '../types';
import { INDUSTRIES, BRAND_MODELS } from '../constants';
import ToggleSwitch from './ToggleSwitch';
import { SparklesIcon } from './icons/SparklesIcon';
import LogoUploader from './LogoUploader';

interface SettingsPageProps {
    brandSettings: BrandSettings;
    onSettingsChange: (settings: BrandSettings) => void;
    featureToggles: FeatureToggles;
    onToggleChange: (toggles: FeatureToggles) => void;
    onGenerateUnifiedBackground: () => void;
    isGenerating: boolean;
    backgroundPreview: string | null;
    onBack: () => void;
}

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const Section: React.FC<React.PropsWithChildren<{ title: string; description: string }>> = ({ title, description, children }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{description}</p>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({
    brandSettings, onSettingsChange, featureToggles, onToggleChange,
    onGenerateUnifiedBackground, isGenerating, backgroundPreview, onBack
}) => {
    
    const handleSettingChange = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
        onSettingsChange({ ...brandSettings, [key]: value });
    };

    return (
        <div className="pb-32 lg:pb-0">
             {/* Sticky Header for both Mobile and Desktop 
                 Using top-16 to clear the global app header (h-16).
                 Using negative margins to span full width of the container.
             */}
             <header className="sticky top-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-20 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 
                -mx-4 -mt-4 px-4 py-4 
                sm:-mx-6 sm:-mt-6 sm:px-6 
                lg:-mx-8 lg:-mt-8 lg:px-8 shadow-sm transition-all"
            >
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors group">
                    <ArrowLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </header>

            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in px-4 lg:px-0">
                
                <Section title="Feature Controls" description="Enable or disable major features of the application.">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">Use Unified Brand Background</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Apply the generated background below to all new images in the Studio.</p>
                        </div>
                        <ToggleSwitch
                            enabled={featureToggles.useUnifiedBackground}
                            onChange={(enabled) => onToggleChange({ ...featureToggles, useUnifiedBackground: enabled })}
                        />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">Use Brand Logo</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically apply the brand logo to all new images in the Studio.</p>
                        </div>
                        <ToggleSwitch
                            enabled={featureToggles.useBrandLogo}
                            onChange={(enabled) => onToggleChange({ ...featureToggles, useBrandLogo: enabled })}
                        />
                    </div>
                </Section>

                <Section title="Brand Information" description="Set up your brand's core identity to guide the AI.">
                    {featureToggles.useBrandLogo && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Logo</label>
                            <LogoUploader logo={brandSettings.logo} onLogoUpload={(logo) => handleSettingChange('logo', logo)} />
                        </div>
                    )}
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                        <select
                            id="industry"
                            value={brandSettings.industry.id}
                            onChange={(e) => handleSettingChange('industry', INDUSTRIES.find(i => i.id === e.target.value) || INDUSTRIES[0])}
                            className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                            {INDUSTRIES.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Model</h3>
                        <div className="flex flex-wrap gap-2">
                        {BRAND_MODELS.map((model) => (
                            <button
                            key={model.id}
                            onClick={() => handleSettingChange('model', model)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                                brandSettings.model.id === model.id
                                ? 'bg-primary-500 text-white font-semibold shadow'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                            >
                            {model.name}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Colors</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="primary-color" className="block text-xs text-gray-500 dark:text-gray-400">Primary</label>
                                <input
                                    id="primary-color"
                                    type="color"
                                    value={brandSettings.colors.primary}
                                    onChange={e => handleSettingChange('colors', { ...brandSettings.colors, primary: e.target.value })}
                                    className="w-full h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label htmlFor="secondary-color" className="block text-xs text-gray-500 dark:text-gray-400">Secondary</label>
                                <input
                                    id="secondary-color"
                                    type="color"
                                    value={brandSettings.colors.secondary}
                                    onChange={e => handleSettingChange('colors', { ...brandSettings.colors, secondary: e.target.value })}
                                    className="w-full h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Unified Background Generation" description="Create a consistent background for all your products based on your brand settings.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Click below to generate a new background based on your current Brand Industry and Model settings.
                            </p>
                            <button
                                onClick={onGenerateUnifiedBackground}
                                disabled={isGenerating}
                                className="w-full max-w-xs bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition"
                            >
                                {isGenerating ? (
                                    <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5 mr-2" />
                                        Generate Background
                                    </>
                                )}
                            </button>
                        </div>
                        <div className={`w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shadow-inner transition-all ${backgroundPreview ? 'aspect-[9/16]' : 'h-80'}`}>
                            {backgroundPreview ? (
                                <img src={backgroundPreview} alt="Background Preview" className="w-full h-full object-cover" />
                            ) : (
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-4">Preview will appear here</p>
                            )}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default SettingsPage;
