# Essays — Bilingual Research Site with Private Annotations

A Quartz-based static site for publishing research essays in French and English, with Hypothesis integration for collaborative annotation.

## Structure

```
essays/
├── content/
│   ├── index.md              # Landing page (language selector)
│   ├── en/                   # English essays
│   │   ├── index.md
│   │   ├── heredoc-manifesto.md
│   │   ├── computational-futurality.md
│   │   └── retcon-methodology.md
│   └── fr/                   # French essays
│       ├── index.md
│       ├── manifeste-heredoc.md
│       ├── futuralite-computationnelle.md
│       └── methodologie-retcon.md
├── quartz.config.ts          # Quartz configuration
├── quartz.layout.ts          # Layout configuration
├── deploy.sh                 # Deployment script
├── nginx-essays.conf         # Nginx configuration for VPS
└── hypothesis-setup.js       # Hypothesis integration notes
```

## Local Setup

### 1. Clone Quartz and add your content

```bash
# Clone Quartz
git clone https://github.com/jackyzha0/quartz.git essays
cd essays

# Install dependencies
npm i

# Replace the content/ folder with this template's content/
# Copy the config files (quartz.config.ts, quartz.layout.ts)
```

### 2. Local development

```bash
npx quartz build --serve
# Open http://localhost:8080
```

### 3. Connect to your GitHub repo

```bash
git remote remove origin
git remote add origin https://github.com/RBMIRC/essays.git
git branch -M main
git push -u origin main
```

## VPS Deployment

### 1. Server setup (Ubuntu/Debian)

```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Create web directory
sudo mkdir -p /var/www/essays
sudo chown $USER:$USER /var/www/essays

# Create password file for restricted access
sudo htpasswd -c /etc/nginx/.htpasswd firstuser
# Add more users:
sudo htpasswd /etc/nginx/.htpasswd anotheruser
```

### 2. Configure nginx

```bash
# Copy the nginx config
sudo cp nginx-essays.conf /etc/nginx/sites-available/essays

# Edit to use your domain
sudo nano /etc/nginx/sites-available/essays

# Enable site
sudo ln -s /etc/nginx/sites-available/essays /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL with Let's Encrypt (recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d essays.yourdomain.com
```

### 4. Deploy

Edit `deploy.sh` with your server details, then:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Hypothesis Annotation Setup

### 1. Enable Hypothesis on your site

Add this to your Quartz `Head.tsx` component or layout:

```html
<script src="https://hypothes.is/embed.js" async></script>
```

### 2. Create a private group

1. Create account: https://hypothes.is/signup
2. Create group: https://hypothes.is/groups/new
3. Name it (e.g., "RetconBlackMountain")
4. Copy the invite link

**Group created:** [RetconBlackMountain](https://hypothes.is/groups/wwKpQDXD/retconblackmountain)

### 3. Invite collaborators

Send collaborators:
- **Join the group:** https://hypothes.is/groups/wwKpQDXD/retconblackmountain
- Instructions to install the Hypothesis browser extension
- The password to access your site (if using nginx basic auth)

### 4. Using annotations

1. Visit your essay page
2. Open Hypothesis sidebar (browser extension)
3. Select your private group from the dropdown
4. Highlight text and annotate
5. Only group members see these annotations

## Adding New Essays

1. Create a new `.md` file in `content/en/` or `content/fr/`
2. Add frontmatter:

```yaml
---
title: Your Essay Title
date: 2025-01-04
tags:
  - tag1
  - tag2
lang: en  # or fr
draft: true  # remove when ready to publish
---
```

3. Write in markdown
4. Link to the other language version at the bottom
5. Run `./deploy.sh`

## Removing Draft Status

Essays with `draft: true` in frontmatter are hidden. Remove this line to publish.

## Wikilinks

Use `[[filename|Display Text]]` to link between essays:

```markdown
[[heredoc-manifesto|Read the Heredoc Manifesto]]
[[/fr/manifeste-heredoc|Version française]]
```

## Customization

- **Colors**: Edit `theme.colors` in `quartz.config.ts`
- **Typography**: Edit `theme.typography` in `quartz.config.ts`
- **Layout**: Modify `quartz.layout.ts`
- **Domain**: Update `baseUrl` in `quartz.config.ts`

---

Built with [Quartz](https://quartz.jzhao.xyz/) • Annotations by [Hypothesis](https://hypothes.is/)
