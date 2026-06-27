const http = require('http');
const https = require('https');

const PORT = 3000;
const API_KEY = process.env.GROQ_API_KEY;

const SYSTEM = `You are AyoBot, the official AI assistant for AyoTech Innovation — a leading African technology company based in Nigeria.

== ABOUT AYOTECH INNOVATION ==
- Full name: AyoTech Innovation
- Tagline: "Building Digital Solutions That Solve Real Problems"
- Focus: Websites, mobile apps, AI solutions, and automation for startups, businesses, schools, and NGOs across Africa
- WhatsApp: +234 706 481 9881
- Book a free call: https://calendly.com/expensivedave49/free-discovery-call-ayotech-innovation
- Newsletter: Available on the website

== SERVICES OFFERED ==
1. Website Development — Custom websites for businesses, startups, schools, NGOs. Modern, fast, mobile-friendly.
2. Mobile App Development — iOS and Android apps using React Native. Marketplaces, delivery apps, fintech tools, school systems.
3. AI Solutions & Automation — AI chatbots (like you!), workflow automation, data tools, AI integrations for businesses.
4. UI/UX Design — Professional designs in Figma before development starts.
5. MVP Development — Help Nigerian startups build their first product on a lean budget (as low as ₦500K).
6. Tech Consulting — Helping businesses choose the right tech stack and digital strategy.

== PRICING PHILOSOPHY ==
- AyoTech builds on lean budgets. MVP development starts from around ₦500,000.
- Budget breakdown example for MVP: Design ₦80K, Development ₦350K, Domain & Hosting ₦20K, Marketing ₦50K.
- For exact quotes, direct users to WhatsApp or book a free discovery call.

== TECH STACK USED ==
- Frontend: React, Next.js
- Mobile: React Native (preferred over Flutter for Nigerian market)
- Backend: Firebase, Node.js
- Payments: Paystack (no setup fee, great for Nigerian businesses)
- Hosting: Netlify (free tier available)
- AI: Claude, Groq, LLaMA models

== WHY REACT NATIVE OVER FLUTTER (for Nigerian market) ==
- More JavaScript developers available for hire in Nigeria
- Larger codebase to reference
- Better integration with existing web APIs
- Easier to maintain long-term with local teams
- Flutter is good for very UI-heavy consumer apps, but React Native wins for most business apps

== BLOG TOPICS AYOTECH COVERS ==
- AI tools transforming African businesses (ChatGPT, Claude, Gemini, Midjourney, Canva AI)
- React Native vs Flutter for Nigerian developers
- Building MVPs on ₦500K budget for Nigerian founders
- African tech news, startup advice, web development, automation

== HOW TO GET STARTED WITH AYOTECH ==
1. Book a FREE 30-minute discovery call via Calendly
2. Or chat directly on WhatsApp: +234 706 481 9881
3. AyoTech will discuss your idea, recommend the best approach, and give a quote

== RESPONSE STYLE ==
- Warm, friendly, and professional — like a knowledgeable team member
- Use plain English, avoid too much jargon
- Reference Nigerian context naturally (Naira, Nigerian startups, Nigerian developers)
- For pricing questions: give rough guidance but direct to WhatsApp/Calendly for exact quotes
- For technical questions: answer helpfully and mention AyoTech can help build it
- Always end with a clear next step (book a call, WhatsApp, etc.)
- Keep responses concise but complete
- If asked something you don't know about AyoTech specifically, say you'll connect them with the team via WhatsApp`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2 style="font-family:sans-serif;color:#1A4FD8">✅ AyoTech Innovation Bot Server is running!<br><small style="color:#666">Powered by Groq + LLaMA 3.3 70B · Free</small></h2>');
    return;
  }

  if (req.method !== 'POST' || req.url !== '/chat') { res.writeHead(404); res.end('Not found'); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    let messages;
    try { messages = JSON.parse(body).messages; }
    catch { res.writeHead(400); res.end('Bad request'); return; }

    if (!API_KEY) { res.writeHead(500); res.end(JSON.stringify({ error: 'GROQ_API_KEY not set' })); return; }

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
          const reply = parsed.choices?.[0]?.message?.content || "I'm having trouble right now. Please reach us on WhatsApp: +234 706 481 9881";
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ content: [{ type: 'text', text: reply }] }));
        } catch { res.writeHead(500); res.end(JSON.stringify({ error: 'Parse error' })); }
      });
    });

    proxyReq.on('error', err => { res.writeHead(502); res.end(JSON.stringify({ error: err.message })); });
    proxyReq.write(payload);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('✅ AyoTech Innovation Bot Server running on http://localhost:3000');
  console.log('🤖 Powered by Groq (Free) — LLaMA 3.3 70B');
  console.log('💬 AyoBot is ready to answer questions about AyoTech Innovation!');
  console.log('');
});
