// Função para buscar vídeo no YouTube pelo videoId
async function fetchYouTubeVideoById(videoId) {
  try {
    const response = await fetch(`/api/youtube-video/${videoId}`); // Nova rota no backend
    const videoData = await response.json();

    // Se o vídeo for encontrado, mostra os dados em formato JSON
    if (response.ok && videoData) {
      const videoInfoDiv = document.getElementById("youtube-video-info");

      // Mostra os dados do vídeo em JSON
      videoInfoDiv.innerHTML = `
        <pre>${JSON.stringify(videoData, null, 2)}</pre>
      `;
    } else {
      alert("Vídeo não encontrado ou erro ao buscar o vídeo");
    }
  } catch (error) {
    console.error("Erro ao buscar vídeo no YouTube:", error);
    alert("Erro ao buscar vídeo no YouTube");
  }
}

// Evento para o botão de buscar vídeo
document.getElementById("fetch-youtube-video").addEventListener("click", () => {
  const videoId = document.getElementById("youtube-video-id").value.trim();
  if (videoId) {
    fetchYouTubeVideoById(videoId); // Chama a função de buscar o vídeo
  } else {
    alert("Por favor, insira um Video ID válido.");
  }
});

// Função para buscar as categorias e exibi-las no painel admin
async function fetchCategories() {
  try {
    const response = await fetch("/api/categories");
    const categories = await response.json();
    const categoriesSection = document.getElementById("categories");
    categoriesSection.innerHTML = "";

    categories.forEach((category) => {
      renderCategory(category, categoriesSection);
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
  }
}

function renderCategory(category, container) {
  resetNewCategoryForm();

  const categoryElement = document.createElement("div");
  categoryElement.classList.add("category-item", "mb-5"); // Adiciona espaçamento entre as categorias

  let livesToDelete = [];

  categoryElement.innerHTML = `
      <div class="mb-3">
        <input type="text" value="${
          category.title
        }" class="form-control category-title" placeholder="Título da Categoria" />
      </div>
      <div class="category-lives">
          ${category.lives
            .map(
              (live) => `
            <div class="live-item row mb-3">
                <div class="col-md-4">
                  <input type="text" value="${live.title}" class="form-control live-title" placeholder="Título da Live" />
                </div>
                <div class="col-md-4">
                  <input type="text" value="${live.videoId}" class="form-control live-id" placeholder="ID da Live" />
                </div>
                <div class="col-md-3">
                  <input type="text" value="${live.viewers}" class="form-control live-viewers" placeholder="Visualizações" />
                </div>
                <div class="col-md-3">
                  <input type="text" value="${live.thumbnail}" class="form-control live-thumbnail" placeholder="Thumbnail" />
                </div>
                <div class="col-md-1">
                  <button class="btn btn-danger remove-live">Excluir</button>
                </div>
            </div>`
            )
            .join("")}
      </div>
      <div class="mt-3">
        <button class="btn btn-primary add-live">Adicionar Live</button>
        <button class="btn btn-success save-category">Salvar Categoria</button>
        <button class="btn btn-danger delete-category">Excluir Categoria</button>
      </div>
  `;

  addEventListenersToCategory(categoryElement, category._id, livesToDelete);
  container.appendChild(categoryElement);
}

function addEventListenersToCategory(
  categoryElement,
  categoryId,
  livesToDelete
) {
  // Evento para excluir uma live existente
  categoryElement
    .querySelectorAll(".remove-live")
    .forEach((removeButton, index) => {
      removeButton.addEventListener("click", () => {
        const liveItem = categoryElement.querySelectorAll(".live-item")[index];

        // Adicionar a live ao array livesToDelete usando o videoId para remover do backend
        const liveId = liveItem.querySelector(".live-id").value;
        livesToDelete.push(liveId);

        // Remover o item do DOM
        liveItem.remove();
      });
    });

  // Evento para adicionar uma nova live
  categoryElement
    .querySelector(".add-live")
    .addEventListener("click", () => addLiveFieldToCategory(categoryElement));

  // Evento para salvar a categoria
  categoryElement
    .querySelector(".save-category")
    .addEventListener("click", () =>
      saveCategory(categoryId, categoryElement, livesToDelete)
    );

  // Evento para excluir a categoria
  categoryElement
    .querySelector(".delete-category")
    .addEventListener("click", () => deleteCategory(categoryId));
}

function addLiveFieldToCategory(categoryElement) {
  const newLiveItem = document.createElement("div");
  newLiveItem.classList.add("live-item", "mb-3", "row"); // Adiciona classes Bootstrap para espaçamento e layout

  newLiveItem.innerHTML = `
    <div class="col-md-4">
      <input type="text" class="form-control live-title" placeholder="Título da Live" />
    </div>
    <div class="col-md-4">
      <input type="text" class="form-control live-id" placeholder="ID da Live" />
    </div>
    <div class="col-md-3">
      <input type="text" class="form-control live-viewers" placeholder="Visualizações" />
    </div>
    <div class="col-md-3">
      <input type="text" class="form-control live-thumbnail" placeholder="Thumbnail" />
    </div>
    <div class="col-md-1">
      <button class="btn btn-danger remove-live">Excluir</button>
    </div>
  `;

  // Adiciona o evento de remover à nova live
  newLiveItem.querySelector(".remove-live").addEventListener("click", () => {
    newLiveItem.remove();
  });

  categoryElement.querySelector(".category-lives").appendChild(newLiveItem);
}

// Função para validar campos antes de criar ou salvar categoria
function validateCategoryForm(categoryTitle, lives) {
  if (!categoryTitle.trim()) {
    alert("O título da categoria é obrigatório!");
    return false;
  }

  if (lives.length === 0) {
    alert("É necessário adicionar pelo menos uma live!");
    return false;
  }

  for (let live of lives) {
    // Verifica se algum campo da live está vazio ou se viewers não é um número válido
    if (!live.title.trim() || !live.videoId.trim()) {
      alert("Todos os campos da live são obrigatórios!");
      return false;
    }

    if (!live.viewers || isNaN(live.viewers) || parseInt(live.viewers) < 0) {
      alert("O campo de visualizações deve ser um número válido!");
      return false;
    }
  }

  return true;
}

// Função para salvar a categoria
async function saveCategory(categoryId, categoryElement, livesToDelete) {
  const title = categoryElement.querySelector(".category-title").value;

  // Extrair as lives do DOM
  let lives = Array.from(categoryElement.querySelectorAll(".live-item")).map(
    (liveElement) => ({
      title: liveElement.querySelector(".live-title").value,
      videoId: liveElement.querySelector(".live-id").value,
      viewers: liveElement.querySelector(".live-viewers").value,
      thumbnail: liveElement.querySelector(".live-thumbnail").value,
    })
  );

  // Validação antes de salvar a categoria
  if (!validateCategoryForm(title, lives)) {
    return; // Para o envio se a validação falhar
  }

  // Preparar o objeto de atualização de categoria com lives
  const updatedCategory = {
    title,
    lives,
    livesToDelete: livesToDelete.map((id) => id), // Enviar os videoIds das lives que precisam ser deletadas
  };

  try {
    // Buscar o token CSRF antes de enviar a requisição
    const csrfResponse = await fetch("/api/csrf-token");
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken, // Envia o token CSRF no cabeçalho
      },
      body: JSON.stringify(updatedCategory),
    });

    if (response.ok) {
      alert("Categoria atualizada com sucesso!");
    } else {
      alert("Erro ao atualizar categoria.");
    }
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    alert("Erro ao atualizar categoria.");
  }
}

