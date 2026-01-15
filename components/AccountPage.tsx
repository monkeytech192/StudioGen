
import React, { useState } from 'react';
import { User } from '../types';
import ChangePasswordModal from './auth/ChangePasswordModal';
import EditProfileModal from './auth/EditProfileModal';
import { PencilIcon } from './icons/PencilIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { UserIcon } from './icons/UserIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LockIcon } from './icons/LockIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

// Helper Icons for this specific page
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const MoreHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);

// UI Components for the List Layout
const ListGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm">
            {children}
        </div>
    </div>
);

const ListItem = ({ 
    icon, 
    label, 
    subLabel, 
    onClick, 
    isLast = false,
    textColor = "text-gray-900 dark:text-white"
}: { 
    icon: React.ReactNode, 
    label: string, 
    subLabel?: string, 
    onClick?: () => void, 
    isLast?: boolean,
    textColor?: string
}) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-600 dark:text-gray-300">
                {icon}
            </div>
            <div className="text-left">
                <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
                {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400">{subLabel}</p>}
            </div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </button>
);

interface AccountPageProps {
    user: User | null;
    onUpdateUser: (updatedData: Partial<User>) => Promise<void>;
    onChangePassword: (currentPass: string, newPass: string) => Promise<void>;
    onBack: () => void;
    onNavigateToSettings: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onUpdateUser, onChangePassword, onBack, onNavigateToSettings }) => {
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    if (!user) {
        return <div className="text-center p-8">Loading user profile...</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-full pb-32">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Account</h1>
                <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
                    <MoreHorizontalIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="p-6 max-w-lg mx-auto">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 shadow-sm border border-teal-100 dark:border-teal-900/30">
                             <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <button 
                            onClick={() => setIsEditProfileModalOpen(true)}
                            className="absolute bottom-0 right-0 p-1.5 bg-teal-500 text-white rounded-full border-2 border-white dark:border-gray-900 shadow-sm hover:bg-teal-400 transition"
                        >
                            <PencilIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{user.email}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-bold border border-teal-100 dark:border-teal-800">
                         <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><path d="M10 1H2C1.4 1 1 1.4 1 2v8c0 .6.4 1 1 1h8c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zM4 8.5L2.5 7 3.2 6.3l.8.7 2.3-2.3.7.7-3 3.1z"/></svg>
                         PRO STUDIO PLAN
                    </div>
                </div>

                {/* GENERAL Group */}
                <ListGroup title="General">
                    <ListItem 
                        icon={<UserIcon className="w-5 h-5"/>}
                        label="Profile Info"
                        subLabel="Name, Phone, DOB"
                        onClick={() => setIsEditProfileModalOpen(true)}
                    />
                    <ListItem 
                        icon={<LockIcon className="w-5 h-5"/>}
                        label="Security"
                        subLabel="Password, 2FA"
                        onClick={() => setIsChangePasswordModalOpen(true)}
                    />
                    <ListItem 
                        icon={<CreditCardIcon className="w-5 h-5"/>}
                        label="Subscription"
                        subLabel="Renews in 12 days"
                        isLast
                    />
                </ListGroup>

                {/* STUDIO CONFIG Group */}
                <ListGroup title="Studio Config">
                    <ListItem 
                        icon={<SettingsIcon className="w-5 h-5"/>}
                        label="Render Defaults"
                        subLabel="Aspect Ratio, Model Version"
                        onClick={onNavigateToSettings}
                        isLast
                    />
                </ListGroup>
            </div>
            
            {/* Modals */}
            {isEditProfileModalOpen && (
                <EditProfileModal 
                    user={user}
                    onClose={() => setIsEditProfileModalOpen(false)}
                    onUpdateUser={async (updatedData) => {
                        await onUpdateUser(updatedData);
                        setIsEditProfileModalOpen(false);
                    }}
                />
            )}

            {isChangePasswordModalOpen && (
                <ChangePasswordModal 
                    onClose={() => setIsChangePasswordModalOpen(false)} 
                    onChangePassword={onChangePassword} 
                />
            )}
        </div>
    );
};

export default AccountPage;
