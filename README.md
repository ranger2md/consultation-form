# Medical Director Consultation Request Form

A professional clinical form for submitting patient consultation requests to Dr. Wilcox at 4Ever Young Scottsdale.

## Quick Start (5 minutes to live)

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign up (if you don't have an account)
2. Click the **+** icon (top right) → **New repository**
3. Name it: `consultation-form` (or anything you want)
4. Click **Create repository**
5. You'll see a screen with setup instructions. Copy the URL of your repo (looks like `https://github.com/yourname/consultation-form.git`)

### Step 2: Upload Files to GitHub

You have two options:

**Option A: Using GitHub Web Upload (Easiest)**

1. On your new repository page, click **Add file** → **Upload files**
2. Download all the files I've created (they're in `/mnt/user-data/outputs/`)
3. Drag and drop them into the GitHub uploader
4. Make sure your folder structure matches this:
   ```
   consultation-form/
   ├── package.json
   ├── next.config.js
   ├── tailwind.config.js
   ├── postcss.config.js
   ├── .gitignore
   ├── pages/
   │   ├── _app.js
   │   └── index.js
   └── styles/
       └── globals.css
   ```
5. Scroll down and click **Commit changes**

**Option B: Using Git Command Line (If you're comfortable with CLI)**

```bash
git clone https://github.com/yourname/consultation-form.git
cd consultation-form
# Copy all the files into this folder
git add .
git commit -m "Initial commit - consultation form"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** (or **Log In** if you have an account)
3. Choose **Continue with GitHub** and authorize Vercel
4. Click **New Project**
5. Find your `consultation-form` repository in the list and click **Import**
6. Vercel will auto-detect the Next.js settings - click **Deploy**
7. Wait 1-2 minutes. You'll see a "Congratulations" message with your live URL

**Your form is now live!** You'll get a URL like:
```
https://consultation-form-abc123.vercel.app
```

### Step 4: Embed in Squarespace

1. Copy your Vercel URL from the previous step
2. Log into your Squarespace site
3. Go to the page where you want the form (or create a new page)
4. Click **+** to add a block → Search for **Code** → **Code Block**
5. Paste this code:

```html
<iframe 
  src="https://consultation-form-abc123.vercel.app" 
  width="100%" 
  height="1200" 
  frameborder="0" 
  style="border: none; overflow: auto;">
</iframe>
```

**Important:** Replace `https://consultation-form-abc123.vercel.app` with your actual Vercel URL

6. Click **Save**

---

## How It Works

**For Staff (Tessa, etc.):**
1. Click the form link
2. Fill in all required fields (marked with *)
3. Click **Submit Consultation Request**
4. Their email client opens with a pre-formatted message ready to send

**For You (Dr. Wilcox):**
- You receive an email at `doctorwilcox@gmail.com`
- The form data is formatted and organized
- No more guessing what the patient's current dose is

---

## What the Form Requires

**Required Fields:**
- Patient Name
- Request Type (Lab Follow-up, Symptom Change, etc.)
- Current HRT Regimen (at least one hormone documented)
- Current Symptoms (or "asymptomatic")
- Overall Status (Improved/Stable/Worse)
- Reproductive Status (Pre/Peri/Post-menopausal)
- Lab Results (checkbox)
- Abnormal Findings summary

**The form won't submit without all of these.**

---

## Updating the Form

If you want to make changes later:

1. Edit the file on GitHub (click the pencil icon on `pages/index.js`)
2. Make your changes
3. Click **Commit changes**
4. Vercel automatically redeploys (takes ~30 seconds)

---

## Troubleshooting

**"Vercel can't find my repository"**
- Make sure all files are uploaded to GitHub
- Try disconnecting Vercel and re-connecting

**"The form doesn't look right"**
- Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Try a different browser

**"Email doesn't open when I submit"**
- This is normal - it means the form is working
- Manually copy the text and paste into an email to `doctorwilcox@gmail.com`
- Or set up a backend email service (ask if you need help)

---

## File Structure

```
consultation-form/
├── package.json                 # Project dependencies
├── next.config.js              # Next.js configuration
├── tailwind.config.js           # Tailwind CSS settings
├── postcss.config.js            # PostCSS settings
├── .gitignore                   # Git ignore rules
├── pages/
│   ├── _app.js                 # App wrapper
│   └── index.js                # Main form component
└── styles/
    └── globals.css              # Global styles (Tailwind)
```

---

## Support

If you need to make changes or add features:
- Updating form fields: Edit `pages/index.js`
- Changing colors/styling: Edit `tailwind.config.js` or `styles/globals.css`
- Changing validation rules: Search for `validateForm` in `pages/index.js`

---

**Deployed and ready to use!**
