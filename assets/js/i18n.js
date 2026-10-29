/**
 * Idiomas. La página está escrita en español; el inglés está acá, aparte.
 * Cada texto en español es la clave de su traducción (sin importar los espacios). Al cambiar de
 * idioma se recorren los textos de la página y algunos atributos, y se cambia lo que tenga
 * traducción; lo que no, queda como está (nombres, números, tecnologías). Lo que echo.js escribe
 * después lo escribe en español y lo pasa por localize(). Por defecto se ve en inglés y
 * el idioma elegido se recuerda.
 */
(() => {
  'use strict';

  const EN = {
    "Mateo Rojas — Desarrollador Full Stack y Analista de Sistemas | Portfolio": "Mateo Rojas — Full Stack Developer & Systems Analyst | Portfolio",
    "Cargando portfolio": "Loading portfolio",
    "DESARROLLADOR FULL STACK": "FULL STACK DEVELOPER",
    "Mateo Rojas, inicio": "Mateo Rojas, home",
    "MENÚ": "MENU",
    "Abrir menú": "Open menu",
    "Menú": "Menu",
    "Navegación principal": "Main navigation",
    "INICIO": "HOME",
    "SOBRE MÍ": "ABOUT ME",
    "EXPERIENCIA": "EXPERIENCE",
    "PROYECTOS": "PROJECTS",
    "SERVICIOS": "SERVICES",
    "Cambiar idioma ES / EN": "Switch language ES / EN",
    "Contacto": "Contact",
    "Explorá mi portfolio": "Explore my portfolio",
    "EXPLORÁ MI": "EXPLORE MY",
    "NUEVO": "NEW",
    "COFUNDADOR Y CEO DE ÓRBITA ↗": "CO-FOUNDER & CEO OF ÓRBITA ↗",
    "DESARROLLADOR DESDE 2023": "DEVELOPER SINCE 2023",
    "Bajar a Sobre mí": "Scroll to About me",
    "DESDE PUERTO IGUAZÚ CONSTRUYO PLATAFORMAS QUE HOY USAN MÁS DE 3.200 ESCUELAS EN CHILE": "FROM PUERTO IGUAZÚ I BUILD PLATFORMS USED TODAY BY 3,200+ SCHOOLS IN CHILE",
    "DISEÑO WEB": "WEB DESIGN",
    "TRANSFORMO IDEAS VISIONARIAS EN EXPERIENCIAS DIGITALES RÁPIDAS Y CON IA": "I TURN VISIONARY IDEAS INTO FAST, AI-POWERED DIGITAL EXPERIENCES",
    "PUERTO IGUAZÚ, ARGENTINA • REMOTO": "PUERTO IGUAZÚ, ARGENTINA • REMOTE",
    "DISCIPLINA Y OFICIO": "DISCIPLINE & CRAFT",
    "FULL STACK • IA • UI/UX • NUBE Y DOCKER": "FULL STACK • AI • UI/UX • CLOUD & DOCKER",
    "SOY MATEO ROJAS, COFUNDADOR Y CEO DE ÓRBITA, DESARROLLADOR FULL STACK Y ANALISTA DE SISTEMAS. CONSTRUYO PLATAFORMAS EN PRODUCCIÓN DE PUNTA A PUNTA, COMO PAPERFLIX (MÁS DE 3.200 ESCUELAS EN CHILE) Y S.I.T.I, DONDE SE CRUZAN UNA ARQUITECTURA SÓLIDA, LA INTELIGENCIA ARTIFICIAL Y UN DISEÑO CUIDADO.": "I AM MATEO ROJAS, CO-FOUNDER AND CEO OF ÓRBITA, A FULL STACK DEVELOPER AND SYSTEMS ANALYST. I BUILD PRODUCTION PLATFORMS END TO END, LIKE PAPERFLIX (3,200+ SCHOOLS IN CHILE) AND S.I.T.I, WHERE SOLID ARCHITECTURE, ARTIFICIAL INTELLIGENCE AND CAREFUL DESIGN MEET.",
    "CONTACTAME": "CONTACT ME",
    "SOBRE": "ABOUT",
    "MÍ": "ME",
    "01 · FORMACIÓN · ANÁLISIS DE SISTEMAS": "01 · EDUCATION · SYSTEMS ANALYSIS",
    "02 · FREELANCE · ANALISTA FUNCIONAL Y FULL STACK": "02 · FREELANCE · FUNCTIONAL ANALYST & FULL STACK",
    "03 · PASANTÍA · SOPORTE IT": "03 · INTERNSHIP · IT SUPPORT",
    "05 · DOCENCIA · ROBÓTICA, DATOS E IA": "05 · TEACHING · ROBOTICS, DATA & AI",
    "06 · NUEVO · COFUNDADOR Y CEO DE ÓRBITA": "06 · NEW · CO-FOUNDER & CEO OF ÓRBITA",
    "ANALISTA DE SISTEMAS": "SYSTEMS ANALYST",
    "SOPORTE IT": "IT SUPPORT",
    "DESARROLLADOR EDTECH": "EDTECH DEVELOPER",
    "PROFESOR DE IA Y ROBÓTICA": "AI & ROBOTICS PROFESSOR",
    "COFUNDADOR Y CEO": "CO-FOUNDER & CEO",
    "MAR 2026 — HOY": "MAR 2026 — PRESENT",
    "ENE 2026 — HOY": "JAN 2026 — PRESENT",
    "2023 — HOY": "2023 — PRESENT",
    "Etapas de experiencia": "Experience stages",
    "EXPERIENCIA Y TRAYECTORIA": "EXPERIENCE & BACKGROUND",
    "MI RECORRIDO": "WHERE I'VE BEEN",
    "Del análisis de sistemas al desarrollo full stack, las plataformas EdTech a gran escala, la docencia y, hoy, Órbita.": "From systems analysis to full stack development, large-scale EdTech platforms, teaching and, today, Órbita.",
    "I.A.E.S · INSTITUTO ARGENTINO DE ESTUDIOS SUPERIORES": "I.A.E.S · ARGENTINE INSTITUTE OF HIGHER STUDIES",
    "Técnico Superior en Análisis de Sistemas: carrera terciaria finalizada con foco en desarrollo de software, modelado de sistemas y bases de datos, complementada con certificaciones de Google UX Design (Coursera) y Desarrollo Full Stack (Udemy).": "Higher Technician in Systems Analysis: a completed tertiary degree focused on software development, systems modeling and databases, complemented by the Google UX Design (Coursera) and Full Stack Development (Udemy) certifications.",
    "ARQUITECTURA": "ARCHITECTURE",
    "Modelado de sistemas, diseño de bases de datos SQL, APIs REST y patrones MVC.": "Systems modeling, SQL database design, REST APIs and MVC patterns.",
    "UX Y PRODUCTO": "UX & PRODUCT",
    "Google UX Design, UX/UI con Figma y maquetación profesional CSS3 / HTML5.": "Google UX Design, UX/UI with Figma and professional CSS3 / HTML5 layout.",
    "Desarrollo web full stack y Java desde cero como base para sistemas reales.": "Full stack web development and Java from scratch as the base for real systems.",
    "JUN 2023 — PRESENTE": "JUN 2023 — PRESENT",
    "PROYECTOS FREELANCE": "FREELANCE PROJECTS",
    "Analista Funcional Ssr y desarrollador full stack para clientes reales: relevamiento de requerimientos en entrevistas, diseño de soluciones con prototipos y mejoras iterativas, y desarrollo de punta a punta.": "Semi-senior functional analyst and full stack developer for real clients: gathering requirements in interviews, designing solutions with prototypes and iterative improvements, and building end to end.",
    "ENTREGAS": "DELIVERY",
    "Más de 15 proyectos web en producción con Angular, Laravel, Next.js y JavaScript (S.I.T.I, Petty Joyas, GV Store, GabyGor, Taccu).": "More than 15 web projects in production with Angular, Laravel, Next.js and JavaScript (S.I.T.I, Petty Joyas, GV Store, GabyGor, Taccu).",
    "IA Y SISTEMAS": "AI & SYSTEMS",
    "Asistente de IA propio en S.I.T.I, POS con lector QR, MercadoPago y WhatsApp Business.": "A custom AI assistant in S.I.T.I, a POS with a QR reader, MercadoPago and WhatsApp Business.",
    "RENDIMIENTO": "PERFORMANCE",
    "Hasta 30 % menos de tiempo de carga en proyectos con tráfico real.": "Up to 30% faster load times on projects with real traffic.",
    "PASANTE DE SOPORTE IT": "IT SUPPORT INTERN",
    "Pasantía en el área de sistemas de un hotel en funcionamiento: soporte a usuarios internos, infraestructura y mantenimiento de equipos.": "An internship in the IT department of a working hotel: internal user support, infrastructure and equipment maintenance.",
    "SOPORTE": "SUPPORT",
    "Soporte técnico remoto y presencial a usuarios internos.": "Remote and on-site technical support for internal users.",
    "DIAGNÓSTICO": "TROUBLESHOOTING",
    "Incidencias de conectividad, hardware y software.": "Connectivity, hardware and software issues.",
    "INFRAESTRUCTURA": "INFRASTRUCTURE",
    "Instalación, configuración y mantenimiento preventivo de equipos.": "Installation, configuration and preventive maintenance of equipment.",
    "ENE 2026 — ACTUALIDAD": "JAN 2026 — PRESENT",
    "DESARROLLADOR FULL STACK · EDTECH": "FULL STACK DEVELOPER · EDTECH",
    "Desarrollo de las plataformas educativas de Paperlux, usadas por escuelas de todo Chile.": "Building Paperlux's educational platforms, used by schools all over Chile.",
    "Plataforma EdTech gamificada en más de 3.200 escuelas; la integración de IA con Groq redujo un 60 % la generación de contenido.": "A gamified EdTech platform in more than 3,200 schools; the AI integration with Groq cut content generation by 60%.",
    "Sistema post-compra con recorridos modulares, quizzes, seguimiento en tiempo real, correos y certificados PDF.": "A post-purchase system with modular paths, quizzes, real-time tracking, emails and PDF certificates.",
    "TECNOLOGÍAS": "STACK",
    "Next.js 14, NestJS, Prisma, Supabase, Vercel y Cloudflare Workers.": "Next.js 14, NestJS, Prisma, Supabase, Vercel and Cloudflare Workers.",
    "MAR 2026 — PRESENTE": "MAR 2026 — PRESENT",
    "Docente en dos institutos: la Tecnicatura Superior en Ciencia de Datos e IA en Instituto Crecer, y Robótica e Informática en el Instituto Tecnológico Itec.": "Teaching at two institutes: the Higher Technical Degree in Data Science and AI at Instituto Crecer, and Robotics and Computing at the Itec Technology Institute.",
    "CIENCIA DE DATOS E IA": "DATA SCIENCE & AI",
    "Clases de nivel superior, material didáctico y proyectos prácticos; IA generativa y automatización.": "Higher-education classes, teaching materials and hands-on projects; generative AI and automation.",
    "ROBÓTICA": "ROBOTICS",
    "Diseño e impartición de clases de robótica y programación en Itec.": "Designing and teaching robotics and programming classes at Itec.",
    "TECNOLOGÍAS EMERGENTES": "EMERGING TECHNOLOGIES",
    "Formación en metodologías de desarrollo y herramientas actuales.": "Training in development methodologies and current tools.",
    "MAY 2026 — PRESENTE": "MAY 2026 — PRESENT",
    "Cofundé Órbita y la dirijo como CEO: tiendas online con catálogo, stock y pedidos en un solo panel, sin comisiones por venta y con dominio propio. La construimos junto a Alexander Ibarra (CPO) y Alan Vega (CTO).": "I co-founded Órbita and lead it as CEO: online stores with catalog, stock and orders in a single dashboard, with no sales commissions and their own domain. We build it together with Alexander Ibarra (CPO) and Alan Vega (CTO).",
    "PRODUCTO": "PRODUCT",
    "Catálogo según el rubro, cobros con Mercado Pago o transferencia, pedidos, stock, clientes y equipo con permisos por rol.": "A catalog for each type of business, payments by Mercado Pago or bank transfer, orders, stock, customers and a team with role-based permissions.",
    "IA": "AI",
    "Orbi, un asistente con IA que conoce cada negocio: responde sobre ventas, stock y pedidos, y ayuda a operar el panel.": "Orbi, an AI assistant that knows each business: it answers about sales, stock and orders, and helps run the dashboard.",
    "PLATAFORMA": "PLATFORM",
    "Next.js 16 y React 19, API en NestJS con Prisma, Supabase, Google Cloud Run, Vercel y Cloudflare R2.": "Next.js 16 and React 19, a NestJS API with Prisma, Supabase, Google Cloud Run, Vercel and Cloudflare R2.",
    "05 · DOCENCIA": "05 · TEACHING",
    "ACTIVIDAD EN GITHUB": "GITHUB ACTIVITY",
    "EN VIVO": "LIVE",
    "EL AÑO, DÍA POR DÍA": "THE YEAR, DAY BY DAY",
    "contribuciones": "contributions",
    "Lo más honesto de un portfolio: lo que hice cada día del último año.": "The most honest part of a portfolio: what I did every day of the last year.",
    "Gráfico de contribuciones de GitHub del último año": "Chart of GitHub contributions over the last year",
    "01 · AÑO": "01 · YEAR",
    "02 · CIUDAD": "02 · CITY",
    "03 · SEMANAS": "03 · WEEKS",
    "04 · VUELTA": "04 · LOOP",
    "PROYECTO DESTACADO": "FEATURED PROJECT",
    "Carrusel ondulado 3D de Landing Pages": "3D wave carousel of landing pages",
    "VISITAR WEB ↗": "VISIT SITE ↗",
    "Sitio web institucional y consultoría legal · SEO optimizado": "Corporate website & legal consulting · SEO optimized",
    "Landing page de agencia digital · Diseño e identidad de marca": "Digital agency landing page · Design & brand identity",
    "Landing page de turismo · Traslados y excursiones en Misiones": "Tourism landing page · Transfers & tours in Misiones",
    "Landing page turística · Reservas directas por WhatsApp": "Tourism landing page · Direct bookings via WhatsApp",
    "Landing page ejecutiva · Remises turísticos en Puerto Iguazú": "Executive landing page · Tourist car service in Puerto Iguazú",
    "Landing page comercial · Viajes en la Triple Frontera": "Business landing page · Trips across the Triple Frontier",
    "Web app financiera · Cálculo interactivo de préstamos": "Finance web app · Interactive loan calculator",
    "PROYECTOS ’26": "WORKS ’26",
    "Lista de sistemas destacados": "List of featured systems",
    "Nuevo · Cofundador y CEO · Tiendas online sin comisión": "New · Co-founder & CEO · Commission-free online stores",
    "Plataforma EdTech · +3.200 escuelas en Chile": "EdTech platform · 3,200+ schools in Chile",
    "Sistema full stack + asistente de IA propio": "Full stack system + custom AI assistant",
    "Proyecto personal · Identidad de marca con IA y neuromarketing": "Personal project · Brand identity with AI and neuromarketing",
    "E-commerce + POS con QR y bot de WhatsApp": "E-commerce + POS with QR and WhatsApp bot",
    "Plataforma EdTech · Onboarding gamificado": "EdTech platform · Gamified onboarding",
    "Reserva de turnos en tiempo real": "Real-time appointment booking",
    "E-commerce deportivo full stack": "Full stack sportswear e-commerce",
    "SaaS de fidelización y puntos": "Loyalty & points SaaS",
    "E-commerce de ropa urbana y panel de administración": "Streetwear e-commerce & admin dashboard",
    "VER PROYECTO EN VIVO": "VIEW LIVE PROJECT",
    "VER GALERÍA DEL SISTEMA": "VIEW SYSTEM GALLERY",
    "Capturas del sistema": "System screenshots",
    "↓ SCROLL O ARRASTRÁ EL TAMBOR PARA ROTAR": "↓ SCROLL OR DRAG THE DRUM TO ROTATE",
    "VER LOS 24 PROYECTOS ↗": "SEE ALL 24 PROJECTS ↗",
    "LOS SERVICIOS QUE OFREZCO": "THE SERVICES I PROVIDE",
    "CREANDO SITIOS Y SISTEMAS WEB VISUALMENTE IMPACTANTES Y FUNCIONALES ADAPTADOS A LOS OBJETIVOS DE CADA CLIENTE.": "CREATING VISUALLY STRIKING, FUNCTIONAL WEBSITES AND WEB SYSTEMS TAILORED TO EACH CLIENT'S GOALS.",
    "DISEÑO UI / UX Y DE PRODUCTO": "UI / UX & PRODUCT DESIGN",
    "Diseño de interfaces centradas en el usuario con sistemas de diseño consistentes, prototipado interactivo en Figma y arquitectura de información pensada para maximizar conversión y retención.": "User-centered interface design with consistent design systems, interactive prototyping in Figma and information architecture built to maximize conversion and retention.",
    "ENTREGABLES: WIREFRAMING, PROTOTIPOS EN FIGMA, SISTEMAS DE DISEÑO, AUDITORÍA UX": "DELIVERABLES: WIREFRAMING, FIGMA PROTOTYPES, DESIGN SYSTEMS, UX AUDIT",
    "CONSULTAR ↗": "INQUIRE ↗",
    "SISTEMAS WEB FULL STACK E IA": "FULL STACK WEB SYSTEMS & AI",
    "Desarrollo de plataformas web completas, e-commerce con MercadoPago, sistemas POS con QR, turnos online e integración de asistentes de Inteligencia Artificial (OpenAI, Groq, Gemini, MCP) sobre arquitecturas escalables.": "Development of complete web platforms, e-commerce with MercadoPago, POS systems with QR, online booking and integration of AI assistants (OpenAI, Groq, Gemini, MCP) on scalable architectures.",
    "ENTREGABLES: NEXT.JS / ANGULAR, LARAVEL / NESTJS, SUPABASE / MYSQL, INTEGRACIÓN IA": "DELIVERABLES: NEXT.JS / ANGULAR, LARAVEL / NESTJS, SUPABASE / MYSQL, AI INTEGRATION",
    "DISEÑO DE LANDING PAGES": "LANDING PAGE DESIGN",
    "Landing pages editoriales e interactivas de alta conversión para empresas, lanzamientos de productos y marcas profesionales. Diseñadas con animaciones fluidas, SEO técnico y máxima velocidad de carga.": "Editorial, interactive, high-converting landing pages for companies, product launches and professional brands. Designed with smooth animations, technical SEO and top loading speed.",
    "ENTREGABLES: ESTRUCTURA PERSUASIVA, ANIMACIÓN / 3D INTERACTIVO, SEO TÉCNICO, DEPLOY RÁPIDO": "DELIVERABLES: PERSUASIVE STRUCTURE, MOTION / INTERACTIVE 3D, TECHNICAL SEO, FAST DEPLOY",
    "HABLEMOS": "LET’S TALK",
    "COPIAR EMAIL": "COPY EMAIL",
    "ESCRITOS Y BLOG": "WRITING & BLOG",
    "PORTFOLIO. TODOS LOS DERECHOS RESERVADOS": "PORTFOLIO. ALL RIGHTS RESERVED",
    "DISEÑO DE MATEO ROJAS": "DESIGN BY MATEO ROJAS",
    "CONTACTO DIRECTO · MATEO ROJAS": "DIRECT CONTACT · MATEO ROJAS",
    "CERRAR ✕": "CLOSE ✕",
    "¿Tenés un proyecto o propuesta en mente?": "Do you have a project or proposal in mind?",
    "Disponible para proyectos Full Stack, integraciones de IA, consultoría técnica y oportunidades remotas, híbridas o presenciales.": "Available for full stack projects, AI integrations, technical consulting and remote, hybrid or on-site opportunities.",
    "rojas.mateo.web@gmail.com (Click para copiar)": "rojas.mateo.web@gmail.com (click to copy)",
    "UBICACIÓN": "LOCATION",
    "NOMBRE": "NAME",
    "Tu nombre o empresa": "Your name or company",
    "tu@email.com": "you@email.com",
    "ASUNTO": "SUBJECT",
    "Desarrollo Full Stack / Proyecto / Propuesta": "Full stack development / Project / Proposal",
    "MENSAJE": "MESSAGE",
    "Contame sobre tu proyecto, plazos o necesidad...": "Tell me about your project, timeline or needs...",
    "ENVIAR MENSAJE": "SEND MESSAGE",
    "Email copiado: rojas.mateo.web@gmail.com": "Email copied: rojas.mateo.web@gmail.com",
    "Abriendo tu cliente de correo...": "Opening your email client...",
    "ARCHIVO COMPLETO DE PROYECTOS (24)": "FULL PROJECT ARCHIVE (24)",
    "Nuevo · Cofundador y CEO": "New · Co-founder & CEO",
    "Tiendas online con catálogo, stock y pedidos, sin comisiones por venta, con dominio propio y Orbi, un asistente con IA. Next.js, NestJS, Supabase, Cloud Run.": "Online stores with catalog, stock and orders, no sales commissions, their own domain and Orbi, an AI assistant. Next.js, NestJS, Supabase, Cloud Run.",
    "Ver web ↗": "Visit site ↗",
    "Proyecto personal · IA": "Personal project · AI",
    "Genera en 60 segundos logo, paleta, tipografías y una maqueta web a partir de una frase, con cada decisión respaldada por neuromarketing y un Neuro-Validation Report™. Next.js 14, Three.js, Zod, Supabase.": "Generates a logo, palette, typography and a website mockup from a single sentence in 60 seconds, with every decision backed by neuromarketing and a Neuro-Validation Report™. Next.js 14, Three.js, Zod, Supabase.",
    "Ver galería ↗": "View gallery ↗",
    "EdTech · +3.200 Escuelas en Chile": "EdTech · 3,200+ schools in Chile",
    "Plataforma educativa gamificada con IA integrada (Groq). Next.js 14, NestJS, Prisma, Supabase.": "A gamified educational platform with built-in AI (Groq). Next.js 14, NestJS, Prisma, Supabase.",
    "Sistema Full Stack + IA": "Full stack system + AI",
    "Gestión para tiendas multimarca con JWT, 5 roles y asistente de IA propio en Angular 17 + Laravel 12.": "Management for multi-brand stores with JWT, 5 roles and a custom AI assistant in Angular 17 + Laravel 12.",
    "E-Commerce Full Stack + POS": "Full stack e-commerce + POS",
    "Joyería online con POS lector QR, chatbot WhatsApp Business y checkout MercadoPago.": "An online jewelry store with a QR-reader POS, a WhatsApp Business chatbot and MercadoPago checkout.",
    "Plataforma EdTech · Chile": "EdTech platform · Chile",
    "Onboarding gamificado para docentes con seguimiento de progreso y certificados PDF.": "Gamified onboarding for teachers with progress tracking and PDF certificates.",
    "E-Commerce Full Stack": "Full stack e-commerce",
    "Tienda de indumentaria deportiva en Next.js, TypeScript, Prisma, Supabase y MercadoPago.": "A sportswear store built with Next.js, TypeScript, Prisma, Supabase and MercadoPago.",
    "Sistema de Turnos Online": "Online booking system",
    "Reserva de turnos en tiempo real con múltiples servicios combinables y notificaciones.": "Real-time booking with multiple combinable services and notifications.",
    "Sistema de Fidelización": "Loyalty system",
    "Sistema de puntos y recompensas con Google OAuth, login telefónico y panel administrativo.": "A points and rewards system with Google OAuth, phone login and an admin dashboard.",
    "E-Commerce Laravel": "Laravel e-commerce",
    "Tienda online de ropa urbana con panel administrativo y base de datos MySQL.": "An online streetwear store with an admin dashboard and a MySQL database.",
    "Sitio Web Institucional": "Corporate website",
    "Presencia profesional y SEO local optimizado para estudio jurídico.": "Professional presence and optimized local SEO for a law firm.",
    "Servicio de traslados turísticos en Misiones.": "Tourist transfer service in Misiones.",
    "Traslados y excursiones turísticas en Puerto Iguazú.": "Transfers and tours in Puerto Iguazú.",
    "Remises y traslados turísticos en Puerto Iguazú.": "Car service and tourist transfers in Puerto Iguazú.",
    "Traslados a toda la provincia de Misiones.": "Transfers across the whole province of Misiones.",
    "Maquetación web para agencia de diseño digital.": "Website build for a digital design agency.",
    "Sistema Médico Angular + Laravel": "Medical system · Angular + Laravel",
    "Gestión clínica con agenda, historial médico, roles y autenticación JWT.": "Clinic management with scheduling, medical records, roles and JWT authentication.",
    "Código en GitHub ↗": "Code on GitHub ↗",
    "Sistema PHP MVC + Docker": "PHP MVC system + Docker",
    "Sistema de Turnos Barbería": "Barbershop booking system",
    "Sistema Barbería": "Barbershop system",
    "Agenda dinámica, recordatorios por email y arquitectura MVC en PHP + MySQL.": "Dynamic scheduling, email reminders and an MVC architecture in PHP + MySQL.",
    "Herramienta Financiera": "Financial tool",
    "Simulador de Amortización": "Loan amortization simulator",
    "Simulación interactiva de cuadros de amortización de préstamos.": "Interactive simulation of loan amortization schedules.",
    "Plataforma de Eventos": "Events platform",
    "Plataforma para conferencias online con venta de tickets y pases.": "A platform for online conferences with ticket and pass sales.",
    "Portal Inmobiliario MVC": "MVC real estate portal",
    "Sistema de Bienes Raíces": "Real estate system",
    "Bienes Raíces": "Real estate",
    "Administración y catálogo de propiedades con panel de control.": "Property management and catalog with a control panel.",
    "ESCRITOS Y ARTÍCULOS TÉCNICOS": "TECHNICAL WRITING & ARTICLES",
    "Innovación EdTech · Dic 2025": "EdTech innovation · Dec 2025",
    "Revolucionando la educación: IA en la creación de recursos": "Revolutionizing education: AI in resource creation",
    "Cómo la integración de IA para importación y categorización masiva permite a los educadores enfocarse en lo importante.": "How AI-powered bulk import and categorization lets educators focus on what matters.",
    "Leer artículo ↗": "Read article ↗",
    "Inteligencia Artificial · Abr 2026": "Artificial intelligence · Apr 2026",
    "Cómo desarrollé un modelo de IA manual y lo integré en SITI": "How I built a hand-made AI model and integrated it into SITI",
    "El proceso completo de crear un asistente adaptado a un sistema de gestión real con respuestas ultrarrápidas.": "The full process of building an assistant tailored to a real management system, with ultra-fast answers.",
    "Inteligencia Artificial · Nov 2025": "Artificial intelligence · Nov 2025",
    "Creando un servidor MCP para conectar IAs a bases de datos": "Building an MCP server to connect AIs to databases",
    "Cómo utilizar el Model Context Protocol para dotar a los LLMs de acceso seguro a datos reales.": "How to use the Model Context Protocol to give LLMs secure access to real data.",
    "Full Stack · Ene 2025": "Full Stack · Jan 2025",
    "Cómo conectar Angular 17 con Laravel 12 usando APIs REST": "How to connect Angular 17 to Laravel 12 with REST APIs",
    "CORS, JWT, interceptores y arquitectura de carpetas para proyectos que escalan.": "CORS, JWT, interceptors and folder architecture for projects that scale.",
    "DevOps · Abr 2025": "DevOps · Apr 2025",
    "Dockerizá tu app Laravel en 15 minutos": "Dockerize your Laravel app in 15 minutes",
    "El stack Docker que uso en producción: PHP-FPM, Nginx, MySQL y deploy con CI/CD.": "The Docker stack I use in production: PHP-FPM, Nginx, MySQL and CI/CD deploys.",
    "Nube y serverless · Sep 2025": "Cloud & serverless · Sep 2025",
    "De VPS tradicional a Vercel + Supabase: Escalabilidad inmediata": "From a traditional VPS to Vercel + Supabase: instant scalability",
    "Por qué pasé a usar arquitecturas serverless para mis proyectos full-stack de alta demanda.": "Why I moved to serverless architectures for my high-demand full stack projects.",
    "ARTÍCULO": "ARTICLE",
    "GALERÍA DEL SISTEMA": "SYSTEM GALLERY",
  };

  const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const esText = new WeakMap(); // nodo de texto → su texto en español
  const esAttr = new WeakMap(); // elemento → { atributo: su valor en español }
  const root = document.documentElement;
  const esTitle = document.title;
  // se abre en inglés; el español queda si alguien lo eligió antes
  let lang = 'en';
  try {
    if (localStorage.getItem('echo-lang') === 'es') lang = 'es';
  } catch (_) { /* sin almacenamiento: queda en inglés */ }

  // el texto en el idioma actual, conservando los espacios de los costados
  function swap(es) {
    if (lang !== 'en') return es;
    const en = EN[norm(es)];
    return en ? es.match(/^\s*/)[0] + en + es.match(/\s*$/)[0] : es;
  }

  function localize(scope = document.body) {
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest('script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!esText.has(n)) esText.set(n, n.nodeValue);
      const v = swap(esText.get(n));
      if (n.nodeValue !== v) n.nodeValue = v;
    }
    const els = scope.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(','));
    for (const el of [scope, ...els]) {
      if (!el.getAttribute) continue;
      for (const a of ATTRS) {
        if (!el.hasAttribute(a)) continue;
        let saved = esAttr.get(el);
        if (!saved) esAttr.set(el, (saved = {}));
        if (!(a in saved)) saved[a] = el.getAttribute(a);
        const v = swap(saved[a]);
        if (el.getAttribute(a) !== v) el.setAttribute(a, v);
      }
    }
  }

  function set(next) {
    lang = next === 'en' ? 'en' : 'es';
    try { localStorage.setItem('echo-lang', lang); } catch (_) { /* no se recuerda */ }
    root.lang = lang;
    document.title = swap(esTitle);
    localize(document.body);
    document.dispatchEvent(new Event('echo:lang'));
  }

  window.echoI18n = {
    get lang() { return lang; },
    t: swap,
    localize,
    set,
    // el texto en español de un nodo, aunque ahora se vea en inglés
    original: (node) => esText.get(node) ?? node.nodeValue,
  };

  // los scripts con defer corren con la página ya leída: en inglés se cambia antes de verse
  if (lang === 'en') {
    root.lang = 'en';
    document.title = swap(esTitle);
    localize(document.body);
  }
})();
