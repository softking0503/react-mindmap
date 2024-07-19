import OpenAI from "openai";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { name, instructions, model, openAIKey, defaultAssistantId } = req.body;

        console.log(openAIKey);

        if (openAIKey) {
            const openai = new OpenAI({
                apiKey: openAIKey,
            });

            try {
                const thread = await openai.beta.threads.create();

                res.status(200).json(thread);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
