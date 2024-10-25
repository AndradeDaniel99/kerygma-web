import fetch from "node-fetch";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line no-undef
const API_KEY = process.env.YOUTUBE_API_KEY;

// Usuário e senha hardcoded para exemplo (em produção, use um banco de dados)
const adminUser = {
  username: "admin",
  passwordHash: await bcrypt.hash("Jesus#87", 10), // Senha criptografada
};

export { adminUser };

// Função para validar o login
export async function loginUser(req, res) {
  const { username, password } = req.body;

  // Sanitização
  const sanitizedUsername = validator.escape(username);
  const sanitizedPassword = validator.escape(password);

  // Validação de formato
  if (!validator.isAlphanumeric(sanitizedUsername)) {
    return res.status(400).json({ message: "Usuário inválido" });
  }
  if (!validator.isLength(sanitizedPassword, { min: 6 })) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres" });
  }

  // Verifica o usuário e a senha
  if (
    username === adminUser.username &&
    bcrypt.compareSync(password, adminUser.passwordHash)
  ) {
    req.session.user = username; // Armazena o usuário na sessão
    res.status(200).json({ message: "Login bem-sucedido!" });
  } else {
    res.status(401).json({ message: "Usuário ou senha incorretos." });
  }
}

// Middleware para proteger rotas de admin
export function checkAuth(req, res, next) {
  if (req.session.user) {
    next(); // Autenticado, pode prosseguir
  } else {
    res.redirect("/login"); // Redireciona para a página de login se não autenticado
  }
}

// Função para buscar vídeo pelo ID no YouTube
export async function fetchYouTubeVideoById(videoId) {
  try {
    // URL da API do YouTube para buscar os dados de um vídeo específico
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        viewers: video.statistics.viewCount, // Número total de visualizações
      };
    } else {
      return null; // Caso o vídeo não seja encontrado
    }
  } catch (error) {
    console.error("Erro ao buscar vídeo no YouTube:", error);
    throw new Error("Erro ao buscar vídeo no YouTube.");
  }
}
