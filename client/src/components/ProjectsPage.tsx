
import React, { useState } from 'react';
import { Project } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { FolderIcon } from './icons/FolderIcon';

interface ProjectsPageProps {
    projects: Project[];
    currentProjectId: string | null;
    onSelectProject: (projectId: string) => void;
    onCreateProject: (name: string) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, currentProjectId, onSelectProject, onCreateProject }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const handleCreate = () => {
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim());
            setNewProjectName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 lg:pb-0 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your generated campaigns.</p>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition w-full sm:w-auto shadow-md"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Project
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="mb-8 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="e.g., Summer Collection 2024"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <button 
                                onClick={handleCreate}
                                className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-sm"
                            >
                                Create
                            </button>
                             <button 
                                onClick={() => setIsCreating(false)}
                                className="flex-1 sm:flex-none px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <div 
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border transition-all hover:shadow-lg ${currentProjectId === project.id ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                        <div className="aspect-[3/2] w-full bg-gray-100 dark:bg-gray-900 rounded-t-2xl overflow-hidden relative">
                            {project.images.length > 0 ? (
                                <img src={project.images[0].imageUrl} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                                    <FolderIcon className="w-12 h-12 opacity-50" />
                                </div>
                            )}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <span className="text-white text-sm font-semibold tracking-wide">Open Project</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{project.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{project.images.length} images</span>
                                <span className="text-xs text-gray-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {projects.length === 0 && !isCreating && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                     <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <FolderIcon className="w-10 h-10 opacity-50" />
                     </div>
                     <p className="text-lg font-medium text-gray-900 dark:text-white">No projects yet</p>
                     <p className="text-sm text-gray-500 max-w-xs text-center mt-1">Create your first project to start organizing your studio designs.</p>
                     <button 
                        onClick={() => setIsCreating(true)}
                        className="mt-6 text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                        Create Project Now
                    </button>
                 </div>
            )}
        </div>
    );
};

export default ProjectsPage;
