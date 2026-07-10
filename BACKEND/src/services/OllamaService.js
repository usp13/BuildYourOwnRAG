import axios from "axios";

class OllamaService {
  constructor() {
    
    this.baseURL =
      process.env.OLLAMA_URL ||
      "http://localhost:11434";

    this.embedModel =
      process.env.EMBED_MODEL ||
      "nomic-embed-text";

    this.genModel =
      process.env.GEN_MODEL ||
      "llama3.2:3b";
  }

  async health() {
    try {
      await axios.get(
        `${this.baseURL}/api/tags`
      );

      return true;
    } catch {
      return false;
    }
  }

  async embed(text) {
    const response =
      await axios.post(
        `${this.baseURL}/api/embeddings`,
        {
          model: this.embedModel,
          prompt: text,
        }
      );

    return response.data.embedding;
  }

  async generate(prompt) {
    const response =
      await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.genModel,
          prompt,
          stream: false,
        }
      );

    return response.data.response;
  }
}

export default OllamaService;