# 🗓 ShiftRoster 2026 — Deployment Guide

A self-contained 24/7 annual shift scheduling web application.

---

## 📁 Project Structure

```
shiftroster-deploy/
├── public/
│   └── index.html          ← The full ShiftRoster app
├── scripts/
│   ├── setup.sh            ← Automated Ubuntu/Debian setup
│   └── shiftroster.service ← Systemd service file
├── nginx/
│   └── nginx.conf          ← Nginx reverse proxy config
├── server.js               ← Express.js web server
├── package.json            ← Node.js dependencies
├── ecosystem.config.js     ← PM2 process manager config
├── Dockerfile              ← Docker image definition
├── docker-compose.yml      ← Docker Compose stack
└── README.md               ← This file
```

---

## ⚡ Quick Start Options

### Option 1 — Automated Setup (Ubuntu/Debian VPS) ✅ Recommended

```bash
# 1. Upload the project to your server
scp -r shiftroster-deploy/ user@YOUR_SERVER_IP:/tmp/

# 2. SSH into server
ssh user@YOUR_SERVER_IP

# 3. Move to web directory & run setup
sudo mv /tmp/shiftroster-deploy /var/www/shiftroster
cd /var/www/shiftroster
chmod +x scripts/setup.sh
sudo ./scripts/setup.sh
```

The script automatically installs Node.js, Nginx, PM2, and starts everything.

---

### Option 2 — Manual Node.js Setup

**Requirements:** Node.js ≥ 18, npm

```bash
# 1. Copy files to server
scp -r shiftroster-deploy/ user@YOUR_SERVER:/var/www/shiftroster

# 2. Install dependencies
cd /var/www/shiftroster
npm install --production

# 3. Run directly
node server.js
# App is live at http://localhost:3000

# 4. With custom port
PORT=8080 node server.js
```

---

### Option 3 — PM2 (Production Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start in cluster mode (uses all CPU cores)
pm2 start ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs shiftroster

# Restart
pm2 restart shiftroster

# Auto-start on reboot
pm2 startup
pm2 save
```

---

### Option 4 — Docker 🐳

**Requirements:** Docker, Docker Compose

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f shiftroster

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

Or with plain Docker:
```bash
# Build image
docker build -t shiftroster:2026 .

# Run container
docker run -d \
  --name shiftroster \
  -p 3000:3000 \
  --restart unless-stopped \
  shiftroster:2026

# Check logs
docker logs -f shiftroster
```

---

### Option 5 — Nginx Reverse Proxy (with SSL)

After the Node.js app is running on port 3000:

```bash
# 1. Copy Nginx config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/shiftroster

# 2. Edit the domain name
sudo nano /etc/nginx/sites-available/shiftroster
# Change: server_name your-domain.com www.your-domain.com;

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/shiftroster /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. Add SSL (free via Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 6 — Systemd Service

```bash
# 1. Copy service file
sudo cp scripts/shiftroster.service /etc/systemd/system/

# 2. Edit paths if needed
sudo nano /etc/systemd/system/shiftroster.service
# Update: WorkingDirectory=/var/www/shiftroster

# 3. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable shiftroster
sudo systemctl start shiftroster

# 4. Check status
sudo systemctl status shiftroster
sudo journalctl -u shiftroster -f   # live logs
```

---

### Option 7 — Free Cloud Platforms

#### Render.com (Free tier)
1. Push project to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Deploy — get a free `*.onrender.com` URL

#### Railway.app
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Fly.io
```bash
npm install -g flyctl
fly auth login
fly launch
fly deploy
```

---

## 🔧 Configuration

| Variable    | Default     | Description              |
|-------------|-------------|--------------------------|
| `PORT`      | `3000`      | HTTP port                |
| `HOST`      | `0.0.0.0`   | Bind address             |
| `NODE_ENV`  | `production`| Environment              |

Set via environment variable:
```bash
PORT=8080 NODE_ENV=production node server.js
```

Or via `.env` file:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

---

## 🌐 API Endpoints

| Endpoint  | Method | Description              |
|-----------|--------|--------------------------|
| `/`       | GET    | ShiftRoster app          |
| `/health` | GET    | Health check (JSON)      |

Health check response:
```json
{
  "status": "ok",
  "app": "ShiftRoster 2026",
  "timestamp": "2026-04-06T10:00:00.000Z",
  "uptime": "3600s"
}
```

---

## 🛡 Security Features

- **Helmet.js** — HTTP security headers
- **Gzip compression** — Faster load times
- **Non-root Docker user** — Reduced attack surface
- **Rate limiting** via Nginx — Prevents abuse
- **HTTPS/SSL** via Let's Encrypt — Encrypted traffic
- **HSTS** — Forces HTTPS in browsers

---

## 📋 Useful Commands

```bash
# PM2
pm2 status                    # App status
pm2 logs shiftroster          # Live logs
pm2 restart shiftroster       # Restart app
pm2 reload shiftroster        # Zero-downtime reload
pm2 monit                     # CPU/RAM monitor

# Docker
docker stats shiftroster      # Resource usage
docker exec -it shiftroster sh # Shell into container

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload config
sudo tail -f /var/log/nginx/shiftroster.error.log  # Error logs

# Node directly
node server.js                # Start app
PORT=8080 node server.js      # Custom port
```

---

## 🔄 Updates

To update the app (replace `public/index.html`):

```bash
# With PM2
cp new-index.html /var/www/shiftroster/public/index.html
pm2 reload shiftroster

# With Docker
cp new-index.html public/index.html
docker-compose up -d --build

# With systemd
cp new-index.html /var/www/shiftroster/public/index.html
sudo systemctl restart shiftroster
```

---

## 🆘 Troubleshooting

**Port already in use:**
```bash
sudo lsof -i :3000
kill -9 $(lsof -t -i:3000)
```

**Permission denied:**
```bash
sudo chown -R www-data:www-data /var/www/shiftroster
```

**Nginx 502 Bad Gateway:**
```bash
# Check if Node is running
pm2 status
curl http://localhost:3000/health
```

**View all logs:**
```bash
pm2 logs shiftroster --lines 100
sudo journalctl -u shiftroster -n 100
```
