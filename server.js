const express = require('express');
const path    = require('path');
const helmet  = require('helmet');
const compression = require('compression');

const app  = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ── Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      imgSrc:     ["'self'", 'data:'],
    },
  },
}));

// ── Gzip compression
app.use(compression());

// ── Static files (public folder)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag:   true,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
}));

// ── Health check endpoint (for load balancers / uptime monitors)
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    app:       'ShiftRoster 2026',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
  });
});

// ── Catch-all → serve index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start
app.listen(PORT, HOST, () => {
  console.log(`\n✅ ShiftRoster is running`);
  console.log(`   → Local:   http://localhost:${PORT}`);
  console.log(`   → Network: http://${HOST}:${PORT}`);
  console.log(`   → Health:  http://localhost:${PORT}/health\n`);
});

// ── Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  process.exit(0);
});
