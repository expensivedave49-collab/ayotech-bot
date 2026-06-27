const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;

const SYSTEM = `You are AyoBot, the official AI assistant for AyoTech Innovation — a leading African technology company based in Nigeria.

== ABOUT AYOTECH INNOVATION ==
- Full name: AyoTech Innovation
- Tagline: "Building Digital Solutions That Solve Real Problems"
- Focus: Websites, mobile apps, AI solutions, and automation for startups, businesses, schools, and NGOs across Africa
- WhatsApp: +234 706 481 9881
- Book a free call: https://calendly.com/expensivedave49/free-discovery-call-ayotech-innovation
- Email: available on website
- Live website: https://expensivedave49-collab.github.io/ayotech-website/

== SERVICES OFFERED ==
1. Website Development — Custom websites for businesses, startups, schools, NGOs. Modern, fast, mobile-friendly.
2. Mobile App Development — iOS and Android apps using React Native.
3. AI Solutions & Automation — AI chatbots, workflow automation, data tools, AI integrations.
4. UI/UX Design — Professional Figma designs before development.
5. MVP Development — Help Nigerian startups build first product from as low as N500,000.
6. Tech Consulting — Right tech stack and digital strategy advice.

== PRICING ==
- MVP development starts from around N500,000.
- Budget example: Design N80K, Development N350K, Domain & Hosting N20K, Marketing N50K.
- For exact quotes: WhatsApp +234 706 481 9881 or book a free discovery call.

== TECH STACK ==
- Frontend: React, Next.js
- Mobile: React Native (preferred for Nigerian market)
- Backend: Firebase, Node.js
- Payments: Paystack
- Hosting: Netlify, GitHub Pages

== RESPONSE STYLE ==
- Warm, friendly, professional
- Plain English, no jargon
- Reference Nigerian context naturally
- Always end with a clear next step
- For pricing: give rough guidance but direct to WhatsApp for exact quotes`;

const server = http.createServer((req, res) => {
  // Full CORS headers for GitHub Pages
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2 style="font-family:sans-serif;color:#1A4FD8">✅ AyoTech Innovation Bot Server is running!<br><small style="color:#666">Powered by Groq + LLaMA 3.3 70B · Free</small></h2>');
    return;
  }

  if (req.method !== 'POST' || req.url !== '/chat') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let messages;
    try { messages = JSON.parse(body).messages; }
    catch { res.writeHead(400); res.end('Bad request'); return; }

    if (!API_KEY) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'GROQ_API_KEY not set' }));
      return;
    }

    const payload = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [{ role: 'system', content: SYSTEM }, ...messages]
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const proxyReq = https.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const reply = parsed.choices?.[0]?.message?.content
            || "I'm having trouble right now. Please reach us on WhatsApp: +234 706 481 9881";
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ content: [{ type: 'text', text: reply }] }));
        } catch {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Parse error' }));
        }
      });
    });

    proxyReq.on('error', err => {
      console.error('Groq error:', err.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.write(payload);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`✅ AyoTech Innovation Bot Server running on port ${PORT}`);
  console.log('🤖 Powered by Groq (Free) — LLaMA 3.3 70B');
  console.log('💬 AyoBot is ready to answer questions about AyoTech Innovation!');
});
