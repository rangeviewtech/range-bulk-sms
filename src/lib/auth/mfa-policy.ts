import { prisma } from '@/lib/prisma';

export type MfaEnforcementType = 'MANDATORY_ROLE' | 'USER_OPTED_IN' | 'NONE';

export type VerificationMethod = 'WEBAUTHN' | 'APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM';

export interface MfaRequirementResult {
  required: boolean;
  type: MfaEnforcementType;
  roles: string[];
  defaultMethod: VerificationMethod;
  allowedMethods: VerificationMethod[];
  maskedContact?: string;
  hasConfiguredTotp: boolean;
  hasConfiguredWebAuthn: boolean;
  canBypassWithRecognizedDevice: boolean; // ALWAYS FALSE for Admin/Agent
}

/**
 * Masks a contact identifier for security and privacy in the UI.
 * e.g. "john.doe@example.com" -> "j***e@example.com"
 * "+256701234567" -> "+256 •••• ••67"
 */
export function maskRecipient(identifier: string, method: VerificationMethod): string {
  if (method === 'APP') return 'Authenticator App (TOTP)';
  if (!identifier) return '';

  if (method === 'EMAIL') {
    const parts = identifier.split('@');
    if (parts.length !== 2) return '••••@••••';
    const [name, domain] = parts;
    const maskedName =
      name.length <= 2
        ? name[0] + '***'
        : name[0] + '***' + name[name.length - 1];
    return `${maskedName}@${domain}`;
  }

  if (method === 'SMS' || method === 'WHATSAPP') {
    if (identifier.length <= 4) return '••••';
    const lastFour = identifier.slice(-4);
    const prefix = identifier.startsWith('+') ? identifier.slice(0, 4) : '';
    return `${prefix} •••• ••${lastFour.slice(-2)}`;
  }

  if (method === 'TELEGRAM') {
    if (identifier.length <= 4) return 'Chat ID: ••••';
    return `Telegram (ID: •••${identifier.slice(-4)})`;
  }

  return 'Authenticator App (TOTP)';
}

/**
 * Centrally evaluates the effective MFA requirement for a user.
 *
 * Rules:
 * 1. ADMINISTRATOR: Mandatory MFA on EVERY new login. Recognized devices CANNOT bypass.
 * 2. AGENT: Mandatory MFA on EVERY new login. Recognized devices CANNOT bypass.
 * 3. CLIENT / USER: Optional MFA (enforced when user.mfaEnabled is true).
 *
 * If an Administrator or Agent has not enrolled in TOTP, falls back to verified Email OTP
 * (or SMS / WhatsApp / Telegram if configured), failing closed if no valid channels exist.
 */
export async function getEffectiveMfaRequirement(userId: string): Promise<MfaRequirementResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: { role: true },
      },
      authenticators: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const roleNames = user.roles.map((ur) => ur.role.name.toUpperCase());
  const isAdmin = roleNames.includes('ADMIN') || roleNames.includes('ADMINISTRATOR');
  const isAgent = roleNames.includes('AGENT');

  const hasConfiguredWebAuthn = (user.authenticators?.length ?? 0) > 0;
  const hasConfiguredTotp = Boolean(user.mfaSecret && user.mfaEnabled);

  // Determine allowed channels
  const allowedMethods: VerificationMethod[] = [];
  
  if (hasConfiguredWebAuthn) {
    allowedMethods.push('WEBAUTHN');
  }
  if (hasConfiguredTotp) {
    allowedMethods.push('APP');
  }
  
  // For privileged roles, we DO NOT allow Email or SMS as an MFA fallback, 
  // because the security blueprint explicitly demands phishing-resistant authenticators
  // or at least TOTP app for these roles. Email OTP is strictly a low-assurance mechanism.
  const isPrivileged = isAdmin || isAgent;

  if (!isPrivileged) {
    if (user.email) {
      allowedMethods.push('EMAIL');
    }
    if (user.phone) {
      allowedMethods.push('SMS');
    }
    if (user.phone && user.whatsappConsent) {
      allowedMethods.push('WHATSAPP');
    }
    if (user.telegramChatId) {
      allowedMethods.push('TELEGRAM');
    }
  }

  // Priority for default method:
  // 1. WEBAUTHN
  // 2. APP (TOTP)
  // 3. EMAIL (verified, reliable, universal)
  // 4. TELEGRAM
  // 5. WHATSAPP
  // 6. SMS
  let defaultMethod: VerificationMethod = 'EMAIL';
  if (hasConfiguredWebAuthn) {
    defaultMethod = 'WEBAUTHN';
  } else if (hasConfiguredTotp) {
    defaultMethod = 'APP';
  } else if (allowedMethods.includes('EMAIL')) {
    defaultMethod = 'EMAIL';
  } else if (allowedMethods.includes('TELEGRAM')) {
    defaultMethod = 'TELEGRAM';
  } else if (allowedMethods.includes('WHATSAPP')) {
    defaultMethod = 'WHATSAPP';
  } else if (allowedMethods.includes('SMS')) {
    defaultMethod = 'SMS';
  }

  let maskedContact: string | undefined;
  if (defaultMethod === 'EMAIL') {
    maskedContact = maskRecipient(user.email, 'EMAIL');
  } else if (defaultMethod === 'WHATSAPP' || defaultMethod === 'SMS') {
    maskedContact = user.phone ? maskRecipient(user.phone, defaultMethod) : undefined;
  } else if (defaultMethod === 'TELEGRAM') {
    maskedContact = user.telegramChatId
      ? maskRecipient(user.telegramChatId, 'TELEGRAM')
      : undefined;
  }

  if (isPrivileged) {
    // Fail closed if no verification method is available
    if (allowedMethods.length === 0) {
      throw new Error(
        'Mandatory MFA failure: Privileged account has no reachable verification channels.'
      );
    }

    return {
      required: true,
      type: 'MANDATORY_ROLE',
      roles: roleNames,
      defaultMethod,
      allowedMethods,
      maskedContact,
      hasConfiguredTotp,
      hasConfiguredWebAuthn,
      canBypassWithRecognizedDevice: false, // MANDATORY: Never bypass for Admin or Agent
    };
  }

  // Client or standard user
  if (user.mfaEnabled || hasConfiguredTotp || hasConfiguredWebAuthn) {
    return {
      required: true,
      type: 'USER_OPTED_IN',
      roles: roleNames,
      defaultMethod,
      allowedMethods,
      maskedContact,
      hasConfiguredTotp,
      hasConfiguredWebAuthn,
      canBypassWithRecognizedDevice: false,
    };
  }

  return {
    required: false,
    type: 'NONE',
    roles: roleNames,
    defaultMethod,
    allowedMethods,
    maskedContact,
    hasConfiguredTotp: false,
    hasConfiguredWebAuthn: false,
    canBypassWithRecognizedDevice: true,
  };
}
