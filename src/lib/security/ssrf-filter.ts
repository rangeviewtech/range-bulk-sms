import dns from 'dns';
import net from 'net';

/**
 * Result of SSRF validation
 */
export interface SsrfValidationResult {
  isSafe: boolean;
  reason?: string;
  resolvedIps?: string[];
  normalizedUrl?: string;
}

/**
 * Checks whether an IPv4 address is in a reserved or private range.
 */
export function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (RFC 1918 Private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local, AWS/GCP/Azure IMDS metadata)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 192 && b === 88 && parts[2] === 99) return true;

  // 192.168.0.0/16 (RFC 1918 Private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Network Benchmark Tests: 198.18.0.0 - 198.19.255.255)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;

  // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a reserved or private range.
 */
export function isPrivateOrReservedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  // Loopback (::1)
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified (::)
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (normalized.startsWith('::ffff:') || normalized.startsWith('0:0:0:0:0:ffff:')) {
    const ipv4Part = normalized.split(':').pop();
    if (ipv4Part && ipv4Part.includes('.')) {
      return isPrivateOrReservedIpv4(ipv4Part);
    }
    return true; // Conservatively block non-standard mapped format
  }

  // Unique Local Addresses (fc00::/7 - fc00 to fdff)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-Local Unicast (fe80::/10 - fe80 to febf)
  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  // Multicast (ff00::/8)
  if (normalized.startsWith('ff')) return true;

  // Documentation / Discard (2001:db8::, 100::)
  if (normalized.startsWith('2001:db8') || normalized.startsWith('100:')) return true;

  return false;
}

/**
 * Validates a URL against Server-Side Request Forgery (SSRF) vulnerabilities.
 */
export async function validateSsrfUrl(
  urlString: string,
  options: { allowPrivateInDev?: boolean } = {}
): Promise<SsrfValidationResult> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(urlString);
  } catch {
    return { isSafe: false, reason: 'Malformed URL format' };
  }

  // Enforce HTTP / HTTPS protocol only
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isSafe: false,
      reason: `Unsupported protocol '${parsedUrl.protocol}'. Only http and https are permitted.`,
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase().trim();

  // Reject empty or whitespace host
  if (!hostname) {
    return { isSafe: false, reason: 'Empty hostname' };
  }

  // Check dangerous local host aliases
  const blockedHostnames = [
    'localhost',
    'localhost.localdomain',
    'local',
    'broadcasthost',
    'instance-data',
    'metadata.google.internal',
    'metadata.internal',
  ];

  if (
    blockedHostnames.includes(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isSafe: false, reason: `Blocked hostname '${hostname}'` };
  }

  // If allowPrivateInDev is explicitly enabled in dev/test environment
  if (options.allowPrivateInDev && process.env.NODE_ENV !== 'production') {
    return { isSafe: true, normalizedUrl: parsedUrl.toString() };
  }

  // Check if hostname is directly an IP address
  const ipType = net.isIP(hostname);
  if (ipType === 4) {
    if (isPrivateOrReservedIpv4(hostname)) {
      return { isSafe: false, reason: `Direct access to private or reserved IPv4 '${hostname}' is prohibited.` };
    }
    return { isSafe: true, resolvedIps: [hostname], normalizedUrl: parsedUrl.toString() };
  } else if (ipType === 6) {
    if (isPrivateOrReservedIpv6(hostname)) {
      return { isSafe: false, reason: `Direct access to private or reserved IPv6 '${hostname}' is prohibited.` };
    }
    return { isSafe: true, resolvedIps: [hostname], normalizedUrl: parsedUrl.toString() };
  }

  // Resolve hostname via DNS to prevent DNS rebinding or internal domain mapping
  try {
    const lookupResults = await dns.promises.lookup(hostname, { all: true });

    if (!lookupResults || lookupResults.length === 0) {
      return { isSafe: false, reason: `DNS resolution failed for hostname '${hostname}'` };
    }

    const resolvedIps = lookupResults.map((r) => r.address);

    for (const res of lookupResults) {
      if (res.family === 4 && isPrivateOrReservedIpv4(res.address)) {
        return {
          isSafe: false,
          reason: `Hostname '${hostname}' resolved to private IPv4 '${res.address}'. Request blocked.`,
          resolvedIps,
        };
      }
      if (res.family === 6 && isPrivateOrReservedIpv6(res.address)) {
        return {
          isSafe: false,
          reason: `Hostname '${hostname}' resolved to private IPv6 '${res.address}'. Request blocked.`,
          resolvedIps,
        };
      }
    }

    return {
      isSafe: true,
      resolvedIps,
      normalizedUrl: parsedUrl.toString(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'DNS lookup error';
    return { isSafe: false, reason: `DNS lookup failed for '${hostname}': ${message}` };
  }
}

/**
 * Safe fetch wrapper that validates the initial URL and any redirect locations against SSRF.
 */
export async function safeSsrfFetch(
  url: string,
  init: RequestInit = {},
  maxRedirects = 3
): Promise<Response> {
  let currentUrl = url;
  let redirectsRemaining = maxRedirects;

  while (redirectsRemaining >= 0) {
    const validation = await validateSsrfUrl(currentUrl);
    if (!validation.isSafe) {
      throw new Error(`SSRF Prevention: Delivery blocked. ${validation.reason}`);
    }

    // Set manual redirect so we can audit every hop
    const fetchOptions: RequestInit = {
      ...init,
      redirect: 'manual',
    };

    const response = await fetch(currentUrl, fetchOptions);

    // If response is a redirect status (301, 302, 303, 307, 308), validate location
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('Location');
      if (!location) {
        return response; // No location header, return redirect as-is
      }

      // Resolve relative redirects against current URL
      const nextUrl = new URL(location, currentUrl).toString();
      currentUrl = nextUrl;
      redirectsRemaining -= 1;
      continue;
    }

    return response;
  }

  throw new Error(`SSRF Prevention: Maximum redirect limit (${maxRedirects}) exceeded`);
}
