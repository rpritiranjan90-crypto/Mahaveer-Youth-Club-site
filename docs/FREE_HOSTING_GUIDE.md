# 🌐 100% Free Production Hosting Guide
## Mahaveer Youth Club Banza V2

This guide explains how to host the complete **Mahaveer Youth Club Banza** website, FastAPI backend, and PostgreSQL database **100% FREE forever** without paying a single rupee for servers or subscriptions.

---

## 🏗️ 100% Free Architecture Overview

| Component | Free Platform | What It Gives You | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend (Website)** | **Vercel** or **Cloudflare Pages** | Fast Global CDN, Free HTTPS, custom domain support | **₹0 / Month** |
| **Backend (FastAPI)** | **Render.com** or **Koyeb** | Free Python web service, automatic SSL | **₹0 / Month** |
| **Database** | **Neon.tech** or **Supabase** | Free managed PostgreSQL 16 database | **₹0 / Month** |
| **Media Uploads** | **Render / Supabase / Cloudinary** | Free persistent storage for photos | **₹0 / Month** |

---

## 🚀 Step 1: Push Your Code to GitHub (Free)

If you haven't already pushed your code to GitHub:

1. Open terminal in this folder and run:
   ```bash
   git init
   git add .
   git commit -m "Mahaveer Youth Club Banza V2 - Production Ready"
   ```
2. Create a new repository on [GitHub.com](https://github.com) (e.g., `mahaveer-youth-club`).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mahaveer-youth-club.git
   git branch -M main
   git push -u origin main
   ```

---

## 🗄️ Step 2: Create Free PostgreSQL Database on Neon.tech (2 Minutes)

1. Go to **[Neon.tech](https://neon.tech)** and sign up for free (using GitHub).
2. Click **Create Project** -> Name: `mahaveer-db` -> Select Region: **Asia Pacific (Singapore / Mumbai)**.
3. Neon will display your **Connection String (DATABASE_URL)**:
   ```text
   postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Copy and save this database connection URL.

---

## ⚙️ Step 3: Deploy Free Backend API on Render.com (3 Minutes)

1. Go to **[Render.com](https://render.com)** and sign up for free with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your `mahaveer-youth-club` GitHub repository.
4. Fill in the settings:
   - **Name:** `mahaveer-api`
   - **Region:** Singapore / Frankfurt
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** **Free**
5. Add **Environment Variables** under the "Environment" tab:
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
   - `SECRET_KEY` = *(generate any random 32+ character string)*
   - `DATABASE_URL` = *(paste your Neon PostgreSQL connection string from Step 2)*
   - `CORS_ORIGINS` = `["*"]` *(or your Vercel URL once generated)*
   - `CLOUDINARY_CLOUD_NAME` = `z1aoi3i6` *(your Cloudinary cloud name)*
   - `CLOUDINARY_API_KEY` = `288948134476681` *(your Cloudinary API key)*
   - `CLOUDINARY_API_SECRET` = `2u0JyxrzrWxeBaNoBkTlTUexWNM` *(your Cloudinary API secret)*
6. Click **Create Web Service**.
7. Render will build the backend, apply Alembic migrations to Neon, and give you a free URL like:
   `https://mahaveer-api.onrender.com`

---

## 🎨 Step 4: Deploy Free Frontend on Vercel (2 Minutes)

1. Go to **[Vercel.com](https://vercel.com)** and sign up with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `mahaveer-youth-club` repository.
4. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** click Edit and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://mahaveer-api.onrender.com/api/v1` *(your Render API URL from Step 3)*
6. Click **Deploy**.
7. In ~30 seconds, Vercel gives you your live website URL:
   `https://mahaveer-youth-club.vercel.app`

---

## 🌐 Step 5: (Optional) Connect Your Own Custom Domain

Both Vercel and Render support custom domains (like `mahaveeryouthclub.org` or `mahaveerbanza.in`) **completely free**:

1. In Vercel -> Go to **Project Settings** -> **Domains**.
2. Type your domain (e.g. `mahaveeryouthclub.org`).
3. Vercel will show you the exact DNS records (`CNAME` or `A`) to add at your domain provider.
4. SSL certificates are issued and renewed **100% automatically for free**.

---

## 🛡️ Admin Login on Your Free Live Site

Once deployed:
1. Go to `https://mahaveer-youth-club.vercel.app/admin/login`
2. Log in with your email: `rpritiranjan90@gmail.com`
3. Enter your password: `Fukun@891755`
4. Set up 2FA or upload your 2026 Ganesh image and logo directly from the live dashboard!
