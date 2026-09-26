'use client';

import * as React from 'react';
import { CheckCircle2, Copy, Check, Send } from 'lucide-react';
import { PORTAL_COLORS } from './portal-tokens';

interface PortalHeroProps {
  environment: 'sandbox' | 'production';
}

type HeroLang = 'curl' | 'nodejs' | 'python' | 'php';

export function PortalHero({ environment: _environment }: PortalHeroProps) {
  const [activeLang, setActiveLang] = React.useState<HeroLang>('curl');
  const [copied, setCopied] = React.useState(false);

  const endpointUrl = 'https://api.range.co.ug/v1/sms/send';

  const snippets: Record<HeroLang, { lines: string[]; full: string }> = {
    curl: {
      lines: [
        'curl -X POST \\',
        `  ${endpointUrl} \\`,
        '  -H "Authorization: Bearer YOUR_API_KEY" \\',
        '  -H "Content-Type: application/json" \\',
        '  -d \'{"to": "+256700123456", "message": "Your OTP is 849201", "senderId": "RANGE"}\'',
      ],
      full: `curl -X POST \\\n  ${endpointUrl} \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"to": "+256700123456", "message": "Your OTP is 849201", "senderId": "RANGE"}'`,
    },
    nodejs: {
      lines: [
        `const res = await axios.post('${endpointUrl}', {`,
        "  to: '+256700123456',",
        "  message: 'Your OTP is 849201',",
        "  senderId: 'RANGE'",
        '}, {',
        "  headers: { Authorization: 'Bearer YOUR_API_KEY' }",
        '});',
      ],
      full: `const res = await axios.post('${endpointUrl}', {\n  to: '+256700123456',\n  message: 'Your OTP is 849201',\n  senderId: 'RANGE'\n}, {\n  headers: { Authorization: 'Bearer YOUR_API_KEY' }\n});`,
    },
    python: {
      lines: [
        'import requests',
        `res = requests.post('${endpointUrl}', json={`,
        "  'to': '+256700123456',",
        "  'message': 'Your OTP is 849201',",
        "  'senderId': 'RANGE'",
        "}, headers={'Authorization': 'Bearer YOUR_API_KEY'})",
      ],
      full: `import requests\nres = requests.post('${endpointUrl}', json={\n  'to': '+256700123456',\n  'message': 'Your OTP is 849201',\n  'senderId': 'RANGE'\n}, headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
    },
    php: {
      lines: [
        `$ch = curl_init('${endpointUrl}');`,
        'curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([',
        "  'to' => '+256700123456', 'message' => 'Your OTP is 849201', 'senderId' => 'RANGE'",
        ']));',
        'curl_setopt($ch, CURLOPT_HTTPHEADER, [',
        "  'Authorization: Bearer YOUR_API_KEY', 'Content-Type: application/json'",
        ']);',
        '$response = curl_exec($ch);',
      ],
      full: `$ch = curl_init('${endpointUrl}');\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([\n  'to' => '+256700123456', 'message' => 'Your OTP is 849201', 'senderId' => 'RANGE'\n]));\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n  'Authorization: Bearer YOUR_API_KEY', 'Content-Type: application/json'\n]);\n$response = curl_exec($ch);`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang].full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full py-2 sm:py-4 lg:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-w-0">
        {/* Left column: Title & benefits */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4 min-w-0">
          <span
            className="inline-block text-xs font-semibold tracking-wide uppercase"
            style={{ color: PORTAL_COLORS.accentBlue }}
          >
            API Reference
          </span>

          <h1
            className="text-2xl sm:text-3xl lg:text-[42px] font-black tracking-tight leading-tight"
            style={{ color: PORTAL_COLORS.primaryText }}
          >
            Range <span style={{ color: PORTAL_COLORS.primaryText }}>SMS API</span>
          </h1>

          <p
            className="text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl"
            style={{ color: PORTAL_COLORS.secondaryText }}
          >
            Integrate powerful messaging capabilities into your application with simple, reliable and scalable APIs.
          </p>

          {/* 3 Benefit Pills */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2">
            {[
              'Simple & RESTful',
              'Reliable Delivery',
              'Developer Friendly',
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium"
                style={{ color: PORTAL_COLORS.primaryText }}
              >
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(32, 213, 160, 0.15)', color: PORTAL_COLORS.successGreen }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Interactive Code Preview Window & Floating illustration badge */}
        <div className="lg:col-span-6 relative min-w-0 max-w-full">
          {/* Subtle background decorative glow / dot pattern */}
          <div className="absolute -inset-2 bg-blue-500/5 blur-2xl rounded-3xl -z-10" />

          <div
            className="relative rounded-2xl border shadow-xl overflow-hidden min-w-0 max-w-full"
            style={{
              backgroundColor: PORTAL_COLORS.cardBg,
              borderColor: PORTAL_COLORS.border,
            }}
          >
            {/* Top tab bar */}
            <div
              className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b gap-2"
              style={{
                backgroundColor: PORTAL_COLORS.headerBg,
                borderColor: PORTAL_COLORS.border,
              }}
            >
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                {(
                  [
                    { id: 'curl', label: 'cURL' },
                    { id: 'nodejs', label: 'Node.js' },
                    { id: 'python', label: 'Python' },
                    { id: 'php', label: 'PHP' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeLang === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLang(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'shadow-xs border font-bold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? PORTAL_COLORS.elevatedBg : 'transparent',
                        color: isActive ? PORTAL_COLORS.accentBlue : PORTAL_COLORS.secondaryText,
                        borderColor: isActive ? PORTAL_COLORS.accentBlue : 'transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Copy Code button */}
              <button
                onClick={handleCopy}
                aria-label="Copy code sample"
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white border border-emerald-600 hover:border-emerald-700 shadow-sm'
                    : 'hover:opacity-80'
                }`}
                style={
                  copied
                    ? undefined
                    : { color: PORTAL_COLORS.secondaryText }
                }
              >
                {copied ? (
                  <Check className="h-4 w-4 text-white stroke-[2.5]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Code Body with line numbers */}
            <div
              className="p-4 sm:p-5 font-mono text-xs overflow-x-auto bg-[#07163D] text-slate-100"
            >
              {activeLang === 'curl' ? (
                <div className="space-y-1 font-mono leading-relaxed">
                  <div className="flex gap-4">
                    <span className="select-none text-right w-4 shrink-0 text-slate-500">1</span>
                    <span>
                      <span className="text-sky-400">curl</span>{' '}
                      <span className="text-slate-300">-X</span>{' '}
                      <span className="text-emerald-400 font-bold">GET</span>{' '}
                      <span className="text-slate-300">\</span>
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="select-none text-right w-4 shrink-0 text-slate-500">2</span>
                    <span>
                      {'  '}
                      <span className="text-slate-100">https://api.range.co.ug/v1/wallet/balance</span>{' '}
                      <span className="text-slate-300">\</span>
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="select-none text-right w-4 shrink-0 text-slate-500">3</span>
                    <span>
                      {'  '}
                      <span className="text-slate-300">-H</span>{' '}
                      <span className="text-emerald-400">&quot;Authorization:</span>{' '}
                      <span className="text-amber-300">Bearer YOUR_API_KEY&quot;</span>
                    </span>
                  </div>
                </div>
              ) : (
                snippets[activeLang].lines.map((line, idx) => (
                  <div key={idx} className="flex gap-4 leading-relaxed font-mono">
                    <span
                      className="select-none text-right w-4 shrink-0 font-mono text-slate-500"
                    >
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre text-slate-200">
                      {line}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Background Decorative Dot Mesh Pattern (matching screenshot) */}
          <div className="hidden xl:block absolute -top-12 -left-12 w-64 h-64 pointer-events-none -z-10 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
              <defs>
                <pattern id="dot-mesh" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill={PORTAL_COLORS.accentBlue} />
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#dot-mesh)" />
            </svg>
          </div>

          {/* Floating badge: "Send Smarter" with cursive slogan matching reference screenshot */}
          <div className="hidden xl:flex items-center gap-3 absolute -top-8 -right-8 z-20 pointer-events-none">
            {/* Glassmorphic badge card */}
            <div
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: PORTAL_COLORS.cardBg,
                borderColor: PORTAL_COLORS.borderLight,
              }}
            >
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs text-white dark:text-[#0B1729]"
                style={{
                  backgroundColor: PORTAL_COLORS.accentBlue,
                }}
              >
                <Send className="h-4 w-4" />
              </div>
              <div className="leading-tight pr-1">
                <div className="text-[11px] font-bold tracking-tight" style={{ color: PORTAL_COLORS.primaryText }}>
                  Send
                </div>
                <div className="text-[11px] font-bold tracking-tight" style={{ color: PORTAL_COLORS.primaryText }}>
                  Smarter
                </div>
              </div>
            </div>

            {/* Handwritten cursive text with curved underline swoosh */}
            <div className="relative -rotate-2 select-none">
              <span
                className="font-serif italic text-xs font-semibold tracking-wide block text-amber-600 dark:text-[#FFCC24]"
              >
                Messages Move Business Forward
              </span>
              <svg
                className="w-full h-2 mt-0.5 text-amber-600 dark:text-[#FFCC24]"
                viewBox="0 0 160 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 5C40 1.5 95 1.5 158 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
