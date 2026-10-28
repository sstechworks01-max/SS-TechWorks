import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MessageSquare, X, Mail, Phone, Info } from './IconHelper';
import { companyInfo } from '../../data/companyData';

export const FloatingWhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(companyInfo.whatsappNumber);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchSetting = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'whatsapp_number')
          .maybeSingle();

        if (data && data.setting_value && data.setting_value !== 'null' && data.setting_value !== '') {
          setWhatsappNumber(String(data.setting_value).replace(/"/g, ''));
        }
      } catch (err) {
        // Silent catch for unconfigured state
      }
    };

    fetchSetting();
  }, []);

  const handleClick = () => {
    const cleanNumber = (whatsappNumber || companyInfo.whatsappNumber).replace(/[^0-9]/g, '');
    window.open(`https://wa.me/91${cleanNumber}?text=${encodeURIComponent('Hi SS TECHWORKS, I would like to inquire about a project.')}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleClick}
          className="group relative flex items-center gap-2 p-3.5 sm:px-4 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/40 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Contact via WhatsApp"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            {whatsappNumber ? 'Chat on WhatsApp' : 'WhatsApp Contact'}
          </span>
          {!whatsappNumber && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" title="Channel not configured yet" />
          )}
        </button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">WhatsApp Channel Status</h3>
                  <p className="text-[11px] text-slate-400">SS TECHWORKS Communication</p>
                </div>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-start gap-2.5 text-amber-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  The official WhatsApp phone number is not yet configured in business site settings. We do not link to arbitrary or unverified phone numbers.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <span className="text-slate-400 block font-medium">Please reach out through our verified contact channel:</span>
              <div className="p-3 rounded-lg bg-[#07090e] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-mono">{companyInfo.email}</span>
                </div>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Send Email
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
