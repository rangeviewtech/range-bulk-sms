/**
 * Verified Mobile Network Operator (MNO) Carrier Allocations
 * 
 * Sources:
 * - Uganda Communications Commission (UCC) National Numbering Plan & ITU-T OB 1304 (2024-11)
 *   and UCC Q1 2025 Market Report (0790 grant effective 2025-03-12).
 * - Nigerian Communications Commission (NCC) National Numbering Plan (snapshot May 2025).
 * - Tanzania Communications Regulatory Authority (TCRA) & ITU-T OB 1304.
 * 
 * IMPORTANT TELECOM NOTICE:
 * This represents the ORIGINAL NUMBER-BLOCK ASSIGNEE at the time of regulatory grant.
 * Due to Mobile Number Portability (MNP), the current serving network may differ from
 * the original allocation holder. This mapping does not guarantee active subscriber status,
 * identity, location, or mobile-money enrollment.
 */

export type AllocationStatus = 
  | 'original_allocation_identified'
  | 'valid_carrier_unknown'
  | 'original_allocation_conflict'
  | 'unsupported_numbering_region';

export interface CarrierAllocation {
  operator: string;
  retailBrand: string;
  kind: 'original_number_block_allocation';
  source: string;
  asOf: string;
  as_of: string;
  verified: 'historical_snapshot' | 'regulator_primary';
  notes?: string;
}

export interface AllocationMatchResult {
  status: AllocationStatus;
  allocation: CarrierAllocation | null;
  caveat: string;
}

const CAVEAT_ORIGINAL = 'Originally allocated network (may differ from current network)';

// ==========================================
// 1. UGANDA (UG, +256) UCC REGULATOR OVERLAY
// ==========================================
// All patterns match the 9-digit NSN (excluding domestic trunk 0 and country code +256)
interface PrefixRule {
  prefix: string; // Exact prefix match or regex
  operator: string;
  retailBrand: string;
  source: string;
  asOf: string;
  notes?: string;
}

