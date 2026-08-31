export type LanguageCode =
  | 'EN'
  | 'DE'
  | 'ES'
  | 'AE'
  | 'FR'
  | 'FA'
  | 'SQ'
  | 'TH'
  | 'HE'
  | 'RU'
  | 'PT'
  | 'JA'
  | 'KO'
  | 'ZH'
  | 'MN'
  | 'NE'
  | 'HI'
  | 'IT'
  | 'MY'
  | 'TR'
  | 'SR'
  | 'HU'
  | 'PL'
  | 'DU'
  | 'TE'
  | 'KM'
  | 'IN'
  | 'GJ'
  | 'BN'
  | 'MR'
  | 'KN'
  | 'EL'
  | 'BR'
  | 'CZ'
  | 'MS'
  | 'TA'
  | 'ML'
  | 'UR'
  | 'BS'
  | 'HR'
  | 'GR'
  | 'AO'
  | 'KU'
  | 'AM'
  | 'OM'
  | 'TI'
  | 'PA'
  | 'ET';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName?: string;
  flag?: string;
  isRtl?: boolean;
}

export interface TranslationDictionary {
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    emailOrUsernamePlaceholder: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPasswordLink: string;
    signInButton: string;
    signingIn: string;
    noAccountPrompt: string;
    createOneLink: string;
    orContinueWith: string;
    socialGoogle: string;
    socialMicrosoft: string;
    socialApple: string;
    socialGitHub: string;
    socialFacebook: string;
    socialX: string;
    
    createAccountTitle: string;
    createAccountSubtitle: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    registerPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    createAccountButton: string;
    creatingAccount: string;
    alreadyHaveAccountPrompt: string;
    signInLink: string;
    
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    sendResetLinkButton: string;
    sendingResetLink: string;
    rememberPasswordPrompt: string;
    checkInboxTitle: string;
    checkInboxSubtitle: string;
    returnToSignInButton: string;
    
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    newPasswordPlaceholder: string;
    updatePasswordButton: string;
    updatingPassword: string;
    backToSignInLink: string;
    passwordUpdatedTitle: string;
    passwordUpdatedSubtitle: string;
    invalidOrExpiredTitle: string;
    invalidOrExpiredSubtitle: string;
    requestNewLinkButton: string;
    
    strengthLabel: string;
    strengthWeak: string;
    strengthGood: string;
    strengthStrong: string;
    
    twoStepTitle: string;
    twoStepSubtitle: string;
    tabAuthApp: string;
    tabSms: string;
    tabWhatsApp: string;
    tabTelegram: string;
    tabEmail: string;
    instructAuthApp: string;
    instructSms: string;
    instructWhatsApp: string;
    instructTelegram: string;
    instructEmail: string;
    verifyAndContinueButton: string;
    verifying: string;
    didntReceiveCode: string;
    resendCode: string;
    resendIn: string;
    resending: string;
    backToLogin: string;
    
    sessionLockedTitle: string;
    sessionLockedSubtitle: string;
    unlockSessionButton: string;
    unlocking: string;
    notYourAccountPrompt: string;
    signOutButton: string;
  };
  
  validation: {
    emailOrUsernameRequired: string;
    emailRequired: string;
    invalidEmail: string;
    nameRequired: string;
    passwordRequired: string;
    passwordMinLength: string;
    confirmPasswordRequired: string;
    passwordsMismatch: string;
    pinRequired: string;
    pinLength: string;
    securityCheckRequired: string;
    securityCheckExpired: string;
  };
  
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    dismiss: string;
    searchPlaceholder: string;
    getMobileApp: string;
    googlePlay: string;
    appStore: string;
    microsoftStore: string;
    languageChangedToast: string;
  };
  
  email: {
    passwordResetSubject: string;
    passwordResetHeading: string;
    passwordResetBody: string;
    passwordResetButton: string;
    passwordResetDisclaimer: string;
    welcomeSubject: string;
    welcomeHeading: string;
    welcomeBody: string;
    otpSubject: string;
    otpBody: string;
    securityAlertSubject: string;
    securityAlertBody: string;
  };
}
