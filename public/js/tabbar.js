// import { toggleSidebar } from "./sidebar.js";

export function renderTabBar() {
  const tabBar = document.createElement("div");
  tabBar.classList.add("tabbar");

  // Cria a logo da tabbar
  const logo = document.createElement("div");
  logo.classList.add("logo");
  logo.innerHTML = `<img src="/css/kerygma-logo.png" alt="Kerygma Logo" class="logo">`;
  tabBar.appendChild(logo);

  // Adiciona a tabbar ao DOM
  document.body.prepend(tabBar);
}
