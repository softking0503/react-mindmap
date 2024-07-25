import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { openAIKey } = req.body;

    if (openAIKey) {
      const openai = new OpenAI({
        apiKey: openAIKey,
      });

      try {
        // Test the validity of the API key by fetching the available models
        await openai.models.list();

        // If the key is valid, proceed with creating a thread
        const thread = await openai.beta.threads.create();

        res.status(200).json(thread);
      } catch (error) {
        // Check if the error is due to an invalid API key
        if (error && error.status === 401) {
          res.status(401).json({ error: "Invalid OpenAI API key" });
        } else {
          res.status(500).json({ error: error });
        }
      }
    } else {
      res.status(400).json({ error: "OpenAI API key is required" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
