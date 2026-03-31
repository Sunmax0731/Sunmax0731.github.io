# Sunmax Site

This directory is ready to publish as a standalone GitHub Pages repository.

## Recommended setup

Create a new GitHub repository and push the contents of this `docs/` directory as the repository root.

Suggested repository names:

- `<your-user-name>.github.io`
- `sunmax-site`

## Publish steps

1. Create an empty repository on GitHub
2. Open a terminal in `docs/`
3. Initialize Git and connect the remote
4. Push to `main`
5. In GitHub, open `Settings > Pages`
6. Set `Source` to `GitHub Actions`

## Example commands

```powershell
cd d:\Claude\docs
git init
git branch -M main
git add .
git commit -m "Initial site publish"
git remote add origin https://github.com/<your-user-name>/<your-repo-name>.git
git push -u origin main
```

## Notes

- The blog uses `fetch`, so it must be served over HTTP. GitHub Pages is fine.
- New blog posts should be added under `blog/posts/yyyymmdd_nn/`.
- After adding a post, also update `blog/posts.json`.
