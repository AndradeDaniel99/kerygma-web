// Função para buscar as categorias e suas lives do backend, com base no idioma
export function fetchCategories() {
  // Define a URL da API com base no idioma recebido
  const url = `/api/categories`;

  return fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Erro ao buscar as categorias:", error);
    });
}
