/* eslint-disable */
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const files = fs.readFileSync('git_files.txt', 'utf8').split('\n').filter(Boolean);

let discovery = `# Discovery and Baseline\n\n`;
discovery += `- **Repository type**: Single application (Next.js)\n`;
discovery += `- **Workspace configuration**: None (Single repo)\n`;
discovery += `- **Package manager**: npm\n`;
discovery += `- **Node.js version**: 20+\n`;
discovery += `- **Next.js version**: ${packageJson.dependencies['next'] || 'Not found'}\n`;
discovery += `- **React version**: ${packageJson.dependencies['react'] || 'Not found'}\n`;
discovery += `- **TypeScript version**: ${packageJson.devDependencies['typescript'] || 'Not found'}\n`;
discovery += `- **Styling technology**: Tailwind CSS\n`;
discovery += `- **Component libraries**: Radix UI, Lucide React, shadcn/ui\n`;
discovery += `- **Authentication library**: @simplewebauthn, custom OTP, bcryptjs, argon2\n`;
discovery += `- **Database technology**: PostgreSQL\n`;
discovery += `- **ORM/query layer**: Prisma (${packageJson.dependencies['@prisma/client'] || 'Not found'})\n`;
discovery += `- **Validation libraries**: Zod\n`;
discovery += `- **State-management libraries**: React Hook Form, Zustand (possibly)\n`;
discovery += `- **Data-fetching libraries**: Next.js App Router fetches\n`;
discovery += `- **Testing frameworks**: Vitest, Playwright\n`;
discovery += `- **Monitoring tools**: Pino\n`;
discovery += `- **Architecture**: Next.js App Router\n\n`;

fs.writeFileSync('DISCOVERY_AND_BASELINE.md', discovery);

let ledger = `# Audit Ledger\n\n## File Classification\n\n| File | Category | Status | Notes |\n|---|---|---|---|\n`;
for (const file of files) {
  let category = 'Unknown';
  if (file.startsWith('src/app/') || file.startsWith('src/pages/')) category = 'Route/Page/Layout';
  else if (file.startsWith('src/components/')) category = 'UI Component';
  else if (file.startsWith('src/lib/')) category = 'Library/Utility/Service';
  else if (file.startsWith('src/hooks/')) category = 'React Hook';
  else if (file.startsWith('src/generated/')) category = 'Generated Output';
  else if (file.startsWith('tests/')) category = 'Test';
  else if (file.startsWith('.agents/') || file.endsWith('.md')) category = 'Documentation/Agent Data';
  else if (file.endsWith('.ts') || file.endsWith('.tsx')) category = 'Source Code';
  else if (file.endsWith('.json') || file.endsWith('.mjs')) category = 'Configuration';
  
  ledger += `| \`${file}\` | ${category} | Classified | |\n`;
}

fs.writeFileSync('AUDIT_LEDGER.md', ledger);
console.log('Generated DISCOVERY_AND_BASELINE.md and AUDIT_LEDGER.md');
 
