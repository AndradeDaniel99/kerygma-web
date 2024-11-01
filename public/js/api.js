// Função para buscar as categorias e suas lives do backend
export async function fetchCategories() {
  const url = "/api/getCategories";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar as categorias:", error);
  }
}
