/**
 * Global Telephone Numbering & Country Registry
 * 
 * Comprehensive dataset covering:
 * - 195 Sovereign Countries (193 UN member states + Holy See + State of Palestine)
 * - 50 Additional Supported Territories and Geographic Regions (245 supported total)
 * - 7 ISO 3166-1 entities without independent numbering plans (AQ, BV, GS, HM, PN, TF, UM)
 * 
 * ITU-T E.164 Dialing Prefixes, ISO-3166-1 alpha-2 / alpha-3 codes, sample fixtures,
 * and telecom-accurate regional validation rules.
 */

export interface RegionRecord {
  id: number;
  name: string;
  alpha2: string; // ISO 3166-1 alpha-2 or CLDR (e.g. "AF", "UG", "XK", "AC", "TA")
  alpha3: string; // ISO 3166-1 alpha-3, or empty string if not assigned
  dialCode: string; // Calling prefix, e.g. "+256", "+1", "+44"
  sampleE164: string; // Non-dialable official test fixture, e.g. "+256712345678"
  sampleNsnDigits: number; // National Significant Number digit count for fixture
  validationRule: string; // e.g. "V(UG)"
  notes?: string;
  isUnMember: boolean; // 193 UN members + Holy See + State of Palestine
  isTerritory: boolean;
  libphonenumberSupported: boolean;
  unsupportedReason?: string;
}

