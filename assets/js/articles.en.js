// Los artículos del blog en inglés (los que se abren desde "Escritos"); en español están en articles.js.
window.ARTICLES_EN = {
          1: {
            category: "Full Stack",
            title: "How to connect Angular 17 to Laravel 12 with REST APIs",
            meta: "January 2025 &nbsp;·&nbsp; 5 min read",
            body: `
        <p>Angular and Laravel are one of the most powerful combinations for modern projects. In this article I walk you through the architecture I use in production, step by step.</p>
        <h6>1. Set up CORS in Laravel</h6>
        <p>The first hurdle is always CORS. In <code>config/cors.php</code> you need to allow your Angular app's origin and the headers JWT needs:</p>
        <pre><code>'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
'supports_credentials' => true,</code></pre>
        <h6>2. Authentication with JWT</h6>
        <p>We use the <code>tymon/jwt-auth</code> package. The flow is simple: the user logs in, Laravel returns a token, Angular keeps it in memory (never in localStorage) and attaches it to every request with an HTTP interceptor.</p>
        <h6>3. Angular interceptor</h6>
        <p>The interceptor catches every outgoing request and adds the <code>Authorization: Bearer {token}</code> header automatically, so you don't have to do it in each service.</p>
        <h6>4. Recommended folder structure</h6>
        <p>On the frontend I split <strong>core</strong> (interceptors, guards, global services), <strong>features</strong> (modules per domain) and <strong>shared</strong> (reusable components). In Laravel I follow the repository pattern to decouple business logic from the controller.</p>
        <h6>Conclusion</h6>
        <p>This combination scales very well. On this base you can add refresh tokens, roles and permissions without changing the core architecture.</p>
      `
          },
          4: {
            category: "DevOps",
            title: "Dockerize your Laravel app in 15 minutes: a reproducible, ready-to-go environment",
            meta: "April 2025 &nbsp;·&nbsp; 7 min read",
            body: `
        <p>The classic "it works on my machine" goes away once you dockerize your project. Here is the stack I use for Laravel in production.</p>
        <h6>The 3 containers you need</h6>
        <p><strong>php-fpm</strong> to run PHP, <strong>nginx</strong> as a reverse proxy and static file server, and <strong>mysql</strong> for the database. Optionally, a <strong>redis</strong> container for cache and queues.</p>
        <h6>The base docker-compose.yml</h6>
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
        <h6>Environment variables</h6>
        <p>Never hardcode credentials. Use a <code>.env</code> file that Docker reads automatically and that you never commit to the repository.</p>
        <h6>Deploying to production</h6>
        <p>With a CI/CD pipeline (GitHub Actions) that builds the image, pushes it to a registry and runs <code>docker compose pull && docker compose up -d</code> on the server. Deploys in under 2 minutes.</p>
      `
          },
          9: {
            category: "Artificial intelligence",
            title: "How I built a hand-made AI model and integrated it into SITI",
            meta: "April 2026 &nbsp;·&nbsp; 7 min read",
            body: `
        <p>SITI is my flagship project: an all-in-one management system for independent stores. When I decided to add an AI assistant, instead of using closed models like GPT-4, I chose to build a hand-made model tailored specifically to the business domain.</p>
        <h6>The problem to solve</h6>
        <p>Generic models are far too large and expensive, and they don't understand the sales system's specific jargon. Salespeople needed instant answers: which product has the best margin? Which ones sell the most?</p>
        <h6>Architecture: training and fine-tuning</h6>
        <p>I took a lightweight open-source model and fine-tuned it with a dataset generated from real SITI queries. That let the model learn the structure of our relational database and translate natural-language questions straight into optimized SQL and inventory reports.</p>
        <h6>Integration and deployment</h6>
        <p>The <strong>Laravel</strong> backend talks through an internal API to a Python service where the model lives, loaded in memory. Because it is a small, tailored model, inference takes milliseconds, which gives salespeople a real-time chat experience through the <strong>Angular</strong> frontend.</p>
        <h6>Why your own model pays off</h6>
        <p>Full control over customer data privacy (nothing leaves our servers), zero per-token costs from external APIs, and much lower latency. In the long run, our own model is an invaluable asset for scaling the system.</p>
      `
          },
          10: {
            category: "Backend",
            title: "From a traditional VPS to Vercel + Supabase: instant scalability",
            meta: "September 2025 &nbsp;·&nbsp; 6 min read",
            body: `
        <p>Running VPS servers is great for learning, but once you have several projects in production, security updates and monitoring eat up a lot of time. Here is how and why I moved most of my stack to serverless.</p>
        <h6>The old way</h6>
        <p>I used to create a droplet on DigitalOcean, install Nginx, set up SSL certificates with Certbot, install MySQL and configure daily backups. If traffic spiked, I had to resize the server by hand. A lot of friction for projects that need to move fast.</p>
        <h6>The serverless era: Next.js and Vercel</h6>
        <p>With <strong>Vercel</strong>, deploying is just a git push. The global CDN serves static content instantly, and Serverless Functions scale automatically. Zero infrastructure setup, 100% focus on the code.</p>
        <h6>Where Supabase fits</h6>
        <p>For the database I needed a modern equivalent of my old MySQL. <strong>Supabase</strong> (built on PostgreSQL) offers not only a managed database but also authentication, file storage and Row Level Security (RLS). On top of that, generating instant REST APIs from the database schema sped up my frontend work by 40%.</p>
        <h6>Conclusion</h6>
        <p>Moving to Vercel + Supabase brought my maintenance time down to zero hours a month and lets me sleep well knowing that if a project goes viral, the infrastructure will scale on its own.</p>
      `
          },
          11: {
            category: "Artificial intelligence",
            title: "Building an MCP server to connect AIs to databases",
            meta: "November 2025 &nbsp;·&nbsp; 8 min read",
            body: `
        <p>The <strong>Model Context Protocol (MCP)</strong> is a groundbreaking standard for how AI models connect to and work with external data sources. In this article I show you how I built an MCP server in Rust.</p>
        <h6>The limit of AI</h6>
        <p>Until recently, if you wanted an LLM to query a company database, you had to write glue scripts or rely on expensive, rigid RAG systems. With MCP you can build universal tools that AI agents discover and use in a standard way.</p>
        <h6>Building the MCP server in Rust</h6>
        <p>I chose <strong>Rust</strong> for its performance and memory safety. The server exposes methods (Tools) over the JSON-RPC protocol. For example, I exposed an <code>execute_secure_query</code> tool that takes validated parameters and turns them into queries against our PostgreSQL database, returning the matching JSON.</p>
        <h6>Working with agents</h6>
        <p>Once the MCP server was running, tools like <strong>Claude Code</strong> or custom agents could connect to it automatically. When a user asks "How many sales did we have yesterday?", the AI agent asks the MCP server which tools exist, finds the database one, writes the query and gives the end user the answer, completely seamlessly.</p>
        <h6>Security and what's next</h6>
        <p>MCP lets you define strict permissions, so the AI model can never run a <code>DROP TABLE</code>. It is the ultimate glue between LLMs and the real world of business applications.</p>
      `
          },
          12: {
            category: "EdTech innovation",
            title: "Revolutionizing education: the impact of AI on EdTech platforms",
            meta: "December 2025 &nbsp;·&nbsp; 6 min read",
            body: `
        <p>When building large-scale educational platforms (like Paperflix), one of the biggest bottlenecks is creating and organizing content. In my experience working on systems for thousands of schools, AI completely changed the game.</p>
        <h6>Automating resource uploads</h6>
        <p>School administrators used to spend hours filling in metadata. With generative AI models built in, the system can now analyze the URL of an external resource and automatically extract the title, an accurate teaching description, the subject and the relevant tags. A 10-minute job now takes 5 seconds.</p>
        <h6>Scaling knowledge</h6>
        <p>When more than 3,200 schools use a platform, standardizing the material is key. AI makes sure descriptions follow a single educational format, fixing human errors and improving indexing for the internal search engine.</p>
        <h6>Bulk import</h6>
        <p>On top of AI, I designed the architecture to combine these models with bulk imports from Excel. The system reads a file with hundreds of links, processes each one in the background while validating the required data, and produces a catalog ready for students with no friction.</p>
        <h6>The role of technology</h6>
        <p>The goal of these tools is not to replace human judgment but to free it from repetitive tasks. By handing digital paperwork to AI, educators and administrators can spend their time designing better learning strategies.</p>
      `
          },
          13: {
            category: "Automation & AI",
            title: "How I connected an AI chatbot to WhatsApp Business without it making up prices",
            meta: "July 2026 &nbsp;·&nbsp; 8 min read",
            body: `
        <p>For Petty Joyas, an online jewelry store, I built a bot that answers on the store's WhatsApp number: prices, stock, shipping and order status with real data from the database. It remembers the conversation and knows when to hand it over to a person.</p>
        <h6>The official API, not a shortcut</h6>
        <p>I used the <strong>WhatsApp Cloud API</strong>, Meta's official route: a verified business number, free within its limits. Unofficial libraries that emulate WhatsApp Web break the terms and can get the number banned, and for a store that number is a sales channel.</p>
        <p>Setup happens once: an app in Meta for Developers, the number and business verified in Business Manager, a permanent token and the webhook pointing to the site's API.</p>
        <h6>A webhook that only accepts Meta</h6>
        <p>Meta verifies the webhook with a challenge (<code>hub_challenge</code>) and then signs every message. The Laravel backend validates the <code>X-Hub-Signature-256</code> header with the App Secret and drops any payload that doesn't come from Meta.</p>
        <pre><code>GET  /api/whatsapp/webhook   # verification (hub_challenge)
POST /api/whatsapp/webhook   # incoming messages, signed
POST /api/whatsapp/send      # manual reply from the dashboard</code></pre>
        <h6>The AI queries the database, it doesn't memorize it</h6>
        <p>I don't load the whole catalog into the model. I give it <strong>tools</strong> (function calling) and it decides which one to use: <code>buscar_productos</code>, <code>detalle_producto</code>, <code>info_envios</code>, <code>info_pagos</code>, <code>estado_pedido</code>… Each one is a real database query, so the bot never invents a price or a stock level.</p>
        <p>The engine is Groq with Llama models plus a list of fallback models: if one is overloaded or retired, the answer comes from the next. The tool loop is capped at five rounds so the model can't keep calling the same thing in circles.</p>
        <h6>One brain for the website and WhatsApp</h6>
        <p>The site chat and the WhatsApp bot share the same AI service. The difference is memory: on WhatsApp I keep the history per number (the last 16 messages, for 3 hours of inactivity), so if the customer already gave their order number, they aren't asked again.</p>
        <p>The WhatsApp number is also matched to registered customers by comparing the last 10 digits, to tolerate phones saved with prefixes or dashes.</p>
        <h6>When a person steps in</h6>
        <p>If the customer writes something like “I want to talk to a person”, the team gets an email, once per conversation so the inbox doesn't flood. From the dashboard you can <strong>pause the AI</strong> in that chat and reply by hand; the bot stays out meanwhile.</p>
        <p>One design rule: the bot informs and hands off, but never moves money or stock on its own. Purchases still go through checkout.</p>
        <h6>Details that add up</h6>
        <p>The dashboard also configures the welcome message, the <em>ice breakers</em> (conversation starter buttons) and slash commands, which sync with Meta. They're pure WhatsApp features: they work even with the bot off.</p>
      `
          },
          14: {
            category: "Marketing & social",
            title: "Social media in an e-commerce: Meta Pixel, Instagram and link previews that sell",
            meta: "August 2026 &nbsp;·&nbsp; 6 min read",
            body: `
        <p>Integrating social media into a store isn't adding Instagram icons to the footer. At Petty Joyas I worked on three fronts: letting Meta know what happens in the store to optimize ads, keeping the Instagram feed on the site without breaking anything, and making every product look good when someone shares it.</p>
        <h6>Meta Pixel with the events that matter</h6>
        <p>The base script (init and <code>PageView</code>) goes once in the layout. Conversion events live in a separate module, so no component repeats the “does <code>fbq</code> exist?” logic:</p>
        <ul>
          <li><strong>ViewContent</strong>: someone opens a product page.</li>
          <li><strong>AddToCart</strong>: they add it to the cart.</li>
          <li><strong>InitiateCheckout</strong>: they reach checkout with a cart.</li>
          <li><strong>Purchase</strong>: confirmed purchase, with the real value in pesos.</li>
        </ul>
        <pre><code>trackPurchase({ orderNumber, items, value });
// eventID = order number</code></pre>
        <p>The <code>Purchase</code> event carries the order number as its <code>eventID</code>. If the same event ever also arrives through the server-side Conversions API, Meta counts it once. And if the customer reloads the “order confirmed” page, the purchase isn't recorded again.</p>
        <h6>The Instagram feed, without breaking the site</h6>
        <p>I first tried a third-party widget and it injected global CSS that broke other parts of the site, like the cart and the mobile menu. I replaced it with the <strong>official Instagram embed</strong>: free, no API key, and each post lives in its own iframe, isolated from the rest.</p>
        <p>Post links are managed from the admin panel, so the client changes the gallery without touching code. And a performance detail: the list is memoized by content, because otherwise every re-render reprocessed the embeds and fired repeated requests to Instagram.</p>
        <h6>Previews that sell</h6>
        <p>A good share of a small store's sales start on WhatsApp or an Instagram DM. Every product page generates its own <strong>Open Graph</strong> metadata with the name, short description and first photo, so pasting the link in a chat shows the piece with its photo instead of a generic logo.</p>
        <h6>Takeaway</h6>
        <p>Social media works better when the store speaks its language: well-named events for ads, isolated content so the design doesn't break, and metadata built for how people actually share.</p>
      `
          },
          15: {
            category: "Full Stack",
            title: "A point of sale that keeps selling without internet",
            meta: "September 2026 &nbsp;·&nbsp; 7 min read",
            body: `
        <p>A physical store can't stop charging because the WiFi went down. For the Petty Joyas shop I built a point of sale that works offline: it records sales, stock adjustments and new products, and syncs everything when the connection comes back.</p>
        <h6>Barcode scanners without an SDK</h6>
        <p>USB and Bluetooth scanners behave like a keyboard: they “type” the code and press Enter. No proprietary SDK needed. The frontend captures that input and the backend resolves the code with a single endpoint:</p>
        <pre><code>GET /api/products/lookup?barcode=7791234567890</code></pre>
        <p>It accepts EAN-13, EAN-8, Code 128, Code 39 and QR, and the barcode column is unique and indexed so lookups are instant.</p>
        <h6>Sync events, not databases</h6>
        <p>The key idea: I don't copy the shop's database to the cloud. The point of sale (a PWA) stores <strong>business events</strong> in IndexedDB: sale created, stock adjusted, product created or edited, inventory counted. When the connection returns, it sends them in order to the API.</p>
        <pre><code>POST /api/sync/events   # one event or a batch
→ { id, status: "accepted" | "duplicate" | "error" }</code></pre>
        <h6>Idempotency: the rule that prevents double sales</h6>
        <p>Every event is born with a UUID generated on the device. If the connection drops mid-request and the point of sale retries, the backend recognizes the <code>id</code> and marks it <code>duplicate</code> instead of recording the sale again.</p>
        <p>Events are processed in the order they happened in the shop, and each type has its own backend action: the sale goes to sale creation, the adjustment to stock movements, and so on.</p>
        <h6>Stock as history</h6>
        <p>Stock isn't a number that gets overwritten: it's the sum of its movements. So if the same item sold offline in the shop and online at the same time, nothing is lost: both movements are recorded and the conflict is visible and resolved with data, not blindly.</p>
        <h6>Result</h6>
        <p>The shop sells the same with or without internet, and the online and physical stores share one inventory without anyone entering anything twice.</p>
      `
          }
        };
