# 🚀 Auto-Deployment Setup Guide

This repository uses GitHub Actions to automatically sync code to `depportfolio` (private production repository), which triggers Vercel deployment.

## ⚙️ One-Time Setup Required

### Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: `Auto-sync myportfolio to depportfolio`
   - **Expiration**: `No expiration` (or `1 year` if preferred)
   - **Scopes**: Check ✅ `repo` (Full control of private repositories)
4. Click **"Generate token"**
5. **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 2: Add Token as Repository Secret

1. Go to this repository: [maulido/myportfolio](https://github.com/maulido/myportfolio)
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Configure:
   - **Name**: `DEPPORTFOLIO_PAT`
   - **Secret**: Paste your Personal Access Token from Step 1
5. Click **"Add secret"**

### Step 3: Test Auto-Sync

After adding the secret, test the workflow:

```bash
# Make a test commit
echo "# Auto-sync test - $(date)" >> README.md
git add README.md
git commit -m "test: verify auto-sync to depportfolio"
git push origin main
```

### Step 4: Verify Deployment

1. **Check GitHub Actions**:
   - Go to [Actions tab](https://github.com/maulido/myportfolio/actions)
   - You should see "Sync to depportfolio" workflow running
   - Wait for green checkmark ✅

2. **Check Vercel**:
   - Open your Vercel dashboard
   - You should see a new deployment triggered from `depportfolio`
   - Wait for deployment to complete

3. **Test Production**:
   - Visit your production URL
   - Verify changes are live

## 🎯 How It Works

```
┌─────────────────┐
│  Local Changes  │
└────────┬────────┘
         │ git push origin main
         ▼
┌─────────────────┐
│  myportfolio    │ (Public development repo)
│  (GitHub)       │
└────────┬────────┘
         │ GitHub Actions triggers
         ▼
┌─────────────────┐
│ Auto-Sync       │ (Workflow runs)
│ Workflow        │
└────────┬────────┘
         │ Syncs code
         ▼
┌─────────────────┐
│  depportfolio   │ (Private production repo)
│  (GitHub)       │
└────────┬────────┘
         │ Vercel detects change
         ▼
┌─────────────────┐
│  Vercel         │ (Auto-deploys)
│  Production     │
└─────────────────┘
```

## 📝 Daily Workflow

After setup, your workflow is simple:

```bash
# 1. Make your changes
git add .
git commit -m "feat: your awesome feature"

# 2. Push to GitHub
git push origin main

# 3. That's it! 🎉
# GitHub Actions automatically syncs to depportfolio
# Vercel automatically deploys to production
```

## 🔍 Monitoring

### Check Workflow Status

- Visit [Actions tab](https://github.com/maulido/myportfolio/actions)
- Click on latest "Sync to depportfolio" run
- View logs if there are any issues

### Common Issues

**❌ Workflow fails with "Authentication failed"**
- Solution: Regenerate Personal Access Token and update `DEPPORTFOLIO_PAT` secret

**❌ Workflow doesn't trigger**
- Solution: Ensure you're pushing to `main` or `fix/build-and-quality-issues` branch

**❌ Vercel doesn't deploy**
- Solution: Check Vercel is connected to `depportfolio` repository

## 🔐 Security Notes

- ✅ Personal Access Token is stored as encrypted GitHub Secret
- ✅ Token is never exposed in logs or code
- ✅ Only this repository can use the token
- ✅ Token can be revoked anytime from GitHub settings

## 📞 Support

If you encounter issues:
1. Check [GitHub Actions logs](https://github.com/maulido/myportfolio/actions)
2. Verify token has `repo` scope
3. Ensure `DEPPORTFOLIO_PAT` secret is set correctly
4. Check Vercel is connected to `depportfolio`

---

**Status**: ⏳ Waiting for Personal Access Token setup

Once you complete Steps 1-2, auto-deployment will be fully operational! 🚀
