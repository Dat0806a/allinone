import { create } from 'zustand';

export type FontSizeOption = 'small' | 'medium' | 'large' | 'elderly';
export type ThemeOption = 'light' | 'dark' | 'auto';
export type VoiceOption = 'male' | 'female' | 'robot';
export type LanguageOption = 'vi' | 'en';

interface SettingsState {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  
  voiceType: VoiceOption;
  setVoiceType: (voice: VoiceOption) => void;
  
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  
  language: LanguageOption;
  setLanguage: (lang: LanguageOption) => void;
  
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
  
  permissions: {
    location: PermissionState | 'loading';
    microphone: PermissionState | 'loading';
    notification: NotificationPermission | 'loading';
  };
  setPermission: (type: 'location' | 'microphone' | 'notification', state: any) => void;
  refreshPermissions: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  fontSize: (localStorage.getItem('setting_font_size') as FontSizeOption) || 'medium',
  setFontSize: (size) => {
    localStorage.setItem('setting_font_size', size);
    set({ fontSize: size });
    applyFontSize(size);
  },
  
  theme: (localStorage.getItem('setting_theme') as ThemeOption) || 'light',
  setTheme: (theme) => {
    localStorage.setItem('setting_theme', theme);
    set({ theme });
    applyTheme(theme);
  },
  
  soundEnabled: localStorage.getItem('setting_sound_enabled') !== 'false',
  setSoundEnabled: (enabled) => {
    localStorage.setItem('setting_sound_enabled', String(enabled));
    set({ soundEnabled: enabled });
  },
  
  voiceType: (localStorage.getItem('setting_voice_type') as VoiceOption) || 'female',
  setVoiceType: (voice) => {
    localStorage.setItem('setting_voice_type', voice);
    set({ voiceType: voice });
  },
  
  soundVolume: localStorage.getItem('setting_sound_volume') ? Number(localStorage.getItem('setting_sound_volume')) : 0.7,
  setSoundVolume: (volume) => {
    localStorage.setItem('setting_sound_volume', String(volume));
    set({ soundVolume: volume });
  },
  
  language: (localStorage.getItem('setting_language') as LanguageOption) || 'vi',
  setLanguage: (lang) => {
    localStorage.setItem('setting_language', lang);
    set({ language: lang });
  },
  
  biometricsEnabled: localStorage.getItem('setting_biometrics_enabled') === 'true',
  setBiometricsEnabled: (enabled) => {
    localStorage.setItem('setting_biometrics_enabled', String(enabled));
    set({ biometricsEnabled: enabled });
  },
  
  permissions: {
    location: 'loading',
    microphone: 'loading',
    notification: 'loading',
  },
  setPermission: (type, state) => {
    set((prev) => ({
      permissions: {
        ...prev.permissions,
        [type]: state,
      }
    }));
  },
  
  refreshPermissions: async () => {
    const permissionsCopy = { ...get().permissions };
    
    // Check location
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const res = await navigator.permissions.query({ name: 'geolocation' });
        permissionsCopy.location = res.state;
      } catch (e) {
        permissionsCopy.location = 'prompt';
      }
    } else {
      permissionsCopy.location = 'prompt';
    }
    
    // Check microphone
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const res = await navigator.permissions.query({ name: 'microphone' as any });
        permissionsCopy.microphone = res.state;
      } catch (e) {
        permissionsCopy.microphone = 'prompt';
      }
    } else {
      permissionsCopy.microphone = 'prompt';
    }
    
    // Check notification
    if ('Notification' in window) {
      permissionsCopy.notification = Notification.permission;
    } else {
      permissionsCopy.notification = 'denied';
    }
    
    set({ permissions: permissionsCopy });
  },
}));

// Apply font size to document body or html root element
export const applyFontSize = (size: FontSizeOption) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  switch (size) {
    case 'small':
      root.style.fontSize = '14px';
      break;
    case 'medium':
      root.style.fontSize = '16px';
      break;
    case 'large':
      root.style.fontSize = '18px';
      break;
    case 'elderly':
      root.style.fontSize = '21px'; // Very large for the elderly
      break;
    default:
      root.style.fontSize = '16px';
  }
};

// Apply dark/light theme to document body or html root element
export const applyTheme = (theme: ThemeOption) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  const applyDark = () => {
    root.classList.add('dark');
  };
  
  const applyLight = () => {
    root.classList.remove('dark');
  };
  
  if (theme === 'dark') {
    applyDark();
  } else if (theme === 'light') {
    applyLight();
  } else {
    // Auto Mode: check current server/local hours
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) {
      applyDark();
    } else {
      applyLight();
    }
  }
};
