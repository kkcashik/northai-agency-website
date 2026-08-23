# NorthAI Website — Netlify Project Context

## Project Overview
Premium one-page dental AI website for NorthAI, deployed on Netlify with lead capture via GHL webhook integration. Domain: **getnorthai.ca** (managed via IONOS DNS).

---

## Deployment & Hosting

### Live Site
- **URL:** https://www.getnorthai.ca
- **Netlify Site:** [Dashboard](https://app.netlify.com) → northai-agency-website
- **Build Status:** Auto-deploy enabled from GitHub
- **Deployments:** Automatic on push to main branch

### Domain Configuration
- **Domain:** getnorthai.ca (purchased via IONOS)
- **DNS Provider:** IONOS
- **Netlify Nameservers:** 
  - dns1.p03.nsone.net
  - dns2.p03.nsone.net
  - dns3.p03.nsone.net
  - dns4.p03.nsone.net
- **SSL/TLS:** Auto-provisioned by Netlify (Let's Encrypt)

### Git Repository
- **Repo:** kkcashik/northai-agency-website (GitHub)
- **Branch:** main
- **Clone:** `git clone https://github.com/kkcashik/northai-agency-website.git`

---

## Project Structure

```
northai/
├── index.html          # HTML markup (lead form, sections)
├── style.css           # All styling (responsive, dark luxury theme)
├── script.js           # JavaScript (nav, animations, GHL webhook)
└── CLAUDE.md           # This file
```

### No Build Step
- Static site — no build process, no npm install
- Netlify deploys files as-is from git push
- CSS & JS are embedded in external files (not inline)

---

## Key Features & Content

### Sections
1. **Hero** — Animated headline, CTA button, stat counter ($450/mo starting)
2. **How It Works** — 3-step process with icons
3. **Results** — Case study with metrics
4. **Value** — 4 metric cards ($8,400 recovered, 15 hrs saved, 73% calls, 4× reviews)
5. **Pricing** — 4 tiers: Review Booster ($450), Starter ($750), AI Receptionist ($1K featured), Full Practice (Custom)
6. **Testimonials** — Customer quotes
7. **FAQ** — 6 collapsible Q&As
8. **Footer** — Contact form → GHL webhook
9. **Mobile Menu** — Hamburger nav for screens < 768px

### Pricing Tiers

| Tier | Price | Key Features |
|------|-------|--------------|
| **Review Booster** | $450/mo | Google Review AI, post-visit SMS/email, monthly audit, sentiment tracking, competitor benchmarking, negative review templates |
| **Starter** | $750/mo | AI voicemail, SMS reminders, missed call text-back, analytics |
| **AI Receptionist** | $1,000/mo | Full AI reception, voicemail transcription, multi-language (EN+FR), priority support |
| **Full Practice** | Custom | White-label, staff training, SLA uptime, all features |

### Mobile Responsive
- Desktop breakpoint: 1024px
- Tablet breakpoint: 768px
- Mobile-first CSS with media queries
- Text opacity: 82% on mobile (55% on desktop) for visibility
- Hamburger menu on mobile, desktop nav on larger screens

---

## Form & Lead Capture

### Demo Form (Footer)
- **Input:** Email field
- **Validation:** HTML5 email check
- **Submission:** 
  - Form hides, "Thanks!" message shows
  - JSON payload sent to GHL webhook
  - Fails silently if webhook unreachable (no user error shown)

### GHL Webhook Integration
```javascript
// Location: script.js line 55
GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/iuQtTC39dqAU6qwodkSq/webhook-trigger/b8f4b7de-08e4-4d5e-91d2-53ec38da9a38"

// Payload sent:
{
  "email": "user@example.com",
  "source": "NorthAI website",
  "page": "https://www.getnorthai.ca",
  "submitted_at": "2026-06-13T14:22:00Z"
}
```

**⚠️ DO NOT change the webhook URL** unless you have a new GHL Inbound Webhook configured.

---

## Development Workflow

### Making Changes
1. Edit files locally in `C:\Users\ashik\ai agency\northai\`
2. Test in browser (open `index.html` locally or on Netlify staging)
3. Commit and push to GitHub main branch:
   ```bash
   git add .
   git commit -m "Describe your change"
   git push origin main
   ```
4. Netlify auto-deploys within seconds

### Common Tasks

#### Update Hero Stat / Pricing
- **File:** index.html
- **Hero stat:** `<span class="stat" data-count="450">450</span>` (line ~120)
- **Pricing cards:** Search for `<div class="plan">` (starts ~line 450)

#### Edit Testimonials
- **File:** index.html
- **Section:** `#testimonials` (search for "Testimonials")
- **Format:** Each quote is a `<div class="tcard">` with `<p>` and `<div class="who">`

#### Adjust Colors / Fonts
- **File:** style.css
- **CSS Variables:** Top of file (~line 1–30)
  - `--navy` — main bg color
  - `--white` — text
  - `--white-55` — faint text (55% opacity)
  - `--lightblue` — accent color
  - `--serif` — DM Serif Display font
  - `--sans` — DM Sans font

#### Mobile Text Visibility
- **File:** style.css
- **Media Query:** `@media (max-width:768px)` (~line 740)
- **Opacity Fix:** Elements set to `rgba(255,255,255,.82)` for legibility

#### Form Behavior
- **File:** script.js
- **Form Handler:** Lines 54–80
- **Success Message:** Changes form display, shows "formOk" element

---

## Testing Checklist

### Before Pushing
- [ ] No console errors (F12 → Console)
- [ ] Mobile 375px width — text readable, no overflow
- [ ] Desktop 1024px+ — layout balanced
- [ ] All links working (internal anchors, external CTAs)
- [ ] Form submits (check GHL Contacts within 30 sec)

### After Deployment
- [ ] Visit https://www.getnorthai.ca
- [ ] Test form submission → check GHL Contacts for lead
- [ ] Mobile test (portrait 375px)
- [ ] Desktop test (1024px+)
- [ ] Check Netlify build log for errors

---

## Netlify Settings

### Build Configuration
- **Build command:** (none — static site)
- **Publish directory:** `/` (root directory, all files)
- **Node.js version:** Not applicable

### Environment Variables
- None required currently
- If adding API keys, set in Netlify → Site Settings → Environment

### Auto-Deploy
- **Source:** GitHub (kkcashik/northai-agency-website, main branch)
- **Status:** ✅ Enabled
- **Triggers:** Every push to main

### Preview Deploys
- **Branch deploys:** Not configured (only main deploys to production)
- **Preview URL:** Temporary URL shown during build

---

## Troubleshooting

### Deployment Failed
1. Check Netlify deploy log: https://app.netlify.com → Deployments → Failed build
2. Common causes:
   - Git push didn't succeed (run `git status`)
   - Invalid HTML/CSS syntax (check console for parse errors)
3. **Fix:** Correct the issue locally, commit, push again

### Form Not Sending to GHL
1. **Check webhook URL** in script.js line 55 (should start with `https://services.leadconnectorhq.com/`)
2. **Check GHL Contacts** — lead should appear within 30 seconds
3. **Browser console** (F12) — any CORS errors?
4. **Network tab** (F12) — is POST request being sent to GHL URL?

### Mobile Text Still Hard to Read
- Ensure `@media (max-width:768px)` block includes the element
- Color should be `rgba(255,255,255,.82)` not `var(--white-55)`

### DNS/Domain Not Resolving
1. Verify nameservers in IONOS are set to Netlify's (list above)
2. Wait 15–60 minutes for DNS propagation
3. Check: `nslookup getnorthai.ca`

---

## Quick Links

| Resource | Link |
|----------|------|
| Live Site | https://www.getnorthai.ca |
| GitHub Repo | https://github.com/kkcashik/northai-agency-website |
| Netlify Dashboard | https://app.netlify.com |
| IONOS DNS | https://www.ionos.com (manage getnorthai.ca) |
| GHL Dashboard | https://app.gohighlevel.com (check Contacts) |

---

## Notes
- Site launched June 2026
- All form submissions route to GHL for lead tracking
- No server-side processing — purely static files + client-side JS
- Design system uses CSS variables for easy theming updates
