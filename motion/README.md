# Videos de los destacados

Composiciones de motion (una línea de tiempo GSAP pausada en `window.__timelines.main`, 1920×1080,
determinista) que se renderizan cuadro por cuadro. **No hace falta subir esta carpeta al hosting.**

Renderizar (necesita Chrome, `puppeteer-core` y ffmpeg). Por ejemplo, Órbita (25 s):

```
node motion/render.mjs motion/orbita/index.html motion/orbita/frames 30 25
ffmpeg -framerate 30 -i motion/orbita/frames/%04d.jpg -vf format=yuv420p -an -c:v libx264 -preset slow -crf 24 -movflags +faststart assets/video/orbita.mp4
```

Duraciones: orbita 25 s, paperflix 24 s, mipaperlux 30 s, neurobrand 28 s.
