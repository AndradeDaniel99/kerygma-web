// import { toggleSidebar } from "./sidebar.js";

export function renderTabBar() {
  const tabBar = document.createElement("div");
  tabBar.classList.add("tabbar");

  // Cria a logo da tabbar
  const logo = document.createElement("div");
  logo.classList.add("logo");
  logo.innerHTML = `<img src='https://via.placeholder.com/50' alt="Logo">`;
  tabBar.appendChild(logo);

  // Adiciona a tabbar ao DOM
  document.body.prepend(tabBar);
}
