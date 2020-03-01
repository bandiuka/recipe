import { elements } from "./base";
const renderRecipe = recipe => {
  const markup = `
  <li>
  <a class="results__link" href="#${recipe.recipe_id}">
    <figure class="results__fig">
      <img src="${recipe.image_url}" alt="Test" />
    </figure>
    <div class="results__data">
      <h4 class="results__name">${recipe.title}</h4>
      <p class="results__author">${recipe.publisher}</p>
    </div>
  </a>
</li>`;
  //ul рүүгээ нэмнэ
  elements.searchResultList.insertAdjacentHTML("beforeend", markup);
};
export const clearSearchQuery = () => {
  elements.searchInput.value = "";
};
export const clearSearchResult = () => {
  elements.searchResultList.innerHTML = "";
  elements.pageButtons.innerHTML = "";
};
export const getInput = () => elements.searchInput.value; // 1 мөр бичиглэл тул return гэж бичих шаардлаггүй шууд буцаана

export const renderRecipes = (recipes, currentpage = 1, resPerPage = 10) => {
  //Хайлтын үр дүнг хуудаслаж үзүүлэх
  //page=2, start=10, end=20
  const start = (currentpage - 1) * resPerPage;
  const end = currentpage * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);
  // хуудаслалтын товчийг гаргаж ирэх
  const totalPage = Math.ceil(recipes.length / resPerPage);
  renderButtons(currentpage, totalPage);
};
//type===> 'prev' , 'next'
const createButton = (page, type, direction) =>
  `<button class="btn-inline results__btn--${type}" data-goto=${page}>
  <svg class="search__icon">
    <use href="img/icons.svg#icon-triangle-${direction}"></use>
  </svg>
  <span>Хуудас ${page}</span>
  </button>`;

const renderButtons = (currentpage, totalPage) => {
  let buttonHtml;
  if (currentpage === 1 && totalPage > 1) {
    //1-р хуудсан дээр байна. 2-р хуудас гэдэг товчийг гарга
    buttonHtml = createButton(2, "next", "right");
  } else if (currentpage < totalPage) {
    //өмнөх болон дараачийн хуудас руу шилжих товчуудыг үзүүлэх
    buttonHtml = createButton(currentpage - 1, "prev", "left");
    buttonHtml += createButton(currentpage + 1, "next", "rifht");
  } else if (currentpage === totalPage) {
    //хамгийн сүүлийн хуудас дээр байна. Өмнөх рүү шилжүүлэх товчийг үзүүлнэ.
    buttonHtml = createButton(currentpage - 1, "prev", "left");
  }
  elements.pageButtons.insertAdjacentHTML("afterbegin", buttonHtml);
};
