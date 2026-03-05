# 👋 Start Here — No Jargon, Step by Step

This is Riyaz's portfolio website. Follow these steps in order.
Each step is short. Don't skip ahead.

---

## PHASE 1 — See it on your computer (5 minutes)

### Step 1 — Install Node.js (once ever)
1. Go to **https://nodejs.org**
2. Click the big green **"LTS"** button to download
3. Install it (just keep clicking Next)
4. **Restart VS Code** after installing

### Step 2 — Open the project in VS Code
1. Open VS Code
2. Click **File → Open Folder**
3. Select this `riyaz-portfolio` folder
4. Click **Terminal → New Terminal** (or press Ctrl + `)

### Step 3 — Install dependencies (once)
Type this in the terminal and press Enter:
```
npm install
```
Wait for it to finish (takes 30–60 seconds, lots of text is normal).

### Step 4 — Start the website
```
npm run dev
```
Your browser will open automatically at **http://localhost:3000**

🎉 You should see Riyaz's portfolio!

> Note: The database is not connected yet, so edit mode won't save
> permanently. But the site looks exactly right. That's fine for now.

---

## PHASE 2 — Put it online (20 minutes)

### Step 5 — Create a free Neon database
1. Go to **https://neon.tech** and click Sign Up (use Google login)
2. Click **New Project**, name it `riyaz-portfolio`, click Create
3. You'll see a **Connection String** — it looks like:
   `postgresql://riyaz:abc123@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Copy it — you'll need it in Step 7

### Step 6 — Create the database tables
1. In Neon, click **SQL Editor** in the left menu
2. Open the file `db/schema.sql` from this project in any text editor
3. Copy ALL the text, paste it into the Neon SQL Editor
4. Click **Run** — you should see "Success"

### Step 7 — Create your .env file
1. In the project folder, find the file `.env.example`
2. Make a copy of it and rename the copy to just `.env` (no .example)
3. Open `.env` and fill in:
   ```
   DATABASE_URL=paste-your-neon-connection-string-here
   ADMIN_PASSWORD=choose-any-password-you-want
   ```
4. Save the file

### Step 8 — Fill the database with Riyaz's data
In the VS Code terminal:
```
node db/seed.js
```
You should see: ✅ personal_info seeded ... 🎉 All done!

### Step 9 — Put it on the internet (Netlify)
1. Go to **https://github.com** → Sign up free
2. Create a **New Repository** called `riyaz-portfolio`
3. In VS Code terminal, run these one by one:
   ```
   git init
   git add .
   git commit -m "Riyaz portfolio"
   git remote add origin https://github.com/YOUR-USERNAME/riyaz-portfolio.git
   git push -u origin main
   ```
4. Go to **https://app.netlify.com** → Sign up with GitHub
5. Click **Add new site → Import from Git → GitHub**
6. Select your `riyaz-portfolio` repository
7. Build settings are automatic — just click **Deploy site**

### Step 10 — Add your secret keys to Netlify
1. In Netlify, go to **Site Settings → Environment Variables**
2. Click **Add variable** and add:
   - Key: `DATABASE_URL` → Value: your Neon connection string
   - Key: `ADMIN_PASSWORD` → Value: your chosen password
3. Go to **Deploys → Trigger deploy → Deploy site**

🌐 Your site is now live at a Netlify URL like `https://riyaz-portfolio.netlify.app`

---

## Using Edit Mode on the live site

1. Go to your live Netlify URL
2. Click the **🔒 Admin Edit** button (bottom-right)
3. Enter the `ADMIN_PASSWORD` you set in Step 10
4. Click any text to edit it — all changes save to the database

---

## Something went wrong?

**"npm: command not found"** → Node.js isn't installed. Redo Step 1.

**"Cannot find module"** → Run `npm install` again.

**Browser shows "This site can't be reached"** → Make sure `npm run dev` is still running in the terminal.

**Page is blank / white screen** → Open browser DevTools (F12), look at Console tab, send the red error message to me.

**Database seed failed** → Double-check your `.env` file has the correct `DATABASE_URL` with no extra spaces.

---

Still stuck? Just copy-paste the exact error message and I'll fix it for you.
