import { fetchCategories } from "./api.js";
import { renderCategoryCarousels } from "./carousel.js";
import { renderTabBar } from "./tabbar.js";

// Função para formatar o número de visualizações
function formatViewersCount(viewersCount) {
  return viewersCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Função para formatar o JSON de categorias com a contagem de visualizações formatada
function formatCategories(categories) {
  return categories.map(category => {
    const formattedLives = category.lives.map(live => ({
      ...live,
      viewers: formatViewersCount(live.viewers)
    }));
    return {
      ...category,
      lives: formattedLives
    };
  });
}

// Carrega as categorias e renderiza o carrossel
async function loadAndRenderCategories() {
  const categories = await fetchCategories();
  const formattedCategories = formatCategories(categories);
  renderCategoryCarousels(formattedCategories);
}

// Função para carregar o arquivo JSON de acordo com o idioma do usuário
async function loadLocalization() {
  // Carrega o arquivo de tradução com base no idioma detectado
  const response = await fetch(`/locales/pt.json`);
  const localization = await response.json();

  // Atualiza o título
  document.querySelector("h1").textContent = localization.header.title;

  // Atualiza o footer
  document.querySelector(".footer .footer-social a:nth-child(1)").textContent =
    localization.footer.social.tiktok;
  document.querySelector(".footer .footer-social a:nth-child(2)").textContent =
    localization.footer.social.instagram;
  document.querySelector(".footer .footer-copyright p").textContent =
    localization.footer.copyright;
}

// Chamando a função para carregar e renderizar as categorias ao carregar a página
window.onload = () => {
    // Renderiza a tabbar
    renderTabBar();

    // Chama a função para carregar os textos ao carregar a página
    loadLocalization();

  loadAndRenderCategories();
};