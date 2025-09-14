const fs = require('fs');
const path = require('path');

// Create a simple PNG header and placeholder image data
const createPlaceholderPNG = (width, height) => {
  // PNG header
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const IHDR = Buffer.alloc(25);
  IHDR.writeUInt32BE(13, 0); // Length
  IHDR.write('IHDR', 4);
  IHDR.writeUInt32BE(width, 8);
  IHDR.writeUInt32BE(height, 12);
  IHDR[16] = 8; // Bit depth
  IHDR[17] = 2; // Color type (RGB)
  IHDR[18] = 0; // Compression
  IHDR[19] = 0; // Filter
  IHDR[20] = 0; // Interlace

  // Simple CRC (placeholder)
  IHDR.writeUInt32BE(0, 21);

  // IEND chunk
  const IEND = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

  return Buffer.concat([PNG_SIGNATURE, IHDR, IEND]);
};

// Create assets directory
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// Create placeholder images
const icon = createPlaceholderPNG(1024, 1024);
const splash = createPlaceholderPNG(1284, 2778);
const adaptiveIcon = createPlaceholderPNG(1024, 1024);
const favicon = createPlaceholderPNG(48, 48);
const logo = createPlaceholderPNG(200, 200);

fs.writeFileSync('assets/icon.png', icon);
fs.writeFileSync('assets/splash.png', splash);
fs.writeFileSync('assets/adaptive-icon.png', adaptiveIcon);
fs.writeFileSync('assets/favicon.png', favicon);
fs.writeFileSync('src/assets/logo.png', logo);

console.log('✅ Assets created successfully');