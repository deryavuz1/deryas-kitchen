const app = document.querySelector('#app');
const state = { recipes: [], category: 'All', query: '', sort: 'saved' };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function renderStepText(step) {
  // Escape the text; only **marked** segments become bold HTML.
  return String(step).split(/(\*\*[^*]+\*\*)/g).map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return '<strong>' + escapeHtml(part.slice(2, -2)) + '</strong>';
    }
    return escapeHtml(part);
  }).join('');
}

function localImageUrl(image) {
  const filename = String(image || '').replace(/^(\.\/|\/)+/, '');
  return /^photos\/[a-z0-9._-]+\.(jpe?g|png|webp)$/i.test(filename) ? `./${filename}` : '';
}

function art(large = false) {
  return `<div class="food-art ${large ? 'large' : ''}" aria-hidden="true"></div>`;
}

function recipeCard(recipe) {
  const image = localImageUrl(recipe.image);
  const cover = image
    ? `<div class="card-image"><img src="${escapeHtml(image)}" alt="Illustrative photo for ${escapeHtml(recipe.title)}" loading="lazy"></div>`
    : art();
  const metadata = [recipe.cookTime, recipe.yield].filter(Boolean);
  return `<a class="recipe-card" href="#/recipe/${encodeURIComponent(recipe.id)}">
    ${cover}
    <div class="card-body">
      <div class="card-topline"><span>${escapeHtml(recipe.category)}</span></div>
      <h3>${escapeHtml(recipe.title)}</h3>
      <p>${escapeHtml(recipe.description)}</p>
      ${metadata.length ? `<div class="card-meta">${metadata.map((value) => `<span>${escapeHtml(value)}</span>`).join('<span class="meta-dot">·</span>')}</div>` : ''}
      <span class="card-cta">View recipe <span aria-hidden="true">→</span></span>
    </div>
  </a>`;
}

function filteredRecipes() {
  const query = state.query.toLocaleLowerCase();
  const matches = state.recipes.filter((recipe) => {
    const matchesCategory = state.category === 'All' || recipe.category === state.category;
    const searchableText = `${recipe.title} ${recipe.description} ${recipe.category} ${recipe.ingredients.join(' ')}`;
    return matchesCategory && searchableText.toLocaleLowerCase().includes(query);
  });
  if (state.sort === 'az') matches.sort((a, b) => a.title.localeCompare(b.title));
  return matches;
}

function updateGrid() {
  const recipes = filteredRecipes();
  const grid = document.querySelector('#recipeGrid');
  if (!grid) return;
  grid.innerHTML = recipes.length ? recipes.map(recipeCard).join('') :
    '<div class="empty-state"><span>✿</span><h3>No recipes found</h3><p>Try another search.</p></div>';
  document.querySelector('#resultCount').textContent = `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`;
}

function renderHome() {
  const categories = ['All', ...new Set(state.recipes.map((recipe) => recipe.category))];
  document.title = "Derya's Kitchen";
  app.innerHTML = `<div class="home-page">
    <section class="browse-intro">
      <div><span class="eyebrow"><span class="nazar" aria-hidden="true"></span> RECIPE BOOK</span>
        <h1>Find a recipe<span>.</span></h1>
        <p>${state.recipes.length} ${state.recipes.length === 1 ? 'recipe' : 'recipes'}</p>
      </div>
    </section>
    <section class="collection" id="collection">
      <div class="collection-controls">
        <label class="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search recipes by name or ingredient</span><input id="recipeSearch" type="search" placeholder="Search by recipe or ingredient" value="${escapeHtml(state.query)}"></label>
        <label class="sort-box"><span>Sort</span><select id="recipeSort"><option value="saved" ${state.sort === 'saved' ? 'selected' : ''}>Default order</option><option value="az" ${state.sort === 'az' ? 'selected' : ''}>A to Z</option></select></label>
      </div>
      <div class="category-list" role="group" aria-label="Filter by category">${categories.map((category) => {
        const count = category === 'All' ? state.recipes.length : state.recipes.filter((recipe) => recipe.category === category).length;
        return `<button type="button" class="category-pill ${category === state.category ? 'active' : ''}" data-category="${escapeHtml(category)}">${category === 'All' ? 'All recipes' : escapeHtml(category)} <span>${count}</span></button>`;
      }).join('')}</div>
      <div class="result-line"><span id="resultCount"></span></div>
      <div class="recipe-grid" id="recipeGrid"></div>
    </section>
  </div>`;
  updateGrid();
  document.querySelector('#recipeSearch').addEventListener('input', (event) => {
    state.query = event.target.value;
    updateGrid();
  });
  document.querySelector('#recipeSort').addEventListener('change', (event) => {
    state.sort = event.target.value;
    updateGrid();
  });
}

