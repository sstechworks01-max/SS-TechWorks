import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  linkToHome?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  linkToHome = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/images/ss-techworks-logo.png');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchCustomLogo = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'official_logo_url')
          .maybeSingle();

        if (data?.setting_value) {
          const cleanUrl = String(data.setting_value).replace(/"/g, '');
          if (cleanUrl) {
            setLogoUrl(cleanUrl);
          }
        }
      } catch {
        // Fallback to local default
      }
    };

    fetchCustomLogo();
  }, []);

  const sizeClasses = {
    sm: { img: 'w-8 h-8', text: 'text-base font-bold' },
    md: { img: 'w-10 h-10', text: 'text-lg sm:text-xl font-bold' },
    lg: { img: 'w-14 h-14', text: 'text-2xl font-bold' },
    xl: { img: 'w-20 h-20', text: 'text-3xl font-extrabold' },
  };

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Circular Logo Container */}
      <div
        className={`${sizeClasses[size].img} relative rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-blue-500/30 bg-[#0d121f] shadow-md shadow-blue-950/40`}
      >
        {!imageError ? (
          <img
            src={logoUrl}
            alt="SS TECHWORKS Official Logo"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-0.5 rounded-full transition-transform hover:scale-105 duration-200"
          />
        ) : (
          /* High-fidelity circular brand mark fallback if physical asset is pending */
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1322] to-[#151e36] text-white"
            title="Official circular logo: place image at /public/images/ss-techworks-logo.png or upload via /admin/settings"
          >
            <span className="font-extrabold text-xs sm:text-sm tracking-tighter text-blue-400">SS</span>
          </div>
        )}
      </div>

      {showText && (
        <span
          className={`${sizeClasses[size].text} tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap`}
        >
          SS TECHWORKS
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" aria-label="SS TECHWORKS Home" className="inline-block shrink-0">
        {content}
      </Link>
    );
  }

  return content;
};
