import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface UserAvatarProps {
    user: User;
    onLogout: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 transition">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 py-1 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            onLogout();
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
