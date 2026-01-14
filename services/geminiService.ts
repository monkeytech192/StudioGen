import { GenerationFormat, Industry, Quality, BackgroundStyle, ColorOption, BrandSettings } from '../types';
import apiFetch from './api';

interface GenerateImageResponse {
  imageUrl: string;
}

interface SuggestColorsResponse {
  colors: ColorOption[];
}

/**
 * Remove background from an image
 */
export const removeBackgroundImage = async (
  base64ImageData: string,
  mimeType: string,
): Promise<string | null> => {
  const response = await apiFetch<GenerateImageResponse>('/generate/remove-background', {
    method: 'POST',
    body: JSON.stringify({ base64ImageData, mimeType }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to remove background');
  }

  return response.data.imageUrl;
};

/**
 * Generate studio image
 */
export const generateStudioImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  industry: Industry,
  quality: Quality,
  format: GenerationFormat,
  background: BackgroundStyle,
): Promise<string | null> => {
  const response = await apiFetch<GenerateImageResponse>('/generate/studio-image', {
    method: 'POST',
    body: JSON.stringify({
      base64ImageData,
      mimeType,
      prompt,
      industry,
      quality,
      format,
      background,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to generate image');
  }

  return response.data.imageUrl;
};

/**
 * Generate unified brand background
 */
export const generateUnifiedBackground = async (
  settings: BrandSettings
): Promise<string | null> => {
  const response = await apiFetch<GenerateImageResponse>('/generate/unified-background', {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to generate background');
  }

  return response.data.imageUrl;
};

/**
 * Suggest text colors based on image
 */
export const suggestTextColors = async (
  base64ImageData: string,
  mimeType: string,
): Promise<ColorOption[]> => {
  const response = await apiFetch<SuggestColorsResponse>('/generate/suggest-colors', {
    method: 'POST',
    body: JSON.stringify({ base64ImageData, mimeType }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to suggest colors');
  }

  return response.data.colors;
};

/**
 * Get current credit balance
 */
export const getCredits = async (): Promise<number> => {
  const response = await apiFetch<{ credits: number }>('/generate/credits');

  if (!response.success || !response.data) {
    return 0;
  }

  return response.data.credits;
};
