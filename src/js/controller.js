import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// import ressources
import 'core-js/stable'; // polyfilling everything else
import 'regenerator-runtime/runtime'; // polyfilling async await
// import { search } from 'core-js/fn/symbol';

// if (module.hot) {
//   module.hot.accept();
// }

///////////////////////////////////////
// Initialize project : npm init (generate package.json)
// Install parcel inside project : npm i parcel@next -D
// Run parcel : npm run start / npm start

// ES6 project polyfilling installation
// npm i core-js regenerator-runtime

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    resultView.update(model.getSearchResultsPage());

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);

    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError(); // don't pass anything to use view's error handling
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResult(query);

    resultView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render Bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change id url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('welcome');
};

init();
