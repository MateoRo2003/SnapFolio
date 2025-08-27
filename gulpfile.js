import gulp from 'gulp';
import webp from 'gulp-webp';
import { deleteAsync } from 'del';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

const paths = {
  images: 'assets/img/**/*.{png,jpg,jpeg}'
};

// Convertir imágenes a WebP en la misma carpeta
export function convertToWebp() {
  return gulp.src(paths.images)
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(file => file.base));
}

// Eliminar originales con un pequeño delay para seguridad
export async function cleanOriginals() {
  console.log('⏳ Esperando a que finalice la conversión antes de eliminar...');
  await new Promise(resolve => setTimeout(resolve, 500)); // espera 0.5s
  await deleteAsync(paths.images);
  console.log('✅ Imágenes originales eliminadas después de la conversión.');
}

// Mostrar el nombre de cada archivo detectado
export async function logFileNames() {
  const files = await glob(paths.images);
  if (files.length > 0) {
    console.log('Archivos detectados para conversión:');
    files.forEach(file => console.log(' - ' + path.basename(file)));
  }
}

// Tarea combinada: registrar → convertir → borrar
export const convertAndClean = gulp.series(logFileNames, convertToWebp, cleanOriginals);

// Vigilar cambios en tiempo real
export function watchImages() {
  gulp.watch(paths.images, convertAndClean);
}

// Tarea por defecto
export default gulp.series(convertAndClean, watchImages);
