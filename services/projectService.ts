
import { Project, ProjectImage } from '../types';

const PROJECTS_KEY = 'studioGen_projects';

export const getProjects = (): Project[] => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]) => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const createProject = (name: string): Project => {
    const projects = getProjects();
    const newProject: Project = {
        id: Date.now().toString(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: []
    };
    projects.unshift(newProject);
    saveProjects(projects);
    return newProject;
};

export const updateProject = (projectId: string, updates: Partial<Project>): Project[] => {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
        projects[index] = { ...projects[index], ...updates, updatedAt: Date.now() };
        saveProjects(projects);
    }
    return projects;
};

export const deleteProject = (projectId: string): Project[] => {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    saveProjects(filtered);
    return filtered;
};

export const addImageToProject = (projectId: string, imageData: string, prompt: string): Project[] => {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
        const newImage: ProjectImage = {
            id: Date.now().toString(),
            imageUrl: imageData,
            createdAt: Date.now(),
            prompt
        };
        projects[index].images.unshift(newImage);
        projects[index].updatedAt = Date.now();
        saveProjects(projects);
    }
    return projects;
};
