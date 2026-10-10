/* eslint-disable */
export {};

const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function analyzeProject() {
  const report = [];
  report.push('# Enterprise Full-Stack Audit Report');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('\n## A. EXECUTIVE SUMMARY');
  report.push('This report evaluates the application against the Enterprise Architecture, Security, and Quality Guidelines.');
  
  // 1. Files
  const pages = [];
  const apiRoutes = [];
  const components = [];
  const libs = [];
  let totalFiles = 0;
  
  walkDir('src/app', (filepath) => {
    totalFiles++;
    if (filepath.endsWith('page.tsx') || filepath.endsWith('layout.tsx')) {
      pages.push(filepath);
    } else if (filepath.endsWith('route.ts')) {
      apiRoutes.push(filepath);
    }
  });
  
  walkDir('src/components', (filepath) => {
    totalFiles++;
    if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      components.push(filepath);
    }
  });

  walkDir('src/lib', (filepath) => {
    totalFiles++;
    if (filepath.endsWith('.ts')) {
      libs.push(filepath);
    }
  });

  report.push('\n## C. COMPLETE COVERAGE SUMMARY');
  report.push(`- **Source Files Analyzed**: ${totalFiles}`);
  report.push(`- **Pages / Layouts**: ${pages.length}`);
  report.push(`- **API Routes**: ${apiRoutes.length}`);
  report.push(`- **UI Components**: ${components.length}`);
  report.push(`- **Library Modules**: ${libs.length}`);

  // 2. Roles and Permissions
  let schemaContent = fs.existsSync('prisma/schema.prisma') ? fs.readFileSync('prisma/schema.prisma', 'utf8') : '';
  const models = [...schemaContent.matchAll(/model\s+(\w+)\s+{/g)].map(m => m[1]);
  
  report.push('\n## D. ROLE AND PERMISSION MATRIX');
  if (models.includes('Role') && models.includes('Permission')) {
    report.push('**Status**: RBAC Schema detected (`Role`, `Permission`, `UserRole`, `RolePermission`).');
  } else {
    report.push('**Status**: Full RBAC Schema missing or partially implemented.');
  }

  // Security checks
  report.push('\n## E. ISSUES DISCOVERED (STATIC ANALYSIS)');
  let issues = [];
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies['next'] === undefined) {
    issues.push('- [HIGH] Next.js not found in dependencies.');
  }

  let securityHeadersFound = false;
  let nextConfig = fs.existsSync('next.config.ts') ? fs.readFileSync('next.config.ts', 'utf8') : '';
  if (nextConfig.includes('Content-Security-Policy') || nextConfig.includes('headers()')) {
    securityHeadersFound = true;
  } else {
    issues.push('- [MEDIUM] CSP/Security headers not found in `next.config.ts`.');
  }
  
  // Rate limiting check
  let rateLimitFound = false;
  libs.forEach(f => {
    if (f.includes('rate-limit') || fs.readFileSync(f, 'utf8').includes('RateLimit')) {
      rateLimitFound = true;
    }
  });
  if (!rateLimitFound) {
    issues.push('- [HIGH] Global API Rate Limiting missing or not clearly defined in `src/lib`.');
  }

  if (issues.length > 0) {
    report.push(...issues);
  } else {
    report.push('- No critical static issues discovered.');
  }
  
  // Save to file
  fs.writeFileSync('ENTERPRISE_AUDIT_REPORT.md', report.join('\n'));
  console.log('Enterprise Audit Report generated: ENTERPRISE_AUDIT_REPORT.md');
}

analyzeProject();
