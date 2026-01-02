const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const temasDir = path.join(imagesDir, 'temas');
const lolDir = path.join(imagesDir, 'lol');
const kitsDir = path.join(imagesDir, 'kits');

// 1. Rename Kit images to lowercase
if (fs.existsSync(kitsDir)) {
  fs.readdirSync(kitsDir).forEach(file => {
    if (file.startsWith('Kit') && file.endsWith('.jpg')) {
      const oldPath = path.join(kitsDir, file);
      const newPath = path.join(kitsDir, file.toLowerCase());
      if (oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${file} to ${file.toLowerCase()}`);
      }
    }
  });
}

// 2. Populate theme folders with lol images
const sourceImages = {
  'mini.png': 'mini.png',
  'pequena.png': 'pequena.png',
  'intermediaria1.png': 'intermediaria.png',
  'grande.png': 'grande.png',
  'redonda.png': 'redonda.png',
  'termocolante.png': 'termocolante.png'
};

if (fs.existsSync(temasDir) && fs.existsSync(lolDir)) {
  const temas = fs.readdirSync(temasDir).filter(file => fs.statSync(path.join(temasDir, file)).isDirectory());
  
  temas.forEach(tema => {
    if (tema === 'cor_solida') return; // Skip or handle separately if needed

    const temaPath = path.join(temasDir, tema);
    console.log(`Populating ${tema}...`);

    Object.entries(sourceImages).forEach(([src, dest]) => {
      const srcPath = path.join(lolDir, src);
      const destPath = path.join(temaPath, dest);

      if (fs.existsSync(srcPath)) {
        if (!fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  Copied ${dest}`);
        }
      } else {
          console.warn(`  Source image ${src} not found in lol folder`);
      }
    });
  });
} else {
    console.error("temas or lol directory not found");
}