// Função para excluir uma categoria no backend
async function deleteCategory(categoryId) {
  if (confirm("Você tem certeza que quer excluir essa categoria?")) {
    try {
      // Buscar o token CSRF antes de enviar a requisição
      const csrfResponse = await fetch("/api/csrf-token");
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken, // Envia o token CSRF no cabeçalho
        },
      });

      if (response.ok) {
        alert("Categoria excluída com sucesso!");
        fetchCategories(); // Atualiza a lista de categorias após a exclusão
      } else {
        alert("Erro ao excluir categoria.");
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria.");
    }
  }
}

// Função para criar uma nova categoria no backend
async function createCategory() {
  const title = document.getElementById("new-category-title").value;

  // Extrai as lives adicionadas
  const lives = Array.from(
    document.querySelectorAll("#new-category-lives .live-item")
  ).map((liveElement) => ({
    title: liveElement.querySelector(".new-live-title").value,
    videoId: liveElement.querySelector(".new-live-id").value,
    viewers: liveElement.querySelector(".new-live-viewers").value,
    thumbnail: liveElement.querySelector(".new-live-thumbnail").value,
  }));

  // Validação antes de enviar a requisição
  if (!validateCategoryForm(title, lives)) {
    return; // Para se a validação falhar
  }

  const newCategory = { title, lives };

  try {
    // Buscar o token CSRF antes de enviar a requisição
    const csrfResponse = await fetch("/api/csrf-token");
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken, // Envia o token CSRF no cabeçalho
      },
      body: JSON.stringify(newCategory),
    });

    if (response.ok) {
      alert("Categoria criada com sucesso!");
      fetchCategories(); // Atualiza a lista de categorias após a criação
      resetNewCategoryForm(); // Limpa o formulário de criação
    } else {
      const errorMessage = await response.text(); // Pega a mensagem de erro
      alert(`Erro ao criar categoria: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    alert(
      "Erro ao criar categoria. Verifique sua conexão ou tente mais tarde."
    );
  }
}

// Função para limpar o formulário de criação de categoria após sucesso
function resetNewCategoryForm() {
  document.getElementById("new-category-title").value = ""; // Limpa o título
  document
    .querySelectorAll("#new-category-lives .live-item")
    .forEach((liveItem) => liveItem.remove()); // Remove todas as lives do formulário
}

// Função para adicionar um novo campo de live no formulário de nova categoria com Bootstrap
function addLiveField() {
  const liveItem = document.createElement("div");
  liveItem.classList.add("live-item", "row", "mb-3"); // Adiciona classes Bootstrap para layout em grid e espaçamento

  liveItem.innerHTML = `
    <div class="col-md-4">
      <input type="text" placeholder="Título da Live" class="form-control new-live-title" />
    </div>
    <div class="col-md-3">
      <input type="text" placeholder="Video ID" class="form-control new-live-id" />
    </div>
    <div class="col-md-2">
      <input type="text" placeholder="Viewers" class="form-control new-live-viewers" />
    </div>
    <div class="col-md-3">
      <input type="text" placeholder="Thumbnail" class="form-control new-live-thumbnail" />
    </div>
  `;

  document.getElementById("new-category-lives").appendChild(liveItem);
}

// Adiciona listeners para os botões de adicionar live e criar categoria
document.getElementById("add-live").addEventListener("click", addLiveField);
document
  .getElementById("create-category")
  .addEventListener("click", createCategory);

// Função para buscar as categorias e exibi-las no painel admin
// (mantenha o restante das funções já implementadas)

// Chama a função para carregar as categorias ao carregar a página
window.onload = () => {
  fetchCategories();
};
