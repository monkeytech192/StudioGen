import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { UploadIcon } from '../icons/UploadIcon';

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (updatedData: Partial<User>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || '');
    const [dob, setDob] = useState(user.dob || '');
    const [avatar, setAvatar] = useState<string | undefined>(user.avatarUrl);
    const [isLoading, setIsLoading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setAvatar(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onUpdateUser({
            ...user,
            name,
            email,
            phone,
            dob,
            avatarUrl: avatar,
        });
        setIsLoading(false);
    };

    const isEmailLogin = user.identifierType === 'email';
    const isPhoneLogin = user.identifierType === 'phone';
    
    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xl animate-fade-in p-4">
            <div className="relative w-full max-w-lg p-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600" />
                        <div>
                            <button type="button" onClick={() => avatarInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium">
                                <UploadIcon className="w-4 h-4" />
                                Change Avatar
                            </button>
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PNG, JPG, WEBP up to 5MB.</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                        <input type="text" id="edit-displayName" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="edit-email" value={email} onChange={e => setEmail(e.target.value)} disabled={isEmailLogin} title={isEmailLogin ? "Cannot change the email used for login." : ""} className={`mt-1 w-full px-3 py-2 border rounded-lg ${isEmailLogin ? 'bg-gray-200 dark:bg-gray-900/50 cursor-not-allowed border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`} />
                    </div>
                    <div>
                        <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="tel" id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={isPhoneLogin} title={isPhoneLogin ? "Cannot change the phone number used for login." : ""} className={`mt-1 w-full px-3 py-2 border rounded-lg ${isPhoneLogin ? 'bg-gray-200 dark:bg-gray-900/50 cursor-not-allowed border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`} />
                    </div>
                     <div>
                        <label htmlFor="edit-dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                        <input type="date" id="edit-dob" value={dob} onChange={e => setDob(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;