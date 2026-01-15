
import React, { useState } from 'react';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative mt-1">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-3 py-2 bg-white dark:bg-gray-950/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 pr-10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 ${props.className || ''}`}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
        </div>
    );
};

export default PasswordInput;
