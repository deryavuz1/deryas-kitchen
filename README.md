# Derya's Kitchen

[Open the recipe book](https://deryavuz1.github.io/deryas-kitchen/).

## Edit a recipe

Edit `public/recipes.json`. Give each recipe a unique `id`, a title, category, description, ingredients, and steps.

To add a photo, save it in `public/photos/`. Set `image` to a path such as `photos/new-recipe.jpg`. Add `photoCredit` and `photoUrl` to credit the photographer.

Push to `main` to publish your changes. GitHub Actions deploys the files in `public/` to GitHub Pages.

## Preview on your computer

```sh
python3 -m http.server 3000 --directory public
```

Open `http://127.0.0.1:3000/`. The server lets the browser load `recipes.json`.
