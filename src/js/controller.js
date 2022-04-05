import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import PaginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView.js';


if(module.hot) {
  module.hot.accept();
}


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  try {

    const id = window.location.hash.slice(1);
    if(!id) return;
   
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // 1) Loading recipe
    await model.loadRecipe(id);
    // // 2) Rendering recipe
    recipeView.render(model.state.recipe);    
  } catch(err) {
    recipeView.renderError();
  }

  
}

const controlSearchResults = async function() {
  try {
    
    const query = searchView.getQuery();
    if(!query) return;

    resultsView.renderSpinner();

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());


    paginationView.render(model.state.search);
  } catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}


const controlServings = function(newServings) {
  //Update the recipe servings(in state)
  model.updateServings(newServings);
  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}


const controlAddBookmark = function() {

  if(!model.state.recipe.bookmarked) { 
    model.addBookmark(model.state.recipe);
  }  
  else {
    model.deleteBookmark(model.state.recipe.id);
  } 
  
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try{

    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();


    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000)

    
  } catch(err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
  
}


const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  console.log('Application started');
}


init();