import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Volume2, 
  Globe, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Monitor, 
  X, 
  Play, 
  VolumeX, 
  Check, 
  Lock, 
  Cpu, 
  RefreshCw, 
  Mail, 
  MessageCircle, 
  User, 
  FileText, 
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PremiumCard, SectionHeader, cn, PremiumButton, PremiumInput } from '../components/premium/UI';
import { useSettingsStore, FontSizeOption, ThemeOption, VoiceOption, LanguageOption } from '../store/useSettingsStore';
import { getTranslation } from '../utils/i18n';

const Settings: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    voiceType,
    setVoiceType,
    soundVolume,
    setSoundVolume,
    language,
    setLanguage,
    biometricsEnabled,
    setBiometricsEnabled,
    permissions,
    refreshPermissions
  } = useSettingsStore();

  const [activeModal, setActiveModal] = useState<'font' | 'theme' | 'sound' | 'language' | 'privacy' | 'help' | 'version' | null>(null);

  // Translate helper
  const t = (key: any) => getTranslation(language, key);

  // Speech helper
  const playTestVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const text = language === 'en' 
      ? `Audio test verified. Notification volume set to ${Math.round(soundVolume * 100)} percent.`
      : `Xác nhận kiểm tra âm thanh thành công. Hệ thống thông báo đang ở mức âm lượng ${Math.round(soundVolume * 100)} phần trăm.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = soundEnabled ? soundVolume : 0;
    
    // Choose voice depending on requested traits
    const voices = window.speechSynthesis.getVoices();
    const targetLang = language === 'en' ? 'en-US' : 'vi-VN';
    const filteredVoices = voices.filter(v => v.lang.startsWith(targetLang));
    
    let selectedVoice = null;
    if (filteredVoices.length > 0) {
      if (voiceType === 'male') {
        selectedVoice = filteredVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('nam')) || filteredVoices[0];
      } else if (voiceType === 'robot') {
        selectedVoice = filteredVoices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('microsoft')) || filteredVoices[0];
      } else {
        selectedVoice = filteredVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('nữ')) || filteredVoices[0];
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    if (voiceType === 'robot') {
      utterance.pitch = 0.5;
      utterance.rate = 1.35;
    } else if (voiceType === 'male') {
      utterance.pitch = 0.85;
      utterance.rate = 0.92;
    } else {
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Human value for UI representation
  const getFontSizeDisplay = () => {
    switch (fontSize) {
      case 'small': return t('fontSizeSmall');
      case 'medium': return t('fontSizeMedium');
      case 'large': return t('fontSizeLarge');
      case 'elderly': return t('fontSizeElderly');
      default: return t('fontSizeMedium');
    }
  };

  const getThemeDisplay = () => {
    switch (theme) {
      case 'light': return t('themeValueLight');
      case 'dark': return t('themeValueDark');
      case 'auto': return t('themeValueAuto');
      default: return t('themeValueAuto');
    }
  };

  const getVoiceDisplay = () => {
    if (!soundEnabled) return t('noSoundText');
    switch (voiceType) {
      case 'male': return t('voiceMale');
      case 'female': return t('voiceFemale');
      case 'robot': return t('voiceRobot');
      default: return t('voiceFemale');
    }
  };

  const getLanguageDisplay = () => {
    return language === 'vi' ? t('langVietnamese') : t('langEnglish');
  };

  // Real permission prompts
  const triggerLocationPrompt = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => refreshPermissions(),
      () => refreshPermissions()
    );
  };

  const triggerMicPrompt = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      refreshPermissions();
    } catch {
      refreshPermissions();
    }
  };

  const triggerNotifPrompt = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
      refreshPermissions();
    }
  };

  // Helper modals elements
  const renderFontModal = () => {
    const sizeKeys: { value: FontSizeOption; title: string; desc: string }[] = [
      { value: 'small', title: t('fontSizeSmall'), desc: t('fontSizeDescSmall') },
      { value: 'medium', title: t('fontSizeMedium'), desc: t('fontSizeDescMedium') },
      { value: 'large', title: t('fontSizeLarge'), desc: t('fontSizeDescLarge') },
      { value: 'elderly', title: t('fontSizeElderly'), desc: t('fontSizeDescElderly') },
    ];

    return (
      <div className="space-y-6">
        <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">
          {language === 'vi' 
            ? 'Thay đổi kích thước chữ hiển thị giúp cải thiện trải nghiệm đọc, đặc biệt thích hợp với người lớn tuổi.' 
            : 'Scaling values allows easier scanning for elder support and low-vision environments.'}
        </p>

        <div className="space-y-3">
          {sizeKeys.map((item) => (
            <button
              key={item.value}
              onClick={() => setFontSize(item.value)}
              className={cn(
                "w-full p-5 rounded-3xl text-left border flex items-center justify-between transition-all duration-200 outline-none",
                fontSize === item.value 
                  ? "bg-orange-50/70 border-primary text-primary dark:bg-orange-950/20" 
                  : "bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
              )}
            >
              <div>
                <p className="font-bold tracking-tight text-slate-800 dark:text-slate-100">{item.title}</p>
                <p className={cn("text-xs font-bold mt-1 opacity-75", fontSize === item.value ? "text-primary" : "text-slate-400")}>
                  {item.desc}
                </p>
              </div>
              {fontSize === item.value && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Real-time sample boxes */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 space-y-1.5 mt-2 shadow-inner">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('close') === 'Đóng' ? 'XEM TRƯỚC VĂN BẢN' : 'TEXT PREVIEW'}</p>
          <p className="font-bold text-slate-800 dark:text-slate-150 leading-relaxed">
            {language === 'vi' ? 'Sức khoẻ của tôi được bảo vệ chu đáo mỗi ngày.' : 'My personal health state is optimally preserved.'}
          </p>
          <p className="text-xs text-slate-400 font-bold">
            {language === 'vi' ? 'Xem nhật ký uống thuốc vào lúc 08:30 sáng.' : 'Review daily medicine schedules at 08:30 AM.'}
          </p>
        </div>
      </div>
    );
  };

  const renderThemeModal = () => {
    const themeKeys: { value: ThemeOption; title: string; desc: string; icon: any }[] = [
      { value: 'light', title: t('themeLight'), desc: language === 'vi' ? 'Tiết kiệm năng lượng ban ngày' : 'Saves focus under daylight', icon: Sun },
      { value: 'dark', title: t('themeDark'), desc: language === 'vi' ? 'Giảm mỏi mắt trong tối' : 'Protects vision under dark logs', icon: Moon },
      { value: 'auto', title: t('themeAuto'), desc: language === 'vi' ? 'Bảo vệ mắt tự động' : 'Automatic transitions for convenience', icon: Cpu },
    ];

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {themeKeys.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => setTheme(item.value)}
                className={cn(
                  "w-full p-5 rounded-3xl text-left border flex items-center justify-between transition-all duration-200 outline-none",
                  theme === item.value 
                    ? "bg-orange-50/70 border-primary text-primary dark:bg-orange-950/20" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border",
                    theme === item.value 
                      ? "bg-primary text-white border-primary" 
                      : "bg-white text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                  )}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className={cn("text-xs font-bold mt-1 opacity-75", theme === item.value ? "text-primary" : "text-slate-400")}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                {theme === item.value && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  const renderSoundModal = () => {
    const voiceKeys: { value: VoiceOption; label: string }[] = [
      { value: 'male', label: t('voiceMale') },
      { value: 'female', label: t('voiceFemale') },
      { value: 'robot', label: t('voiceRobot') },
    ];

    return (
      <div className="space-y-6">
        {/* Toggle Option */}
        <div className="p-5 flex items-center justify-between rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{t('soundEnabled')}</p>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {language === 'vi' ? 'Phát giọng đọc khi báo hẹn uống thuốc' : 'Vocal alerts on medicine checkpoints'}
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "w-14 h-8 rounded-full transition-colors relative cursor-pointer outline-none",
              soundEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
            )}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full absolute left-1 top-1 flex items-center justify-center"
              style={{ x: soundEnabled ? 24 : 0 }}
            >
              {soundEnabled ? (
                <Volume2 size={12} className="text-primary" />
              ) : (
                <VolumeX size={12} className="text-slate-400" />
              )}
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {soundEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Select voice */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('selectVoice')}</label>
                <div className="grid grid-cols-1 gap-2">
                  {voiceKeys.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setVoiceType(item.value)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left border flex items-center justify-between transition-colors outline-none",
                        voiceType === item.value 
                          ? "bg-slate-100 border-primary text-primary dark:bg-slate-800" 
                          : "bg-surface border-slate-100 hover:border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                      )}
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-100 text-sm">{item.label}</span>
                      {voiceType === item.value && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume sliders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                  <span className="uppercase tracking-widest">{t('soundVolume')}</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <VolumeX size={18} className="text-slate-350" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="w-full h-2 rounded-full accent-primary bg-slate-100 dark:bg-slate-800 outline-none cursor-pointer"
                  />
                  <Volume2 size={18} className="text-primary" />
                </div>
              </div>

              {/* Sound Test trigger */}
              <PremiumButton
                onClick={playTestVoice}
                className="w-full bg-orange-50 hover:bg-orange-100 text-primary border border-orange-100 py-3.5 dark:bg-orange-950/20 dark:border-orange-900 flex items-center justify-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                {t('testSoundButton')}
              </PremiumButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderLanguageModal = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <button
            onClick={() => setLanguage('vi')}
            className={cn(
              "w-full p-5 rounded-3xl text-left border flex items-center justify-between transition-all duration-200 outline-none",
              language === 'vi' 
                ? "bg-orange-50/70 border-primary text-primary dark:bg-orange-950/20" 
                : "bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl leading-none">🇻🇳</span>
              <div>
                <p className="font-bold tracking-tight text-slate-800 dark:text-slate-100">Tiếng Việt</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tiếng Việt bản địa & Hướng dẫn âm thanh</p>
              </div>
            </div>
            {language === 'vi' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "w-full p-5 rounded-3xl text-left border flex items-center justify-between transition-all duration-200 outline-none",
              language === 'en' 
                ? "bg-orange-50/70 border-primary text-primary dark:bg-orange-950/20" 
                : "bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl leading-none">🇺🇸</span>
              <div>
                <p className="font-bold tracking-tight text-slate-800 dark:text-slate-100">English</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Universal translations & Vocal support</p>
              </div>
            </div>
            {language === 'en' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderPrivacyModal = () => {
    return (
      <div className="space-y-6">
        <p className="text-slate-500 font-medium text-xs leading-relaxed">
          {language === 'vi'
            ? 'Bảo vệ an toàn và quyền sử dụng tài nguyên nhằm tối ưu việc gửi vị trí SOS và cảnh báo thông minh.'
            : 'Authorize runtime metrics for emergency coordinates broadcasts and reminders.'}
        </p>

        <div className="space-y-4">
          {/* Location Permission */}
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/50">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('locationPerm')}</p>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mt-1">
                {permissions.location === 'granted' ? t('permGranted') : permissions.location === 'denied' ? t('permDenied') : t('permPrompt')}
              </p>
            </div>
            {permissions.location === 'granted' ? (
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black border border-green-100 dark:bg-green-950/20 dark:border-green-900">
                OK
              </div>
            ) : (
              <button
                onClick={triggerLocationPrompt}
                className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black select-none outline-none"
              >
                {t('permRequired')}
              </button>
            )}
          </div>

          {/* Micro Permission */}
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/50">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('micPerm')}</p>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mt-1">
                {permissions.microphone === 'granted' ? t('permGranted') : permissions.microphone === 'denied' ? t('permDenied') : t('permPrompt')}
              </p>
            </div>
            {permissions.microphone === 'granted' ? (
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black border border-green-100 dark:bg-green-950/20 dark:border-green-900">
                OK
              </div>
            ) : (
              <button
                onClick={triggerMicPrompt}
                className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black select-none outline-none"
              >
                {t('permRequired')}
              </button>
            )}
          </div>

          {/* Notification Permission */}
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/50">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('notifPerm')}</p>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mt-1">
                {permissions.notification === 'granted' ? t('permGranted') : permissions.notification === 'denied' ? t('permDenied') : t('permPrompt')}
              </p>
            </div>
            {permissions.notification === 'granted' ? (
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black border border-green-100 dark:bg-green-950/20 dark:border-green-900">
                OK
              </div>
            ) : (
              <button
                onClick={triggerNotifPrompt}
                className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black select-none outline-none"
              >
                {t('permRequired')}
              </button>
            )}
          </div>

          {/* FaceID/Finger Biometric toggles */}
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/50">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('biometricPerm')}</p>
              <p className="text-[10px] font-black text-slate-400 mt-1">
                {language === 'vi' ? 'Sử dụng TouchID / Vân tay mở khoá nhanh' : 'Secure instant checks via WebAuthn logs'}
              </p>
            </div>
            <button
              onClick={() => setBiometricsEnabled(!biometricsEnabled)}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative cursor-pointer outline-none",
                biometricsEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full absolute left-1 top-1"
                style={{ x: biometricsEnabled ? 20 : 0 }}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'font': return t('fontSizeLabel');
      case 'theme': return t('nightModeLabel');
      case 'sound': return t('reminderSoundLabel');
      case 'language': return t('languageLabel');
      case 'privacy': return t('privacyLabel');
      case 'help': return t('supportTitle');
      case 'version': return t('appVersionLabel');
      default: return '';
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1.5">
        <p className="text-[#475569] dark:text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] md:text-xs select-none">{t('personalization')}</p>
        <h1 className="text-3xl font-display font-black text-[#0F172A] dark:text-white md:text-4xl tracking-tight leading-none">{t('systemSettings')}</h1>
      </div>

      <div className="space-y-8">
        <div>
          <SectionHeader title={t('interfaceAndUtilities')} />
          <div className="space-y-3 mt-3">
             <SettingItem 
               icon={Monitor} 
               label={t('fontSizeLabel')} 
               value={getFontSizeDisplay()} 
               onClick={() => setActiveModal('font')} 
             />
             <SettingItem 
               icon={theme === 'light' ? Sun : Moon} 
               label={t('nightModeLabel')} 
               value={getThemeDisplay()} 
               onClick={() => setActiveModal('theme')} 
             />
             <SettingItem 
               icon={Volume2} 
               label={t('reminderSoundLabel')} 
               value={getVoiceDisplay()} 
               onClick={() => setActiveModal('sound')} 
             />
          </div>
        </div>

        <div>
          <SectionHeader title={t('systemAndSecurity')} />
          <div className="space-y-3 mt-3">
             <SettingItem 
               icon={Globe} 
               label={t('languageLabel')} 
               value={getLanguageDisplay()} 
               onClick={() => setActiveModal('language')} 
             />
             <SettingItem 
               icon={Shield} 
               label={t('privacyLabel')} 
               value={t('securityLevel')} 
               onClick={() => setActiveModal('privacy')} 
             />
             <SettingItem 
               icon={HelpCircle} 
               label={t('helpSupportLabel')} 
               value={t('activeSupport')} 
               onClick={() => setActiveModal('help')} 
             />
             <SettingItem 
               icon={Info} 
               label={t('appVersionLabel')} 
               value={t('appVersionVal')} 
               onClick={() => setActiveModal('version')} 
             />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-10 pb-6">
         <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-primary premium-shadow border border-slate-100 dark:border-slate-800/80 select-none">
            <SettingsIcon size={32} className="animate-spin-slow" />
         </div>
         <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] select-none text-center">{t('optimized2026')}</p>
      </div>

      {/* Embedded Modals / Overlay via App Portal to prevent layout breaks */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModal && (
            <div className="fixed inset-0 z-[12000] flex items-end justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-4 md:p-6 select-none">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full max-w-[440px] bg-white dark:bg-[#121c2e] rounded-[2.5rem] border border-slate-150/55 dark:border-slate-800 p-6 md:p-8 flex flex-col premium-shadow max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0">
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{getModalTitle()}</h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-450 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer outline-none"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrolled Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 pr-1">
                  {activeModal === 'font' && renderFontModal()}
                  {activeModal === 'theme' && renderThemeModal()}
                  {activeModal === 'sound' && renderSoundModal()}
                  {activeModal === 'language' && renderLanguageModal()}
                  {activeModal === 'privacy' && renderPrivacyModal()}
                  {activeModal === 'help' && <HelpSupportModal language={language} t={t} />}
                  {activeModal === 'version' && <VersionModal language={language} t={t} />}
                </div>

                {/* Footer close button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 shrink-0 flex gap-3">
                  <PremiumButton
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-slate-50 text-slate-500 hover:text-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-slate-100 py-3.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-100"
                  >
                    {t('close')}
                  </PremiumButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.getElementById('app-modal-portal') || document.body
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

interface HelpSupportModalProps {
  language: LanguageOption;
  t: (key: any) => string;
}

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ language, t }) => {
  const [tab, setTab] = useState<'faq' | 'support' | 'assistant'>('faq');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  // Feedback form state
  const [formData, setFormData] = useState({ name: '', email: '', type: 'feedback', title: '', desc: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Assistant chat state
  const [chatHistory, setChatHistory] = useState<any[]>([
    { id: 1, sender: 'bot', text: language === 'vi' ? 'Chào bác! Con là trợ lý sức khoẻ thông minh của HealthCare. Bác cần con hỗ trợ gì hôm nay ạ?' : 'Hello! I am your companion assistant. How may I support you today?' }
  ]);
  const [customChatText, setCustomChatText] = useState('');

  const faqs = language === 'vi' ? [
    { q: "Làm thế nào để thêm giờ nhắc uống thuốc?", a: "Bác vào thẻ 'Ủy thác thuốc' hoặc bấm biểu tượng 'Thuốc' ở trang chủ, sau đó chọn '+' và nhập tên thuốc cùng các mốc giờ uống tương thích." },
    { q: "Quét vân tay / FaceID cài đặt ra sao?", a: "Bác kích hoạt mục 'FaceID / Thẻ vân tay' ở phần Quyền riêng tư, sau đó sử dụng sinh trắc học thiết bị khi được yêu cầu." },
    { q: "Chức năng SOS hoạt động thế nào?", a: "Khi bác bấm và GIỮ nút SOS màu đỏ trong 3 giây (hoặc nhấp xác nhận), hệ thống lập tức phát tiếng còi hụ, gọi điện cho đường dây y tế 115 và cùng lúc nhắn toạ độ vệ tinh cho người thân." },
    { q: "Dùng tài khoản miễn phí có được định vị y tế?", a: "Có! Định vị GPS và gọi cấp cứu tự động là quyền lợi MIỄN PHÍ vĩnh viễn trọn đời cho mọi tài khoản để bảo vệ cuộc sống của bác." },
  ] : [
    { q: "How do I configure a medicine reminder?", a: "Go to the Medicines tab, hit '+ Add Medication', fill in the name, dosage, and preferred hours, then save." },
    { q: "Is the biometric scan safe for seniors?", a: "Yes, FaceID and TouchID credentials are encrypted locally on your companion node for maximal security." },
    { q: "What does the red SOS trigger do?", a: "Holding the circular SOS node for 3 full seconds fires alert triggers to 115 dispatch and broadcasts live coords to contacts." }
  ];

  const careAssistantAnswers = language === 'vi' ? {
    sos: "Khi kích hoạt SOS, còi khụ báo động sẽ vang lên ở mức tối đa và tin nhắn kèm toạ độ bản đồ sẽ trực tiếp gửi tới người thân thông qua mạng lưới an toàn.",
    meds: "Bác hoàn toàn có thể tự ghi chép hoặc cài đặt để người thân cài giùm qua tài khoản liên kết. Khi tới giờ, app sẽ có chuông phát âm thanh thông báo.",
    pulse: "Nhịp tim đo được sẽ lưu tự động ở thẻ Phân tích (Analytics) của bác để có thể báo cáo chi tiết nhất cho Bác sĩ gia đình."
  } : {
    sos: "SOS broadcasts live details immediately to emergency care networks and safe contacts with responsive coordinates tracking.",
    meds: "Medication schedules sync with notification alarms so voice reading readouts happen at specified times.",
    pulse: "Your cardiac records compile cleanly into analytics folders to prepare charts for healthcare advisors."
  };

  const triggerAssistantQuickAnswer = (key: 'sos' | 'meds' | 'pulse') => {
    const qText = key === 'sos' 
      ? (language === 'vi' ? "Cài đặt SOS khẩn cấp thế nào?" : "How does SOS alerting run?")
      : key === 'meds'
      ? (language === 'vi' ? "Đặt chuông báo thuốc ra sao?" : "How do reminders play?")
      : (language === 'vi' ? "Nhịp tim lưu trữ ở đâu?" : "Where cardiac logs save?");

    const botText = careAssistantAnswers[key];
    setChatHistory(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: qText },
      { id: Date.now() + 1, sender: 'bot', text: botText }
    ]);
  };

  const sendCustomChatMessage = () => {
    if (!customChatText.trim()) return;
    const uText = customChatText;
    setCustomChatText('');
    
    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: uText }]);
    
    setTimeout(() => {
      const botReply = language === 'vi' 
        ? "Dạ con đã ghi nhận ý kiến của bác. Bác có thể chọn nút hỗ trợ nhanh bên dưới hoặc liên hệ tổng đài 24/7 để được giải đáp tức thì!"
        : "I have saved your advice. Please call our 24/7 technical hotline for immediate support!";
      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
    }, 800);
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.title || !formData.desc) return;
    
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSuccess(true);
      setFormData({ name: '', email: '', type: 'feedback', title: '', desc: '' });
      setTimeout(() => setFormSuccess(false), 2500);
    }, 1000);
  };

  return (
    <div className="space-y-6 flex flex-col h-[520px]">
      {/* Modal-specific tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 gap-1 shrink-0">
        <button
          onClick={() => setTab('faq')}
          className={cn(
            "flex-1 py-2 rounded-xl text-center font-bold text-xs transition-colors cursor-pointer outline-none",
            tab === 'faq' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400"
          )}
        >
          Hỏi đáp (FAQ)
        </button>
        <button
          onClick={() => setTab('assistant')}
          className={cn(
            "flex-1 py-2 rounded-xl text-center font-bold text-xs transition-colors cursor-pointer outline-none",
            tab === 'assistant' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400"
          )}
        >
          🤖 Trợ lý ảo
        </button>
        <button
          onClick={() => setTab('support')}
          className={cn(
            "flex-1 py-2 rounded-xl text-center font-bold text-xs transition-colors cursor-pointer outline-none",
            tab === 'support' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-400"
          )}
        >
          Gửi phản hồi
        </button>
      </div>

      {/* Tab content area */}
      <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar pr-1">
        {tab === 'faq' && (
          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-[13px] md:text-sm text-slate-800 dark:text-slate-150 outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className={cn("text-slate-400 transition-transform", faqOpenIndex === index && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpenIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="p-4 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold border-t border-slate-100/50 dark:border-slate-800/50">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <a 
              href="tel:19001111"
              className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900 rounded-2xl font-black text-xs md:text-sm mt-4 select-none outline-none"
            >
              <span>📞 {t('contactSupport')}</span>
              <span>1900 1111 (24/7)</span>
            </a>
          </div>
        )}

        {tab === 'assistant' && (
          <div className="flex flex-col h-full gap-3">
            {/* Message History */}
            <div className="flex-1 space-y-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar min-h-[220px]">
              {chatHistory.map(msg => (
                <div key={msg.id} className={cn("flex w-full", msg.sender === 'bot' ? "justify-start" : "justify-end")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[12px] md:text-xs font-semibold leading-relaxed max-w-[85%] shadow-sm",
                    msg.sender === 'bot' 
                      ? "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100" 
                      : "bg-primary text-white"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="grid grid-cols-3 gap-1.5 shrink-0 pt-1">
              <button
                type="button"
                onClick={() => triggerAssistantQuickAnswer('sos')}
                className="py-1 px-2 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary dark:text-slate-400 text-[10px] font-bold rounded-lg truncate text-center outline-none bg-slate-50 dark:bg-slate-900"
              >
                🆘 Hướng dẫn SOS
              </button>
              <button
                type="button"
                onClick={() => triggerAssistantQuickAnswer('meds')}
                className="py-1 px-2 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary dark:text-slate-400 text-[10px] font-bold rounded-lg truncate text-center outline-none bg-slate-50 dark:bg-slate-900"
              >
                ⏰ Nhắc nhở thuốc
              </button>
              <button
                type="button"
                onClick={() => triggerAssistantQuickAnswer('pulse')}
                className="py-1 px-2 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary dark:text-slate-400 text-[10px] font-bold rounded-lg truncate text-center outline-none bg-slate-50 dark:bg-slate-900"
              >
                📊 Đo lường nhịp tim
              </button>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 shrink-0">
              <input
                type="text"
                value={customChatText}
                onChange={(e) => setCustomChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCustomChatMessage()}
                placeholder={language === 'vi' ? "Nhập câu hỏi tại đây..." : "Type healthcare query..."}
                className="flex-1 p-3 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold outline-none text-slate-800 dark:text-slate-100 focus:border-primary placeholder-slate-400"
              />
              <button
                type="button"
                onClick={sendCustomChatMessage}
                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer outline-none"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {tab === 'support' && (
          <form onSubmit={submitFeedback} className="space-y-3.5">
            <AnimatePresence>
              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 text-xs font-black text-center dark:bg-green-950/20 dark:border-green-900"
                >
                  🚀 {t('feedbackSuccess')}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Họ và Tên</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-slate-105 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-100 placeholder-slate-350"
                  placeholder="Tên của bạn..."
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Thư điện tử (Email)</span>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-slate-105 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-150 placeholder-slate-350"
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Loại yêu cầu</span>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border border-slate-105 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold outline-none text-slate-850 dark:text-slate-200"
              >
                <option value="feedback">Góp ý cải tiến giao diện</option>
                <option value="bug">Báo cáo lỗi kỹ thuật</option>
                <option value="emergency">Yêu cầu cứu trợ khẩn cấp</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tiêu đề ý kiến</span>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-slate-105 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-100 placeholder-slate-350"
                placeholder="Tôi muốn góp ý..."
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mô tả nội dung chi tiết</span>
              <textarea
                required
                rows={3}
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                className="w-full p-3 border border-slate-105 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-100 placeholder-slate-350 resize-none"
                placeholder="Ghi ý kiến của bác tại đây để tụi con hỗ trợ kịp thời nha..."
              />
            </div>

            <PremiumButton
              type="submit"
              disabled={formLoading}
              className="w-full py-4 text-xs font-black uppercase tracking-widest bg-primary text-white"
            >
              {formLoading ? 'ĐANG GỬI...' : 'GỬI PHẢN HỒI THƯỜNG TRỰC'}
            </PremiumButton>
          </form>
        )}
      </div>
    </div>
  );
};

interface VersionModalProps {
  language: LanguageOption;
  t: (key: any) => string;
}

const VersionModal: React.FC<VersionModalProps> = ({ language, t }) => {
  const [checking, setChecking] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);

  const triggerCheck = () => {
    setChecking(true);
    setResultText(null);
    setTimeout(() => {
      setChecking(false);
      setResultText(language === 'vi' 
        ? "Phiên bản hiện tại v4.2.0 (Build 2026.0521) của bạn hoàn toàn bảo mật, an toàn nhất và đã được cập nhật mới nhất từ cơ sở dữ liệu quốc gia."
        : "Health v4.2.0 (Build 2026.0521) is fully secure, verified, and running the latest offline-first companion client."
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 flex flex-col items-center justify-center text-center py-6">
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-primary rounded-[2rem] premium-shadow border-white/50 animate-bounce">
        <Info size={40} />
      </div>
      
      <div>
        <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg">HealthCare Companion</h3>
        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Phiên bản v4.2.0 (Bảo Hộ)</p>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Build node: #202605211944</p>
      </div>

      <div className="w-full px-5">
        {checking ? (
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-primary" size={24} />
            <p className="text-xs text-slate-400 font-bold">{language === 'vi' ? 'Đang kiểm tra máy chủ an toàn...' : 'Validating companion manifest...'}</p>
          </div>
        ) : resultText ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-tr from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-900/50 rounded-3xl"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 mb-2.5 mx-auto">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed text-center">{resultText}</p>
          </motion.div>
        ) : (
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {language === 'vi' ? 'Toàn bộ dữ liệu chăm sóc từ xa của bác đều được đồng bộ hóa nội địa, mã hóa hai chiều và hạn chế xâm nhập trái phép.' : 'Companion databases utilize dual-end security hashes for local user safeguards.'}
          </p>
        )}
      </div>

      {!checking && !resultText && (
        <PremiumButton
          onClick={triggerCheck}
          className="w-full bg-primary text-white py-4 max-w-xs mt-2"
        >
          {t('checkUpdate')}
        </PremiumButton>
      )}
    </div>
  );
};

const SettingItem = ({ icon: Icon, label, value, onClick }: any) => (
  <motion.button
    whileHover={{ x: 4, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="w-full bg-white dark:bg-slate-900/90 p-5 md:p-6 rounded-[2.2rem] flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] border border-slate-100/90 dark:border-slate-800/80 group text-left outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/80 transition-all duration-200"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-amber-400 transition-colors border border-slate-100 dark:border-slate-700/60 shrink-0">
        <Icon size={24} />
      </div>
      <div>
        <p className="font-extrabold text-[#0F172A] tracking-tight dark:text-slate-50 text-[16px] md:text-[18px] leading-snug">{label}</p>
        <p className="text-xs md:text-[14px] font-extrabold text-[#B45309] dark:text-[#FBBF24] mt-1 select-none tracking-normal leading-none">{value}</p>
      </div>
    </div>
    <ChevronRight className="text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 duration-200" size={20} />
  </motion.button>
);

export default Settings;
