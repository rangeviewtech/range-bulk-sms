const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/components/layout/range-sidebar.tsx',
  'src/components/layout/legal-layout.tsx'
];

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace text and bg colors
  content = content.replace(/text-\[\#04648C\]/g, 'text-brand-blue');
  content = content.replace(/bg-\[\#04648C\]/g, 'bg-brand-blue');
  content = content.replace(/border-\[\#04648C\]/g, 'border-brand-blue');
  
  content = content.replace(/text-\[\#FBCA07\]/g, 'text-brand-yellow');
  content = content.replace(/bg-\[\#FBCA07\]/g, 'bg-brand-yellow');
  content = content.replace(/border-\[\#FBCA07\]/g, 'border-brand-yellow');
  
  content = content.replace(/ring-\[\#07163d\]/g, 'ring-brand-navy');
  content = content.replace(/bg-\[\#07163d\]/g, 'bg-brand-navy');
  
  // Replace partial opacities like bg-[#04648C]/10 -> bg-brand-blue/10
  content = content.replace(/bg-\[\#04648C\]\/(\d+)/g, 'bg-brand-blue/$1');
  content = content.replace(/border-\[\#04648C\]\/(\d+)/g, 'border-brand-blue/$1');
  
  // Handle some other random ones from legal-layout
  content = content.replace(/'#04648C'/g, "'var(--color-brand-blue)'");
  content = content.replace(/bg-\[\#FBCA07\]/g, 'bg-brand-yellow');
  content = content.replace(/text-\[\#141B2D\]/g, 'text-brand-navy'); // Using navy as the darkest brand
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Processed ${filePath}`);
}

filesToProcess.forEach(processFile);
