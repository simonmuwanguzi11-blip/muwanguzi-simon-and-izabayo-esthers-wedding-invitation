const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const adminEmail = process.env.ADMIN_EMAIL || 'simonmuwanguzi11@gmail.com';
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || '256743161242';

function messageFor(guest) {
  return `🔔 NEW ${(guest.contribution ? 'CONTRIBUTION' : 'RSVP')}\n\nName: ${guest.name}\nPhone: ${guest.phone}\nGuests: ${guest.guests}\nContribution: ${guest.contribution || 'N/A'}\nMessage: ${guest.message || 'N/A'}`;
}

async function sendNotifications(guest) {
  const message = messageFor(guest);
  const jobs = [];
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    jobs.push(fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: adminWhatsApp, type: 'text', text: { body: message } })
    }));
  }
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
    jobs.push(fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: process.env.EMAILJS_SERVICE_ID, template_id: process.env.EMAILJS_TEMPLATE_ID, user_id: process.env.EMAILJS_PUBLIC_KEY, template_params: {
        to_email: adminEmail, from_name: guest.name, rsvp_type: guest.contribution ? 'Contribution' : 'RSVP', guest_count: guest.guests, contribution_amount: guest.contribution || 'N/A', phone: guest.phone, message: guest.message || 'N/A'
      } })
    }));
  }
  await Promise.allSettled(jobs);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/notify') {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', async () => {
      try { await sendNotifications(JSON.parse(body)); response.writeHead(202, { 'Content-Type': 'application/json' }); response.end('{"ok":true}'); }
      catch { response.writeHead(400, { 'Content-Type': 'application/json' }); response.end('{"ok":false}'); }
    });
    return;
  }
  const file = request.url === '/' ? 'index.html' : request.url.slice(1);
  const filePath = path.join(root, file);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) { response.writeHead(404); response.end('Not found'); return; }
  const contentType = file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html';
  response.writeHead(200, { 'Content-Type': contentType }); fs.createReadStream(filePath).pipe(response);
});

server.listen(process.env.PORT || 3000, () => console.log('Wedding invitation running at http://localhost:3000'));
