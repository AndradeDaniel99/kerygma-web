// /api/getCategories.js
import clientPromise from "../index.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db("kerygmaDB");
    const categories = await db.collection("categories").find({}).toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
}
