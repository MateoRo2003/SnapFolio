// Los artículos del blog: se abren en una ventana desde la sección "Escritos".
window.ARTICLES = {
          1: {
            category: "Full Stack",
            title: "Cómo conectar Angular 17 con Laravel 12 usando APIs REST",
            meta: "Enero 2025 &nbsp;·&nbsp; 5 min de lectura",
            body: `
        <p>Integrar Angular con Laravel es una de las combinaciones más potentes para proyectos modernos. En este artículo te muestro la arquitectura que uso en producción, paso a paso.</p>
        <h6>1. Configurar CORS en Laravel</h6>
        <p>El primer obstáculo siempre es CORS. En <code>config/cors.php</code> debés permitir el origen de tu app Angular y los headers necesarios para JWT:</p>
        <pre><code>'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
'supports_credentials' => true,</code></pre>
        <h6>2. Autenticación con JWT</h6>
        <p>Usamos el paquete <code>tymon/jwt-auth</code>. El flujo es simple: el usuario hace login, Laravel devuelve un token, Angular lo guarda en memoria (nunca en localStorage) y lo adjunta en cada request con un interceptor HTTP.</p>
        <h6>3. Interceptor Angular</h6>
        <p>El interceptor captura todas las peticiones salientes y agrega el header <code>Authorization: Bearer {token}</code> automáticamente, sin tener que hacerlo en cada servicio.</p>
        <h6>4. Estructura de carpetas recomendada</h6>
        <p>En el frontend separo <strong>core</strong> (interceptores, guards, servicios globales), <strong>features</strong> (módulos por dominio) y <strong>shared</strong> (componentes reutilizables). En Laravel sigo la arquitectura de repositorios para desacoplar la lógica de negocio del controlador.</p>
        <h6>Conclusión</h6>
        <p>Esta combinación escala muy bien. Con esta base podés agregar refresh tokens, roles y permisos sin cambiar la arquitectura central.</p>
      `
          },
          2: {
            category: "UX/UI",
            title: "5 errores de UX que cometen los emprendedores en su primer sitio web",
            meta: "Febrero 2025 &nbsp;·&nbsp; 4 min de lectura",
            body: `
        <p>Trabajando con decenas de emprendedores noté que los mismos errores se repiten una y otra vez. Acá van los más críticos y cómo corregirlos.</p>
        <h6>Error 1: Hero con demasiado texto</h6>
        <p>El héroe es el primer punto de contacto. Si tiene 3 párrafos explicando todo lo que hace tu empresa, el usuario se va. La fórmula que funciona: <strong>una propuesta de valor clara + un CTA visible</strong>. Nada más.</p>
        <h6>Error 2: Sin jerarquía visual</h6>
        <p>Todo al mismo tamaño significa que nada es importante. Usá tamaños de fuente bien diferenciados (H1 grande, H2 mediano, body legible) y el ojo del usuario sabrá adónde mirar.</p>
        <h6>Error 3: CTA enterrado</h6>
        <p>El botón de acción principal tiene que estar visible sin hacer scroll. Colores que contrastan, texto accionable ("Solicitar presupuesto" > "Enviar").</p>
        <h6>Error 4: No optimizado para mobile</h6>
        <p>Más del 60% del tráfico es mobile. Botones chicos, menús que no cierran, formularios imposibles de completar con el pulgar: todo eso mata la conversión.</p>
        <h6>Error 5: Velocidad de carga ignorada</h6>
        <p>Imágenes sin comprimir, fuentes web cargadas síncronamente, sin caché. Cada segundo adicional de carga reduce la conversión un 7%. Usá WebP, lazy loading y un buen hosting.</p>
      `
          },
          3: {
            category: "Automatización",
            title: "Automatizá tu negocio con n8n: workflows sin escribir código",
            meta: "Marzo 2025 &nbsp;·&nbsp; 6 min de lectura",
            body: `
        <p>n8n es una herramienta de automatización open source que instalé en un VPS por menos de 5 dólares al mes y que hoy le ahorra horas semanales a varios de mis clientes.</p>
        <h6>¿Qué es n8n?</h6>
        <p>Es un orquestador de flujos similar a Zapier o Make, pero self-hosted y con capacidad de ejecutar código JavaScript cuando necesitás lógica personalizada.</p>
        <h6>Caso real: notificaciones de nuevos pedidos por WhatsApp</h6>
        <p>Un cliente recibía pedidos por formulario web. El flujo en n8n escucha el webhook del formulario, formatea el mensaje y lo envía por WhatsApp Business API en menos de 2 segundos. Sin tocar el backend de la web.</p>
        <h6>Caso real: sincronización de hojas de cálculo</h6>
        <p>Otro cliente manejaba inventario en Google Sheets y ventas en WooCommerce. n8n sincroniza ambos cada 30 minutos, actualiza el stock y genera un reporte diario por email.</p>
        <h6>Cómo empezar</h6>
        <p>Instalás n8n con Docker (<code>docker run -it --rm n8nio/n8n</code>), entrás al panel visual y empezás a conectar nodos. La curva de aprendizaje es de un par de horas.</p>
      `
          },
          4: {
            category: "DevOps",
            title: "Dockerizá tu app Laravel en 15 minutos: entorno reproducible y listo",
            meta: "Abril 2025 &nbsp;·&nbsp; 7 min de lectura",
            body: `
        <p>El clásico "en mi máquina funciona" desaparece cuando dockerizás tu proyecto. Acá el stack que uso para Laravel en producción.</p>
        <h6>Los 3 contenedores que necesitás</h6>
        <p><strong>php-fpm</strong> para ejecutar PHP, <strong>nginx</strong> como proxy reverso y servidor de archivos estáticos, y <strong>mysql</strong> para la base de datos. Opcionalmente un contenedor de <strong>redis</strong> para caché y colas.</p>
        <h6>El docker-compose.yml base</h6>
        <pre><code>services:
  app:
    build: .
    volumes:
      - .:/var/www
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: laravel</code></pre>
        <h6>Variables de entorno</h6>
        <p>Nunca hardcodeés credenciales. Usá un archivo <code>.env</code> que Docker lee automáticamente y que jamás subís al repositorio.</p>
        <h6>Deploy en producción</h6>
        <p>Con un pipeline de CI/CD (GitHub Actions) que hace build de la imagen, la pushea a un registry y ejecuta <code>docker compose pull && docker compose up -d</code> en el servidor. Deploy en menos de 2 minutos.</p>
      `
          },
          5: {
            category: "Backend",
            title: "Sistema de reembolsos automáticos con Laravel y Stripe",
            meta: "Mayo 2025 &nbsp;·&nbsp; 8 min de lectura",
            body: `
        <p>Construí este sistema para un cliente de e-commerce que procesaba decenas de reembolsos por semana de forma manual. Hoy todo es automático.</p>
        <h6>El flujo completo</h6>
        <p>1. El cliente solicita el reembolso desde la app. 2. Laravel valida la elegibilidad (plazo, estado del pedido, monto). 3. Si pasa la validación, se llama a la API de Stripe para emitir el reembolso. 4. Un webhook de Stripe confirma el resultado. 5. Se notifica al cliente por email y se actualiza el estado en la base de datos.</p>
        <h6>Validaciones críticas</h6>
        <p>Antes de tocar Stripe verificamos: que el pago esté en estado <code>succeeded</code>, que no se haya reembolsado antes (idempotencia), que el monto no supere el original, y que el pedido esté dentro del período de reembolso permitido.</p>
        <h6>Idempotencia con Stripe</h6>
        <p>Stripe acepta una clave de idempotencia por request. Usamos el ID del pedido como clave, así aunque el webhook llegue dos veces nunca procesamos el reembolso dos veces.</p>
        <h6>Manejo de fallos</h6>
        <p>Los reembolsos que fallan van a una cola de reintentos con backoff exponencial. Si después de 3 intentos sigue fallando, se crea una tarea manual para el equipo de soporte con toda la información necesaria.</p>
        <h6>Resultado</h6>
        <p>El cliente pasó de dedicar 4 horas semanales a reembolsos a prácticamente cero. El sistema procesa el 95% de los casos sin intervención humana.</p>
      `
          },
          6: {
            category: "Inteligencia Artificial",
            title: "IA generativa en tus proyectos web: más allá del ChatGPT",
            meta: "Junio 2025 &nbsp;·&nbsp; 6 min de lectura",
            body: `
        <p>La IA generativa dejó de ser un juguete. Hoy la integro en proyectos reales y los resultados son concretos. Acá lo que aprendí.</p>
        <h6>APIs que uso en producción</h6>
        <p><strong>OpenAI GPT-4o</strong> para generación de texto, resúmenes y asistentes de chat. <strong>Anthropic Claude</strong> para análisis de documentos largos y tareas que requieren razonamiento complejo. <strong>Whisper</strong> para transcripción de audio. <strong>DALL·E / Stable Diffusion</strong> para generación de imágenes.</p>
        <h6>Caso real: asistente de soporte</h6>
        <p>Implementé un chatbot que lee la base de conocimiento del cliente (PDFs, documentos Word) y responde preguntas de usuarios. Usa RAG (Retrieval-Augmented Generation): primero busca los fragmentos relevantes y luego el modelo genera la respuesta basada en esos fragmentos, no en su entrenamiento.</p>
        <h6>Caso real: generación de descripciones de productos</h6>
        <p>Un e-commerce con 800 productos sin descripción. Con un script que llama a la API de GPT-4o, generamos descripciones únicas, optimizadas para SEO, en menos de una hora.</p>
        <h6>Costos bajo control</h6>
        <p>El mayor error es no calcular los costos antes de lanzar. Implementá caché de respuestas para queries repetidas, limitá el contexto que enviás al modelo y monitoreá el uso con los dashboards de cada proveedor.</p>
        <h6>El futuro cercano</h6>
        <p>Los agentes autónomos que pueden ejecutar acciones (llamar APIs, navegar webs, escribir código) van a cambiar completamente cómo se construyen las aplicaciones. Ya estoy experimentando con ellos.</p>
      `
          },
          7: {
            category: "UX/UI",
            title: "10 consejos de UX que aumentan la conversión en cualquier landing page",
            meta: "Julio 2025 &nbsp;·&nbsp; 5 min de lectura",
            body: `
        <p>Después de diseñar decenas de landing pages y ver sus métricas, llegué a estos 10 principios que funcionan siempre.</p>
        <h6>1. Una sola acción por página</h6>
        <p>Cada landing debe tener un único objetivo. Dos CTAs compiten entre sí y reducen la conversión de ambos.</p>
        <h6>2. El héroe responde "¿qué gano yo?"</h6>
        <p>No "quiénes somos", sino qué problema resolvés y para quién. En 6 segundos el usuario decide si sigue o se va.</p>
        <h6>3. Prueba social arriba del pliegue</h6>
        <p>Logos de clientes, estrellas de valoración o un número ("más de 200 proyectos entregados") cerca del hero eliminan la fricción inicial.</p>
        <h6>4. Microcopy que reduce ansiedad</h6>
        <p>"Sin tarjeta de crédito", "cancelás cuando querés", "respuesta en 24hs". Pequeños textos junto al CTA que eliminan objeciones antes de que aparezcan.</p>
        <h6>5. Contraste en el botón principal</h6>
        <p>El CTA debe ser el elemento más visible de la pantalla. Si el usuario tarda más de 1 segundo en encontrarlo, hay un problema.</p>
        <h6>6. Formularios cortos</h6>
        <p>Cada campo extra reduce las conversiones. Pedí solo lo imprescindible; podés pedir más información después.</p>
        <h6>7. Velocidad</h6>
        <p>Una landing que tarda 4 segundos en cargar ya perdió al 25% de sus visitantes. Core Web Vitals en verde, siempre.</p>
        <h6>8. Mobile-first real</h6>
        <p>Diseñá primero para el pulgar. Botones de al menos 44px, formularios sin zoom involuntario, imágenes adaptadas.</p>
        <h6>9. Video corto donde sea posible</h6>
        <p>Un video de 60 segundos mostrando el producto o servicio convierte mejor que cinco párrafos de texto.</p>
        <h6>10. Test, iterá, repetí</h6>
        <p>Ningún consejo reemplaza probar con tus usuarios reales. A/B testing con herramientas simples como Google Optimize te da datos concretos.</p>
      `
          },
          8: {
            category: "Frontend",
            title: "TypeScript en serio: tipos avanzados que todo dev debería conocer",
            meta: "Agosto 2025 &nbsp;·&nbsp; 5 min de lectura",
            body: `
        <p>TypeScript básico lo sabe todo el mundo. Estos son los patrones que marcan la diferencia entre un código que simplemente compila y uno que realmente escala.</p>
        <h6>Utility Types imprescindibles</h6>
        <p><code>Partial&lt;T&gt;</code> hace opcionales todas las propiedades. <code>Required&lt;T&gt;</code> las hace obligatorias. <code>Pick&lt;T, K&gt;</code> selecciona un subconjunto. <code>Omit&lt;T, K&gt;</code> excluye propiedades. <code>Record&lt;K, V&gt;</code> construye objetos con claves tipadas.</p>
        <h6>Discriminated Unions</h6>
        <p>En lugar de un objeto con campos opcionales que pueden ser undefined, modelás los estados posibles como tipos distintos con un discriminador. TypeScript te da exhaustividad en el switch.</p>
        <pre><code>type State =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };</code></pre>
        <h6>Generics con constraints</h6>
        <p>Los generics sin constraints son peligrosos. Usá <code>extends</code> para limitar qué tipos acepta tu función y obtener autocompletado real.</p>
        <h6>El consejo más importante</h6>
        <p>Evitá el <code>any</code> como si fuera un error de compilación. Cuando sentís la tentación de usarlo, es una señal de que tu modelado de datos tiene un problema que vale la pena resolver.</p>
      `
          },
          9: {
            category: "Inteligencia Artificial",
            title: "Cómo desarrollé un modelo de IA manual y lo integré en SITI",
            meta: "Abril 2026 &nbsp;·&nbsp; 7 min de lectura",
            body: `
        <p>SITI es mi proyecto estrella: un sistema integral de gestión para tiendas independientes. Cuando decidí agregarle un asistente de IA, en vez de usar modelos cerrados como GPT-4, opté por crear un modelo manual adaptado específicamente al dominio del negocio.</p>
        <h6>El problema a resolver</h6>
        <p>Los modelos genéricos son excesivamente grandes y caros, además de no comprender la jerga específica del sistema de ventas. Los vendedores necesitaban respuestas instantáneas: ¿qué producto tiene mejor margen?, ¿cuáles son los más vendidos?.</p>
        <h6>Arquitectura: Entrenamiento y Fine-Tuning</h6>
        <p>Tomé un modelo open-source liviano y le hice fine-tuning con un dataset generado a partir de consultas reales del sistema SITI. Esto permitió que el modelo aprenda la estructura de nuestra base de datos relacional y pueda traducir consultas en lenguaje natural directamente a código SQL optimizado y reportes de inventario.</p>
        <h6>Integración y Despliegue</h6>
        <p>El backend en <strong>Laravel</strong> se comunica vía API interna con un servicio en Python donde reside el modelo cargado en memoria. Al ser un modelo pequeño y adaptado, los tiempos de inferencia rondan los milisegundos, permitiendo una experiencia de chat en tiempo real para el vendedor a través del frontend en <strong>Angular</strong>.</p>
        <h6>Ventajas del modelo propio</h6>
        <p>Control total sobre la privacidad de los datos de los clientes (nada sale de nuestros servidores), nulos costos por token de APIs externas, y una latencia muchísimo menor. A largo plazo, el modelo propio es un asset invalorable para la escalabilidad del sistema.</p>
      `
          },
          10: {
            category: "Backend",
            title: "De VPS tradicional a Vercel + Supabase: Escalabilidad inmediata",
            meta: "Septiembre 2025 &nbsp;·&nbsp; 6 min de lectura",
            body: `
        <p>Administrar servidores VPS es genial para aprender, pero cuando tenés múltiples proyectos en producción, las actualizaciones de seguridad y el monitoreo consumen muchísimo tiempo. Acá cuento cómo y por qué migré gran parte de mi stack a Serverless.</p>
        <h6>El viejo paradigma</h6>
        <p>Antes, creaba una droplet en DigitalOcean, instalaba Nginx, configuraba certificados SSL con Certbot, instalaba MySQL y configuraba backups diarios. Si el tráfico subía de golpe, había que hacer resize manual del servidor. Mucha fricción para proyectos que requieren agilidad.</p>
        <h6>La era Serverless: Next.js y Vercel</h6>
        <p>Con <strong>Vercel</strong>, el despliegue es simplemente un git push. La CDN global entrega el contenido estático al instante, y las Serverless Functions escalan automáticamente. Cero configuración de infraestructura, enfoque 100% en el código.</p>
        <h6>El rol de Supabase</h6>
        <p>Para la base de datos necesitaba un equivalente moderno a mi viejo MySQL. <strong>Supabase</strong> (basado en PostgreSQL) ofrece no solo la base de datos autogestionada, sino también autenticación, almacenamiento de archivos y Row Level Security (RLS). Además, la capacidad de generar APIs REST instantáneas a partir del esquema de la DB aceleró mi desarrollo frontend un 40%.</p>
        <h6>Conclusión</h6>
        <p>Migrar a Vercel + Supabase redujo mis costos de mantenimiento a cero horas por mes y me permitió dormir tranquilo sabiendo que si un proyecto se vuelve viral, la infraestructura escalará automáticamente.</p>
      `
          },
          11: {
            category: "Inteligencia Artificial",
            title: "Creando un servidor MCP para conectar IAs a bases de datos",
            meta: "Noviembre 2025 &nbsp;·&nbsp; 8 min de lectura",
            body: `
        <p>El <strong>Model Context Protocol (MCP)</strong> es un estándar revolucionario que permite estandarizar cómo los modelos de IA se conectan e interactúan con orígenes de datos externos. En este artículo te muestro cómo desarrollé un servidor MCP en Rust.</p>
        <h6>El límite de la IA</h6>
        <p>Hasta hace poco, si querías que un LLM consultara una base de datos corporativa, tenías que armar scripts intermedios o depender de costosos sistemas de RAG rígidos. Con MCP, podés crear herramientas universales que los agentes de IA descubren y utilizan de forma estándar.</p>
        <h6>Creando el Servidor MCP en Rust</h6>
        <p>Elegí <strong>Rust</strong> por su rendimiento y seguridad en el manejo de memoria. El servidor expone métodos (Tools) mediante el protocolo JSON-RPC. Por ejemplo, expuse una herramienta <code>execute_secure_query</code> que acepta parámetros validados y los traduce a consultas a nuestra base de datos PostgreSQL, retornando el JSON correspondiente.</p>
        <h6>Integración con Agentes</h6>
        <p>Una vez que el servidor MCP estuvo corriendo, herramientas como <strong>Claude Code</strong> o agentes custom pudieron conectarse automáticamente. Cuando el usuario pregunta "¿Cuántas ventas tuvimos ayer?", el agente de IA consulta al servidor MCP qué herramientas existen, ve la de base de datos, formula el query y presenta la respuesta al usuario final de forma completamente transparente.</p>
        <h6>Seguridad y Futuro</h6>
        <p>El MCP permite definir permisos estrictos, garantizando que el modelo de IA jamás ejecute un <code>DROP TABLE</code>. Es el pegamento definitivo entre los LLMs y el mundo real de las aplicaciones empresariales.</p>
      `
          },
          12: {
            category: "Innovación EdTech",
            title: "Revolucionando la educación: El impacto de la IA en plataformas EdTech",
            meta: "Diciembre 2025 &nbsp;·&nbsp; 6 min de lectura",
            body: `
        <p>Durante el desarrollo de plataformas educativas a gran escala (como Paperflix), uno de los mayores cuellos de botella es la creación y organización del contenido. En mi experiencia trabajando con sistemas para miles de escuelas, la IA cambió por completo el paradigma.</p>
        <h6>Automatización en la carga de recursos</h6>
        <p>Los administradores educativos solían pasar horas rellenando metadatos. Al integrar modelos de IA generativa, el sistema ahora puede analizar la URL de un recurso externo y extraer automáticamente el título, una descripción pedagógica precisa, la asignatura y los tags relevantes. Un trabajo de 10 minutos se redujo a 5 segundos.</p>
        <h6>Escalabilidad del conocimiento</h6>
        <p>Cuando tenés más de 3200 escuelas usando una plataforma, la estandarización del material es clave. La IA asegura que las descripciones sigan un formato educativo unificado, corrigiendo errores humanos y mejorando la indexación para el motor de búsqueda interno.</p>
        <h6>Importación Masiva</h6>
        <p>Sumado a la IA, diseñé la arquitectura para cruzar estos modelos con importaciones masivas vía Excel. El sistema lee un archivo con cientos de enlaces, procesa cada uno en segundo plano validando los datos requeridos, y genera el catálogo listo para los alumnos sin fricción.</p>
        <h6>El rol de la tecnología</h6>
        <p>El objetivo de estas herramientas no es reemplazar el criterio humano, sino liberarlo de tareas repetitivas. Al delegar la burocracia digital a la IA, los educadores y administradores pueden dedicar su tiempo a diseñar mejores estrategias de aprendizaje.</p>
      `
          },
          13: {
            category: "Automatización e IA",
            title: "Cómo conecté un chatbot con IA a WhatsApp Business sin que invente precios",
            meta: "Julio 2026 &nbsp;·&nbsp; 8 min de lectura",
            body: `
        <p>Para Petty Joyas, una joyería online, armé un bot que atiende por el número de WhatsApp del negocio: responde precios, stock, envíos y el estado de un pedido con datos reales de la base, recuerda la charla y sabe cuándo pasarle la conversación a una persona.</p>
        <h6>La API oficial, no un atajo</h6>
        <p>Usé <strong>WhatsApp Cloud API</strong>, la vía oficial de Meta: número empresarial verificado y gratis dentro de sus límites. Las librerías no oficiales que emulan WhatsApp Web violan los términos y pueden hacer que bloqueen el número, que para un comercio es su canal de ventas.</p>
        <p>El alta se hace una sola vez: app en Meta for Developers, número y negocio verificados en Business Manager, un token permanente y el webhook apuntando a la API del sitio.</p>
        <h6>Un webhook que solo acepta a Meta</h6>
        <p>Meta verifica el webhook con un desafío (<code>hub_challenge</code>) y después firma cada mensaje. El backend en Laravel valida el header <code>X-Hub-Signature-256</code> con el App Secret y descarta cualquier payload que no venga de Meta.</p>
        <pre><code>GET  /api/whatsapp/webhook   # verificación (hub_challenge)
POST /api/whatsapp/webhook   # mensajes entrantes, con firma
POST /api/whatsapp/send      # respuesta manual desde el panel</code></pre>
        <h6>La IA consulta la base, no la memoriza</h6>
        <p>No le cargo el catálogo entero al modelo. Le doy <strong>herramientas</strong> (function calling) y él decide cuál usar: <code>buscar_productos</code>, <code>detalle_producto</code>, <code>info_envios</code>, <code>info_pagos</code>, <code>estado_pedido</code>… Cada una es una consulta real a la base. Así el bot nunca inventa un precio ni un stock.</p>
        <p>El motor es Groq con modelos Llama y una lista de modelos de respaldo: si uno está saturado o fue dado de baja, la respuesta sale con el siguiente. El loop de herramientas tiene un tope de cinco vueltas, para que el modelo no se quede llamando lo mismo en círculo.</p>
        <h6>Un solo cerebro para la web y para WhatsApp</h6>
        <p>El chat del sitio y el bot de WhatsApp usan el mismo servicio de IA. La diferencia es la memoria: en WhatsApp guardo el historial por número (los últimos 16 mensajes, durante 3 horas sin actividad), así si el cliente ya dio su número de pedido, no se lo vuelvo a pedir.</p>
        <p>Además, el número de WhatsApp se cruza con los clientes registrados comparando los últimos 10 dígitos, para tolerar teléfonos cargados con 0, con 15 o con guiones.</p>
        <h6>Cuándo entra una persona</h6>
        <p>Si el cliente escribe algo como “quiero hablar con una persona”, el equipo recibe un mail, una sola vez por conversación para no llenar la bandeja. Desde el panel se puede <strong>pausar la IA</strong> en esa charla y responder a mano; el bot no se mete mientras tanto.</p>
        <p>Una regla de diseño: el bot informa y deriva, pero nunca mueve dinero ni stock por su cuenta. Las compras siguen pasando por el checkout.</p>
        <h6>Detalles que suman</h6>
        <p>Desde el panel también se configuran el mensaje de bienvenida, los <em>ice breakers</em> (los botones de inicio de conversación) y los comandos con barra, que se sincronizan con Meta. Son puro WhatsApp: funcionan aunque el bot esté apagado.</p>
      `
          },
          14: {
            category: "Marketing y redes",
            title: "Redes sociales en un e-commerce: Pixel de Meta, Instagram y vistas previas que venden",
            meta: "Agosto 2026 &nbsp;·&nbsp; 6 min de lectura",
            body: `
        <p>Integrar redes en una tienda no es poner íconos de Instagram en el footer. En Petty Joyas trabajé tres frentes: que Meta sepa qué pasa en la tienda para optimizar los anuncios, que el feed de Instagram viva en el sitio sin romper nada, y que cada producto se vea bien cuando alguien lo comparte.</p>
        <h6>Pixel de Meta con los eventos que importan</h6>
        <p>El script base (inicialización y <code>PageView</code>) va una sola vez en el layout. Los eventos de conversión están en un módulo aparte, así ningún componente repite la lógica de “¿existe <code>fbq</code>?”:</p>
        <ul>
          <li><strong>ViewContent</strong>: alguien abre la ficha de un producto.</li>
          <li><strong>AddToCart</strong>: lo suma al carrito.</li>
          <li><strong>InitiateCheckout</strong>: llega al checkout con el carrito armado.</li>
          <li><strong>Purchase</strong>: compra confirmada, con el valor real y en pesos.</li>
        </ul>
        <pre><code>trackPurchase({ orderNumber, items, value });
// eventID = número de pedido</code></pre>
        <p>El <code>Purchase</code> lleva como <code>eventID</code> el número de pedido. Así, si algún día el mismo evento llega también por la Conversions API desde el servidor, Meta lo cuenta una sola vez. Y si el cliente recarga la página de “pedido confirmado”, la compra no se registra de nuevo.</p>
        <h6>El feed de Instagram, sin romper el sitio</h6>
        <p>Primero probé un widget de terceros y metía un CSS global que rompía otras partes del sitio, como el carrito y el menú en celular. Lo reemplacé por el <strong>embed oficial de Instagram</strong>: gratis, sin API key, y cada publicación vive en su propio iframe, aislada del resto.</p>
        <p>Los links de las publicaciones se cargan desde el panel de administración, así el cliente cambia la galería sin tocar código. Y un detalle de rendimiento: la lista se memoriza por contenido, porque sin eso cada re-render volvía a procesar los embeds y disparaba pedidos repetidos a Instagram.</p>
        <h6>Vistas previas que venden</h6>
        <p>Buena parte de las ventas de una tienda chica se empiezan por WhatsApp o por un mensaje privado de Instagram. Cada ficha de producto genera sus metadatos de <strong>Open Graph</strong> con el nombre, la descripción corta y la primera foto. Así, al pegar el link en un chat, aparece la joya con su foto y no un logo genérico.</p>
        <h6>Lo que me llevo</h6>
        <p>Las redes funcionan mejor cuando la tienda les habla en su idioma: eventos bien nombrados para los anuncios, contenido aislado para no romper el diseño y metadatos pensados para cómo se comparte de verdad.</p>
      `
          },
          15: {
            category: "Full Stack",
            title: "Un punto de venta que sigue vendiendo sin internet",
            meta: "Septiembre 2026 &nbsp;·&nbsp; 7 min de lectura",
            body: `
        <p>Una tienda física no puede dejar de cobrar porque se cayó el WiFi. Para el local de Petty Joyas armé un punto de venta que funciona sin conexión: registra ventas, ajustes de stock y altas de productos, y lo sincroniza todo cuando vuelve internet.</p>
        <h6>Lectores de código sin SDK</h6>
        <p>Los lectores USB y Bluetooth se comportan como un teclado: “tipean” el código y un Enter. No hace falta ningún SDK propietario. El frontend captura esa entrada y el backend resuelve el código con un solo endpoint:</p>
        <pre><code>GET /api/products/lookup?barcode=7791234567890</code></pre>
        <p>Acepta EAN-13, EAN-8, Code 128, Code 39 y QR, y la columna del código es única e indexada para que la búsqueda sea instantánea.</p>
        <h6>Sincronizar eventos, no bases de datos</h6>
        <p>La idea clave: no copio la base del local a la nube. El punto de venta (una PWA) guarda <strong>eventos de negocio</strong> en IndexedDB: venta creada, stock ajustado, producto creado o editado, inventario contado. Al volver la conexión, los manda en orden a la API.</p>
        <pre><code>POST /api/sync/events   # un evento o un lote
→ { id, status: "accepted" | "duplicate" | "error" }</code></pre>
        <h6>Idempotencia: la regla que evita ventas dobles</h6>
        <p>Cada evento nace con un UUID generado en el dispositivo. Si la conexión se corta a mitad de un envío y el punto de venta reintenta, el backend reconoce el <code>id</code> y lo marca como <code>duplicate</code> en vez de registrar la venta otra vez.</p>
        <p>Los eventos se procesan en el orden en que ocurrieron en el local, y cada tipo tiene su propia acción en el backend: la venta va a la creación de ventas, el ajuste a los movimientos de stock, y así.</p>
        <h6>El stock como historial</h6>
        <p>El stock no es un número que se pisa: es la suma de sus movimientos. Por eso, si se vendió lo mismo en el local sin conexión y en la web al mismo tiempo, no se pierde nada: los dos movimientos quedan registrados y el conflicto se ve y se resuelve con datos, no a ciegas.</p>
        <h6>Resultado</h6>
        <p>El local vende igual con o sin internet, y la tienda online y la física comparten un solo inventario sin que nadie tenga que cargar nada dos veces.</p>
      `
          }
        };