const UG_RULES: PrefixRule[] = [
  // Airtel Uganda: 700-709, 740-746, 750-759
  { prefix: '70', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '740', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '741', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '742', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '743', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '744', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '745', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '746', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '75', operator: 'Airtel Uganda', retailBrand: 'Airtel', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },

  // Uganda Telecommunications Corporation / UTCL (formerly UTL): 710-719
  { prefix: '71', operator: 'Uganda Telecommunications Corporation (UTCL)', retailBrand: 'UTCL', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01', notes: 'Historic UTL lineage' },

  // Narrow grants under 72x
  { prefix: '7240', operator: 'Hamilton Telecom', retailBrand: 'Hamilton', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01', notes: 'Narrow 7240 grant' },
  { prefix: '726', operator: 'Tangerine / Lycamobile', retailBrand: 'Lycamobile', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '727', operator: 'Tangerine / Lycamobile', retailBrand: 'Lycamobile', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '7280', operator: 'Talkio Telecom', retailBrand: 'Talkio', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01', notes: 'Narrow 7280 grant' },

  // MTN Uganda: 760-768, 770-779, 780-789, 790, and 39 (fixed-wireless/CDMA)
  { prefix: '39', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01', notes: 'MTN fixed-wireless / CDMA block' },
  { prefix: '760', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '761', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '762', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '763', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '764', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '765', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '766', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '767', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '768', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '77', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '78', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '790', operator: 'MTN Uganda', retailBrand: 'MTN', source: 'UCC Q1 2025 Market Report', asOf: '2025-03-12', notes: '0790 grant effective 2025-03-12' },
];

// Explicit unallocated prefixes in Uganda overlay (to guard against accidental broad matching)
const UG_EXPLICIT_UNALLOCATED = ['791', '747', '748', '749', '769'];

// ==========================================
// 2. NIGERIA (NG, +234) NCC REGULATOR OVERLAY
// ==========================================
const NG_RULES: PrefixRule[] = [
  // MTN Nigeria
  { prefix: '703', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '704', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '706', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '707', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '7025', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06', notes: 'Narrow 7025 grant (ex-Visafone)' },
  { prefix: '803', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '806', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '810', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '813', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '814', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '816', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '903', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '906', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '913', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '916', operator: 'MTN Nigeria', retailBrand: 'MTN', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },

  // Airtel Nigeria
  { prefix: '701', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '708', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '802', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '808', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '812', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '901', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '902', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '904', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '907', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '911', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '912', operator: 'Airtel Nigeria', retailBrand: 'Airtel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },

  // Globacom (Glo)
  { prefix: '705', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '805', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '807', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '811', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '815', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '905', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '915', operator: 'Globacom', retailBrand: 'Glo', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },

  // 9mobile (EMTS)
  { prefix: '809', operator: '9mobile (Emerging Markets Telecommunication Services - EMTS)', retailBrand: '9mobile', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '817', operator: '9mobile (Emerging Markets Telecommunication Services - EMTS)', retailBrand: '9mobile', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '818', operator: '9mobile (Emerging Markets Telecommunication Services - EMTS)', retailBrand: '9mobile', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '908', operator: '9mobile (Emerging Markets Telecommunication Services - EMTS)', retailBrand: '9mobile', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
  { prefix: '909', operator: '9mobile (Emerging Markets Telecommunication Services - EMTS)', retailBrand: '9mobile', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },

  // nTel
  { prefix: '804', operator: 'NatCom Development (nTel)', retailBrand: 'nTel', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },

  // Openskys
  { prefix: '7023', operator: 'Openskys', retailBrand: 'Openskys', source: 'NCC National Numbering Plan', asOf: '2025-05-06' },
];

// ==========================================
// 3. TANZANIA (TZ, +255) TCRA OVERLAY
// ==========================================
const TZ_RULES: PrefixRule[] = [
  // Vodacom Tanzania
  { prefix: '66', operator: 'Vodacom Tanzania', retailBrand: 'Vodacom', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '74', operator: 'Vodacom Tanzania', retailBrand: 'Vodacom', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '75', operator: 'Vodacom Tanzania', retailBrand: 'Vodacom', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '76', operator: 'Vodacom Tanzania', retailBrand: 'Vodacom', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },

  // Airtel Tanzania
  { prefix: '68', operator: 'Airtel Tanzania', retailBrand: 'Airtel', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '69', operator: 'Airtel Tanzania', retailBrand: 'Airtel', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '78', operator: 'Airtel Tanzania', retailBrand: 'Airtel', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },

  // Tigo / Honora
  { prefix: '65', operator: 'Honora Tanzania', retailBrand: 'Tigo', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '67', operator: 'Honora Tanzania', retailBrand: 'Tigo', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '71', operator: 'Honora Tanzania', retailBrand: 'Tigo', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '77', operator: 'Honora Tanzania', retailBrand: 'Tigo', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },

  // Halotel / Viettel
  { prefix: '61', operator: 'Viettel Tanzania', retailBrand: 'Halotel', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '62', operator: 'Viettel Tanzania', retailBrand: 'Halotel', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },

  // TTCL
  { prefix: '73', operator: 'Tanzania Telecommunications Corporation', retailBrand: 'TTCL', source: 'TCRA / ITU-T OB 1304', asOf: '2024-11-01' },
];

// ==========================================
// 4. KENYA (KE, +254) CAK REGULATOR OVERLAY
// ==========================================
const KE_RULES: PrefixRule[] = [
  // Safaricom PLC
  { prefix: '70', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '71', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '72', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '79', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '740', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '741', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '742', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '743', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '745', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '746', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '748', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '757', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '758', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '759', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '768', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '769', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '110', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '111', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '112', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '113', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '114', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '115', operator: 'Safaricom PLC', retailBrand: 'Safaricom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },

  // Airtel Kenya
  { prefix: '73', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '750', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '751', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '752', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '753', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '754', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '755', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '756', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '78', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '100', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '101', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '102', operator: 'Airtel Kenya Networks', retailBrand: 'Airtel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },

  // Telkom Kenya
  { prefix: '77', operator: 'Telkom Kenya', retailBrand: 'Telkom', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },

  // Equitel / Finserve
  { prefix: '763', operator: 'Finserve Africa (Equitel)', retailBrand: 'Equitel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '764', operator: 'Finserve Africa (Equitel)', retailBrand: 'Equitel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '765', operator: 'Finserve Africa (Equitel)', retailBrand: 'Equitel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '766', operator: 'Finserve Africa (Equitel)', retailBrand: 'Equitel', source: 'CAK / ITU-T OB 1304', asOf: '2024-11-01' },
];

// ==========================================
// 5. RWANDA (RW, +250) RURA OVERLAY
// ==========================================
const RW_RULES: PrefixRule[] = [
  // MTN Rwanda
  { prefix: '78', operator: 'MTN Rwandacell', retailBrand: 'MTN', source: 'RURA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '79', operator: 'MTN Rwandacell', retailBrand: 'MTN', source: 'RURA / ITU-T OB 1304', asOf: '2024-11-01' },

  // Airtel Rwanda
  { prefix: '72', operator: 'Airtel Rwanda', retailBrand: 'Airtel', source: 'RURA / ITU-T OB 1304', asOf: '2024-11-01' },
  { prefix: '73', operator: 'Airtel Rwanda', retailBrand: 'Airtel', source: 'RURA / ITU-T OB 1304', asOf: '2024-11-01' },
];

/**
 * Finds the best match using longest prefix matching against a rule set.
 */
function findLongestPrefixMatch(nsn: string, rules: PrefixRule[]): PrefixRule | null {
  // Sort rules descending by prefix length (longest match first)
  const sorted = [...rules].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const rule of sorted) {
    if (nsn.startsWith(rule.prefix)) {
      return rule;
    }
  }
  return null;
}

/**
 * Resolves the original carrier allocation for a given region and NSN (National Significant Number).
 */
export function resolveOriginalCarrierAllocation(
  alpha2: string,
  nsnDigits: string
): AllocationMatchResult {
  const code = alpha2.toUpperCase();

  // 1. Uganda (UG)
  if (code === 'UG') {
    // Check if explicitly unallocated
    for (const unalloc of UG_EXPLICIT_UNALLOCATED) {
      if (nsnDigits.startsWith(unalloc)) {
        return {
          status: 'valid_carrier_unknown',
          allocation: null,
          caveat: 'Prefix is unallocated in the dated UCC numbering overlay.',
        };
      }
    }

    const matched = findLongestPrefixMatch(nsnDigits, UG_RULES);
    if (matched) {
      return {
        status: 'original_allocation_identified',
        allocation: {
          operator: matched.operator,
          retailBrand: matched.retailBrand,
          kind: 'original_number_block_allocation',
          source: matched.source,
          asOf: matched.asOf,
          as_of: matched.asOf,
          verified: 'regulator_primary',
          notes: matched.notes,
        },
        caveat: CAVEAT_ORIGINAL,
      };
    }

    return {
      status: 'valid_carrier_unknown',
      allocation: null,
      caveat: 'Carrier prefix not identified in UCC regulatory allocation database.',
    };
  }

  // 2. Nigeria (NG)
  if (code === 'NG') {
    const matched = findLongestPrefixMatch(nsnDigits, NG_RULES);
    if (matched) {
      return {
        status: 'original_allocation_identified',
        allocation: {
          operator: matched.operator,
          retailBrand: matched.retailBrand,
          kind: 'original_number_block_allocation',
          source: matched.source,
          asOf: matched.asOf,
          as_of: matched.asOf,
          verified: 'regulator_primary',
          notes: matched.notes,
        },
        caveat: CAVEAT_ORIGINAL,
      };
    }

    return {
      status: 'valid_carrier_unknown',
      allocation: null,
      caveat: 'Carrier prefix not identified in NCC numbering plan.',
    };
  }

  // 3. Tanzania (TZ)
  if (code === 'TZ') {
    const matched = findLongestPrefixMatch(nsnDigits, TZ_RULES);
    if (matched) {
      return {
        status: 'original_allocation_identified',
        allocation: {
          operator: matched.operator,
          retailBrand: matched.retailBrand,
          kind: 'original_number_block_allocation',
          source: matched.source,
          asOf: matched.asOf,
          as_of: matched.asOf,
          verified: 'regulator_primary',
        },
        caveat: CAVEAT_ORIGINAL,
      };
    }

    return {
      status: 'valid_carrier_unknown',
      allocation: null,
      caveat: 'Carrier prefix not identified in TCRA allocation guide.',
    };
  }

  // 4. Kenya (KE)
  if (code === 'KE') {
    const matched = findLongestPrefixMatch(nsnDigits, KE_RULES);
    if (matched) {
      return {
        status: 'original_allocation_identified',
        allocation: {
          operator: matched.operator,
          retailBrand: matched.retailBrand,
          kind: 'original_number_block_allocation',
          source: matched.source,
          asOf: matched.asOf,
          as_of: matched.asOf,
          verified: 'regulator_primary',
          notes: matched.notes,
        },
        caveat: CAVEAT_ORIGINAL,
      };
    }

    return {
      status: 'valid_carrier_unknown',
      allocation: null,
      caveat: 'Carrier prefix not identified in CAK numbering plan.',
    };
  }

  // 5. Rwanda (RW)
  if (code === 'RW') {
    const matched = findLongestPrefixMatch(nsnDigits, RW_RULES);
    if (matched) {
      return {
        status: 'original_allocation_identified',
        allocation: {
          operator: matched.operator,
          retailBrand: matched.retailBrand,
          kind: 'original_number_block_allocation',
          source: matched.source,
          asOf: matched.asOf,
          as_of: matched.asOf,
          verified: 'regulator_primary',
          notes: matched.notes,
        },
        caveat: CAVEAT_ORIGINAL,
      };
    }

    return {
      status: 'valid_carrier_unknown',
      allocation: null,
      caveat: 'Carrier prefix not identified in RURA numbering plan.',
    };
  }

  // 6. Other regions
  return {
    status: 'valid_carrier_unknown',
    allocation: null,
    caveat: `Original carrier allocation overlay not configured for region ${code}.`,
  };
}

/**
 * Returns all operator allocations for a given region (used by operator catalog API).
 */
export function getRegionOperatorCatalog(alpha2: string): PrefixRule[] {
  const code = alpha2.toUpperCase();
  if (code === 'UG') return UG_RULES;
  if (code === 'NG') return NG_RULES;
  if (code === 'TZ') return TZ_RULES;
  if (code === 'KE') return KE_RULES;
  if (code === 'RW') return RW_RULES;
  return [];
}
