import { fetchCategories } from "./api.js";
import { renderCategoryCarousels } from "./carousel.js";
import { renderTabBar } from "./tabbar.js";

// Função principal para carregar categorias e suas lives
window.onload = () => {
  // Renderiza a tabbar
  renderTabBar();

  // Chama a função para carregar os textos ao carregar a página
  loadLocalization();

  // Renderiza os carrosséis
  fetchCategories().then((categories) => {
    if (categories) {
      renderCategoryCarousels(categories);
    }
  });
};

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
