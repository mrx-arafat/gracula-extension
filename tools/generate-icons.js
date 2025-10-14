// Quick Icon Generator for Gracula
// Run this with Node.js to generate placeholder icons

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// SVG template for Gracula icon
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" fill="white" text-anchor="middle" dominant-baseline="central">🧛</text>
</svg>`;
}

// Generate SVG files
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 SVG icons created successfully!');
console.log('\n⚠️  Note: Chrome extensions prefer PNG files.');
console.log('To convert SVG to PNG, you can:');
console.log('1. Use an online converter like cloudconvert.com');
console.log('2. Use ImageMagick: convert icon.svg icon.png');
console.log('3. Open in browser and take screenshot');
console.log('\nOr just use the create-icons.html file in your browser!');

