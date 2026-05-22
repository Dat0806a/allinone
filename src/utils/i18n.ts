import { LanguageOption } from '../store/useSettingsStore';

export const i18nDictionary = {
  vi: {
    // General Headers
    personalization: 'Tùy chỉnh cá nhân',
    systemSettings: 'Cài đặt hệ thống',
    interfaceAndUtilities: 'Giao diện & Tiện ích',
    systemAndSecurity: 'Hệ thống & Bảo mật',
    optimized2026: 'Tối ưu hóa năm 2026',
    
    // Setting Item labels
    fontSizeLabel: 'Cỡ chữ hiển thị',
    nightModeLabel: 'Chế độ ban đêm',
    reminderSoundLabel: 'Âm thanh nhắc nhở',
    languageLabel: 'Ngôn ngữ ứng dụng',
    privacyLabel: 'Quyền riêng tư',
    helpSupportLabel: 'Trợ giúp & Hỗ trợ',
    appVersionLabel: 'Phiên bản phần mềm',
    
    // FontSize options
    fontSizeSmall: 'Nhỏ',
    fontSizeMedium: 'Vừa',
    fontSizeLarge: 'Lớn',
    fontSizeElderly: 'Cực đại (Cho người cao tuổi)',
    fontSizeDescSmall: 'Cỡ chữ nhỏ gọn',
    fontSizeDescMedium: 'Cỡ chữ chuẩn hệ thống',
    fontSizeDescLarge: 'Dễ đọc hơn cho cận thị',
    fontSizeDescElderly: 'Cực kỳ dễ đọc, khuyên dùng cho người già',
    
    // Theme options
    themeLight: 'Chế độ sáng',
    themeDark: 'Chế độ tối',
    themeAuto: 'Tự động theo thời gian (20:00 - 06:00)',
    themeValueLight: 'Sáng',
    themeValueDark: 'Tối',
    themeValueAuto: 'Tự động',
    
    // Sound options
    soundEnabled: 'Bật âm thanh nhắc nhở',
    selectVoice: 'Giọng nói AI',
    voiceMale: 'Giọng Nam khỏe khoắn',
    voiceFemale: 'Giọng Nữ dịu dàng',
    voiceRobot: 'Giọng Android thông minh',
    soundVolume: 'Âm lượng thông báo',
    testSoundButton: 'Nghe thử giọng nói',
    noSoundText: 'Đã tắt âm thanh',
    
    // Languages
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English (Mỹ)',
    
    // Privacy
    securityLevel: 'Bảo mật cấp cao',
    locationPerm: 'Quyền truy cập vị trí',
    micPerm: 'Quyền truy cập Microphone',
    notifPerm: 'Quyền gửi thông báo',
    biometricPerm: 'Mở bằng FaceID / Thẻ vân tay',
    permGranted: 'Đã cấp quyền',
    permDenied: 'Đã từ chối',
    permPrompt: 'Nhấp để cấp quyền',
    permRequired: 'Yêu cầu quyền truy cập',
    
    // Support & Info
    supportTitle: 'Trợ giúp & Liên hệ',
    appVersionVal: 'Health v4.2.0',
    checkUpdate: 'Kiểm tra phiên bản',
    allUpdated: 'Đã cập nhật mới nhất',
    sendFeedback: 'Gửi phản hồi cho chúng tôi',
    contactSupport: 'Liên hệ tổng đài 24/7',
    activeSupport: '24/7 Sẵn sàng',
    feedbackSuccess: 'Đã gửi phản hồi thành công!',
    feedbackError: 'Vui lòng điền đầy đủ thông tin bài đăng.',
    
    // Modals & UI actions
    close: 'Đóng',
    confirm: 'Xác nhận',
    save: 'Lưu thay đổi',
    cancel: 'Hủy bỏ',
    back: 'Quay lại',
    holdToTrigger: 'Nhấn và giữ 3 giây để gọi ngay',
    
    // Emergency / SOS
    sosLabel: 'Báo động SOS khẩn cấp',
    sosValue: 'Kích hoạt hỗ trợ y tế và gửi định vị vị trí',
    emergencyTriggered: 'Đang liên hệ y tế khẩn cấp',
    emergencyText: 'Lực lượng cứu hộ và người thân đang nhận được vị trí chính xác của bạn.'
  },
  en: {
    // General Headers
    personalization: 'Personal Customization',
    systemSettings: 'System Settings',
    interfaceAndUtilities: 'Interface & Utilities',
    systemAndSecurity: 'System & Security',
    optimized2026: 'Optimized for 2026',
    
    // Setting Item labels
    fontSizeLabel: 'Display Font Size',
    nightModeLabel: 'Dark Mode Theme',
    reminderSoundLabel: 'Reminder Sound Alert',
    languageLabel: 'Application Language',
    privacyLabel: 'Privacy & Security',
    helpSupportLabel: 'Help & Support Desk',
    appVersionLabel: 'Software Version',
    
    // FontSize options
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    fontSizeElderly: 'Extra Large (For Elderly)',
    fontSizeDescSmall: 'Compact screen text size',
    fontSizeDescMedium: 'Standard system text size',
    fontSizeDescLarge: 'Easier to read for low vision',
    fontSizeDescElderly: 'Maximum clarity, best for seniors',
    
    // Theme options
    themeLight: 'Light Theme Mode',
    themeDark: 'Dark Theme Mode',
    themeAuto: 'Auto-Scheduled (20:00 - 06:00)',
    themeValueLight: 'Light',
    themeValueDark: 'Dark',
    themeValueAuto: 'Auto',
    
    // Sound options
    soundEnabled: 'Enable Medicine Reminders',
    selectVoice: 'Synthesized AI Voice',
    voiceMale: 'Robust Male Voice',
    voiceFemale: 'Gentle Female Voice',
    voiceRobot: 'Assistant Robot Voice',
    soundVolume: 'Notification Volume Level',
    testSoundButton: 'Play Audio Preview',
    noSoundText: 'Sound muted',
    
    // Languages
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English (US)',
    
    // Privacy
    securityLevel: 'High-Level Security',
    locationPerm: 'Location Tracking Permission',
    micPerm: 'Microphone Permission',
    notifPerm: 'App Notification Access',
    biometricPerm: 'FaceID / Fingerprint Lock',
    permGranted: 'Permission Granted',
    permDenied: 'Permission Denied',
    permPrompt: 'Tap to authorize',
    permRequired: 'Request access',
    
    // Support & Info
    supportTitle: 'Help & Technical Support',
    appVersionVal: 'Health v4.2.0',
    checkUpdate: 'Check for Updates',
    allUpdated: 'Everything is Up to Date',
    sendFeedback: 'Send Us Constructive Feedback',
    contactSupport: 'Call Customer Support 24/7',
    activeSupport: '24/7 Ready',
    feedbackSuccess: 'Feedback submitted successfully!',
    feedbackError: 'Please complete all required fields.',
    
    // Modals & UI actions
    close: 'Close',
    confirm: 'Confirm',
    save: 'Save Changes',
    cancel: 'Cancel',
    back: 'Back',
    holdToTrigger: 'Press and hold 3 seconds to call now',
    
    // Emergency / SOS
    sosLabel: 'SOS Emergency Alarm',
    sosValue: 'Trigger medical assistance and broadcast live coords',
    emergencyTriggered: 'Emergency dispatch in progress',
    emergencyText: 'First responders and contacts are receiving your precise location.'
  }
};

export const getTranslation = (lang: LanguageOption, key: keyof typeof i18nDictionary['vi']) => {
  const dict = i18nDictionary[lang] || i18nDictionary['vi'];
  return dict[key] || i18nDictionary['vi'][key] || String(key);
};
