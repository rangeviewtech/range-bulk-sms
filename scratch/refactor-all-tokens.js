const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Generic color replacements
  content = content.replace(/text-\[\#04648C\]/g, 'text-brand-blue');
  content = content.replace(/bg-\[\#04648C\]/g, 'bg-brand-blue');
  content = content.replace(/border-\[\#04648C\]/g, 'border-brand-blue');
  content = content.replace(/ring-\[\#04648C\]/g, 'ring-brand-blue');
  content = content.replace(/shadow-\[\#04648C\]/g, 'shadow-brand-blue');
  
  content = content.replace(/text-\[\#FBCA07\]/g, 'text-brand-yellow');
  content = content.replace(/bg-\[\#FBCA07\]/g, 'bg-brand-yellow');
  content = content.replace(/border-\[\#FBCA07\]/g, 'border-brand-yellow');
  content = content.replace(/ring-\[\#FBCA07\]/g, 'ring-brand-yellow');
  content = content.replace(/shadow-\[\#FBCA07\]/g, 'shadow-brand-yellow');
  
  content = content.replace(/text-\[\#07163[Dd]\]/g, 'text-brand-navy');
  content = content.replace(/bg-\[\#07163[Dd]\]/g, 'bg-brand-navy');
  content = content.replace(/border-\[\#07163[Dd]\]/g, 'border-brand-navy');
  content = content.replace(/ring-\[\#07163[Dd]\]/g, 'ring-brand-navy');

  // Handle opacities
  content = content.replace(/bg-\[\#04648C\]\/(\d+)/g, 'bg-brand-blue/$1');
  content = content.replace(/text-\[\#04648C\]\/(\d+)/g, 'text-brand-blue/$1');
  content = content.replace(/border-\[\#04648C\]\/(\d+)/g, 'border-brand-blue/$1');
  
  content = content.replace(/bg-\[\#FBCA07\]\/(\d+)/g, 'bg-brand-yellow/$1');
  content = content.replace(/text-\[\#FBCA07\]\/(\d+)/g, 'text-brand-yellow/$1');
  content = content.replace(/border-\[\#FBCA07\]\/(\d+)/g, 'border-brand-yellow/$1');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated tokens in: ${filePath}`);
  }
}

walkDir(path.join(process.cwd(), 'src/app'), processFile);
walkDir(path.join(process.cwd(), 'src/components'), processFile);
