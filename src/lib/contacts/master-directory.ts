/**
 * Master Contact Directory Store
 *
 * Provides a unified, deterministic subscriber database matching the exact audiences
 * of the contact groups:
 * - "Kampala Retail Leads" (3,890 contacts)
 * - "VIP Customers" (1,245 contacts)
 * - "School Fee Reminders" (560 contacts)
 * Total: 5,695 contacts across East Africa and international destinations.
 */

export interface GroupItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
  contactCount?: number;
  memberCount?: number;
}

export interface MasterContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  email: string | null;
  status: 'ACTIVE' | 'OPTED_OUT';
  addedAt: string;
  createdAt: string;
  groupId: string;
  groupName: string;
  groups: { id: string; name: string }[];
}

export const MASTER_GROUPS: GroupItem[] = [
  {
    id: 'grp_1',
    name: 'VIP Customers',
    description: 'High volume enterprise clients and corporate accounts.',
    color: '#04648C',
    createdAt: '2026-09-10',
    contactCount: 1245,
  },
  {
    id: 'grp_2',
    name: 'Kampala Retail Leads',
    description: 'Prospective business leads from retail activations.',
    color: '#FBCA07',
    createdAt: '2026-09-12',
    contactCount: 3890,
  },
  {
    id: 'grp_3',
    name: 'School Fee Reminders',
    description: 'Parents and guardians enrolled for term notifications.',
    color: '#10B981',
    createdAt: '2026-09-15',
    contactCount: 560,
  },
];

