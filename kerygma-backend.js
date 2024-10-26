import express from "express";
import session from "express-session"; // Para gerenciar sessões
import cors from "cors";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb"; // MongoDB import
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import {
  fetchYouTubeVideoById,
  loginUser,
  checkAuth,
} from "./backend-viewmodel.js";
import { connectToMongoDB, client } from "./data/mongodb.js";

dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configura o middleware CSRF
const csrfProtection = csurf({ cookie: true });
// Configuração do rate limit para limitar o número de requisições
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas de login por IP em 15 minutos
  message:
    "Muitas tentativas de login. Por favor, tente novamente em 15 minutos.",
  headers: true, // Adiciona cabeçalhos RateLimit aos responses
});

// Middleware necessário para o cookie-parser
app.use(cookieParser());

// Adicione o middleware CSRF às rotas que precisam de proteção
app.use(csrfProtection);

app.use(cors());

// Adicione o middleware CSRF às rotas que precisam de proteção
app.use(csrfProtection);

// Configuração do express-session
app.use(
  session({
    // eslint-disable-next-line no-undef
    secret: process.env.SESSION_SECRET, // Troque por uma chave secreta forte
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Defina como true se estiver usando HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Expira após 24 horas (86400000 ms)
    },
  })
);

// Middleware para servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Middleware para processar JSON no corpo das requisições
app.use(express.json());

// Rota de login
app.post("/api/login", loginLimiter, loginUser); // Usa a função loginUser do viewmodel

// Protege a rota de admin
app.get("api/admin", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "admin.html"));
});

// Rota para fornecer o token CSRF ao frontend
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rota para a página de login
app.get("api/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/login.html"));
});

// Rota para buscar apenas os nomes das categorias
app.get("/api/categories/names", async (req, res) => {
  try {
    const db = client.db("kerygmaDB");
    const categories = await db
      .collection("categories")
      .find({}, { projection: { title: 1 } })
      .toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erro ao buscar nomes das categorias:", error);
    res.status(500).json({ message: "Erro ao buscar nomes das categorias" });
  }
});

// Rota para atualizar uma categoria existente (adicionar uma live)
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params; // Pega o ID da categoria da URL
  const { title, lives } = req.body; // Pega o novo título e o array de lives do corpo da requisição
  console.log(title);
  try {
    const db = client.db("kerygmaDB");
    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) }, // Filtro: Encontra a categoria pelo ID
      { $set: { title, lives } } // Atualiza o título e o array de lives
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    res.status(200).json({ message: "Categoria atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ message: "Erro ao atualizar categoria." });
  }
});

// Nova rota para buscar vídeo pelo ID no YouTube
app.get("/api/youtube-video/:videoId", async (req, res) => {
  const { videoId } = req.params;

  try {
    const videoData = await fetchYouTubeVideoById(videoId); // Chamar a função do viewmodel

    if (videoData) {
      res.json(videoData);
    } else {
      res.status(404).json({ message: "Vídeo não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao buscar vídeo no YouTube:", error);
    res.status(500).json({ message: "Erro ao buscar vídeo no YouTube." });
  }
});

// Rota para adicionar um novo vídeo a uma categoria existente
app.put("/api/categories/:id/add-video", async (req, res) => {
  const { id } = req.params; // Pegamos o ID da categoria da URL
  const newVideo = req.body; // Dados do novo vídeo (title, videoId, viewers, thumbnail)

  try {
    const db = client.db("kerygmaDB");

    // Adiciona o novo vídeo à lista de lives da categoria
    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      { $push: { lives: newVideo } } // Adiciona o vídeo à array de lives
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    res
      .status(200)
      .json({ message: "Vídeo adicionado com sucesso à categoria." });
  } catch (error) {
    console.error("Erro ao adicionar vídeo à categoria:", error);
    res.status(500).json({ message: "Erro ao adicionar vídeo à categoria." });
  }
});

// Método GET para buscar todas as categorias
app.get("/api/categories", async (req, res) => {
  try {
    const db = client.db("kerygmaDB");

    // Busca todas as categorias na coleção
    const categories = await db.collection("categories").find().toArray();

    res.status(200).json(categories); // Retorna as categorias em formato JSON
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ message: "Erro ao buscar categorias", error });
  }
});

// Adiciona nova categoria ao banco de dados
app.post("/api/categories", async (req, res) => {
  try {
    const { title, lives } = req.body; // Pegamos o título da categoria e os vídeos do corpo da requisição
    const database = client.db("kerygmaDB");
    const categories = database.collection("categories");

    // Insere uma nova categoria no banco de dados
    const result = await categories.insertOne({ title, lives });
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    res.status(500).json({ error: "Erro ao adicionar categoria" });
  }
});

// Rota para buscar uma categoria específica pelo ID
app.get("/api/categories/:id", async (req, res) => {
  const { id } = req.params; // Pega o ID da categoria da URL

  try {
    const db = client.db("kerygmaDB");
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    res.status(500).json({ message: "Erro ao buscar categoria." });
  }
});

// Atualiza uma categoria existente no MongoDB
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params; // Pegamos o ID da categoria da URL
  const { title, lives, livesToDelete } = req.body; // Pegamos o novo título, lives e lives a serem excluídas

  try {
    const db = client.db("kerygmaDB");

    // Atualiza o título e as lives da categoria
    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) }, // Filtro: encontramos pela categoria ID
      { $set: { title, lives } } // Atualiza título e lives
    );

    // Verificamos se algum documento foi modificado
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    // Se houver lives a serem excluídas, removemos pelo videoId
    if (livesToDelete && livesToDelete.length > 0) {
      await db.collection("categories").updateOne(
        { _id: new ObjectId(id) },
        { $pull: { lives: { videoId: { $in: livesToDelete } } } } // Remove as lives com os videoIds correspondentes
      );
    }

    res
      .status(200)
      .json({ message: "Categoria atualizada com sucesso", result });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ message: "Erro ao atualizar categoria" });
  }
});

// Endpoint para excluir uma categoria
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params; // Pegamos o ID da categoria da URL

  try {
    const db = client.db("kerygmaDB");
    const result = await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Categoria excluída com sucesso" });
    } else {
      res.status(404).json({ message: "Categoria não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    res.status(500).json({ message: "Erro ao excluir categoria" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Chamar a função para conectar ao MongoDB quando o servidor for iniciado
connectToMongoDB();
