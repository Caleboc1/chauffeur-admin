const fs = require('fs');
const path = require('path');

const directory = './src';

const replacements = {
  'var(--brand-navy)': 'var(--color-neutral-100)',
  'var(--brand-gold)': 'var(--color-primary-300)',
  'var(--color-neutral-800)': 'var(--color-neutral-alpha-10)',
  'var(--md-sys-typescale-headline-medium-size)': 'var(--typography-headings-h-6-fontsize)',
  'var(--md-sys-typescale-headline-small-size)': 'var(--typography-headings-h-7-fontsize)',
  'var(--md-sys-typescale-body-large-size)': 'var(--typography-body-b-1-fontsize)',
  'var(--md-sys-typescale-body-medium-size)': 'var(--typography-body-b-2-fontsize)',
  'var(--md-sys-typescale-body-small-size)': 'var(--typography-body-b-3-fontsize)',
  'var(--md-sys-typescale-label-medium-size)': 'var(--typography-body-b-4-fontsize)',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.css')) results.push(file);
    }
  });
  return results;
}

const cssFiles = walk(directory);
let updatedFiles = 0;

cssFiles.forEach(file => {
  // Skip globals.css as it has the actual definitions
  if (file.includes('globals.css')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [oldToken, newToken] of Object.entries(replacements)) {
    // Escape regex characters for exact match
    const regex = new RegExp(oldToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, newToken);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
  }
});

console.log(`Updated ${updatedFiles} files.`);
