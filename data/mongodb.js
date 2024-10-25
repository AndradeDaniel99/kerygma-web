import { MongoClient, ServerApiVersion } from "mongodb"; // MongoDB import
import dotenv from "dotenv";

// MongoDB URI
dotenv.config(); // Carrega as variáveis do arquivo .env

// eslint-disable-next-line no-undef
const uri = process.env.MONGODB_URI;

// Create MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Função para conectar ao MongoDB
export async function connectToMongoDB() {
  try {
    // Conecta o cliente ao servidor (opcional a partir da v4.7)
    await client.connect();
    console.log("You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
  }
}

export { client };
