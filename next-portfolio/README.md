# Next.js Migration Scaffold (Md Akhinoor Islam Portfolio)

This directory (`next-portfolio/`) is a starting point to migrate the current static portfolio (SOLIDWORKS + Arduino + Projects) to a modern **Next.js 14 App Router** architecture and deploy on **Vercel**.

## ✅ Included
- Next.js 14 (App Router)
- TypeScript + Strict mode
- Basic layout + metadata
- Global responsive base styles
- Placeholder `page.tsx` with migration checklist

## 🚀 Local Development
```bash
npm install
npm run dev
```
Then open: http://localhost:3000

## 🔄 Migration Plan
1. Port existing `index.html` sections into React components under `app/`.
2. Extract SOLIDWORKS interactive card into `components/SolidworksCard.tsx`.
3. Move project data into `data/projects.ts` (or fetch from GitHub API via server component).
4. Add dark mode toggle (use CSS variables or next-themes).
5. Replace `<img>` with `next/image` for optimization.
6. Add `/api/contact` route for future form handling.
7. Add SEO: dynamic OpenGraph images later.

## 🌐 Deploy to Vercel (English)
1. Push this folder as its own repository (or root if mono).  
2. Go to https://vercel.com → New Project → Import Repo.  
3. Framework: auto-detected (Next.js).  
4. Build command: `next build` (default).  
5. Output: `.next` (automatic).  
6. Deploy → Get production URL.  
7. Add custom domain (optional).  

## 🌐 ডিপ্লয় (বাংলা)
১. কোড গিটে পুশ করুন।  
২. Vercel এ লগইন → New Project → রিপো সিলেক্ট।  
৩. অটো সেটিংস ঠিক থাকলে Deploy চাপুন।  
৪. কয়েক সেকেন্ডে লাইভ URL পাবেন।  
৫. ডোমেইন চাইলে “Domains” ট্যাবে যোগ করুন।  

## 🛡️ Environment Variables (Future)
| Purpose | Key | Example |
|---------|-----|---------|
| Contact form mail API | MAIL_API_KEY | `sk-xxxx` |
| GitHub token (optional) | GITHUB_TOKEN | `ghp_xxxx` |

## 🧩 Suggested Structure (Next Step)
```
next-portfolio/
  app/
    layout.tsx
    page.tsx
    about/page.tsx
    projects/page.tsx
    api/contact/route.ts
  components/
    Hero.tsx
    Navbar.tsx
    Footer.tsx
    SolidworksCard.tsx
  data/
    projects.ts
  public/
    images/
```

## 🔮 Future Enhancements
- Edge caching for project data
- MDX blog for engineering notes
- OpenGraph dynamic image generation (`@vercel/og`)
- Search + filter as server components

## ❓ Why Next.js + Vercel
- Faster global delivery
- Image optimization built-in
- Serverless + edge ready
- Zero-config deployments with preview

---
Feel free to continue extending this scaffold. Ask if you want me to auto-port the hero/about/projects sections into components next.
