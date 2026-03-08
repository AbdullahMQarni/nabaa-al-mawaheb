# 🚀 Deployment Guide — Nabaa Al-Mawaheb

## Stack

| Service | Purpose | Cost |
|---------|---------|------|
| **Neon** | PostgreSQL database | Free (0.5 GB) |
| **Vercel** | Hosting & auto-deploy | Free tier |
| **GitHub** | Version control & CI/CD trigger | Free |

---

## Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create a new project (name it `nabaa-al-mawaheb`)
3. Copy the connection string — looks like:
   ```
   postgresql://user:password@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require
   ```
4. Keep this string safe — you'll need it in Steps 2 and 3

---

## Step 2: Update Prisma for PostgreSQL

Open `prisma/schema.prisma` and change:

```diff
 datasource db {
-  provider = "sqlite"
-  url      = "file:./dev.db"
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
 }
```

Create/update `.env` in the project root:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require"
```

Then run:

```bash
npx prisma generate
npx prisma db push
```

This creates all tables on the Neon database. To seed initial data (stadiums, admin user), run:

```bash
npx prisma db seed
```

---

## Step 3: Push to GitHub

```bash
# Initialize git (skip if already done)
git init

# Make sure .env is in .gitignore (NEVER commit secrets)
echo ".env" >> .gitignore

git add .
git commit -m "Initial commit - Nabaa Al-Mawaheb MVP"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nabaa-al-mawaheb.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"** → Import your `nabaa-al-mawaheb` repo
3. In **Environment Variables**, add:
   - `DATABASE_URL` = your Neon connection string
4. Click **Deploy**
5. Wait ~2 minutes → Your site is live at `nabaa-al-mawaheb.vercel.app`!

---

## Updating the Website (Future Changes)

After the initial deployment, any update is just:

```bash
# 1. Make your code changes locally
# 2. Test locally with: npm run dev
# 3. Push to GitHub:

git add .
git commit -m "Description of what you changed"
git push
```

Vercel automatically detects the push and redeploys. **Done!**

---

## Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run locally at localhost:3000 |
| `npm run build` | Test production build locally |
| `npx prisma studio` | Visual database editor at localhost:5555 |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx vercel --prod` | Manual deploy (alternative to git push) |
| `npx vercel env pull` | Pull env vars from Vercel to local `.env` |

---

## Rollback

If a deployment breaks something:
- **Vercel Dashboard** → Deployments → Click on a previous working deploy → **Promote to Production**

---

## Important Notes

> ⚠️ **Never commit `.env`** — It contains your database password
>
> ⚠️ **Database changes** — If you modify `schema.prisma`, run `npx prisma db push` before deploying
>
> ✅ **Preview deploys** — Push to a branch other than `main` to get a preview URL for testing before going live
