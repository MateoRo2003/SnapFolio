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
          }
        };
