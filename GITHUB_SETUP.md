# GitHub Setup Instructions

## Step 1: Create GitHub Repository
1. Go to https://github.com and sign in
2. Click "+" → "New repository"
3. Name it (e.g., "eduverse")
4. **Don't** check "Initialize with README"
5. Click "Create repository"

## Step 2: Run These Commands

Open PowerShell/Terminal in your project folder and run:

```powershell
# Navigate to project (if not already there)
cd "c:\Users\kashi\Downloads\eduverse-main\eduverse-main"

# Stage all files
git add .

# Create first commit
git commit -m "Initial commit: EduVerse project"

# Add your GitHub repository as remote (REPLACE YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## If You Get Authentication Errors:

### Option 1: Use Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. When pushing, use token as password:
   ```
   Username: your_github_username
   Password: your_personal_access_token
   ```

### Option 2: Use GitHub CLI
```powershell
# Install GitHub CLI if not installed
# Then authenticate:
gh auth login

# Then push normally
git push -u origin main
```

## Common Issues:

### Issue: "fatal: not a git repository"
**Solution:** Run `git init` first

### Issue: "remote origin already exists"
**Solution:** Remove and re-add:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Issue: "Permission denied"
**Solution:** Check your GitHub credentials or use Personal Access Token

### Issue: "Large files" error
**Solution:** Make sure `.env.local` and `node_modules` are in `.gitignore` (already done)
