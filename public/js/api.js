// Função para buscar as categorias e suas lives do backend
export function fetchCategories() {
  const url = "/api/getCategories";

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Erro ao buscar as categorias:", error);
    });
}
