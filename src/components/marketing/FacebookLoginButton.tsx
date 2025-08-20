'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    checkLoginState: () => void;
  }
}

interface FacebookLoginButtonProps {
  onLoginSuccess?: (accessToken: string, userID: string) => void;
  onLoginError?: (error: string) => void;
}

export default function FacebookLoginButton({ onLoginSuccess, onLoginError }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Facebook App ID from environment
  const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1063013326038261';

  useEffect(() => {
    // Load Facebook SDK
    loadFacebookSDK();
  }, []);

  const loadFacebookSDK = () => {
    if (typeof window !== 'undefined' && !window.FB) {
      // Create Facebook SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      // Initialize Facebook SDK
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });

        // Define the global callback function
        window.checkLoginState = checkLoginState;

        // Check initial login status
        checkLoginStatus();
      };

      document.head.appendChild(script);
    } else if (window.FB) {
      // Define the global callback function
      window.checkLoginState = checkLoginState;
      checkLoginStatus();
    }
  };

  // This is the callback function that Facebook calls after login
  const checkLoginState = () => {
    if (!window.FB) return;
    
    window.FB.getLoginStatus(function(response: any) {
      console.log('Facebook login state callback:', response);
      statusChangeCallback(response);
    });
  };

  // Process the login status response
  const statusChangeCallback = (response: any) => {
    console.log('Status change callback:', response);
    
    if (response.status === 'connected') {
      // User is logged into Facebook and has authorized the app
      setIsConnected(true);
      setError(null);
      
      const { accessToken, userID } = response.authResponse;
      
      // Store the access token and user ID
      localStorage.setItem('facebook_access_token', accessToken);
      localStorage.setItem('facebook_user_id', userID);
      localStorage.setItem('facebook_login_status', 'connected');
      
      // Get user info
      window.FB.api('/me', { fields: 'id,name,email' }, (userResponse: any) => {
        if (userResponse && !userResponse.error) {
          setUserInfo({
            ...response.authResponse,
            user: userResponse
          });
        }
      });

      // Get user's ad accounts
      getAdAccounts(accessToken);
      
      onLoginSuccess?.(accessToken, userID);
      
    } else if (response.status === 'not_authorized') {
      // User is logged into Facebook but hasn't authorized the app
      setIsConnected(false);
      setError('Je bent ingelogd bij Facebook maar hebt de app nog niet geautoriseerd.');
      onLoginError?.('Not authorized');
      
    } else {
      // User is not logged into Facebook
      setIsConnected(false);
      setError('Je bent niet ingelogd bij Facebook.');
      onLoginError?.('Not logged in');
    }
  };

  const checkLoginStatus = () => {
    if (!window.FB) return;

    window.FB.getLoginStatus((response: any) => {
      statusChangeCallback(response);
    });
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK niet geladen');
      return;
    }

    // Check if already connected first
    if (isConnected) {
      setError('Je bent al verbonden met Facebook. Probeer eerst de verbinding te verbreken als je opnieuw wilt verbinden.');
      return;
    }

    // Check current Facebook login status before attempting login
    window.FB.getLoginStatus((response: any) => {
      if (response.status === 'connected') {
        // Already connected, just update the state
        setIsConnected(true);
        setUserInfo(response.authResponse);
        
        // Get user info
        window.FB.api('/me', { fields: 'id,name,email' }, (userResponse: any) => {
          if (userResponse && !userResponse.error) {
            setUserInfo({
              ...response.authResponse,
              user: userResponse
            });
          }
        });

        // Get user's ad accounts
        getAdAccounts(response.authResponse.accessToken);
        
        onLoginSuccess?.(response.authResponse.accessToken, response.authResponse.userID);
        return;
      }

      // Not connected, proceed with login
      setIsLoading(true);
      setError(null);

      // Request permissions for marketing API
      window.FB.login((loginResponse: any) => {
        setIsLoading(false);

        if (loginResponse.status === 'connected') {
          setIsConnected(true);
          setUserInfo(loginResponse.authResponse);
          
          // Get user info
          window.FB.api('/me', { fields: 'id,name,email' }, (userResponse: any) => {
            if (userResponse && !userResponse.error) {
              setUserInfo({
                ...loginResponse.authResponse,
                user: userResponse
              });
            }
          });

          // Get user's ad accounts
          getAdAccounts(loginResponse.authResponse.accessToken);
          
          onLoginSuccess?.(loginResponse.authResponse.accessToken, loginResponse.authResponse.userID);
        } else {
          setIsConnected(false);
          const errorMsg = loginResponse.error_reason || 'Facebook login mislukt';
          setError(errorMsg);
          onLoginError?.(errorMsg);
        }
      }, {
        scope: [
          'email',
          'public_profile',
          'ads_management',
          'ads_read',
          'business_management',
          'read_insights',
          'pages_read_engagement',
          'pages_show_list'
        ].join(',')
      });
    });
  };

  const getAdAccounts = async (accessToken: string) => {
    try {
      const response = await fetch(`/api/marketing/facebook-ad-manager?action=get-ad-accounts&accessToken=${accessToken}`);
      const data = await response.json();
      
      if (data.success && data.adAccounts.length > 0) {
        // Store the first ad account ID
        localStorage.setItem('facebook_ad_account_id', data.adAccounts[0].id);
        console.log('Ad Account ID stored:', data.adAccounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
    }
  };

  const handleLogout = () => {
    if (!window.FB) return;

    window.FB.logout((response: any) => {
      setIsConnected(false);
      setUserInfo(null);
      localStorage.removeItem('facebook_ad_account_id');
      localStorage.removeItem('facebook_access_token');
      localStorage.removeItem('facebook_user_id');
      localStorage.removeItem('facebook_login_status');
    });
  };

  if (!FB_APP_ID) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="text-red-400 font-semibold">Facebook App ID niet geconfigureerd</h3>
            <p className="text-red-300 text-sm">
              Voeg NEXT_PUBLIC_FACEBOOK_APP_ID toe aan je environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={`border rounded-lg p-4 ${
        isConnected 
          ? 'bg-green-900/20 border-green-500/50' 
          : 'bg-gray-900/20 border-gray-500/50'
      }`}>
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h3 className={`font-semibold ${
              isConnected ? 'text-green-400' : 'text-gray-400'
            }`}>
              Facebook Connectie Status
            </h3>
            <p className="text-gray-300 text-sm">
              {isConnected 
                ? `Verbonden als ${userInfo?.user?.name || 'Gebruiker'}`
                : 'Niet verbonden met Facebook'
              }
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {isConnected && userInfo?.user && (
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-blue-400 font-semibold">Verbonden Account</h3>
              <p className="text-blue-300 text-sm">
                Naam: {userInfo.user.name}<br/>
                Email: {userInfo.user.email}<br/>
                User ID: {userInfo.user.id}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Facebook Login Button */}
      <div className="flex justify-center">
        {!isConnected ? (
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-gray-600 text-white px-8 py-4 rounded-lg flex items-center space-x-3 transition-colors font-medium text-lg shadow-lg"
          >
            {isLoading ? (
              <CogIcon className="w-6 h-6 animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            <span>
              {isLoading ? 'Verbinden...' : 'Verbinden met Facebook'}
            </span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-3 transition-colors font-medium"
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Verbinding Verbreken</span>
          </button>
        )}
      </div>

      {/* Permissions Info */}
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-blue-200 text-sm">
            <h3 className="font-semibold mb-2">Toegestane Permissions</h3>
            <ul className="space-y-1">
              <li>• <strong>email:</strong> Je email adres</li>
              <li>• <strong>public_profile:</strong> Basis profiel informatie</li>
              <li>• <strong>ads_management:</strong> Campagnes beheren</li>
              <li>• <strong>ads_read:</strong> Advertentie data lezen</li>
              <li>• <strong>business_management:</strong> Business Manager toegang</li>
              <li>• <strong>read_insights:</strong> Performance data lezen</li>
              <li>• <strong>pages_read_engagement:</strong> Page engagement data</li>
              <li>• <strong>pages_show_list:</strong> Pages lijst bekijken</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
