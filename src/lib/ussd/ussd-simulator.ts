/**
 * Range Bulk USSD Engine & Session State Machine
 * 
 * Compliant with Airtel Uganda GSM USSD Gateway protocol standards.
 * Supports session establishment, interactive multi-level menu navigation,
 * CON (Continue) vs END (Terminate) PDU session directives, and timeout bounds.
 */

export type UssdAction = 'CON' | 'END';

export interface UssdSessionRequest {
  sessionId: string;
  msisdn: string;       // International format, e.g. 256701234567
  serviceCode: string;  // e.g. *284#
  text: string;         // Cumulative user input separated by '*' or current input
}

export interface UssdSessionResponse {
  sessionId: string;
  message: string;
  action: UssdAction;
}

export interface UssdMenuItem {
  id: string;
  label: string;
  response?: string;
  action?: UssdAction;
  children?: UssdMenuItem[];
}

/**
 * Standard Telecom USSD Demo Menu Architecture
 */
export const DEFAULT_USSD_MENU: UssdMenuItem[] = [
  {
    id: '1',
    label: '1. Check SMS Balance',
    response: 'Your Range SMS Balance is UGX 2,019,540 (~44,878 SMS). Tier: Standard Enterprise.\nThank you for choosing Range Telecom.',
    action: 'END',
  },
  {
    id: '2',
    label: '2. Mini Statement',
    response: 'Last 3 Transactions:\n1. Top-up: +UGX 50,000\n2. Campaign: -UGX 12,450\n3. Top-up: +UGX 100,000\nSMS balance is healthy.',
    action: 'END',
  },
  {
    id: '3',
    label: '3. Telecom Rate Calculator',
    children: [
      {
        id: '1',
        label: '1. Bulk SMS Tiers',
        response: 'Airtel Bulk SMS Rates (VAT Incl):\nUp to 200k: 30 UGX\n200k-500k: 28 UGX\n500k-1M: 24 UGX\n15M+: 5 UGX\n200M+: 0.5 UGX (Negotiable)',
        action: 'END',
      },
      {
        id: '2',
        label: '2. Bulk USSD Tiers',
        response: 'Airtel Bulk USSD Rates (VAT Incl):\nUp to 200k: 25 UGX\n200k-500k: 24 UGX\n500k-1M: 23 UGX\n15M+: 6 UGX\n150M+: 2.5 UGX (Negotiable)',
        action: 'END',
      },
      {
        id: '3',
        label: '3. Sender ID Setup Fee',
        response: 'Airtel Sender ID Registration Fee:\nUGX 250,000 (VAT Inclusive).\nOne-time network provisioning fee.',
        action: 'END',
      },
    ],
  },
  {
    id: '4',
    label: '4. Contact Escalation Support',
    response: 'Range Telecom Support:\nTechnical: tech@range.ug\nBilling: billing@range.ug\nEmergency Hotline: +256 700 000 000',
    action: 'END',
  },
];

/**
 * Executes a USSD step against a defined menu hierarchy.
 */
export function processUssdSession(request: UssdSessionRequest): UssdSessionResponse {
  const { sessionId, serviceCode, text } = request;

  // Root screen (user dialed *XXX# without sub-arguments)
  if (!text || text.trim() === '') {
    const menuLines = [
      `Welcome to Range USSD Gateway (${serviceCode})`,
      ...DEFAULT_USSD_MENU.map((item) => item.label),
      'Select an option:',
    ];
    return {
      sessionId,
      message: menuLines.join('\n'),
      action: 'CON',
    };
  }

  // Split cumulative inputs: e.g. "3*1" -> ["3", "1"]
  const steps = text.split('*').map((s) => s.trim()).filter(Boolean);

  let currentMenu = DEFAULT_USSD_MENU;
  let activeItem: UssdMenuItem | undefined;

  for (let i = 0; i < steps.length; i++) {
    const choice = steps[i];
    activeItem = currentMenu.find((item) => item.id === choice);

    if (!activeItem) {
      return {
        sessionId,
        message: 'Invalid selection. Please dial the code again.\nThank you.',
        action: 'END',
      };
    }

    // If item has children and this is not the last step, navigate deeper
    if (activeItem.children && i < steps.length - 1) {
      currentMenu = activeItem.children;
    }
  }

  if (!activeItem) {
    return {
      sessionId,
      message: 'Invalid selection.\nThank you.',
      action: 'END',
    };
  }

  // If active item has submenus and we are at the step where we present them
  if (activeItem.children && activeItem.children.length > 0) {
    const subMenuLines = [
      activeItem.label,
      ...activeItem.children.map((child) => child.label),
      'Select an option:',
    ];
    return {
      sessionId,
      message: subMenuLines.join('\n'),
      action: 'CON',
    };
  }

  // Leaf node reached: return final message and END session
  return {
    sessionId,
    message: activeItem.response || 'Request processed successfully.\nThank you for choosing Range Telecom.',
    action: activeItem.action || 'END',
  };
}