function renderDetail(recipe) {
  const image = localImageUrl(recipe.image);
  document.title = `${recipe.title} | Derya's Kitchen`;
  app.innerHTML = `<article class="detail-page">
    <a class="back-link" href="#/">← All recipes</a>
    <div class="detail-hero">
      <div class="detail-intro"><span class="eyebrow"><span class="eyebrow-flower">✿</span> ${escapeHtml(recipe.category.toUpperCase())} / RECIPE ${String(state.recipes.indexOf(recipe) + 1).padStart(2, '0')}</span>
        <h1>${escapeHtml(recipe.title)}</h1><p>${escapeHtml(recipe.description)}</p>
        <div class="detail-actions"><button type="button" class="button button-coral" data-action="print">Print recipe <span aria-hidden="true">↗</span></button></div>
      </div>
      ${image ? `<div class="detail-photo"><img src="${escapeHtml(image)}" alt="Illustrative photo for ${escapeHtml(recipe.title)}">${recipe.photoCredit && recipe.photoUrl ? `<a class="photo-credit" href="${escapeHtml(recipe.photoUrl)}" target="_blank" rel="noopener noreferrer">Photo: ${escapeHtml(recipe.photoCredit)}</a>` : ''}</div>` : art(true)}
    </div>
    <div class="recipe-facts">
      ${[['Prep', recipe.prepTime], ['Rest', recipe.chillTime], ['Cook', recipe.cookTime], ['Makes', recipe.yield]].filter(([, value]) => value).map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
    </div>
    <div class="recipe-content">
      <section class="ingredients-panel"><div class="panel-heading"><h2>Ingredients<span>.</span></h2></div>
        <ul class="ingredient-list">${recipe.ingredients.map((ingredient) => ingredient.startsWith('## ')
          ? `<li class="ingredient-group">${escapeHtml(ingredient.slice(3))}</li>`
          : `<li><label><input type="checkbox"><span class="custom-check" aria-hidden="true"></span><span>${escapeHtml(ingredient)}</span></label></li>`).join('')}</ul>
      </section>
      <section class="method-panel"><div class="panel-heading"><h2>Method<span>.</span></h2></div>
        <ol class="step-list">${recipe.steps.map((step, index) => `<li><span class="step-number">${String(index + 1).padStart(2, '0')}</span><p>${renderStepText(step)}</p></li>`).join('')}</ol>
      </section>
    </div>
    ${recipe.notes ? `<aside class="recipe-note"><span class="note-flower">✿</span><div><span class="section-number">NOTES</span><p>${escapeHtml(recipe.notes)}</p></div></aside>` : ''}
    <div class="detail-bottom"><a href="#/" class="back-link">← Back to recipes</a></div>
  </article>`;
}

function render() {
  const route = location.hash.slice(1).split('/').filter(Boolean);
  if (route[0] === 'recipe' && route[1]) {
    const recipe = state.recipes.find((item) => item.id === route[1]);
    if (recipe) renderDetail(recipe);
    else app.innerHTML = '<div class="empty-page"><h1>Recipe not found.</h1><a class="button button-coral" href="#/">Back to recipes</a></div>';
  } else renderHome();
  document.querySelector('#navRecipes').classList.toggle('active', !route.length);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function loadRecipes() {
  const response = await fetch('./recipes.json');
  if (!response.ok) throw new Error('Could not load the recipes.');
  const recipes = await response.json();
  if (!Array.isArray(recipes)) throw new Error('Recipe data is invalid.');
  state.recipes = recipes;
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'print') window.print();
  const category = event.target.closest('[data-category]');
  if (category) {
    state.category = category.dataset.category;
    document.querySelectorAll('[data-category]').forEach((button) => button.classList.toggle('active', button.dataset.category === state.category));
    updateGrid();
  }
});
window.addEventListener('hashchange', render);

loadRecipes().then(render).catch((error) => {
  app.innerHTML = `<div class="empty-page"><h1>Could not open the recipe book.</h1><p>${escapeHtml(error.message)}</p></div>`;
});