export const COUNTRY_REGISTRY: readonly RegionRecord[] = [
  {
    "id": 1,
    "name": "Afghanistan",
    "alpha2": "AF",
    "alpha3": "AFG",
    "dialCode": "+93",
    "sampleE164": "+93701234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(AF)",
    "notes": "Mobile example uses a 9-digit NSN; domestic leading 0 is not part of E.164.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 2,
    "name": "Albania",
    "alpha2": "AL",
    "alpha3": "ALB",
    "dialCode": "+355",
    "sampleE164": "+355672123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(AL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 3,
    "name": "Algeria",
    "alpha2": "DZ",
    "alpha3": "DZA",
    "dialCode": "+213",
    "sampleE164": "+213551234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(DZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 4,
    "name": "Andorra",
    "alpha2": "AD",
    "alpha3": "AND",
    "dialCode": "+376",
    "sampleE164": "+376312345",
    "sampleNsnDigits": 6,
    "validationRule": "V(AD)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 5,
    "name": "Angola",
    "alpha2": "AO",
    "alpha3": "AGO",
    "dialCode": "+244",
    "sampleE164": "+244923123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(AO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 6,
    "name": "Antigua and Barbuda",
    "alpha2": "AG",
    "alpha3": "ATG",
    "dialCode": "+1",
    "sampleE164": "+12684641234",
    "sampleNsnDigits": 10,
    "validationRule": "V(AG)",
    "notes": "+1 area code(s): 268.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 7,
    "name": "Argentina",
    "alpha2": "AR",
    "alpha3": "ARG",
    "dialCode": "+54",
    "sampleE164": "+5491123456789",
    "sampleNsnDigits": 11,
    "validationRule": "V(AR)",
    "notes": "Mobile E.164 includes international mobile token 9; national dialling may instead use 0 and 15. Do not strip or insert these manually.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 8,
    "name": "Armenia",
    "alpha2": "AM",
    "alpha3": "ARM",
    "dialCode": "+374",
    "sampleE164": "+37477123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(AM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 9,
    "name": "Australia",
    "alpha2": "AU",
    "alpha3": "AUS",
    "dialCode": "+61",
    "sampleE164": "+61412345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(AU)",
    "notes": "Australian mobile sample has 9 NSN digits (+61 4…). Domestic format usually begins 04; preserve metadata rules for other types.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 10,
    "name": "Austria",
    "alpha2": "AT",
    "alpha3": "AUT",
    "dialCode": "+43",
    "sampleE164": "+43664123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(AT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 11,
    "name": "Azerbaijan",
    "alpha2": "AZ",
    "alpha3": "AZE",
    "dialCode": "+994",
    "sampleE164": "+994401234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(AZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 12,
    "name": "Bahamas",
    "alpha2": "BS",
    "alpha3": "BHS",
    "dialCode": "+1",
    "sampleE164": "+12423591234",
    "sampleNsnDigits": 10,
    "validationRule": "V(BS)",
    "notes": "+1 area code(s): 242.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 13,
    "name": "Bahrain",
    "alpha2": "BH",
    "alpha3": "BHR",
    "dialCode": "+973",
    "sampleE164": "+97336001234",
    "sampleNsnDigits": 8,
    "validationRule": "V(BH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 14,
    "name": "Bangladesh",
    "alpha2": "BD",
    "alpha3": "BGD",
    "dialCode": "+880",
    "sampleE164": "+8801812345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(BD)",
    "notes": "Use current prefixes; the sample mobile NSN is 10 digits, not a universal rule for every service.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 15,
    "name": "Barbados",
    "alpha2": "BB",
    "alpha3": "BRB",
    "dialCode": "+1",
    "sampleE164": "+12462501234",
    "sampleNsnDigits": 10,
    "validationRule": "V(BB)",
    "notes": "+1 area code(s): 246.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 16,
    "name": "Belarus",
    "alpha2": "BY",
    "alpha3": "BLR",
    "dialCode": "+375",
    "sampleE164": "+375294911911",
    "sampleNsnDigits": 9,
    "validationRule": "V(BY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 17,
    "name": "Belgium",
    "alpha2": "BE",
    "alpha3": "BEL",
    "dialCode": "+32",
    "sampleE164": "+32450001234",
    "sampleNsnDigits": 9,
    "validationRule": "V(BE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 18,
    "name": "Belize",
    "alpha2": "BZ",
    "alpha3": "BLZ",
    "dialCode": "+501",
    "sampleE164": "+5016221234",
    "sampleNsnDigits": 7,
    "validationRule": "V(BZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 19,
    "name": "Benin",
    "alpha2": "BJ",
    "alpha3": "BEN",
    "dialCode": "+229",
    "sampleE164": "+2290195123456",
    "sampleNsnDigits": 10,
    "validationRule": "V(BJ)",
    "notes": "Benin expanded to 10-digit numbers in 2024; the fixture begins 01. Do not use old 8-digit-only rules.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 20,
    "name": "Bhutan",
    "alpha2": "BT",
    "alpha3": "BTN",
    "dialCode": "+975",
    "sampleE164": "+97517123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(BT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 21,
    "name": "Bolivia",
    "alpha2": "BO",
    "alpha3": "BOL",
    "dialCode": "+591",
    "sampleE164": "+59171234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(BO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 22,
    "name": "Bosnia and Herzegovina",
    "alpha2": "BA",
    "alpha3": "BIH",
    "dialCode": "+387",
    "sampleE164": "+38761123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(BA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 23,
    "name": "Botswana",
    "alpha2": "BW",
    "alpha3": "BWA",
    "dialCode": "+267",
    "sampleE164": "+26771123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(BW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 24,
    "name": "Brazil",
    "alpha2": "BR",
    "alpha3": "BRA",
    "dialCode": "+55",
    "sampleE164": "+5511961234567",
    "sampleNsnDigits": 11,
    "validationRule": "V(BR)",
    "notes": "Mobile NSN examples typically include 2-digit area + 9-digit mobile, versus 8-digit local fixed-line; carrier-selection belongs to national dialling.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 25,
    "name": "Brunei Darussalam",
    "alpha2": "BN",
    "alpha3": "BRN",
    "dialCode": "+673",
    "sampleE164": "+6737123456",
    "sampleNsnDigits": 7,
    "validationRule": "V(BN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 26,
    "name": "Bulgaria",
    "alpha2": "BG",
    "alpha3": "BGR",
    "dialCode": "+359",
    "sampleE164": "+35943012345",
    "sampleNsnDigits": 8,
    "validationRule": "V(BG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 27,
    "name": "Burkina Faso",
    "alpha2": "BF",
    "alpha3": "BFA",
    "dialCode": "+226",
    "sampleE164": "+22670123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(BF)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 28,
    "name": "Burundi",
    "alpha2": "BI",
    "alpha3": "BDI",
    "dialCode": "+257",
    "sampleE164": "+25779561234",
    "sampleNsnDigits": 8,
    "validationRule": "V(BI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 29,
    "name": "Cabo Verde",
    "alpha2": "CV",
    "alpha3": "CPV",
    "dialCode": "+238",
    "sampleE164": "+2389911234",
    "sampleNsnDigits": 7,
    "validationRule": "V(CV)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 30,
    "name": "Cambodia",
    "alpha2": "KH",
    "alpha3": "KHM",
    "dialCode": "+855",
    "sampleE164": "+85591234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(KH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 31,
    "name": "Cameroon",
    "alpha2": "CM",
    "alpha3": "CMR",
    "dialCode": "+237",
    "sampleE164": "+237671234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(CM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 32,
    "name": "Canada",
    "alpha2": "CA",
    "alpha3": "CAN",
    "dialCode": "+1",
    "sampleE164": "+15062345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(CA)",
    "notes": "Shares country calling code +1; 10-digit NANP NSN, region cannot be determined from +1 alone.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 33,
    "name": "Central African Republic",
    "alpha2": "CF",
    "alpha3": "CAF",
    "dialCode": "+236",
    "sampleE164": "+23670012345",
    "sampleNsnDigits": 8,
    "validationRule": "V(CF)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 34,
    "name": "Chad",
    "alpha2": "TD",
    "alpha3": "TCD",
    "dialCode": "+235",
    "sampleE164": "+23563012345",
    "sampleNsnDigits": 8,
    "validationRule": "V(TD)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 35,
    "name": "Chile",
    "alpha2": "CL",
    "alpha3": "CHL",
    "dialCode": "+56",
    "sampleE164": "+56221234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(CL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 36,
    "name": "China",
    "alpha2": "CN",
    "alpha3": "CHN",
    "dialCode": "+86",
    "sampleE164": "+8613123456789",
    "sampleNsnDigits": 11,
    "validationRule": "V(CN)",
    "notes": "Illustrated mobile NSN is 11 digits; fixed-line and service lengths differ.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 37,
    "name": "Colombia",
    "alpha2": "CO",
    "alpha3": "COL",
    "dialCode": "+57",
    "sampleE164": "+573211234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(CO)",
    "notes": "The national dialing plan changed; do not hard-code legacy city/mobile prefixes or dialling tokens.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 38,
    "name": "Comoros",
    "alpha2": "KM",
    "alpha3": "COM",
    "dialCode": "+269",
    "sampleE164": "+2693212345",
    "sampleNsnDigits": 7,
    "validationRule": "V(KM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 39,
    "name": "Congo, Democratic Republic of the",
    "alpha2": "CD",
    "alpha3": "COD",
    "dialCode": "+243",
    "sampleE164": "+243991234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(CD)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 40,
    "name": "Congo, Republic of the",
    "alpha2": "CG",
    "alpha3": "COG",
    "dialCode": "+242",
    "sampleE164": "+242061234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(CG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 41,
    "name": "Costa Rica",
    "alpha2": "CR",
    "alpha3": "CRI",
    "dialCode": "+506",
    "sampleE164": "+50683123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(CR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 42,
    "name": "Croatia",
    "alpha2": "HR",
    "alpha3": "HRV",
    "dialCode": "+385",
    "sampleE164": "+385921234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(HR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 43,
    "name": "Cuba",
    "alpha2": "CU",
    "alpha3": "CUB",
    "dialCode": "+53",
    "sampleE164": "+5351234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(CU)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 44,
    "name": "Cyprus",
    "alpha2": "CY",
    "alpha3": "CYP",
    "dialCode": "+357",
    "sampleE164": "+35796123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(CY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 45,
    "name": "Czechia",
    "alpha2": "CZ",
    "alpha3": "CZE",
    "dialCode": "+420",
    "sampleE164": "+420601123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(CZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 46,
    "name": "Côte d'Ivoire (Ivory Coast)",
    "alpha2": "CI",
    "alpha3": "CIV",
    "dialCode": "+225",
    "sampleE164": "+2250123456789",
    "sampleNsnDigits": 10,
    "validationRule": "V(CI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 47,
    "name": "Denmark",
    "alpha2": "DK",
    "alpha3": "DNK",
    "dialCode": "+45",
    "sampleE164": "+4534412345",
    "sampleNsnDigits": 8,
    "validationRule": "V(DK)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 48,
    "name": "Djibouti",
    "alpha2": "DJ",
    "alpha3": "DJI",
    "dialCode": "+253",
    "sampleE164": "+25377831001",
    "sampleNsnDigits": 8,
    "validationRule": "V(DJ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 49,
    "name": "Dominica",
    "alpha2": "DM",
    "alpha3": "DMA",
    "dialCode": "+1",
    "sampleE164": "+17672251234",
    "sampleNsnDigits": 10,
    "validationRule": "V(DM)",
    "notes": "+1 area code(s): 767.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 50,
    "name": "Dominican Republic",
    "alpha2": "DO",
    "alpha3": "DOM",
    "dialCode": "+1",
    "sampleE164": "+18092345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(DO)",
    "notes": "+1 area code(s): 809/829/849. Country code is +1; 809/829/849 are NANP area codes, not three different country calling codes.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 51,
    "name": "Ecuador",
    "alpha2": "EC",
    "alpha3": "ECU",
    "dialCode": "+593",
    "sampleE164": "+593991234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(EC)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 52,
    "name": "Egypt",
    "alpha2": "EG",
    "alpha3": "EGY",
    "dialCode": "+20",
    "sampleE164": "+201001234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(EG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 53,
    "name": "El Salvador",
    "alpha2": "SV",
    "alpha3": "SLV",
    "dialCode": "+503",
    "sampleE164": "+50370123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(SV)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 54,
    "name": "Equatorial Guinea",
    "alpha2": "GQ",
    "alpha3": "GNQ",
    "dialCode": "+240",
    "sampleE164": "+240222123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(GQ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 55,
    "name": "Eritrea",
    "alpha2": "ER",
    "alpha3": "ERI",
    "dialCode": "+291",
    "sampleE164": "+2917123456",
    "sampleNsnDigits": 7,
    "validationRule": "V(ER)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 56,
    "name": "Estonia",
    "alpha2": "EE",
    "alpha3": "EST",
    "dialCode": "+372",
    "sampleE164": "+37251234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(EE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 57,
    "name": "Eswatini",
    "alpha2": "SZ",
    "alpha3": "SWZ",
    "dialCode": "+268",
    "sampleE164": "+26876123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(SZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 58,
    "name": "Ethiopia",
    "alpha2": "ET",
    "alpha3": "ETH",
    "dialCode": "+251",
    "sampleE164": "+251911234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(ET)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 59,
    "name": "Fiji",
    "alpha2": "FJ",
    "alpha3": "FJI",
    "dialCode": "+679",
    "sampleE164": "+6797012345",
    "sampleNsnDigits": 7,
    "validationRule": "V(FJ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 60,
    "name": "Finland",
    "alpha2": "FI",
    "alpha3": "FIN",
    "dialCode": "+358",
    "sampleE164": "+358412345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(FI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 61,
    "name": "France",
    "alpha2": "FR",
    "alpha3": "FRA",
    "dialCode": "+33",
    "sampleE164": "+33612345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(FR)",
    "notes": "Mobile illustration is a 9-digit NSN; domestic 0 is typically not included after +33.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 62,
    "name": "Gabon",
    "alpha2": "GA",
    "alpha3": "GAB",
    "dialCode": "+241",
    "sampleE164": "+24106031234",
    "sampleNsnDigits": 8,
    "validationRule": "V(GA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 63,
    "name": "Gambia",
    "alpha2": "GM",
    "alpha3": "GMB",
    "dialCode": "+220",
    "sampleE164": "+2203012345",
    "sampleNsnDigits": 7,
    "validationRule": "V(GM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 64,
    "name": "Georgia",
    "alpha2": "GE",
    "alpha3": "GEO",
    "dialCode": "+995",
    "sampleE164": "+995555123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(GE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 65,
    "name": "Germany",
    "alpha2": "DE",
    "alpha3": "DEU",
    "dialCode": "+49",
    "sampleE164": "+4915123456789",
    "sampleNsnDigits": 11,
    "validationRule": "V(DE)",
    "notes": "Variable national number lengths; neither a single exact length nor a fixed area-code width is safe.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 66,
    "name": "Ghana",
    "alpha2": "GH",
    "alpha3": "GHA",
    "dialCode": "+233",
    "sampleE164": "+233231234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(GH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 67,
    "name": "Greece",
    "alpha2": "GR",
    "alpha3": "GRC",
    "dialCode": "+30",
    "sampleE164": "+306912345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(GR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 68,
    "name": "Grenada",
    "alpha2": "GD",
    "alpha3": "GRD",
    "dialCode": "+1",
    "sampleE164": "+14734031234",
    "sampleNsnDigits": 10,
    "validationRule": "V(GD)",
    "notes": "+1 area code(s): 473.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 69,
    "name": "Guatemala",
    "alpha2": "GT",
    "alpha3": "GTM",
    "dialCode": "+502",
    "sampleE164": "+50251234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(GT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 70,
    "name": "Guinea",
    "alpha2": "GN",
    "alpha3": "GIN",
    "dialCode": "+224",
    "sampleE164": "+224601123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(GN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 71,
    "name": "Guinea-Bissau",
    "alpha2": "GW",
    "alpha3": "GNB",
    "dialCode": "+245",
    "sampleE164": "+245955012345",
    "sampleNsnDigits": 9,
    "validationRule": "V(GW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 72,
    "name": "Guyana",
    "alpha2": "GY",
    "alpha3": "GUY",
    "dialCode": "+592",
    "sampleE164": "+5926091234",
    "sampleNsnDigits": 7,
    "validationRule": "V(GY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 73,
    "name": "Haiti",
    "alpha2": "HT",
    "alpha3": "HTI",
    "dialCode": "+509",
    "sampleE164": "+50934101234",
    "sampleNsnDigits": 8,
    "validationRule": "V(HT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 74,
    "name": "Honduras",
    "alpha2": "HN",
    "alpha3": "HND",
    "dialCode": "+504",
    "sampleE164": "+50491234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(HN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 75,
    "name": "Hungary",
    "alpha2": "HU",
    "alpha3": "HUN",
    "dialCode": "+36",
    "sampleE164": "+36201234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(HU)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 76,
    "name": "Iceland",
    "alpha2": "IS",
    "alpha3": "ISL",
    "dialCode": "+354",
    "sampleE164": "+3546111234",
    "sampleNsnDigits": 7,
    "validationRule": "V(IS)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 77,
    "name": "India",
    "alpha2": "IN",
    "alpha3": "IND",
    "dialCode": "+91",
    "sampleE164": "+918123456789",
    "sampleNsnDigits": 10,
    "validationRule": "V(IN)",
    "notes": "Illustrated mobile is 10 NSN digits; fixed-line and toll-free patterns must use metadata.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 78,
    "name": "Indonesia",
    "alpha2": "ID",
    "alpha3": "IDN",
    "dialCode": "+62",
    "sampleE164": "+62812345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(ID)",
    "notes": "Variable NSN lengths and ambiguous leading 62 without +; use region-aware parsing.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 79,
    "name": "Iran",
    "alpha2": "IR",
    "alpha3": "IRN",
    "dialCode": "+98",
    "sampleE164": "+989123456789",
    "sampleNsnDigits": 10,
    "validationRule": "V(IR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 80,
    "name": "Iraq",
    "alpha2": "IQ",
    "alpha3": "IRQ",
    "dialCode": "+964",
    "sampleE164": "+9647912345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(IQ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 81,
    "name": "Ireland",
    "alpha2": "IE",
    "alpha3": "IRL",
    "dialCode": "+353",
    "sampleE164": "+353850123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(IE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 82,
    "name": "Israel",
    "alpha2": "IL",
    "alpha3": "ISR",
    "dialCode": "+972",
    "sampleE164": "+972502345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(IL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 83,
    "name": "Italy",
    "alpha2": "IT",
    "alpha3": "ITA",
    "dialCode": "+39",
    "sampleE164": "+393123456789",
    "sampleNsnDigits": 10,
    "validationRule": "V(IT)",
    "notes": "Italian fixed-line leading zero (e.g. Rome 06) is significant even after +39; never blindly delete it.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 84,
    "name": "Jamaica",
    "alpha2": "JM",
    "alpha3": "JAM",
    "dialCode": "+1",
    "sampleE164": "+18762101234",
    "sampleNsnDigits": 10,
    "validationRule": "V(JM)",
    "notes": "+1 area code(s): 876/658. Uses +1 with area codes 876 and 658 (not calling codes +1876 or +1658).",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 85,
    "name": "Japan",
    "alpha2": "JP",
    "alpha3": "JPN",
    "dialCode": "+81",
    "sampleE164": "+819012345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(JP)",
    "notes": "Variable domestic layouts; leading 0 is a national dialing prefix, not generally part of the E.164 NSN.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 86,
    "name": "Jordan",
    "alpha2": "JO",
    "alpha3": "JOR",
    "dialCode": "+962",
    "sampleE164": "+962790123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(JO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 87,
    "name": "Kazakhstan",
    "alpha2": "KZ",
    "alpha3": "KAZ",
    "dialCode": "+7",
    "sampleE164": "+77710009998",
    "sampleNsnDigits": 10,
    "validationRule": "V(KZ)",
    "notes": "Shares +7 with Russia; determine numbering region from national digits using metadata.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 88,
    "name": "Kenya",
    "alpha2": "KE",
    "alpha3": "KEN",
    "dialCode": "+254",
    "sampleE164": "+254712123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(KE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 89,
    "name": "Kiribati",
    "alpha2": "KI",
    "alpha3": "KIR",
    "dialCode": "+686",
    "sampleE164": "+68672001234",
    "sampleNsnDigits": 8,
    "validationRule": "V(KI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 90,
    "name": "Kuwait",
    "alpha2": "KW",
    "alpha3": "KWT",
    "dialCode": "+965",
    "sampleE164": "+96550012345",
    "sampleNsnDigits": 8,
    "validationRule": "V(KW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 91,
    "name": "Kyrgyzstan",
    "alpha2": "KG",
    "alpha3": "KGZ",
    "dialCode": "+996",
    "sampleE164": "+996700123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(KG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 92,
    "name": "Laos",
    "alpha2": "LA",
    "alpha3": "LAO",
    "dialCode": "+856",
    "sampleE164": "+8562023123456",
    "sampleNsnDigits": 10,
    "validationRule": "V(LA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 93,
    "name": "Latvia",
    "alpha2": "LV",
    "alpha3": "LVA",
    "dialCode": "+371",
    "sampleE164": "+37121234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(LV)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 94,
    "name": "Lebanon",
    "alpha2": "LB",
    "alpha3": "LBN",
    "dialCode": "+961",
    "sampleE164": "+96171123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(LB)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 95,
    "name": "Lesotho",
    "alpha2": "LS",
    "alpha3": "LSO",
    "dialCode": "+266",
    "sampleE164": "+26650123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(LS)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 96,
    "name": "Liberia",
    "alpha2": "LR",
    "alpha3": "LBR",
    "dialCode": "+231",
    "sampleE164": "+231770123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(LR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 97,
    "name": "Libya",
    "alpha2": "LY",
    "alpha3": "LBY",
    "dialCode": "+218",
    "sampleE164": "+218912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(LY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 98,
    "name": "Liechtenstein",
    "alpha2": "LI",
    "alpha3": "LIE",
    "dialCode": "+423",
    "sampleE164": "+423660234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(LI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 99,
    "name": "Lithuania",
    "alpha2": "LT",
    "alpha3": "LTU",
    "dialCode": "+370",
    "sampleE164": "+37061234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(LT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 100,
    "name": "Luxembourg",
    "alpha2": "LU",
    "alpha3": "LUX",
    "dialCode": "+352",
    "sampleE164": "+352628123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(LU)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 101,
    "name": "Madagascar",
    "alpha2": "MG",
    "alpha3": "MDG",
    "dialCode": "+261",
    "sampleE164": "+261321234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(MG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 102,
    "name": "Malawi",
    "alpha2": "MW",
    "alpha3": "MWI",
    "dialCode": "+265",
    "sampleE164": "+265991234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(MW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 103,
    "name": "Malaysia",
    "alpha2": "MY",
    "alpha3": "MYS",
    "dialCode": "+60",
    "sampleE164": "+60123456789",
    "sampleNsnDigits": 9,
    "validationRule": "V(MY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 104,
    "name": "Maldives",
    "alpha2": "MV",
    "alpha3": "MDV",
    "dialCode": "+960",
    "sampleE164": "+9607712345",
    "sampleNsnDigits": 7,
    "validationRule": "V(MV)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 105,
    "name": "Mali",
    "alpha2": "ML",
    "alpha3": "MLI",
    "dialCode": "+223",
    "sampleE164": "+22365012345",
    "sampleNsnDigits": 8,
    "validationRule": "V(ML)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 106,
    "name": "Malta",
    "alpha2": "MT",
    "alpha3": "MLT",
    "dialCode": "+356",
    "sampleE164": "+35696961234",
    "sampleNsnDigits": 8,
    "validationRule": "V(MT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 107,
    "name": "Marshall Islands",
    "alpha2": "MH",
    "alpha3": "MHL",
    "dialCode": "+692",
    "sampleE164": "+6922351234",
    "sampleNsnDigits": 7,
    "validationRule": "V(MH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 108,
    "name": "Mauritania",
    "alpha2": "MR",
    "alpha3": "MRT",
    "dialCode": "+222",
    "sampleE164": "+22222123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(MR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 109,
    "name": "Mauritius",
    "alpha2": "MU",
    "alpha3": "MUS",
    "dialCode": "+230",
    "sampleE164": "+23052512345",
    "sampleNsnDigits": 8,
    "validationRule": "V(MU)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 110,
    "name": "Mexico",
    "alpha2": "MX",
    "alpha3": "MEX",
    "dialCode": "+52",
    "sampleE164": "+522221234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(MX)",
    "notes": "Obsolete international mobile token 1 and national access 044/045 must not be hard-coded into current format.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 111,
    "name": "Micronesia",
    "alpha2": "FM",
    "alpha3": "FSM",
    "dialCode": "+691",
    "sampleE164": "+6913501234",
    "sampleNsnDigits": 7,
    "validationRule": "V(FM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 112,
    "name": "Moldova",
    "alpha2": "MD",
    "alpha3": "MDA",
    "dialCode": "+373",
    "sampleE164": "+37362112345",
    "sampleNsnDigits": 8,
    "validationRule": "V(MD)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 113,
    "name": "Monaco",
    "alpha2": "MC",
    "alpha3": "MCO",
    "dialCode": "+377",
    "sampleE164": "+377612345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(MC)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 114,
    "name": "Mongolia",
    "alpha2": "MN",
    "alpha3": "MNG",
    "dialCode": "+976",
    "sampleE164": "+97688123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(MN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 115,
    "name": "Montenegro",
    "alpha2": "ME",
    "alpha3": "MNE",
    "dialCode": "+382",
    "sampleE164": "+38260123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(ME)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 116,
    "name": "Morocco",
    "alpha2": "MA",
    "alpha3": "MAR",
    "dialCode": "+212",
    "sampleE164": "+212650123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(MA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 117,
    "name": "Mozambique",
    "alpha2": "MZ",
    "alpha3": "MOZ",
    "dialCode": "+258",
    "sampleE164": "+258821234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(MZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 118,
    "name": "Myanmar",
    "alpha2": "MM",
    "alpha3": "MMR",
    "dialCode": "+95",
    "sampleE164": "+9592123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(MM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 119,
    "name": "Namibia",
    "alpha2": "NA",
    "alpha3": "NAM",
    "dialCode": "+264",
    "sampleE164": "+264811234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(NA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 120,
    "name": "Nauru",
    "alpha2": "NR",
    "alpha3": "NRU",
    "dialCode": "+674",
    "sampleE164": "+6745551234",
    "sampleNsnDigits": 7,
    "validationRule": "V(NR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 121,
    "name": "Nepal",
    "alpha2": "NP",
    "alpha3": "NPL",
    "dialCode": "+977",
    "sampleE164": "+9779841234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(NP)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 122,
    "name": "Netherlands",
    "alpha2": "NL",
    "alpha3": "NLD",
    "dialCode": "+31",
    "sampleE164": "+31612345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(NL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 123,
    "name": "New Zealand",
    "alpha2": "NZ",
    "alpha3": "NZL",
    "dialCode": "+64",
    "sampleE164": "+64211234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(NZ)",
    "notes": "National numbering length varies by number type; mobile example length is not a blanket length limit.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 124,
    "name": "Nicaragua",
    "alpha2": "NI",
    "alpha3": "NIC",
    "dialCode": "+505",
    "sampleE164": "+50581234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(NI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 125,
    "name": "Niger",
    "alpha2": "NE",
    "alpha3": "NER",
    "dialCode": "+227",
    "sampleE164": "+22793123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(NE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 126,
    "name": "Nigeria",
    "alpha2": "NG",
    "alpha3": "NGA",
    "dialCode": "+234",
    "sampleE164": "+2348021234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(NG)",
    "notes": "Do not equate an example 10-digit mobile NSN with all possible landline/service number lengths.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 127,
    "name": "North Korea",
    "alpha2": "KP",
    "alpha3": "PRK",
    "dialCode": "+850",
    "sampleE164": "+8501921234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(KP)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 128,
    "name": "North Macedonia",
    "alpha2": "MK",
    "alpha3": "MKD",
    "dialCode": "+389",
    "sampleE164": "+38972345678",
    "sampleNsnDigits": 8,
    "validationRule": "V(MK)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 129,
    "name": "Norway",
    "alpha2": "NO",
    "alpha3": "NOR",
    "dialCode": "+47",
    "sampleE164": "+4740612345",
    "sampleNsnDigits": 8,
    "validationRule": "V(NO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 130,
    "name": "Oman",
    "alpha2": "OM",
    "alpha3": "OMN",
    "dialCode": "+968",
    "sampleE164": "+96892123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(OM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 131,
    "name": "Pakistan",
    "alpha2": "PK",
    "alpha3": "PAK",
    "dialCode": "+92",
    "sampleE164": "+923012345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(PK)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 132,
    "name": "Palau",
    "alpha2": "PW",
    "alpha3": "PLW",
    "dialCode": "+680",
    "sampleE164": "+6806201234",
    "sampleNsnDigits": 7,
    "validationRule": "V(PW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 133,
    "name": "Palestine (State of)",
    "alpha2": "PS",
    "alpha3": "PSE",
    "dialCode": "+970",
    "sampleE164": "+970599123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(PS)",
    "notes": "Uses +970 in its numbering plan; +972 may also appear in the region in practice. Treat actual numbering plan as selected.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 134,
    "name": "Panama",
    "alpha2": "PA",
    "alpha3": "PAN",
    "dialCode": "+507",
    "sampleE164": "+50761234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(PA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 135,
    "name": "Papua New Guinea",
    "alpha2": "PG",
    "alpha3": "PNG",
    "dialCode": "+675",
    "sampleE164": "+67570123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(PG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 136,
    "name": "Paraguay",
    "alpha2": "PY",
    "alpha3": "PRY",
    "dialCode": "+595",
    "sampleE164": "+595961456789",
    "sampleNsnDigits": 9,
    "validationRule": "V(PY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 137,
    "name": "Peru",
    "alpha2": "PE",
    "alpha3": "PER",
    "dialCode": "+51",
    "sampleE164": "+51912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(PE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 138,
    "name": "Philippines",
    "alpha2": "PH",
    "alpha3": "PHL",
    "dialCode": "+63",
    "sampleE164": "+639051234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(PH)",
    "notes": "Mobile illustration is +63 905…; domestic 09… is not appended unchanged after +63.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 139,
    "name": "Poland",
    "alpha2": "PL",
    "alpha3": "POL",
    "dialCode": "+48",
    "sampleE164": "+48512345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(PL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 140,
    "name": "Portugal",
    "alpha2": "PT",
    "alpha3": "PRT",
    "dialCode": "+351",
    "sampleE164": "+351912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(PT)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 141,
    "name": "Qatar",
    "alpha2": "QA",
    "alpha3": "QAT",
    "dialCode": "+974",
    "sampleE164": "+97433123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(QA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 142,
    "name": "Romania",
    "alpha2": "RO",
    "alpha3": "ROU",
    "dialCode": "+40",
    "sampleE164": "+40712034567",
    "sampleNsnDigits": 9,
    "validationRule": "V(RO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 143,
    "name": "Russia",
    "alpha2": "RU",
    "alpha3": "RUS",
    "dialCode": "+7",
    "sampleE164": "+79123456789",
    "sampleNsnDigits": 10,
    "validationRule": "V(RU)",
    "notes": "Shares +7 with Kazakhstan; country/region requires NSN analysis, not +7 alone.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 144,
    "name": "Rwanda",
    "alpha2": "RW",
    "alpha3": "RWA",
    "dialCode": "+250",
    "sampleE164": "+250720123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(RW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 145,
    "name": "Saint Kitts and Nevis",
    "alpha2": "KN",
    "alpha3": "KNA",
    "dialCode": "+1",
    "sampleE164": "+18697652917",
    "sampleNsnDigits": 10,
    "validationRule": "V(KN)",
    "notes": "+1 area code(s): 869.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 146,
    "name": "Saint Lucia",
    "alpha2": "LC",
    "alpha3": "LCA",
    "dialCode": "+1",
    "sampleE164": "+17582845678",
    "sampleNsnDigits": 10,
    "validationRule": "V(LC)",
    "notes": "+1 area code(s): 758.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 147,
    "name": "Saint Vincent and the Grenadines",
    "alpha2": "VC",
    "alpha3": "VCT",
    "dialCode": "+1",
    "sampleE164": "+17844301234",
    "sampleNsnDigits": 10,
    "validationRule": "V(VC)",
    "notes": "+1 area code(s): 784.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 148,
    "name": "Samoa",
    "alpha2": "WS",
    "alpha3": "WSM",
    "dialCode": "+685",
    "sampleE164": "+6857212345",
    "sampleNsnDigits": 7,
    "validationRule": "V(WS)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 149,
    "name": "San Marino",
    "alpha2": "SM",
    "alpha3": "SMR",
    "dialCode": "+378",
    "sampleE164": "+37866661212",
    "sampleNsnDigits": 8,
    "validationRule": "V(SM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 150,
    "name": "Saudi Arabia",
    "alpha2": "SA",
    "alpha3": "SAU",
    "dialCode": "+966",
    "sampleE164": "+966512345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(SA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 151,
    "name": "Senegal",
    "alpha2": "SN",
    "alpha3": "SEN",
    "dialCode": "+221",
    "sampleE164": "+221701234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(SN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 152,
    "name": "Serbia",
    "alpha2": "RS",
    "alpha3": "SRB",
    "dialCode": "+381",
    "sampleE164": "+381601234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(RS)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 153,
    "name": "Seychelles",
    "alpha2": "SC",
    "alpha3": "SYC",
    "dialCode": "+248",
    "sampleE164": "+2482510123",
    "sampleNsnDigits": 7,
    "validationRule": "V(SC)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 154,
    "name": "Sierra Leone",
    "alpha2": "SL",
    "alpha3": "SLE",
    "dialCode": "+232",
    "sampleE164": "+23225123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(SL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 155,
    "name": "Singapore",
    "alpha2": "SG",
    "alpha3": "SGP",
    "dialCode": "+65",
    "sampleE164": "+6581234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(SG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 156,
    "name": "Slovakia",
    "alpha2": "SK",
    "alpha3": "SVK",
    "dialCode": "+421",
    "sampleE164": "+421912123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(SK)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 157,
    "name": "Slovenia",
    "alpha2": "SI",
    "alpha3": "SVN",
    "dialCode": "+386",
    "sampleE164": "+38631234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(SI)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 158,
    "name": "Solomon Islands",
    "alpha2": "SB",
    "alpha3": "SLB",
    "dialCode": "+677",
    "sampleE164": "+6777421234",
    "sampleNsnDigits": 7,
    "validationRule": "V(SB)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 159,
    "name": "Somalia",
    "alpha2": "SO",
    "alpha3": "SOM",
    "dialCode": "+252",
    "sampleE164": "+25271123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(SO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 160,
    "name": "South Africa",
    "alpha2": "ZA",
    "alpha3": "ZAF",
    "dialCode": "+27",
    "sampleE164": "+27711234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(ZA)",
    "notes": "National leading 0 is not ordinarily written after +27; example NSN is 9 digits.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 161,
    "name": "South Korea",
    "alpha2": "KR",
    "alpha3": "KOR",
    "dialCode": "+82",
    "sampleE164": "+821020000000",
    "sampleNsnDigits": 10,
    "validationRule": "V(KR)",
    "notes": "Mobile illustration is +82 10…; omit national trunk 0 after +82.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 162,
    "name": "South Sudan",
    "alpha2": "SS",
    "alpha3": "SSD",
    "dialCode": "+211",
    "sampleE164": "+211977123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(SS)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 163,
    "name": "Spain",
    "alpha2": "ES",
    "alpha3": "ESP",
    "dialCode": "+34",
    "sampleE164": "+34612345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(ES)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 164,
    "name": "Sri Lanka",
    "alpha2": "LK",
    "alpha3": "LKA",
    "dialCode": "+94",
    "sampleE164": "+94712345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(LK)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 165,
    "name": "Sudan",
    "alpha2": "SD",
    "alpha3": "SDN",
    "dialCode": "+249",
    "sampleE164": "+249911231234",
    "sampleNsnDigits": 9,
    "validationRule": "V(SD)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 166,
    "name": "Suriname",
    "alpha2": "SR",
    "alpha3": "SUR",
    "dialCode": "+597",
    "sampleE164": "+5977412345",
    "sampleNsnDigits": 7,
    "validationRule": "V(SR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 167,
    "name": "Sweden",
    "alpha2": "SE",
    "alpha3": "SWE",
    "dialCode": "+46",
    "sampleE164": "+46701234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(SE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 168,
    "name": "Switzerland",
    "alpha2": "CH",
    "alpha3": "CHE",
    "dialCode": "+41",
    "sampleE164": "+41781234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(CH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 169,
    "name": "Syrian Arab Republic",
    "alpha2": "SY",
    "alpha3": "SYR",
    "dialCode": "+963",
    "sampleE164": "+963944567890",
    "sampleNsnDigits": 9,
    "validationRule": "V(SY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 170,
    "name": "São Tomé and Príncipe",
    "alpha2": "ST",
    "alpha3": "STP",
    "dialCode": "+239",
    "sampleE164": "+2399812345",
    "sampleNsnDigits": 7,
    "validationRule": "V(ST)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 171,
    "name": "Tajikistan",
    "alpha2": "TJ",
    "alpha3": "TJK",
    "dialCode": "+992",
    "sampleE164": "+992917123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(TJ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 172,
    "name": "Tanzania",
    "alpha2": "TZ",
    "alpha3": "TZA",
    "dialCode": "+255",
    "sampleE164": "+255621234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(TZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 173,
    "name": "Thailand",
    "alpha2": "TH",
    "alpha3": "THA",
    "dialCode": "+66",
    "sampleE164": "+66812345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(TH)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 174,
    "name": "Timor-Leste",
    "alpha2": "TL",
    "alpha3": "TLS",
    "dialCode": "+670",
    "sampleE164": "+67077212345",
    "sampleNsnDigits": 8,
    "validationRule": "V(TL)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 175,
    "name": "Togo",
    "alpha2": "TG",
    "alpha3": "TGO",
    "dialCode": "+228",
    "sampleE164": "+22890112345",
    "sampleNsnDigits": 8,
    "validationRule": "V(TG)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 176,
    "name": "Tonga",
    "alpha2": "TO",
    "alpha3": "TON",
    "dialCode": "+676",
    "sampleE164": "+6767715123",
    "sampleNsnDigits": 7,
    "validationRule": "V(TO)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 177,
    "name": "Trinidad and Tobago",
    "alpha2": "TT",
    "alpha3": "TTO",
    "dialCode": "+1",
    "sampleE164": "+18682911234",
    "sampleNsnDigits": 10,
    "validationRule": "V(TT)",
    "notes": "+1 area code(s): 868.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 178,
    "name": "Tunisia",
    "alpha2": "TN",
    "alpha3": "TUN",
    "dialCode": "+216",
    "sampleE164": "+21620123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(TN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 179,
    "name": "Turkmenistan",
    "alpha2": "TM",
    "alpha3": "TKM",
    "dialCode": "+993",
    "sampleE164": "+99366123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(TM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 180,
    "name": "Tuvalu",
    "alpha2": "TV",
    "alpha3": "TUV",
    "dialCode": "+688",
    "sampleE164": "+688901234",
    "sampleNsnDigits": 6,
    "validationRule": "V(TV)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 181,
    "name": "Türkiye",
    "alpha2": "TR",
    "alpha3": "TUR",
    "dialCode": "+90",
    "sampleE164": "+905012345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(TR)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 182,
    "name": "Uganda",
    "alpha2": "UG",
    "alpha3": "UGA",
    "dialCode": "+256",
    "sampleE164": "+256712345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(UG)",
    "notes": "Standard illustrated mobile: +256712345678; local rendering has a leading 0. The mobile NSN illustrated here is 9 digits.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 183,
    "name": "Ukraine",
    "alpha2": "UA",
    "alpha3": "UKR",
    "dialCode": "+380",
    "sampleE164": "+380501234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(UA)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 184,
    "name": "United Arab Emirates",
    "alpha2": "AE",
    "alpha3": "ARE",
    "dialCode": "+971",
    "sampleE164": "+971501234567",
    "sampleNsnDigits": 9,
    "validationRule": "V(AE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 185,
    "name": "United Kingdom",
    "alpha2": "GB",
    "alpha3": "GBR",
    "dialCode": "+44",
    "sampleE164": "+447400123456",
    "sampleNsnDigits": 10,
    "validationRule": "V(GB)",
    "notes": "Uses +44; Guernsey, Jersey and Isle of Man have distinct regions within +44.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 186,
    "name": "United States",
    "alpha2": "US",
    "alpha3": "USA",
    "dialCode": "+1",
    "sampleE164": "+12015550123",
    "sampleNsnDigits": 10,
    "validationRule": "V(US)",
    "notes": "Shares +1. NANP geographical numbers have area code (3 digits) + exchange (3) + line (4); +1 alone does not mean US.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 187,
    "name": "Uruguay",
    "alpha2": "UY",
    "alpha3": "URY",
    "dialCode": "+598",
    "sampleE164": "+59894231234",
    "sampleNsnDigits": 8,
    "validationRule": "V(UY)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 188,
    "name": "Uzbekistan",
    "alpha2": "UZ",
    "alpha3": "UZB",
    "dialCode": "+998",
    "sampleE164": "+998912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(UZ)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 189,
    "name": "Vanuatu",
    "alpha2": "VU",
    "alpha3": "VUT",
    "dialCode": "+678",
    "sampleE164": "+6785912345",
    "sampleNsnDigits": 7,
    "validationRule": "V(VU)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 190,
    "name": "Vatican City (Holy See)",
    "alpha2": "VA",
    "alpha3": "VAT",
    "dialCode": "+39",
    "sampleE164": "+390669812345",
    "sampleNsnDigits": 10,
    "validationRule": "V(VA)",
    "notes": "Assigned +379 but reachable fixed lines use +39 06 698…; Italian mobile numbers do not prove Vatican residence.",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 191,
    "name": "Venezuela",
    "alpha2": "VE",
    "alpha3": "VEN",
    "dialCode": "+58",
    "sampleE164": "+584121234567",
    "sampleNsnDigits": 10,
    "validationRule": "V(VE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 192,
    "name": "Vietnam",
    "alpha2": "VN",
    "alpha3": "VNM",
    "dialCode": "+84",
    "sampleE164": "+84912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(VN)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 193,
    "name": "Yemen",
    "alpha2": "YE",
    "alpha3": "YEM",
    "dialCode": "+967",
    "sampleE164": "+967712345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(YE)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 194,
    "name": "Zambia",
    "alpha2": "ZM",
    "alpha3": "ZMB",
    "dialCode": "+260",
    "sampleE164": "+260955123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(ZM)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 195,
    "name": "Zimbabwe",
    "alpha2": "ZW",
    "alpha3": "ZWE",
    "dialCode": "+263",
    "sampleE164": "+263712345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(ZW)",
    "isUnMember": true,
    "isTerritory": false,
    "libphonenumberSupported": true
  },
  {
    "id": 196,
    "name": "American Samoa",
    "alpha2": "AS",
    "alpha3": "ASM",
    "dialCode": "+1",
    "sampleE164": "+16847331234",
    "sampleNsnDigits": 10,
    "validationRule": "V(AS)",
    "notes": "+1 area code(s): 684.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 197,
    "name": "Anguilla",
    "alpha2": "AI",
    "alpha3": "AIA",
    "dialCode": "+1",
    "sampleE164": "+12642351234",
    "sampleNsnDigits": 10,
    "validationRule": "V(AI)",
    "notes": "+1 area code(s): 264.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 198,
    "name": "Aruba",
    "alpha2": "AW",
    "alpha3": "ABW",
    "dialCode": "+297",
    "sampleE164": "+2975601234",
    "sampleNsnDigits": 7,
    "validationRule": "V(AW)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 199,
    "name": "Ascension Island",
    "alpha2": "AC",
    "alpha3": "",
    "dialCode": "+247",
    "sampleE164": "+24740123",
    "sampleNsnDigits": 5,
    "validationRule": "V(AC)",
    "notes": "Distinct libphonenumber/CLDR region AC; do not treat this as an ordinary ISO 3166-1 entity in all systems.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 200,
    "name": "Bermuda",
    "alpha2": "BM",
    "alpha3": "BMU",
    "dialCode": "+1",
    "sampleE164": "+14413701234",
    "sampleNsnDigits": 10,
    "validationRule": "V(BM)",
    "notes": "+1 area code(s): 441.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 201,
    "name": "Bonaire, Sint Eustatius and Saba",
    "alpha2": "BQ",
    "alpha3": "BES",
    "dialCode": "+599",
    "sampleE164": "+5993181234",
    "sampleNsnDigits": 7,
    "validationRule": "V(BQ)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 202,
    "name": "British Indian Ocean Territory",
    "alpha2": "IO",
    "alpha3": "IOT",
    "dialCode": "+246",
    "sampleE164": "+2463801234",
    "sampleNsnDigits": 7,
    "validationRule": "V(IO)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 203,
    "name": "British Virgin Islands",
    "alpha2": "VG",
    "alpha3": "VGB",
    "dialCode": "+1",
    "sampleE164": "+12843001234",
    "sampleNsnDigits": 10,
    "validationRule": "V(VG)",
    "notes": "+1 area code(s): 284.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 204,
    "name": "Cayman Islands",
    "alpha2": "KY",
    "alpha3": "CYM",
    "dialCode": "+1",
    "sampleE164": "+13453231234",
    "sampleNsnDigits": 10,
    "validationRule": "V(KY)",
    "notes": "+1 area code(s): 345.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 205,
    "name": "Christmas Island",
    "alpha2": "CX",
    "alpha3": "CXR",
    "dialCode": "+61",
    "sampleE164": "+61412345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(CX)",
    "notes": "Uses +61 with Australia; the shared mobile fixture does not identify the subscriber as being on Christmas Island.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 206,
    "name": "Cocos (Keeling) Islands",
    "alpha2": "CC",
    "alpha3": "CCK",
    "dialCode": "+61",
    "sampleE164": "+61412345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(CC)",
    "notes": "Uses +61 with Australia; the shared mobile fixture does not identify the subscriber as being on the Cocos Islands.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 207,
    "name": "Cook Islands",
    "alpha2": "CK",
    "alpha3": "COK",
    "dialCode": "+682",
    "sampleE164": "+68271234",
    "sampleNsnDigits": 5,
    "validationRule": "V(CK)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 208,
    "name": "Curaçao",
    "alpha2": "CW",
    "alpha3": "CUW",
    "dialCode": "+599",
    "sampleE164": "+59995181234",
    "sampleNsnDigits": 8,
    "validationRule": "V(CW)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 209,
    "name": "Falkland Islands (Malvinas)",
    "alpha2": "FK",
    "alpha3": "FLK",
    "dialCode": "+500",
    "sampleE164": "+50051234",
    "sampleNsnDigits": 5,
    "validationRule": "V(FK)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 210,
    "name": "Faroe Islands",
    "alpha2": "FO",
    "alpha3": "FRO",
    "dialCode": "+298",
    "sampleE164": "+298211234",
    "sampleNsnDigits": 6,
    "validationRule": "V(FO)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 211,
    "name": "French Guiana",
    "alpha2": "GF",
    "alpha3": "GUF",
    "dialCode": "+594",
    "sampleE164": "+594694201234",
    "sampleNsnDigits": 9,
    "validationRule": "V(GF)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 212,
    "name": "French Polynesia",
    "alpha2": "PF",
    "alpha3": "PYF",
    "dialCode": "+689",
    "sampleE164": "+68987123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(PF)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 213,
    "name": "Gibraltar",
    "alpha2": "GI",
    "alpha3": "GIB",
    "dialCode": "+350",
    "sampleE164": "+35057123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(GI)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 214,
    "name": "Greenland",
    "alpha2": "GL",
    "alpha3": "GRL",
    "dialCode": "+299",
    "sampleE164": "+299221234",
    "sampleNsnDigits": 6,
    "validationRule": "V(GL)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 215,
    "name": "Guadeloupe",
    "alpha2": "GP",
    "alpha3": "GLP",
    "dialCode": "+590",
    "sampleE164": "+590690001234",
    "sampleNsnDigits": 9,
    "validationRule": "V(GP)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 216,
    "name": "Guam",
    "alpha2": "GU",
    "alpha3": "GUM",
    "dialCode": "+1",
    "sampleE164": "+16713001234",
    "sampleNsnDigits": 10,
    "validationRule": "V(GU)",
    "notes": "+1 area code(s): 671.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 217,
    "name": "Guernsey",
    "alpha2": "GG",
    "alpha3": "GGY",
    "dialCode": "+44",
    "sampleE164": "+447781123456",
    "sampleNsnDigits": 10,
    "validationRule": "V(GG)",
    "notes": "Shares +44 with the UK and other Crown Dependencies; let libphonenumber resolve leading ranges.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 218,
    "name": "Hong Kong",
    "alpha2": "HK",
    "alpha3": "HKG",
    "dialCode": "+852",
    "sampleE164": "+85251234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(HK)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 219,
    "name": "Isle of Man",
    "alpha2": "IM",
    "alpha3": "IMN",
    "dialCode": "+44",
    "sampleE164": "+447924123456",
    "sampleNsnDigits": 10,
    "validationRule": "V(IM)",
    "notes": "Shares +44 with the UK and other Crown Dependencies; let libphonenumber resolve leading ranges.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 220,
    "name": "Jersey",
    "alpha2": "JE",
    "alpha3": "JEY",
    "dialCode": "+44",
    "sampleE164": "+447797712345",
    "sampleNsnDigits": 10,
    "validationRule": "V(JE)",
    "notes": "Shares +44 with the UK and other Crown Dependencies; let libphonenumber resolve leading ranges.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 221,
    "name": "Kosovo (CLDR/libphonenumber region)",
    "alpha2": "XK",
    "alpha3": "",
    "dialCode": "+383",
    "sampleE164": "+38343201234",
    "sampleNsnDigits": 8,
    "validationRule": "V(XK)",
    "notes": "CLDR/libphonenumber region XK; not an ISO 3166-1 assigned alpha-2 code.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 222,
    "name": "Macao",
    "alpha2": "MO",
    "alpha3": "MAC",
    "dialCode": "+853",
    "sampleE164": "+85366123456",
    "sampleNsnDigits": 8,
    "validationRule": "V(MO)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 223,
    "name": "Martinique",
    "alpha2": "MQ",
    "alpha3": "MTQ",
    "dialCode": "+596",
    "sampleE164": "+596696201234",
    "sampleNsnDigits": 9,
    "validationRule": "V(MQ)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 224,
    "name": "Mayotte",
    "alpha2": "YT",
    "alpha3": "MYT",
    "dialCode": "+262",
    "sampleE164": "+262639012345",
    "sampleNsnDigits": 9,
    "validationRule": "V(YT)",
    "notes": "Shares +262; distinguish geographic regions using number ranges rather than country calling code alone.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 225,
    "name": "Montserrat",
    "alpha2": "MS",
    "alpha3": "MSR",
    "dialCode": "+1",
    "sampleE164": "+16644923456",
    "sampleNsnDigits": 10,
    "validationRule": "V(MS)",
    "notes": "+1 area code(s): 664.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 226,
    "name": "New Caledonia",
    "alpha2": "NC",
    "alpha3": "NCL",
    "dialCode": "+687",
    "sampleE164": "+687751234",
    "sampleNsnDigits": 6,
    "validationRule": "V(NC)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 227,
    "name": "Niue",
    "alpha2": "NU",
    "alpha3": "NIU",
    "dialCode": "+683",
    "sampleE164": "+6838884012",
    "sampleNsnDigits": 7,
    "validationRule": "V(NU)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 228,
    "name": "Norfolk Island",
    "alpha2": "NF",
    "alpha3": "NFK",
    "dialCode": "+672",
    "sampleE164": "+672381234",
    "sampleNsnDigits": 6,
    "validationRule": "V(NF)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 229,
    "name": "Northern Mariana Islands",
    "alpha2": "MP",
    "alpha3": "MNP",
    "dialCode": "+1",
    "sampleE164": "+16702345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(MP)",
    "notes": "+1 area code(s): 670.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 230,
    "name": "Puerto Rico",
    "alpha2": "PR",
    "alpha3": "PRI",
    "dialCode": "+1",
    "sampleE164": "+17872345678",
    "sampleNsnDigits": 10,
    "validationRule": "V(PR)",
    "notes": "+1 area code(s): 787/939.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 231,
    "name": "Réunion",
    "alpha2": "RE",
    "alpha3": "REU",
    "dialCode": "+262",
    "sampleE164": "+262692123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(RE)",
    "notes": "Shares +262; distinguish geographic regions using number ranges rather than country calling code alone.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 232,
    "name": "Saint Barthélemy",
    "alpha2": "BL",
    "alpha3": "BLM",
    "dialCode": "+590",
    "sampleE164": "+590690001234",
    "sampleNsnDigits": 9,
    "validationRule": "V(BL)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 233,
    "name": "Saint Helena",
    "alpha2": "SH",
    "alpha3": "SHN",
    "dialCode": "+290",
    "sampleE164": "+29051234",
    "sampleNsnDigits": 5,
    "validationRule": "V(SH)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 234,
    "name": "Saint Martin (French part)",
    "alpha2": "MF",
    "alpha3": "MAF",
    "dialCode": "+590",
    "sampleE164": "+590690001234",
    "sampleNsnDigits": 9,
    "validationRule": "V(MF)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 235,
    "name": "Saint Pierre and Miquelon",
    "alpha2": "PM",
    "alpha3": "SPM",
    "dialCode": "+508",
    "sampleE164": "+508551234",
    "sampleNsnDigits": 6,
    "validationRule": "V(PM)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 236,
    "name": "Sint Maarten (Dutch part)",
    "alpha2": "SX",
    "alpha3": "SXM",
    "dialCode": "+1",
    "sampleE164": "+17215205678",
    "sampleNsnDigits": 10,
    "validationRule": "V(SX)",
    "notes": "+1 area code(s): 721.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 237,
    "name": "Svalbard and Jan Mayen",
    "alpha2": "SJ",
    "alpha3": "SJM",
    "dialCode": "+47",
    "sampleE164": "+4741234567",
    "sampleNsnDigits": 8,
    "validationRule": "V(SJ)",
    "notes": "Shares +47 with Norway; sample cannot establish physical location in Svalbard or Jan Mayen.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 238,
    "name": "Taiwan",
    "alpha2": "TW",
    "alpha3": "TWN",
    "dialCode": "+886",
    "sampleE164": "+886912345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(TW)",
    "notes": "Country/territory designations reflect the region-code dataset; dialling uses +886.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 239,
    "name": "Tokelau",
    "alpha2": "TK",
    "alpha3": "TKL",
    "dialCode": "+690",
    "sampleE164": "+6907290",
    "sampleNsnDigits": 4,
    "validationRule": "V(TK)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 240,
    "name": "Tristan da Cunha",
    "alpha2": "TA",
    "alpha3": "",
    "dialCode": "+290",
    "sampleE164": "+2908999",
    "sampleNsnDigits": 4,
    "validationRule": "V(TA)",
    "notes": "Distinct libphonenumber/CLDR region TA; not an ISO 3166-1 alpha-2 code.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 241,
    "name": "Turks and Caicos Islands",
    "alpha2": "TC",
    "alpha3": "TCA",
    "dialCode": "+1",
    "sampleE164": "+16492311234",
    "sampleNsnDigits": 10,
    "validationRule": "V(TC)",
    "notes": "+1 area code(s): 649.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 242,
    "name": "United States Virgin Islands",
    "alpha2": "VI",
    "alpha3": "VIR",
    "dialCode": "+1",
    "sampleE164": "+13406421234",
    "sampleNsnDigits": 10,
    "validationRule": "V(VI)",
    "notes": "+1 area code(s): 340.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 243,
    "name": "Wallis and Futuna",
    "alpha2": "WF",
    "alpha3": "WLF",
    "dialCode": "+681",
    "sampleE164": "+681821234",
    "sampleNsnDigits": 6,
    "validationRule": "V(WF)",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 244,
    "name": "Western Sahara",
    "alpha2": "EH",
    "alpha3": "ESH",
    "dialCode": "+212",
    "sampleE164": "+212650123456",
    "sampleNsnDigits": 9,
    "validationRule": "V(EH)",
    "notes": "Shares +212 numbering resources with Morocco; country attribution may be ambiguous for shared ranges.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  },
  {
    "id": 245,
    "name": "Åland Islands",
    "alpha2": "AX",
    "alpha3": "ALA",
    "dialCode": "+358",
    "sampleE164": "+358412345678",
    "sampleNsnDigits": 9,
    "validationRule": "V(AX)",
    "notes": "Uses +358 with Finland; sample is a Finnish mobile-format illustration and does not identify presence on Åland.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": true
  }
] as const;

export const UNSUPPORTED_ISO_ENTITIES: readonly RegionRecord[] = [
  {
    "id": 246,
    "name": "Antarctica",
    "alpha2": "AQ",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "Antarctica has an assigned +672 resource, but individual stations use multiple different network arrangements; no universal AQ subscriber rule.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "Antarctica has an assigned +672 resource, but individual stations use multiple different network arrangements; no universal AQ subscriber rule."
  },
  {
    "id": 247,
    "name": "Bouvet Island",
    "alpha2": "BV",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "No standalone subscriber-number plan in the source metadata; do not assert that a number belongs to Bouvet Island.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "No standalone subscriber-number plan in the source metadata; do not assert that a number belongs to Bouvet Island."
  },
  {
    "id": 248,
    "name": "South Georgia and the South Sandwich Islands",
    "alpha2": "GS",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "No standalone supported region metadata; a real service may use a related administration’s or satellite network’s plan.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "No standalone supported region metadata; a real service may use a related administration’s or satellite network’s plan."
  },
  {
    "id": 249,
    "name": "Heard Island and McDonald Islands",
    "alpha2": "HM",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "No standalone supported region metadata; use the actual serving network if known.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "No standalone supported region metadata; use the actual serving network if known."
  },
  {
    "id": 250,
    "name": "Pitcairn",
    "alpha2": "PN",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "The libphonenumber FAQ documents no conventional standalone numbering plan and satellite use.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "The libphonenumber FAQ documents no conventional standalone numbering plan and satellite use."
  },
  {
    "id": 251,
    "name": "French Southern Territories",
    "alpha2": "TF",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "French Southern Territories not separately covered in Google metadata because numbering-plan information is insufficient; do not reuse all +262 ranges as TF-specific.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "French Southern Territories not separately covered in Google metadata because numbering-plan information is insufficient; do not reuse all +262 ranges as TF-specific."
  },
  {
    "id": 252,
    "name": "United States Minor Outlying Islands",
    "alpha2": "UM",
    "alpha3": "",
    "dialCode": "",
    "sampleE164": "",
    "sampleNsnDigits": 0,
    "validationRule": "UNSUPPORTED",
    "notes": "A set of outlying islands without a single standalone region numbering plan; use serving jurisdiction/operator instead.",
    "isUnMember": false,
    "isTerritory": true,
    "libphonenumberSupported": false,
    "unsupportedReason": "A set of outlying islands without a single standalone region numbering plan; use serving jurisdiction/operator instead."
  }
] as const;

export const ALL_REGIONS: readonly RegionRecord[] = [
  ...COUNTRY_REGISTRY,
  ...UNSUPPORTED_ISO_ENTITIES,
] as const;

// Fast lookup indexes
const BY_ALPHA2 = new Map<string, RegionRecord>();
const BY_ALPHA3 = new Map<string, RegionRecord>();
const BY_DIAL_CODE = new Map<string, RegionRecord[]>();

for (const region of ALL_REGIONS) {
  BY_ALPHA2.set(region.alpha2.toUpperCase(), region);
  if (region.alpha3) {
    BY_ALPHA3.set(region.alpha3.toUpperCase(), region);
  }
  if (region.dialCode) {
    const list = BY_DIAL_CODE.get(region.dialCode) || [];
    list.push(region);
    BY_DIAL_CODE.set(region.dialCode, list);
  }
}

/**
 * Retrieves a region record by its ISO alpha-2 or CLDR identifier (case-insensitive).
 */
export function getRegionByAlpha2(alpha2: string): RegionRecord | undefined {
  if (!alpha2) return undefined;
  return BY_ALPHA2.get(alpha2.trim().toUpperCase());
}

/**
 * Retrieves a region record by its ISO alpha-3 identifier (case-insensitive).
 */
export function getRegionByAlpha3(alpha3: string): RegionRecord | undefined {
  if (!alpha3) return undefined;
  return BY_ALPHA3.get(alpha3.trim().toUpperCase());
}

/**
 * Retrieves all regions sharing a specific ITU-T dialing code (e.g. "+1", "+44", "+256").
 */
export function getRegionsByDialCode(dialCode: string): RegionRecord[] {
  if (!dialCode) return [];
  const normalized = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return BY_DIAL_CODE.get(normalized) || [];
}

/**
 * Returns all supported countries and territories (245 records).
 */
export function getAllSupportedRegions(): readonly RegionRecord[] {
  return COUNTRY_REGISTRY;
}

/**
 * Normalizes text for search by stripping diacritics, punctuation, apostrophes, and whitespace.
 */
export function normalizeForSearch(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['’`.]/g, '')
    .trim();
}

/**
 * Common country aliases, acronyms, and colloquial names mapping.
 * Keyed by ISO 3166-1 alpha-2 code.
 */
export const COUNTRY_ALIASES: Record<string, readonly string[]> = {
  // East Africa & Horn of Africa
  UG: ['uganda', 'ug', 'kla', 'kampala', 'entebbe', 'jinja', 'mbarara', 'gulu'],
  KE: ['kenya', 'ke', 'nbi', 'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret'],
  TZ: ['tanzania', 'tz', 'dar es salaam', 'dodoma', 'zanzibar', 'arusha', 'mwanza', 'united republic of tanzania'],
  RW: ['rwanda', 'rw', 'kigali', 'butare', 'gisenyi'],
  BI: ['burundi', 'bi', 'bujumbura', 'gitega'],
  SS: ['south sudan', 'juba', 'malakal', 'wau'],
  SD: ['sudan', 'khartoum', 'omdurman', 'port sudan'],
  ET: ['ethiopia', 'addis ababa', 'habesha', 'oromia', 'amhara'],
  SO: ['somalia', 'mogadishu', 'hargeisa', 'somaliland', 'puntland'],
  DJ: ['djibouti', 'djibouti city'],
  ER: ['eritrea', 'asmara'],

  // West & Central Africa
  NG: ['nigeria', 'ng', 'lagos', 'abuja', 'kano', 'ibadan', 'port harcourt', 'benin city'],
  GH: ['ghana', 'gh', 'accra', 'kumasi', 'tema', 'tamale'],
  CM: ['cameroon', 'cameroun', 'yaounde', 'douala'],
  SN: ['senegal', 'dakar', 'thies'],
  CI: ['ivory coast', 'cote divoire', 'côte d\'ivoire', 'abidjan', 'yamoussoukro'],
  CD: ['drc', 'dr congo', 'congo kinshasa', 'congo drc', 'democratic republic of the congo', 'zaire', 'kinshasa', 'lubumbashi', 'goma'],
  CG: ['congo', 'republic of the congo', 'congo brazzaville', 'brazzaville', 'pointe-noire'],
  AO: ['angola', 'luanda', 'huambo'],
  GA: ['gabon', 'libreville', 'port-gentil'],
  GQ: ['equatorial guinea', 'malabo', 'bata'],
  ML: ['mali', 'bamako'],
  BF: ['burkina faso', 'ouagadougou', 'bobo-dioulasso'],
  NE: ['niger', 'niamey', 'zinder'],
  TD: ['chad', 'ndjamena'],
  TG: ['togo', 'lome', 'lomé'],
  BJ: ['benin', 'cotonou', 'porto-novo'],
  GN: ['guinea', 'conakry'],
  SL: ['sierra leone', 'freetown'],
  LR: ['liberia', 'monrovia'],
  GW: ['guinea-bissau', 'bissau'],
  CV: ['cape verde', 'cabo verde', 'praia'],
  ST: ['sao tome', 'são tomé', 'sao tome and principe', 'são tomé and príncipe'],
  CF: ['car', 'central african republic', 'central africa', 'bangui'],

  // Southern Africa
  ZA: ['rsa', 'south africa', 'joburg', 'johannesburg', 'cape town', 'durban', 'pretoria', 'soweto', 'bloemfontein', 'gqeberha'],
  ZM: ['zambia', 'lusaka', 'ndola', 'kitwe', 'livingstone'],
  ZW: ['zimbabwe', 'harare', 'bulawayo'],
  MW: ['malawi', 'lilongwe', 'blantyre', 'mzuzu'],
  MZ: ['mozambique', 'maputo', 'matola', 'beira'],
  BW: ['botswana', 'gaborone', 'francistown'],
  NA: ['namibia', 'windhoek', 'walvis bay'],
  LS: ['lesotho', 'maseru'],
  SZ: ['swaziland', 'eswatini', 'mbabane', 'manzini'],
  MG: ['madagascar', 'antananarivo'],
  MU: ['mauritius', 'port louis'],
  SC: ['seychelles', 'victoria'],
  KM: ['comoros', 'moroni'],

  // North Africa
  EG: ['egypt', 'misr', 'cairo', 'alexandria', 'giza', 'sharm el sheikh'],
  MA: ['morocco', 'maroc', 'rabat', 'casablanca', 'marrakech', 'tangier', 'fes'],
  DZ: ['algeria', 'algerie', 'algiers', 'oran', 'constantine'],
  TN: ['tunisia', 'tunis', 'sfax', 'sousse'],
  LY: ['libya', 'tripoli', 'benghazi', 'misrata'],
  MR: ['mauritania', 'nouakchott'],

  // Middle East
  AE: ['uae', 'united arab emirates', 'emirates', 'dubai', 'abu dhabi', 'sharjah', 'ajman', 'ras al khaimah', 'fujairah', 'al ain'],
  SA: ['ksa', 'saudi', 'saudi arabia', 'riyadh', 'jeddah', 'mecca', 'makkah', 'medina', 'madinah', 'dammam', 'khobar'],
  QA: ['qatar', 'doha', 'al wakrah'],
  KW: ['kuwait', 'kuwait city', 'salmiya'],
  BH: ['bahrain', 'manama', 'muharraq'],
  OM: ['oman', 'muscat', 'salalah'],
  YE: ['yemen', 'sanaa', 'aden', 'taiz'],
  IQ: ['iraq', 'baghdad', 'erbil', 'basra', 'mosul', 'sulaymaniyah'],
  JO: ['jordan', 'amman', 'zarqa', 'aqaba'],
  LB: ['lebanon', 'beirut', 'tripoli'],
  SY: ['syria', 'syrian arab republic', 'damascus', 'aleppo', 'homs'],
  IL: ['israel', 'tel aviv', 'jerusalem', 'haifa'],
  PS: ['palestine', 'state of palestine', 'gaza', 'west bank', 'ramallah', 'hebron', 'nablus'],
  IR: ['iran', 'islamic republic of iran', 'persia', 'tehran', 'mashhad', 'isfahan', 'shiraz'],

  // South Asia
  IN: ['india', 'bharat', 'hindustan', 'delhi', 'new delhi', 'mumbai', 'bombay', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'madras', 'kolkata', 'calcutta', 'pune', 'ahmedabad', 'noida', 'gurgaon'],
  PK: ['pakistan', 'karachi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar', 'faisalabad'],
  BD: ['bangladesh', 'dhaka', 'chittagong', 'sylhet', 'rajshahi'],
  LK: ['sri lanka', 'ceylon', 'colombo', 'kandy', 'galle'],
  NP: ['nepal', 'kathmandu', 'pokhara', 'lalitpur'],
  BT: ['bhutan', 'thimphu'],
  MV: ['maldives', 'male', 'hulhumale'],
  AF: ['afghanistan', 'kabul', 'kandahar', 'herat'],

  // East & Southeast Asia
  CN: ['prc', 'china', 'peoples republic of china', 'beijing', 'shanghai', 'shenzhen', 'guangzhou', 'chengdu', 'hangzhou', 'wuhan'],
  JP: ['japan', 'nippon', 'nihon', 'tokyo', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'sapporo'],
  KR: ['korea', 'south korea', 'republic of korea', 'rok', 'seoul', 'busan', 'incheon', 'daegu'],
  KP: ['north korea', 'dprk', 'pyongyang'],
  TW: ['taiwan', 'chinese taipei', 'roc', 'taipei', 'kaohsiung', 'taichung'],
  HK: ['hong kong', 'hk', 'kowloon'],
  MO: ['macau', 'macao'],
  SG: ['singapore', 'lion city'],
  MY: ['malaysia', 'kuala lumpur', 'kl', 'penang', 'johor bahru', 'george town'],
  ID: ['indonesia', 'jakarta', 'bali', 'surabaya', 'bandung', 'medan', 'yogyakarta'],
  TH: ['thailand', 'siam', 'bangkok', 'phuket', 'chiang mai', 'pattaya'],
  VN: ['vietnam', 'viet nam', 'hanoi', 'saigon', 'ho chi minh', 'da nang'],
  PH: ['philippines', 'filipino', 'pilipinas', 'manila', 'cebu', 'davao', 'quezon city', 'makati'],
  MM: ['burma', 'myanmar', 'yangon', 'rangoon', 'mandalay', 'naypyidaw'],
  KH: ['cambodia', 'phnom penh', 'siem reap'],
  LA: ['laos', 'lao pdr', 'vientiane', 'luang prabang'],
  MN: ['mongolia', 'ulaanbaatar'],
  BN: ['brunei', 'brunei darussalam', 'bandar seri begawan'],
  TL: ['east timor', 'timor', 'timor leste', 'dili'],

  // Central Asia
  KZ: ['kazakhstan', 'almaty', 'astana', 'nur-sultan', 'shymkent'],
  UZ: ['uzbekistan', 'tashkent', 'samarkand', 'bukhara'],
  KG: ['kyrgyzstan', 'bishkek', 'osh'],
  TJ: ['tajikistan', 'dushanbe'],
  TM: ['turkmenistan', 'ashgabat'],

  // Europe - Western & Central
  GB: ['uk', 'united kingdom', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland', 'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'cardiff', 'belfast', 'liverpool', 'leeds'],
  FR: ['france', 'republique francaise', 'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'bordeaux'],
  DE: ['germany', 'deutschland', 'berlin', 'munich', 'münchen', 'frankfurt', 'hamburg', 'cologne', 'köln', 'stuttgart', 'düsseldorf'],
  IT: ['italy', 'italia', 'rome', 'roma', 'milan', 'milano', 'naples', 'napoli', 'turin', 'torino', 'florence', 'firenze', 'venice'],
  ES: ['spain', 'espana', 'españa', 'madrid', 'barcelona', 'valencia', 'seville', 'sevilla', 'malaga', 'bilbao'],
  PT: ['portugal', 'lisbon', 'lisboa', 'porto', 'braga', 'faro'],
  NL: ['holland', 'netherlands', 'the netherlands', 'amsterdam', 'rotterdam', 'the hague', 'den haag', 'utrecht', 'eindhoven'],
  BE: ['belgium', 'belgique', 'belgie', 'brussels', 'bruxelles', 'antwerp', 'gent', 'bruges'],
  CH: ['switzerland', 'swiss', 'helvetia', 'schweiz', 'suisse', 'svizzera', 'zurich', 'geneva', 'bern', 'basel', 'lausanne'],
  AT: ['austria', 'oesterreich', 'österreich', 'vienna', 'wien', 'salzburg', 'innsbruck', 'graz'],
  IE: ['ireland', 'eire', 'éire', 'republic of ireland', 'dublin', 'cork', 'galway', 'limerick'],
  LU: ['luxembourg', 'luxembourg city'],
  MC: ['monaco', 'monte carlo'],
  LI: ['liechtenstein', 'vaduz'],
  SM: ['san marino'],
  VA: ['vatican', 'vatican city', 'holy see', 'the vatican'],
  AD: ['andorra', 'andorra la vella'],
  MT: ['malta', 'valletta', 'sliema'],

  // Europe - Northern / Nordic
  SE: ['sweden', 'sverige', 'stockholm', 'gothenburg', 'malmo', 'uppsala'],
  NO: ['norway', 'norge', 'oslo', 'bergen', 'trondheim', 'stavanger'],
  DK: ['denmark', 'danmark', 'copenhagen', 'københavn', 'aarhus', 'odense'],
  FI: ['finland', 'suomi', 'helsinki', 'espoo', 'tampere', 'vantaa'],
  IS: ['iceland', 'reykjavik'],

  // Europe - Eastern & Baltic
  PL: ['poland', 'polska', 'warsaw', 'warszawa', 'krakow', 'kraków', 'wroclaw', 'gdansk', 'poznan'],
  UA: ['ukraine', 'kyiv', 'kiev', 'lviv', 'odessa', 'kharkiv', 'dnipro'],
  CZ: ['czech', 'czech republic', 'czechia', 'prague', 'praha', 'brno', 'ostrava'],
  SK: ['slovakia', 'bratislava', 'kosice'],
  HU: ['hungary', 'magyarorszag', 'budapest', 'debrecen'],
  RO: ['romania', 'bucharest', 'cluj', 'timisoara', 'iasi'],
  BG: ['bulgaria', 'sofia', 'plovdiv', 'varna'],
  GR: ['greece', 'hellas', 'athens', 'thessaloniki', 'patras', 'heraklion'],
  CY: ['cyprus', 'nicosia', 'limassol', 'larnaca'],
  TR: ['turkey', 'turkiye', 'türkiye', 'istanbul', 'ankara', 'izmir', 'antalya', 'bursa'],
  RU: ['russia', 'russian federation', 'rf', 'moscow', 'saint petersburg', 'st petersburg', 'novosibirsk', 'yekaterinburg'],
  BY: ['belarus', 'minsk'],
  MD: ['moldova', 'republic of moldova', 'chisinau'],
  EE: ['estonia', 'eesti', 'tallinn', 'tartu'],
  LV: ['latvia', 'latvija', 'riga'],
  LT: ['lithuania', 'lietuva', 'vilnius', 'kaunas'],

  // Balkans & Caucasus
  RS: ['serbia', 'belgrade', 'novi sad'],
  HR: ['croatia', 'hrvatska', 'zagreb', 'split', 'dubrovnik', 'rijeka'],
  BA: ['bosnia', 'herzegovina', 'bih', 'bosnia and herzegovina', 'sarajevo', 'banja luka', 'mostar'],
  SI: ['slovenia', 'ljubljana', 'maribor'],
  ME: ['montenegro', 'podgorica'],
  AL: ['albania', 'shqiperia', 'tirana', 'durres'],
  MK: ['macedonia', 'north macedonia', 'fyrom', 'skopje'],
  XK: ['kosovo', 'pristina', 'prizren'],
  GE: ['georgia', 'tbilisi', 'batumi'],
  AM: ['armenia', 'yerevan'],
  AZ: ['azerbaijan', 'baku'],

  // Americas - North & Central
  US: ['usa', 'america', 'united states', 'united states of america', 'us of a', 'u.s.', 'u.s.a.', 'new york', 'california', 'texas', 'florida', 'washington', 'chicago', 'los angeles', 'houston', 'miami', 'san francisco'],
  CA: ['canada', 'ca', 'toronto', 'montreal', 'vancouver', 'ottawa', 'calgary', 'edmonton', 'quebec', 'winnipeg'],
  MX: ['mexico', 'méxico', 'cdmx', 'guadalajara', 'monterrey', 'cancun', 'puebla', 'tijuana'],
  GT: ['guatemala', 'guatemala city'],
  BZ: ['belize', 'belmopan', 'belize city'],
  SV: ['el salvador', 'san salvador'],
  HN: ['honduras', 'tegucigalpa', 'san pedro sula'],
  NI: ['nicaragua', 'managua'],
  CR: ['costa rica', 'san jose'],
  PA: ['panama', 'panama city'],

  // Caribbean
  CU: ['cuba', 'havana'],
  DO: ['dominican republic', 'dominicana', 'santo domingo', 'punta cana'],
  HT: ['haiti', 'port-au-prince'],
  JM: ['jamaica', 'kingston', 'montego bay'],
  TT: ['trinidad', 'tobago', 'trinidad and tobago', 'port of spain'],
  BB: ['barbados', 'bridgetown'],
  BS: ['bahamas', 'the bahamas', 'nassau'],
  LC: ['st lucia', 'st. lucia', 'saint lucia', 'castries'],
  VC: ['st vincent', 'st. vincent', 'saint vincent', 'saint vincent and the grenadines', 'kingstown'],
  GD: ['grenada', 'st georges'],
  AG: ['antigua', 'barbuda', 'antigua and barbuda', 'st johns'],
  DM: ['dominica', 'roseau'],
  KN: ['st kitts', 'st. kitts', 'saint kitts', 'st kitts and nevis', 'saint kitts and nevis', 'basseterre'],

  // South America
  BR: ['brazil', 'brasil', 'sao paulo', 'são paulo', 'rio', 'rio de janeiro', 'brasilia', 'salvador', 'fortaleza', 'belo horizonte'],
  AR: ['argentina', 'buenos aires', 'cordoba', 'rosario', 'mendoza'],
  CO: ['colombia', 'bogota', 'medellin', 'cali', 'barranquilla', 'cartagena'],
  PE: ['peru', 'perú', 'lima', 'cusco', 'arequipa'],
  CL: ['chile', 'santiago', 'valparaiso', 'concepcion'],
  VE: ['venezuela', 'bolivarian republic of venezuela', 'caracas', 'maracaibo', 'valencia'],
  EC: ['ecuador', 'quito', 'guayaquil', 'cuenca'],
  BO: ['bolivia', 'plurinational state of bolivia', 'la paz', 'santa cruz', 'sucre', 'cochabamba'],
  PY: ['paraguay', 'asuncion'],
  UY: ['uruguay', 'montevideo'],
  GY: ['guyana', 'georgetown'],
  SR: ['suriname', 'paramaribo'],

  // Oceania
  AU: ['australia', 'aussie', 'oz', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'gold coast'],
  NZ: ['new zealand', 'aotearoa', 'kiwi', 'auckland', 'wellington', 'christchurch', 'hamilton'],
  FJ: ['fiji', 'suva', 'nadi'],
  PG: ['png', 'papua new guinea', 'port moresby'],
  SB: ['solomon islands', 'honiara'],
  VU: ['vanuatu', 'port vila'],
  WS: ['samoa', 'apia'],
  TO: ['tonga', 'nukualofa'],
  FM: ['micronesia', 'federated states of micronesia', 'palikir'],
  PW: ['palau', 'ngerulmud', 'koror'],
  MH: ['marshall islands', 'majuro'],
  KI: ['kiribati', 'tarawa'],
  NR: ['nauru', 'yaren'],
  TV: ['tuvalu', 'funafuti'],

  // Territories & Dependencies
  PR: ['puerto rico', 'san juan'],
  GU: ['guam', 'hagatna'],
  VI: ['us virgin islands', 'usvi', 'charlotte amalie'],
  AS: ['american samoa', 'pago pago'],
  MP: ['saipan', 'northern mariana islands', 'cnmi'],
  BM: ['bermuda', 'hamilton'],
  KY: ['cayman islands', 'cayman', 'george town'],
  TC: ['turks and caicos', 'tci', 'cockburn town'],
  VG: ['british virgin islands', 'bvi', 'road town'],
  AI: ['anguilla', 'the valley'],
  MS: ['montserrat', 'brades'],
  GI: ['gibraltar'],
  FK: ['falkland islands', 'malvinas', 'stanley'],
  NC: ['new caledonia', 'noumea'],
  PF: ['french polynesia', 'tahiti', 'papeete'],
  WF: ['wallis and futuna', 'mata-utu'],
  YT: ['mayotte', 'mamoudzou'],
  RE: ['reunion', 'réunion', 'saint-denis'],
  GP: ['guadeloupe', 'basse-terre'],
  MQ: ['martinique', 'fort-de-france'],
  GF: ['french guiana', 'cayenne'],
  BL: ['st barts', 'st. barts', 'st barthelemy', 'saint barthelemy', 'gustavia'],
  MF: ['st martin', 'st. martin', 'saint martin', 'marigot'],
  PM: ['st pierre', 'st. pierre', 'saint pierre', 'saint pierre and miquelon'],
  AW: ['aruba', 'oranjestad'],
  CW: ['curacao', 'curaçao', 'willemstad'],
  SX: ['sint maarten', 'st maarten', 'philipsburg'],
  BQ: ['bonaire', 'sint eustatius', 'saba', 'caribbean netherlands', 'kralendijk'],
  GL: ['greenland', 'kalaallit nunaat', 'nuuk'],
  FO: ['faeroe', 'faroe', 'faroe islands', 'torshavn'],
  AX: ['aland', 'åland', 'aland islands', 'åland islands', 'mariehamn'],
  SJ: ['svalbard', 'jan mayen', 'longyearbyen'],
  IM: ['isle of man', 'mann', 'douglas'],
  JE: ['jersey', 'st helier'],
  GG: ['guernsey', 'alderney', 'sark', 'st peter port'],
  SH: ['st helena', 'st. helena', 'saint helena', 'ascension', 'tristan da cunha', 'jamestown'],
  IO: ['diego garcia', 'british indian ocean territory', 'biot'],
  CK: ['cook islands', 'rarotonga'],
  NU: ['niue', 'alofi'],
  TK: ['tokelau'],
};

interface SearchableRegion {
  region: RegionRecord;
  normalizedName: string;
  nameWords: string[];
  cleanDialCode: string;
  normalizedAlpha2: string;
  normalizedAlpha3: string;
  normalizedAliases: string[];
}

// Pre-index regions once at startup for sub-millisecond search performance
const SEARCHABLE_REGIONS: SearchableRegion[] = ALL_REGIONS.map((region) => {
  const normalizedName = normalizeForSearch(region.name);
  const nameWords = normalizedName.split(/\s+/).filter(Boolean);
  const cleanDialCode = region.dialCode.replace(/\D/g, '');
  const normalizedAlpha2 = region.alpha2.toLowerCase();
  const normalizedAlpha3 = region.alpha3.toLowerCase();
  const rawAliases = COUNTRY_ALIASES[region.alpha2] || [];
  const normalizedAliases = rawAliases.map(normalizeForSearch);

  return {
    region,
    normalizedName,
    nameWords,
    cleanDialCode,
    normalizedAlpha2,
    normalizedAlpha3,
    normalizedAliases,
  };
});

/**
 * Searches the registry by country name, ISO code, dialing code, common aliases, or pasted telephone number.
 * Results are sorted by relevance match score.
 */
export function searchRegions(
  query: string,
  options?: { unOnly?: boolean; territoryOnly?: boolean }
): RegionRecord[] {
  const raw = (query || '').trim();

  // If query is empty, filter by options and preserve standard order
  if (!raw) {
    return ALL_REGIONS.filter((region) => {
      if (options?.unOnly && !region.isUnMember) return false;
      if (options?.territoryOnly && !region.isTerritory) return false;
      return true;
    });
  }

  const cleanText = normalizeForSearch(raw);
  const cleanQueryLower = raw.toLowerCase();
  const cleanDigits = raw.replace(/\D/g, '');
  const isPhonePattern = raw.startsWith('+') || raw.startsWith('00') || /^\d+$/.test(raw);

  const scored: { region: RegionRecord; score: number }[] = [];

  for (let i = 0; i < SEARCHABLE_REGIONS.length; i++) {
    const item = SEARCHABLE_REGIONS[i];
    const { region } = item;

    if (options?.unOnly && !region.isUnMember) continue;
    if (options?.territoryOnly && !region.isTerritory) continue;

    let score = 0;

    // 1. Exact ISO code matches (highest priority)
    if (cleanText === item.normalizedAlpha2) {
      score = Math.max(score, 100);
    } else if (cleanText === item.normalizedAlpha3) {
      score = Math.max(score, 95);
    }

    // 2. Exact dial code match
    if (item.cleanDialCode && (raw === region.dialCode || cleanDigits === item.cleanDialCode)) {
      score = Math.max(score, 98);
    }

    // 3. Exact alias match (e.g. "uk" -> United Kingdom, "usa" -> United States)
    if (item.normalizedAliases.some((a) => a === cleanText)) {
      score = Math.max(score, 92);
    }

    // 4. Name starts with query
    if (item.normalizedName.startsWith(cleanText)) {
      score = Math.max(score, 88);
    }

    // 5. Any alias starts with query
    if (item.normalizedAliases.some((a) => a.startsWith(cleanText))) {
      score = Math.max(score, 82);
    }

    // 6. Pasted telephone number or partial dial code match
    if (cleanDigits && item.cleanDialCode) {
      // User typed or pasted a full phone number starting with the country's dial code
      // (e.g., "+256772123456" or "256772123456" matches Uganda +256)
      if (cleanDigits.length >= item.cleanDialCode.length && cleanDigits.startsWith(item.cleanDialCode)) {
        let phoneMatchScore = 78;
        // Disambiguate NANP (+1), +7, and +44 shared dial codes if full number is entered
        if (item.cleanDialCode === '1' && cleanDigits.length >= 4) {
          const areaCode = cleanDigits.slice(1, 4);
          if (NANP_AREA_CODE_MAP[areaCode] === region.alpha2) {
            phoneMatchScore = 96; // highly specific area code match (e.g. 242 Bahamas)
          } else if (region.alpha2 === 'US') {
            phoneMatchScore = 95; // primary sovereign NANP country
          } else if (region.alpha2 === 'CA') {
            phoneMatchScore = 94; // Canada
          }
        } else if (item.cleanDialCode === '7' && cleanDigits.length >= 2) {
          const firstNsn = cleanDigits[1];
          if ((firstNsn === '6' || firstNsn === '7') && region.alpha2 === 'KZ') {
            phoneMatchScore = 96; // Kazakhstan
          } else if (region.alpha2 === 'RU') {
            phoneMatchScore = 95; // Russia
          }
        } else if (item.cleanDialCode === '44' && cleanDigits.length >= 4) {
          if (region.alpha2 === 'GB') {
            phoneMatchScore = 95; // United Kingdom primary
          }
        }
        score = Math.max(score, phoneMatchScore);
      }
      // Partial dial code typed (e.g., "+25" or "25" matches "+254", "+256")
      else if (item.cleanDialCode.startsWith(cleanDigits)) {
        score = Math.max(score, 72);
      }
      // Query contains the dial code
      else if (isPhonePattern && region.dialCode.includes(raw)) {
        score = Math.max(score, 68);
      }
    }

    // 7. Word in country name starts with query (e.g. "Kingdom" in "United Kingdom")
    if (item.nameWords.some((w) => w.startsWith(cleanText))) {
      score = Math.max(score, 65);
    }

    // 8. Name contains query substring
    if (item.normalizedName.includes(cleanText) || region.name.toLowerCase().includes(cleanQueryLower)) {
      score = Math.max(score, 55);
    }

    // 9. Alias contains query substring
    if (item.normalizedAliases.some((a) => a.includes(cleanText))) {
      score = Math.max(score, 45);
    }

    if (score > 0) {
      // Sovereign UN states get a minor tiebreak priority over uninhabited dependencies
      const tieBreak = region.isUnMember ? 1 : 0;
      scored.push({ region, score: score + tieBreak });
    }
  }

  // Sort descending by score, then alphabetically by country name
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.region.name.localeCompare(b.region.name);
  });

  return scored.map((s) => s.region);
}

/**
 * NANP (+1) Area Code to Region Mapping.
 * Disambiguates +1 numbers between US, CA, and Caribbean territories.
 */
export const NANP_AREA_CODE_MAP: Record<string, string> = {
  // Caribbean & Atlantic NANP regions
  '242': 'BS', // Bahamas
  '246': 'BB', // Barbados
  '264': 'AI', // Anguilla
  '268': 'AG', // Antigua and Barbuda
  '284': 'VG', // British Virgin Islands
  '340': 'VI', // US Virgin Islands
  '345': 'KY', // Cayman Islands
  '441': 'BM', // Bermuda
  '473': 'GD', // Grenada
  '649': 'TC', // Turks and Caicos
  '658': 'JM', // Jamaica
  '664': 'MS', // Montserrat
  '670': 'MP', // Northern Mariana Islands
  '671': 'GU', // Guam
  '684': 'AS', // American Samoa
  '721': 'SX', // Sint Maarten
  '758': 'LC', // Saint Lucia
  '767': 'DM', // Dominica
  '784': 'VC', // Saint Vincent and the Grenadines
  '787': 'PR', // Puerto Rico
  '809': 'DO', // Dominican Republic
  '829': 'DO', // Dominican Republic
  '849': 'DO', // Dominican Republic
  '868': 'TT', // Trinidad and Tobago
  '869': 'KN', // Saint Kitts and Nevis
  '876': 'JM', // Jamaica
  '939': 'PR', // Puerto Rico

  // Canadian NPAs
  '204': 'CA', '226': 'CA', '236': 'CA', '249': 'CA', '250': 'CA', '289': 'CA',
  '306': 'CA', '343': 'CA', '365': 'CA', '367': 'CA', '403': 'CA', '416': 'CA',
  '418': 'CA', '438': 'CA', '450': 'CA', '506': 'CA', '514': 'CA', '519': 'CA',
  '548': 'CA', '579': 'CA', '581': 'CA', '587': 'CA', '604': 'CA', '613': 'CA',
  '639': 'CA', '647': 'CA', '672': 'CA', '705': 'CA', '709': 'CA', '778': 'CA',
  '780': 'CA', '782': 'CA', '807': 'CA', '819': 'CA', '825': 'CA', '867': 'CA',
  '873': 'CA', '902': 'CA', '905': 'CA',
};

/**
 * Resolves candidate regions for a telephone number, with disambiguation for shared calling codes.
 */
export function resolveCandidateRegions(
  dialCode: string,
  nsnDigits: string,
  preferredRegion?: string
): {
  primaryRegion?: RegionRecord;
  candidateRegions: RegionRecord[];
  isAmbiguous: boolean;
} {
  const candidates = getRegionsByDialCode(dialCode);
  if (candidates.length === 0) {
    return { candidateRegions: [], isAmbiguous: false };
  }

  if (candidates.length === 1) {
    return {
      primaryRegion: candidates[0],
      candidateRegions: candidates,
      isAmbiguous: false,
    };
  }

  // Shared calling code disambiguation:
  // 1. NANP (+1): Check 3-digit Area Code
  if (dialCode === '+1' && nsnDigits.length >= 3) {
    const areaCode = nsnDigits.slice(0, 3);
    const mappedAlpha2 = NANP_AREA_CODE_MAP[areaCode];
    if (mappedAlpha2) {
      const match = candidates.find((c) => c.alpha2 === mappedAlpha2);
      if (match) {
        return {
          primaryRegion: match,
          candidateRegions: candidates,
          isAmbiguous: false,
        };
      }
    }
    // Default NANP fallbacks if preferred region provided
    if (preferredRegion) {
      const pref = candidates.find((c) => c.alpha2 === preferredRegion.toUpperCase());
      if (pref) {
        return {
          primaryRegion: pref,
          candidateRegions: candidates,
          isAmbiguous: true,
        };
      }
    }
    // Ambiguous between US and others
    const usRegion = candidates.find((c) => c.alpha2 === 'US');
    return {
      primaryRegion: usRegion,
      candidateRegions: candidates,
      isAmbiguous: true,
    };
  }

  // 2. Russia / Kazakhstan (+7)
  if (dialCode === '+7' && nsnDigits.length >= 1) {
    const firstDigit = nsnDigits[0];
    if (firstDigit === '6' || firstDigit === '7') {
      // 76x, 77x allocated to Kazakhstan
      const kz = candidates.find((c) => c.alpha2 === 'KZ');
      if (kz) {
        return { primaryRegion: kz, candidateRegions: candidates, isAmbiguous: false };
      }
    }
    const ru = candidates.find((c) => c.alpha2 === 'RU');
    return { primaryRegion: ru, candidateRegions: candidates, isAmbiguous: true };
  }

  // 3. Italy / Vatican (+39)
  if (dialCode === '+39') {
    if (nsnDigits.startsWith('06698')) {
      const va = candidates.find((c) => c.alpha2 === 'VA');
      if (va) return { primaryRegion: va, candidateRegions: candidates, isAmbiguous: false };
    }
    const it = candidates.find((c) => c.alpha2 === 'IT');
    return { primaryRegion: it, candidateRegions: candidates, isAmbiguous: false };
  }

  // 4. UK / Channel Islands / Isle of Man (+44)
  if (dialCode === '+44') {
    if (nsnDigits.startsWith('7781') || nsnDigits.startsWith('1481')) {
      const gg = candidates.find((c) => c.alpha2 === 'GG');
      if (gg) return { primaryRegion: gg, candidateRegions: candidates, isAmbiguous: false };
    }
    if (nsnDigits.startsWith('7797') || nsnDigits.startsWith('1534')) {
      const je = candidates.find((c) => c.alpha2 === 'JE');
      if (je) return { primaryRegion: je, candidateRegions: candidates, isAmbiguous: false };
    }
    if (nsnDigits.startsWith('7924') || nsnDigits.startsWith('1624')) {
      const im = candidates.find((c) => c.alpha2 === 'IM');
      if (im) return { primaryRegion: im, candidateRegions: candidates, isAmbiguous: false };
    }
    const gb = candidates.find((c) => c.alpha2 === 'GB');
    return { primaryRegion: gb, candidateRegions: candidates, isAmbiguous: true };
  }

  // 5. Australia / Christmas / Cocos (+61)
  if (dialCode === '+61') {
    const au = candidates.find((c) => c.alpha2 === 'AU');
    return { primaryRegion: au, candidateRegions: candidates, isAmbiguous: true };
  }

  // 6. Morocco / Western Sahara (+212)
  if (dialCode === '+212') {
    const ma = candidates.find((c) => c.alpha2 === 'MA');
    return { primaryRegion: ma, candidateRegions: candidates, isAmbiguous: true };
  }

  // 7. Mayotte / Réunion (+262)
  if (dialCode === '+262') {
    if (nsnDigits.startsWith('639') || nsnDigits.startsWith('269')) {
      const yt = candidates.find((c) => c.alpha2 === 'YT');
      if (yt) return { primaryRegion: yt, candidateRegions: candidates, isAmbiguous: false };
    }
    const re = candidates.find((c) => c.alpha2 === 'RE');
    return { primaryRegion: re, candidateRegions: candidates, isAmbiguous: true };
  }

  // If a preferred region is specified and is in candidates
  if (preferredRegion) {
    const match = candidates.find((c) => c.alpha2 === preferredRegion.toUpperCase());
    if (match) {
      return { primaryRegion: match, candidateRegions: candidates, isAmbiguous: true };
    }
  }

  return {
    primaryRegion: candidates[0],
    candidateRegions: candidates,
    isAmbiguous: true,
  };
}
