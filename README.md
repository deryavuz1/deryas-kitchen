# Derya's Kitchen

A recipe website in English with Turkish-inspired tile details. It includes thick chocolate chip cookies, köfte, date cake, and Sharlotka.

## Publish

The GitHub Actions workflow publishes the files in `public/` to GitHub Pages after a push to `main`. In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.

For a repository named `deryas-kitchen` under `deryavuz1`, the site address will be `https://deryavuz1.github.io/deryas-kitchen/` once deployment succeeds.

## Edit a recipe

Edit `public/recipes.json`. Each recipe has a unique `id`, a title, ingredients, steps, and optional photo details. To add a photo, put it in `public/photos/` and use a relative path such as `./photos/new-recipe.jpg`. Keep the photo credit and source URL with the recipe. Commit and push the change to publish it.

The public website is read-only. Its recipe data is part of the repository, so recipe changes go through Git.

## Preview on this computer

Run:

```sh
python3 -m http.server 3000 --directory public
```

Then open `http://127.0.0.1:3000/`. This server is only for preview. The browser needs it to load `recipes.json`; the published site runs on GitHub Pages.

## How it works

`index.html` loads `app.js` and `styles.css`. JavaScript fetches `recipes.json`, builds the recipe cards, and supports search and filters. Recipe links use URL hashes, so a recipe page still opens when someone follows a direct link. Asset paths are relative, which lets the site work under the GitHub Pages project path.

The original Node and Docker files remain in this local folder for reference. They are excluded from this repository and are not part of the published site. The recipe photos are local copies of Pexels photographs; credits appear on the recipe pages.
