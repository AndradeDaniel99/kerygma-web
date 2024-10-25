// Função para renderizar carrosséis de categorias e suas lives
export function renderCategoryCarousels(categories) {
  const container = document.getElementById("carousels-container");
  container.innerHTML = ""; // Limpa o container

  // Itera pelas categorias
  categories.forEach((category) => {
    const categorySection = document.createElement("div");
    categorySection.classList.add("carousel-section");

    // Adiciona o título da categoria
    const categoryTitle = document.createElement("h2");
    categoryTitle.textContent = category.title; // Usa o título diretamente do JSON
    categorySection.appendChild(categoryTitle);

    // Cria o carrossel para a categoria
    const carousel = document.createElement("div");
    carousel.classList.add("carousel");
    categorySection.appendChild(carousel);

    // Adiciona cada live ao carrossel
    category.lives.forEach((live) => {
      const liveElement = document.createElement("div");
      liveElement.classList.add("live");

      // Monta o link do YouTube usando o videoId
      const liveLink = document.createElement("a");
      liveLink.href = `https://www.youtube.com/watch?v=${live.videoId}`; // Link gerado dinamicamente
      liveLink.target = "_blank"; // Abre o link em uma nova aba
      liveLink.rel = "noopener noreferrer"; // Melhoria de segurança

      // Conteúdo do card
      // Conteúdo do card
      liveLink.innerHTML = `
                <img src="${live.thumbnail}" alt="${live.title}">
                <div class="live-info">
                <h3>${live.title}</h3>    
                <p>${live.viewers || "N/A"} visualizações</p> 
                </div>
            `;

      // Anexa o link à estrutura
      liveElement.appendChild(liveLink);
      carousel.appendChild(liveElement);
    });

    // Adiciona a seção completa ao container principal
    container.appendChild(categorySection);
  });
}
