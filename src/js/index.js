require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import List from "./model/List";
import Likes from "./model/Like";
import * as likesView from "./view/likesView";
import * as listView from "./view/listView";
import {
  renderRecipe,
  clearRecipe,
  highlightSelectedRecipe
} from "./view/recipeView";
/**
 * Web app төлөв
 * -Хайлтын query, үр дүн
 * -Тухайн үзүүлж байгаа жор
 * -Лайкласан жорууд
 * -Захиалж байгаа жорын найрлагууд
 */

const state = {};

/**
 * Хайлтын контроллер
 */
const controlSearch = async () => {
  //1. Вэбээс хайлтын түлхүүр үгийг гаргаж авна
  const query = searchView.getInput();

  if (query) {
    //2. Шинээр хайлтын обьектыг үүсгэнэ
    state.search = new Search(query);
    //3. Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);
    //4. Хайлтыг гүйцэтгэнэ
    await state.search.doSearch();
    //5. Хайлтын үр дүнг дэлгэцэнд харуулна
    clearLoader();
    if (state.search.result === undefined) alert("Хайлтаар илэрцгүй");
    else searchView.renderRecipes(state.search.result);
  }
};
elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});
/**
 *Жорын контроллер
 */
const controlRecipe = async () => {
  //URl-aac ID ийг салгаж авна.
  const id = window.location.hash.replace("#", "");
  if (id) {
    // Жорын моделийг үүсгэнэ
    state.recipe = new Recipe(id);
    //UI дэлгэцийг бэлтгэнэ
    clearRecipe();
    renderLoader(elements.recipeDiv);
    //Жороо татаж авна.
    await state.recipe.getRecipe();
    //Жороо гүйцэтгэх хугацааг болон орцыг тооцоолно
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();
    // Жорыг дэлгэцэнд гаргана
    renderRecipe(state.recipe, state.likes.isLiked(id));
  }
};
// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach(e => window.addEventListener(e, controlRecipe));

window.addEventListener("load", e => {
  //Шинээр лайк моделийг аппын эхэнд үүсгэнэ
  if (!state.likes) state.likes = new Likes();
  //like tsesiig gargah eseh
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
  // like uud baiwal tedgeeriig tsesend nemj haruulna
  state.likes.likes.forEach(like => likesView.renderLike(like));
});
/**
 * Найрлаганы контроллер
 */
const controlList = () => {
  //Найрлаганы моделийг үүсгэнэ
  state.list = new List();

  //Өмнө харагдаж байгаа найрлагуудыг дэлгэцээс зайлуулна
  listView.clearItems();
  // Уг модел рүү одоо харагдаж байгаа жорны бүх найрлагыг авч хийнэ
  state.recipe.ingredients.forEach(n => {
    // Тухайн найрлагыг модел рүү хийнэ
    const item = state.list.addItem(n);
    //Тухайн найрлагыг дэлгэцэнд гаргана
    listView.renderItem(item);
  });
};
/**
 * Like controller
 */
const controlLike = () => {
  // 1. Like ийн моделийг үүсгэнэ
  if (!state.likes) state.likes = new Likes();
  //2. Одоо харагдаж байгаа жорын ID ийг олж авна
  const currentRecipeId = state.recipe.id;
  //3. Энэ жорыг лайк хийсэн эсэхийг шалгах
  if (state.likes.isLiked(currentRecipeId)) {
    // like хийсэн бол болиулах
    state.likes.deleteLike(currentRecipeId);
    // like ийн цэснээс устгана
    likesView.deleteLike(currentRecipeId);
    // Лайк товчны лайкласан байдлыг болиулах
    likesView.toggleLikeBtn(false);
  } else {
    // like хийгээгүй бол like лах

    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );
    // Лайк товчны лайкласан байдлыг лайкалсан болгох
    likesView.toggleLikeBtn(true);
    //Лайк цэсэнд энэ лайкыг оруулах
    likesView.renderLike(newLike);
  }
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};
elements.recipeDiv.addEventListener("click", e => {
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});
elements.shoppingList.addEventListener("click", e => {
  //клик хийсэн li элементийн data-itemid аттрибутыг шүүж авах
  const id = e.target.closest(".shopping__item").dataset.itemid;
  // олдсон ID-тэй орцыг моделоос устгана
  state.list.deleteItem(id);
  // Дэлгэцээс устгана
  listView.deleteItem(id);
});
