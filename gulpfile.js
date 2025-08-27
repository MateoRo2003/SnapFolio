import gulp from 'gulp';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const imagesPath = 'assets/img/**/*.{png,jpg,jpeg}';

// Convertir un solo archivo a WebP y borrar el original
async function convertAndDelete(filePath) {
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputWebp = path.join(dir, `${baseName}.webp`);

  try {
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(outputWebp);
    
    console.log(`${filePath} → ${outputWebp} ✅`);

    // Borrar el archivo original después de crear el WebP
    fs.unlinkSync(filePath);
    console.log(`Archivo original eliminado: ${filePath} 🗑️`);
  } catch (err) {
    console.error(`Error procesando ${filePath}: ${err}`);
  }
}

// Función para procesar todos los archivos existentes
export function imagenes() {
  return gulp.src(imagesPath, { since: gulp.lastRun(imagenes) })
    .on('data', file => convertAndDelete(file.path));
}

// Vigilar cambios en tiempo real
export function dev() {
  gulp.watch(imagesPath, imagenes);
}

// Tarea por defecto
export default gulp.series(imagenes, dev);
