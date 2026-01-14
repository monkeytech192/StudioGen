import { Project, ProjectImage } from '../types';
import apiFetch from './api';

interface ProjectListItem {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  imageCount: number;
  previewImages: { id: string; imageUrl: string }[];
}

interface ProjectDetail {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  images: Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    settings: Record<string, unknown> | null;
    createdAt: number;
  }>;
}

/**
 * Get all projects for current user
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await apiFetch<ProjectListItem[]>('/projects');

  if (!response.success || !response.data) {
    console.error('Failed to fetch projects:', response.error);
    return [];
  }

  return response.data.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    images: p.previewImages.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      createdAt: 0,
      prompt: '',
    })),
  }));
};

/**
 * Get a single project with all images
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
  const response = await apiFetch<ProjectDetail>(`/projects/${projectId}`);

  if (!response.success || !response.data) {
    console.error('Failed to fetch project:', response.error);
    return null;
  }

  const p = response.data;
  return {
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      prompt: img.prompt,
      createdAt: img.createdAt,
    })),
  };
};

/**
 * Create a new project
 */
export const createProject = async (name: string): Promise<Project> => {
  const response = await apiFetch<ProjectDetail>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create project');
  }

  const p = response.data;
  return {
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    images: [],
  };
};

/**
 * Update a project
 */
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project[]> => {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!response.success) {
    console.error('Failed to update project:', response.error);
  }

  // Fetch updated list
  return getProjects();
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<Project[]> => {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    console.error('Failed to delete project:', response.error);
  }

  // Fetch updated list
  return getProjects();
};

/**
 * Add an image to a project
 */
export const addImageToProject = async (
  projectId: string,
  imageData: string,
  prompt: string
): Promise<Project[]> => {
  const response = await apiFetch<{ id: string; imageUrl: string }>(`/projects/${projectId}/images`, {
    method: 'POST',
    body: JSON.stringify({
      imageUrl: imageData,
      prompt,
    }),
  });

  if (!response.success) {
    console.error('Failed to add image:', response.error);
  }

  // Fetch updated list
  return getProjects();
};

/**
 * Delete an image from a project
 */
export const deleteImageFromProject = async (
  projectId: string,
  imageId: string
): Promise<Project[]> => {
  const response = await apiFetch(`/projects/${projectId}/images/${imageId}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    console.error('Failed to delete image:', response.error);
  }

  // Fetch updated list
  return getProjects();
};

// Keep legacy function signatures for backward compatibility
export const saveProjects = (_projects: Project[]) => {
  console.warn('saveProjects is deprecated. Use individual CRUD functions.');
};