const SAMPLE_MEMBERS_MAP: Record<string, Array<{ id: string; name: string; firstName: string; lastName: string; phone: string; email: string | null; status: 'ACTIVE' | 'OPTED_OUT'; addedAt: string }>> = {
  grp_1: [
    { id: 'c_1', name: 'Dr. Arthur Sserwadda', firstName: 'Arthur', lastName: 'Sserwadda', phone: '+256702950322', email: 'arthur.s@crestfoam.co.ug', status: 'ACTIVE', addedAt: '2026-09-10' },
    { id: 'c_2', name: 'Claire Nabirye', firstName: 'Claire', lastName: 'Nabirye', phone: '+256772123456', email: 'claire@stanbicbank.co.ug', status: 'ACTIVE', addedAt: '2026-09-11' },
    { id: 'c_3', name: 'Amina Mwangi', firstName: 'Amina', lastName: 'Mwangi', phone: '+254712345678', email: 'amina.m@safaricom.co.ke', status: 'ACTIVE', addedAt: '2026-09-11' },
    { id: 'c_4', name: 'Ronald Mukasa', firstName: 'Ronald', lastName: 'Mukasa', phone: '+256782998877', email: 'ronald.m@totalenergies.ug', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_5', name: 'Oliver Smith', firstName: 'Oliver', lastName: 'Smith', phone: '+447911123456', email: 'oliver.smith@rangeview.co.uk', status: 'ACTIVE', addedAt: '2026-09-13' },
  ],
  grp_2: [
    { id: 'c_6', name: 'Agnes Mukasa', firstName: 'Agnes', lastName: 'Mukasa', phone: '+256703100592', email: 'agnes.mukasa@outlook.com', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_7', name: 'Daniel Kiconco', firstName: 'Daniel', lastName: 'Kiconco', phone: '+256704100629', email: 'daniel.kiconco@rangeview.co.ug', status: 'ACTIVE', addedAt: '2026-09-12' },
    { id: 'c_8', name: 'Julian Byaruhanga', firstName: 'Julian', lastName: 'Byaruhanga', phone: '+256752100666', email: 'julian.byaruhanga@umeme.co.ug', status: 'ACTIVE', addedAt: '2026-09-13' },
    { id: 'c_9', name: 'Mercy Alinda', firstName: 'Mercy', lastName: 'Alinda', phone: '+256774100703', email: 'mercy.alinda@crestfoam.co.ug', status: 'ACTIVE', addedAt: '2026-09-13' },
    { id: 'c_10', name: 'Charles Kato', firstName: 'Charles', lastName: 'Kato', phone: '+256703100740', email: 'charles.kato@gmail.com', status: 'ACTIVE', addedAt: '2026-09-14' },
    { id: 'c_11', name: 'Amina Kariuki', firstName: 'Amina', lastName: 'Kariuki', phone: '+254722334455', email: 'akariuki@safaricom.co.ke', status: 'ACTIVE', addedAt: '2026-09-14' },
    { id: 'c_12', name: 'Juma Hassan', firstName: 'Juma', lastName: 'Hassan', phone: '+255754123456', email: 'jhassan@vodacom.co.tz', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_13', name: 'Jean-Paul Habimana', firstName: 'Jean-Paul', lastName: 'Habimana', phone: '+250788123456', email: 'habimana.jp@bk.rw', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_14', name: 'Oliver Smith', firstName: 'Oliver', lastName: 'Smith', phone: '+447911123456', email: 'oliver.smith@rangeview.co.uk', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_15', name: 'Michael Chen', firstName: 'Michael', lastName: 'Chen', phone: '+14155552671', email: 'mchen@techcorp.io', status: 'ACTIVE', addedAt: '2026-09-16' },
  ],
  grp_3: [
    { id: 'c_15_rem', name: 'Margaret Akello', firstName: 'Margaret', lastName: 'Akello', phone: '+256702667788', email: 'akello.m@gmail.com', status: 'ACTIVE', addedAt: '2026-09-15' },
    { id: 'c_16', name: 'Patrick Tumwine', firstName: 'Patrick', lastName: 'Tumwine', phone: '+256773889900', email: 'tumwine.p@outlook.com', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_17', name: 'Grace Wanjiku', firstName: 'Grace', lastName: 'Wanjiku', phone: '+254733445566', email: 'gwanjiku@gmail.com', status: 'ACTIVE', addedAt: '2026-09-16' },
    { id: 'c_18', name: 'Beatrice Nakato', firstName: 'Beatrice', lastName: 'Nakato', phone: '+256751224466', email: 'bnakato@gmail.com', status: 'ACTIVE', addedAt: '2026-09-17' },
  ],
};

const REGIONAL_CONFIGS = [
  {
    country: 'UG',
    countryName: 'Uganda',
    dialCode: '+256',
    prefixes: ['703', '704', '752', '774', '782', '701'],
    digitsCount: 6,
    firstNames: [
      'Dennis', 'Sandra', 'Moses', 'Julian', 'Arthur', 'Claire', 'Ronald', 'Grace',
      'David', 'Brian', 'Fiona', 'Joseph', 'Patricia', 'Emmanuel', 'Mercy', 'Ivan',
      'Sarah', 'Kevin', 'Brenda', 'Timothy', 'Agnes', 'Samuel', 'Gloria', 'Joshua',
      'Rebecca', 'Charles', 'Diana', 'Derrick', 'Christine', 'Robert', 'Esther',
      'Daniel', 'Faith', 'Paul', 'Peace', 'Gerald', 'Harriet', 'Stephen', 'Dorothy',
    ],
    lastNames: [
      'Katende', 'Nalubega', 'Byaruhanga', 'Kyomugisha', 'Sserwadda', 'Nabirye', 'Mukasa',
      'Kemigisa', 'Ochieng', 'Kigozi', 'Namutebi', 'Kasule', 'Akello', 'Tumwine', 'Nakato',
      'Ssemwogerere', 'Mugisha', 'Nanyanzi', 'Lubega', 'Alinda', 'Okello', 'Asiimwe',
      'Birungi', 'Kiconco', 'Nsubuga', 'Opio', 'Atuhaire', 'Babirye', 'Musoke', 'Ntale',
      'Kintu', 'Kiwanuka', 'Namaganda', 'Muwonge', 'Lwanga', 'Wasswa', 'Kato', 'Kibuuka',
    ],
    domains: [
      'gmail.com', 'yahoo.com', 'outlook.com', 'crestfoam.co.ug', 'stanbicbank.co.ug',
      'totalenergies.ug', 'umeme.co.ug', 'rangeview.co.ug',
    ],
  },
  {
    country: 'KE',
    countryName: 'Kenya',
    dialCode: '+254',
    prefixes: ['712', '722', '733', '790'],
    digitsCount: 6,
    firstNames: ['Amina', 'Brian', 'Fatuma', 'Hassan', 'Juma', 'Kariuki', 'Mwangi', 'Njeri', 'Wanjiku', 'Faith', 'Kevin'],
    lastNames: ['Mwangi', 'Kariuki', 'Odinga', 'Kamau', 'Otieno', 'Waweru', 'Kipchoge', 'Njoroge', 'Wambui'],
    domains: ['safaricom.co.ke', 'equitybank.co.ke', 'gmail.com', 'yahoo.com'],
  },
  {
    country: 'TZ',
    countryName: 'Tanzania',
    dialCode: '+255',
    prefixes: ['754', '784', '713', '767'],
    digitsCount: 6,
    firstNames: ['Baraka', 'Juma', 'Kassim', 'Aisha', 'Zainab', 'Rashid', 'Salim', 'Neema'],
    lastNames: ['Mollel', 'Mrema', 'Hassan', 'Makamba', 'Nyerere', 'Massawe', 'Shirima'],
    domains: ['vodacom.co.tz', 'crdbbank.co.tz', 'gmail.com'],
  },
  {
    country: 'RW',
    countryName: 'Rwanda',
    dialCode: '+250',
    prefixes: ['788', '781', '722'],
    digitsCount: 6,
    firstNames: ['Jean-Paul', 'Mutesi', 'Gatete', 'Diane', 'Patrick', 'Alain', 'Clarisse'],
    lastNames: ['Habimana', 'Murenzi', 'Kagabo', 'Bizimana', 'Uwase', 'Nkurunziza'],
    domains: ['bk.rw', 'mtn.co.rw', 'gmail.com'],
  },
  {
    country: 'GB',
    countryName: 'United Kingdom',
    dialCode: '+44',
    prefixes: ['7911', '7400', '7700'],
    digitsCount: 6,
    firstNames: ['Oliver', 'Emma', 'James', 'Sophie', 'George', 'Charlotte', 'Harry'],
    lastNames: ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans'],
    domains: ['rangeview.co.uk', 'gmail.com', 'outlook.com', 'bbc.co.uk'],
  },
  {
    country: 'US',
    countryName: 'United States',
    dialCode: '+1',
    prefixes: ['415555', '212555', '312555', '650555'],
    digitsCount: 4,
    firstNames: ['Michael', 'Emily', 'Alex', 'Liam', 'Jessica', 'David', 'Sarah'],
    lastNames: ['Johnson', 'Williams', 'Chen', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
    domains: ['techcorp.io', 'gmail.com', 'globalretail.com'],
  },
];

function generateDeterministicGroupContacts(group: GroupItem): MasterContact[] {
  const targetCount = group.contactCount ?? (
    group.id === 'grp_1' ? 1245 : group.id === 'grp_2' ? 3890 : group.id === 'grp_3' ? 560 : 100
  );

  const initialList = SAMPLE_MEMBERS_MAP[group.id] || [];
  const result: MasterContact[] = initialList.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    name: m.name,
    phone: m.phone,
    normalizedPhone: m.phone,
    email: m.email,
    status: m.status,
    addedAt: m.addedAt,
    createdAt: `${m.addedAt}T08:00:00.000Z`,
    groupId: group.id,
    groupName: group.name,
    groups: [{ id: group.id, name: group.name }],
  }));

  if (result.length >= targetCount) {
    return result;
  }

  const baseYear = 2026;
  const startId = result.length + 1;

  for (let i = startId; i <= targetCount; i++) {
    // Unique seed per group so phone numbers across groups are distinct
    // while keeping grp_2 identical to existing Kampala Retail Leads screenshot
    const seed = group.id === 'grp_1' ? i + 4000 : group.id === 'grp_3' ? i + 6000 : i;

    let configIndex = 0;
    const mod10 = seed % 10;
    const mod20 = seed % 20;

    if (mod10 === 7) {
      configIndex = 1; // KE
    } else if (mod20 === 8) {
      configIndex = 2; // TZ
    } else if (mod20 === 18) {
      configIndex = 3; // RW
    } else if (mod20 === 9) {
      configIndex = 4; // GB
    } else if (mod20 === 19) {
      configIndex = 5; // US
    }

    const cfg = REGIONAL_CONFIGS[configIndex];
    const fn = cfg.firstNames[(seed * 11) % cfg.firstNames.length];
    const ln = cfg.lastNames[(seed * 17) % cfg.lastNames.length];
    const prefix = cfg.prefixes[seed % cfg.prefixes.length];
    const suffixBase = cfg.digitsCount === 4 ? 1000 : 100000;
    const suffixMod = cfg.digitsCount === 4 ? 9000 : 900000;
    const phoneSuffix = (suffixBase + ((seed * 37) % suffixMod)).toString();
    const domain = cfg.domains[(seed * 7) % cfg.domains.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${seed > 100 ? seed % 99 : ''}@${domain}`;

    const day = (i % 28) + 1;
    const month = i % 2 === 0 ? '09' : '08';
    const addedAt = `${baseYear}-${month}-${day < 10 ? '0' + day : day}`;
    const phone = `${cfg.dialCode}${prefix}${phoneSuffix}`;

    result.push({
      id: `c_${group.id}_${i}`,
      firstName: fn,
      lastName: ln,
      name: `${fn} ${ln}`,
      phone,
      normalizedPhone: phone,
      email: i % 15 === 0 ? null : email,
      status: i % 50 === 0 ? 'OPTED_OUT' : 'ACTIVE',
      addedAt,
      createdAt: `${addedAt}T10:00:00.000Z`,
      groupId: group.id,
      groupName: group.name,
      groups: [{ id: group.id, name: group.name }],
    });
  }

  return result;
}

let cachedMasterContacts: MasterContact[] | null = null;
let cachedGroupMembers: Map<string, MasterContact[]> | null = null;

/**
 * Returns the complete master contact directory (5,695 contacts)
 */
export function getMasterContacts(): MasterContact[] {
  if (cachedMasterContacts) {
    return cachedMasterContacts;
  }

  const all: MasterContact[] = [];
  const groupMap = new Map<string, MasterContact[]>();

  for (const group of MASTER_GROUPS) {
    const members = generateDeterministicGroupContacts(group);
    groupMap.set(group.id, members);
    groupMap.set(group.name.toLowerCase(), members);
    all.push(...members);
  }

  cachedGroupMembers = groupMap;
  cachedMasterContacts = all;
  return all;
}

let cachedPhoneMatches: Map<string, MasterContact[]> | null = null;

/**
 * Returns a pre-indexed map of phone -> MasterContact[] for O(1) contact enrichment,
 * preventing expensive loop iterations on every request.
 */
export function getMasterPhoneMatches(): Map<string, MasterContact[]> {
  if (cachedPhoneMatches) {
    return cachedPhoneMatches;
  }

  const contacts = getMasterContacts();
  const map = new Map<string, MasterContact[]>();
  for (const mc of contacts) {
    const list = map.get(mc.phone) || [];
    list.push(mc);
    map.set(mc.phone, list);
  }

  cachedPhoneMatches = map;
  return map;
}

/**
 * Returns contacts belonging to a specific group by ID or name
 */
export function getMasterGroupMembers(groupIdOrName: string): MasterContact[] {
  if (!cachedGroupMembers) {
    getMasterContacts();
  }
  return cachedGroupMembers?.get(groupIdOrName) || cachedGroupMembers?.get(groupIdOrName.toLowerCase()) || [];
}

/**
 * Returns all master groups with their audience counts
 */
export function getMasterGroups(): GroupItem[] {
  return MASTER_GROUPS;
}

