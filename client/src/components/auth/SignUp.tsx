
import React, { useState } from 'react';
import { GoogleIcon } from '../icons/GoogleIcon';
import PasswordInput from './PasswordInput';

interface SignUpProps {
    onSignUp: (identifier: string, pass: string) => Promise<void>;
    onGoogleLogin: () => Promise<void>;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onGoogleLogin }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (identifier && password) {
            setIsLoading(true);
            try {
                await onSignUp(identifier, password);
            } catch (error) {
                // Error is handled in App.tsx with a toast
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleClick = async () => {
        setIsGoogleLoading(true);
        await onGoogleLogin();
        setIsGoogleLoading(false);
    };

    return (
        <div className="flex flex-col">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            value={identifier} 
                            onChange={(e) => setIdentifier(e.target.value)} 
                            required 
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-950/50 text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-600 transition-all text-sm" 
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <PasswordInput 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                             placeholder="Create a password"
                            className="w-full pl-9 pr-10 py-2.5 bg-gray-950/50 text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                </div>
                <button type="submit" disabled={isLoading || isGoogleLoading} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2 group">
                    {isLoading ? 'Creating Account...' : (
                        <>
                            Sign Up Free
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                    )}
                </button>
            </form>

            <div className="my-5 flex items-center w-full">
                <div className="flex-grow border-t border-gray-700/50"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-500 font-medium uppercase">OR</span>
                <div className="flex-grow border-t border-gray-700/50"></div>
            </div>
            
            <button onClick={handleGoogleClick} disabled={isGoogleLoading || isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition font-bold text-sm">
                <GoogleIcon className="w-4 h-4" />
                {isGoogleLoading ? 'Connecting...' : 'Sign Up with Google'}
            </button>
        </div>
    );
};

export default SignUp;
