import { useEffect, useState } from 'react';
import * as authService from '../../services/authService';

/**
 * Google OAuth Callback Handler
 * This component handles the redirect from Google OAuth (not popup)
 */
const GoogleCallback = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the id_token from URL hash (Google returns it as fragment)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription || error || 'Google login failed');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        if (!idToken) {
          setStatus('error');
          setErrorMessage('No token received from Google');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Call googleLogin with the token
        await authService.googleLogin(idToken);
        
        setStatus('success');
        
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        
      } catch (err) {
        console.error('Google callback error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Google login failed');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Đang xử lý đăng nhập Google...</p>
            <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-white text-lg">Đăng nhập thành công!</p>
            <p className="text-gray-400 text-sm mt-2">Đang chuyển hướng...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <p className="text-white text-lg">Đăng nhập thất bại</p>
            <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
            <p className="text-gray-400 text-sm mt-4">Đang chuyển về trang chủ...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
