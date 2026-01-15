
export interface Industry {
  id: string;
  name: string;
}

export interface Quality {
  id: string;
  name: string;
  description: string;
}

export interface GenerationFormat {
  id: 'banner' | 'poster' | 'square';
  name: string;
  className: string;
  value: '16:9' | '9:16' | '1:1';
}

export interface BackgroundStyle {
  id: string;
  name: string;
  prompt: string;
  previewClass: string;
}

export interface Font {
  id: string;
  name: string;
  className: string;
  cssValue: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ColorOption {
    id: string;
    name: string;
    value: string;
    isGradient: boolean;
}

export interface FilterOption {
    id: string;
    name: string;
    value: string; // CSS filter string
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface User {
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    dob?: string;
    identifierType: 'email' | 'phone';
}

// Settings Page Types
export interface BrandModel {
    id: string;
    name: string;
    prompt: string;
}

export interface BrandColors {
    primary: string;
    secondary: string;
}

export interface BrandSettings {
    logo: string | null;
    industry: Industry;
    model: BrandModel;
    colors: BrandColors;
    prompt: string;
}

export interface FeatureToggles {
    useUnifiedBackground: boolean;
    useBrandLogo: boolean;
}

// Project Types
export interface ProjectImage {
    id: string;
    imageUrl: string;
    createdAt: number;
    prompt: string;
}

export interface Project {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    images: ProjectImage[];
}
