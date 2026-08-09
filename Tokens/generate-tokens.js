const fs = require('fs');

const TOKEN_FILES = {
  colors: 'color.tokens.json',
  effects: 'effects.tokens.json',
  typography: 'typography.tokens.json',
};

const OUTPUT_FILE = 'tokens.css';

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sanitize(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function figmaColorToCSS(value) {
  if (typeof value !== 'string') return value;
  if (value.startsWith('#') && value.length === 9) {
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    const a = parseInt(value.slice(7, 9), 16) / 255;
    const roundedA = Math.round(a * 100) / 100;
    return roundedA === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${roundedA})`;
  }
  return value;
}

function walk(obj, path, onToken) {
  for (const [key, val] of Object.entries(obj)) {
    const sanitizedKey = sanitize(key);
    if (val && typeof val === 'object' && !val.type) {
      walk(val, path.concat(sanitizedKey), onToken);
    } else if (val && typeof val === 'object' && val.type) {
      onToken(path.concat(sanitizedKey), val);
    }
  }
}

function generateCSS() {
  const lines = [];

  const colors = loadJSON(TOKEN_FILES.colors);
  walk(colors, [], (path, token) => {
    if (token.type === 'color') {
      const skip = ['variable-collection', 'global-tokens-light', 'colors', 'dark-mode'];
      const filtered = path.filter(p => !skip.includes(p));
      const name = filtered.join('-');
      lines.push(`  --color-${name}: ${figmaColorToCSS(token.value)};`);
    } else if (token.type === 'dimension') {
      const last = path[path.length - 1];
      if (path.join('-').includes('spacing')) {
        lines.push(`  --spacing-${last}: ${token.value}px;`);
      } else if (path.join('-').includes('stroke')) {
        lines.push(`  --stroke-${last}: ${token.value}px;`);
      }
    }
  });

  const effects = loadJSON(TOKEN_FILES.effects);
  walk(effects, [], (path, token) => {
    if (token.type === 'custom-shadow') {
      const v = token.value;
      const shadow = `${v.offsetX}px ${v.offsetY}px ${v.radius}px ${v.spread}px ${v.color}`;
      const skip = ['effect', 'global-tokens'];
      const filtered = path.filter(p => !skip.includes(p));
      lines.push(`  --effect-${filtered.join('-')}: ${shadow};`);
    }
  });

  const typography = loadJSON(TOKEN_FILES.typography);
  walk(typography, [], (path, token) => {
    const prop = path[path.length - 1];
    const skip = ['typography', 'global-tokens'];
    const filtered = path.filter(p => !skip.includes(p));
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    const name = filtered.slice(0, -1).join('-');
    const value = token.type === 'dimension' ? `${token.value}px` : token.value;
    if (name) {
      lines.push(`  --typography-${name}-${cssProp}: ${value};`);
    } else {
      lines.push(`  --typography-${filtered[0]}-${cssProp}: ${value};`);
    }
  });

  return `:root {\n${lines.join('\n')}\n}\n`;
}

const css = generateCSS();
fs.writeFileSync(OUTPUT_FILE, css);
console.log(`Generated ${OUTPUT_FILE}`);
