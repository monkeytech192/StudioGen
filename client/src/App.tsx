
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import SettingsPanel from './components/SettingsPanel';
import ResultDisplay from './components/ResultDisplay';
import Toast from './components/Toast';
import { removeBackgroundImage, generateStudioImage, suggestTextColors, generateUnifiedBackground } from './services/geminiService';
import * as authService from './services/authService';
import * as projectService from './services/projectService';
import { Quality, GenerationFormat, BackgroundStyle, Font, Position, ColorOption, ToastMessage, User, BrandSettings, FeatureToggles, Project } from './types';
import { QUALITIES, GENERATION_FORMATS, BACKGROUND_STYLES, FONTS, BRAND_MODELS, INDUSTRIES, TRANSLATIONS } from './constants';
import AuthModal from './components/auth/AuthModal';
import Navbar from './components/Navbar';
import AccountPage from './components/AccountPage';
import SettingsPage from './components/SettingsPage';
import ProjectsPage from './components/ProjectsPage';

type ActiveView = 'studio' | 'account' | 'settings' | 'projects';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // Language State
  const [lang, setLang] = useState<'en' | 'vi'>('en');

  // Translation helper
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
      return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
  };

  // App State
  const [activeView, setActiveView] = useState<ActiveView>('studio');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Input State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Trà Dưa Lưới');
  
  // Intermediate State
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null);
  const [bgRemoveError, setBgRemoveError] = useState<string | null>(null);

  // Studio Settings State
  const [quality, setQuality] = useState<Quality>(QUALITIES[1]);
  const [generationFormat, setGenerationFormat] = useState<GenerationFormat>(GENERATION_FORMATS[0]);
  const [background, setBackground] = useState<BackgroundStyle>(BACKGROUND_STYLES[0]);
  
  // Overlay State
  const [overlayText, setOverlayText] = useState<string>('');
  const [isTextActive, setIsTextActive] = useState<boolean>(false);
  const [selectedFont, setSelectedFont] = useState<Font>(FONTS[0]);
  const [suggestedTextColors, setSuggestedTextColors] = useState<ColorOption[]>([]);
  const [selectedTextColor, setSelectedTextColor] = useState<ColorOption | null>(null);
  const [textSize, setTextSize] = useState<number>(48);
  const [textDimensions, setTextDimensions] = useState<{width: number, height: number}>({ width: 300, height: 80 });
  const [logoPosition, setLogoPosition] = useState<Position>({ x: 16, y: 16 });
  const [textPosition, setTextPosition] = useState<Position>({ x: 0, y: 0 });

  // Brand Settings State
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logo: null,
    industry: INDUSTRIES[0],
    model: BRAND_MODELS[0],
    colors: { primary: '#14b8a6', secondary: '#99f6e4' },
    prompt: 'Clean, professional studio with soft lighting'
  });
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>({ useUnifiedBackground: false, useBrandLogo: false });
  const [unifiedBackground, setUnifiedBackground] = useState<string | null>(null);

  // Output State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingUnifiedBg, setIsGeneratingUnifiedBg] = useState(false);
  const [isFetchingColors, setIsFetchingColors] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // UI State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
    } else {
      setIsAuthModalOpen(true);
    }
    
    // Default to dark mode for the premium feel
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(true); 

    // Load projects
    const loadedProjects = projectService.getProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) {
        setCurrentProject(loadedProjects[0]);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Handlers
  const handleLogin = async (identifier: string, pass: string) => {
    try {
      const user = await authService.login(identifier, pass);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      showToast('Login successful!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      showToast(message, 'error');
      throw error;
    }
  };

  const handleSignUp = async (identifier: string, pass: string) => {
    try {
      const user = await authService.signUp(identifier, pass);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      showToast('Account created successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed.';
      showToast(message, 'error');
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await authService.googleLogin();
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      showToast('Logged in with Google successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed.';
      showToast(message, 'error');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    handleReset();
    setActiveView('studio');
    showToast('You have been logged out.', 'success');
  };
  
  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    try {
        const user = await authService.updateUser({ ...currentUser, ...updatedUser });
        setCurrentUser(user);
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Profile update failed.';
        showToast(message, 'error');
    }
  };

  const handleChangePassword = async (currentPass: string, newPass: string) => {
    if (!currentUser) return;
    try {
      await authService.changePassword(currentUser.email, currentPass, newPass);
      showToast('Password changed! Please log in again.', 'success');
      setTimeout(() => {
        handleLogout();
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password.';
      showToast(message, 'error');
      throw error;
    }
  };
  
  const showToast = (message: string, type: 'success' | 'error', duration: number = 3000) => {
    setToast({ id: Math.random(), message, type });
  };

  // Project Handlers
  const handleCreateProject = (name: string) => {
      const newProject = projectService.createProject(name);
      setProjects([newProject, ...projects]);
      setCurrentProject(newProject);
      setActiveView('studio');
      showToast(`Project "${name}" created.`, 'success');
  };

  const handleRenameProject = (name: string) => {
      if (!currentProject) {
          handleCreateProject(name); // Handle case where user renames "Untitled" before creating
          return;
      }
      const updatedList = projectService.updateProject(currentProject.id, { name });
      setProjects(updatedList);
      setCurrentProject({ ...currentProject, name });
  };

  const handleSelectProject = (projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
          setCurrentProject(project);
          setActiveView('studio');
      }
  };

  const handleSaveToProject = (finalImage: string) => {
      let targetProject = currentProject;
      
      // If no project exists or selected, create one
      if (!targetProject) {
          targetProject = projectService.createProject(t('untitledProject'));
          setProjects([targetProject, ...projects]);
          setCurrentProject(targetProject);
      }

      const updatedList = projectService.addImageToProject(targetProject.id, finalImage, prompt);
      setProjects(updatedList);
      
      // Update current project ref
      const updatedProject = updatedList.find(p => p.id === targetProject!.id) || null;
      setCurrentProject(updatedProject);
      
      showToast('Image saved to project!', 'success');
  };


  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setGeneratedImage(null);
    setGenerateError(null);
    setBgRemovedImage(null);
    setBgRemoveError(null);
    setIsTextActive(false);
    setOverlayText('');
  };

  const handleRemoveBackground = async () => {
    if (!uploadedImage) {
      showToast("Please upload an image first.", 'error');
      return;
    }
    setIsRemovingBg(true);
    setBgRemoveError(null);
    setBgRemovedImage(null);

    try {
      const base64Data = uploadedImage.split(',')[1];
      const mimeType = uploadedImage.substring(uploadedImage.indexOf(':') + 1, uploadedImage.indexOf(';'));
      const result = await removeBackgroundImage(base64Data, mimeType);

      if (!result) {
        const errorMsg = "Failed to remove background. The model returned an empty response. Please try again.";
        setBgRemoveError(errorMsg);
        showToast(errorMsg, 'error');
      } else if (result === uploadedImage) {
        const errorMsg = "The AI could not identify a background to remove. Please try a different image.";
        setBgRemoveError(errorMsg);
        showToast(errorMsg, 'error');
      } else {
        setBgRemovedImage(result);
        showToast("Background removed successfully!", 'success');
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred during background removal.';
      setBgRemoveError(errorMsg);
      showToast(errorMsg, 'error');
      setBgRemovedImage(null);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const generateAndSuggestColors = async (image: string) => {
      setIsFetchingColors(true);
      try {
        const colors = await suggestTextColors(image.split(',')[1]);
        setSuggestedTextColors(colors);
        setSelectedTextColor(colors[0] || null);
      } catch (e) {
        showToast("Could not suggest colors.", 'error');
      } finally {
        setIsFetchingColors(false);
      }
  }

  const handleGenerateUnifiedBackground = async () => {
    setIsGeneratingUnifiedBg(true);
    try {
      const result = await generateUnifiedBackground(brandSettings);
      if (result) {
        setUnifiedBackground(result);
        showToast("Unified background generated!", 'success');
      } else {
        throw new Error("Model returned an empty background.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to generate unified background.";
      showToast(message, 'error');
    } finally {
      setIsGeneratingUnifiedBg(false);
    }
  };

  const handleGenerate = async () => {
    const imageToGenerateFrom = bgRemovedImage || uploadedImage;
    if (!imageToGenerateFrom) {
      showToast('Please upload an image first.', 'error');
      return;
    }
    
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedImage(null);
    setSuggestedTextColors([]);
    setIsTextActive(false);
    setOverlayText('');

    try {
      const base64Data = imageToGenerateFrom.split(',')[1];
      const mimeType = imageToGenerateFrom.substring(imageToGenerateFrom.indexOf(':') + 1, imageToGenerateFrom.indexOf(';'));
      
      const unifiedBgToUse = featureToggles.useUnifiedBackground && unifiedBackground 
        ? { ...background, prompt: `Use the pre-generated unified brand background. Do not change it.` } 
        : background;

      const result = await generateStudioImage(
        base64Data, mimeType, prompt, brandSettings.industry, quality, generationFormat, 
        unifiedBgToUse
      );

      setGeneratedImage(result);
       if(!result){
        setGenerateError("Failed to generate image. The model might have returned an empty response.");
        showToast("Image generation failed. Please try a different prompt or settings.", 'error');
      } else {
        await generateAndSuggestColors(result);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image generation.';
      setGenerateError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setPrompt('Trà Dưa Lưới');
    setBgRemovedImage(null);
    setBgRemoveError(null);
    setQuality(QUALITIES[1]);
    setGenerationFormat(GENERATION_FORMATS[0]);
    setBackground(BACKGROUND_STYLES[0]);
    setOverlayText('');
    setIsTextActive(false);
    setSelectedFont(FONTS[0]);
    setSuggestedTextColors([]);
    setSelectedTextColor(null);
    setTextSize(48);
    setTextDimensions({ width: 300, height: 80 });
    setLogoPosition({ x: 16, y: 16 });
    setTextPosition({ x: 0, y: 0 });
    setGeneratedImage(null);
    setGenerateError(null);
    setIsRemovingBg(false);
    setIsGenerating(false);
    setIsFetchingColors(false);
    // Do not reset project context
    showToast("Workspace reset.", 'success');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex`}>
      {isAuthModalOpen && (
        <AuthModal 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
          onGoogleLogin={handleGoogleLogin} 
          lang={lang}
          setLang={setLang}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <Navbar activeView={activeView} onNavigate={setActiveView} t={t} />

      <div className={`flex-1 flex flex-col relative transition-all duration-300 lg:pl-20 ${!currentUser ? 'blur-md pointer-events-none' : ''} mb-20 lg:mb-0`}>
        {/* Header is hidden on Account page to match native look, but visible on others */}
        {activeView !== 'account' && (
             <Header 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                user={currentUser} 
                onLogout={handleLogout} 
                lang={lang} 
                setLang={setLang}
                currentProject={currentProject}
                onRenameProject={handleRenameProject}
                t={t}
            />
        )}
        <Toast toast={toast} onClose={() => setToast(null)} />
        
        <main className={`flex-1 ${activeView === 'account' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {activeView === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Column: Assets & Input (25%) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                 <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-5">
                    <h3 className="font-playfair-display font-bold text-lg text-gray-900 dark:text-white">{t('sourceMaterial')}</h3>
                    <ImageUploader 
                      onImageUpload={handleImageUpload}
                      uploadedImage={uploadedImage}
                      processedImage={bgRemovedImage}
                      isProcessing={isRemovingBg}
                      onRemoveBackground={handleRemoveBackground}
                      error={bgRemoveError}
                      t={t}
                    />
                 </div>
                 
                 <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                    <h3 className="font-playfair-display font-bold text-lg text-gray-900 dark:text-white mb-3">{t('contextDescription')}</h3>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('contextPlaceholder')}
                      className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm"
                    />
                </div>
              </div>

              {/* Middle Column: Configuration (25%) */}
              <div className="lg:col-span-3 h-full">
                <SettingsPanel
                    quality={quality}
                    setQuality={setQuality}
                    generationFormat={generationFormat}
                    setGenerationFormat={setGenerationFormat}
                    background={background}
                    setBackground={setBackground}
                    onGenerate={handleGenerate}
                    isLoading={isGenerating}
                    isImageReady={!!uploadedImage}
                    useUnifiedBackground={featureToggles.useUnifiedBackground}
                    t={t}
                />
              </div>

              {/* Right Column: Result (50%) */}
              <div className="lg:col-span-6 h-full min-h-[500px]">
                <ResultDisplay
                    generatedImage={generatedImage}
                    logo={featureToggles.useBrandLogo ? brandSettings.logo : null}
                    isLoading={isGenerating}
                    error={generateError}
                    aspectRatioClass={generatedImage ? '' : generationFormat.className}
                    overlayText={overlayText}
                    setOverlayText={setOverlayText}
                    isTextActive={isTextActive}
                    setIsTextActive={setIsTextActive}
                    selectedFont={selectedFont}
                    setSelectedFont={setSelectedFont}
                    suggestedTextColors={suggestedTextColors}
                    selectedTextColor={selectedTextColor}
                    setSelectedTextColor={setSelectedTextColor}
                    isFetchingColors={isFetchingColors}
                    textSize={textSize}
                    setTextSize={setTextSize}
                    textDimensions={textDimensions}
                    onTextDimensionsChange={setTextDimensions}
                    logoPosition={logoPosition}
                    onLogoPositionChange={setLogoPosition}
                    textPosition={textPosition}
                    onTextPositionChange={setTextPosition}
                    onReset={handleReset}
                    onSave={handleSaveToProject}
                    t={t}
                />
              </div>
            </div>
          )}
          
          {activeView === 'projects' && (
              <ProjectsPage 
                  projects={projects}
                  currentProjectId={currentProject?.id || null}
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
              />
          )}

          {activeView === 'account' && currentUser && (
            <AccountPage 
                user={currentUser} 
                onUpdateUser={handleUpdateUser} 
                onChangePassword={handleChangePassword} 
                onBack={() => setActiveView('studio')}
                onNavigateToSettings={() => setActiveView('settings')}
            />
          )}
          {activeView === 'settings' && (
            <SettingsPage 
              brandSettings={brandSettings}
              onSettingsChange={setBrandSettings}
              featureToggles={featureToggles}
              onToggleChange={setFeatureToggles}
              onGenerateUnifiedBackground={handleGenerateUnifiedBackground}
              isGenerating={isGeneratingUnifiedBg}
              backgroundPreview={unifiedBackground}
              onBack={() => setActiveView('studio')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
