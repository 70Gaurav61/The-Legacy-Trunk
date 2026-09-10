import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const generateImageTags = async (imageUrl) => {

    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(
            `Failed to download image: ${response.status}`
        );
    }

    const arrayBuffer = await response.arrayBuffer();

    const imageBuffer = Buffer.from(arrayBuffer);

    const mimeType =
        response.headers.get("content-type") || "image/jpeg";

    const base64Image = imageBuffer.toString("base64");

    const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",

        contents: [
            {
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            },
            {
                text: `
                    Analyze this image for a family memory archive.

                    Generate 5 to 10 useful tags that describe:
                    - people
                    - relationships when visually obvious
                    - activities
                    - location/environment
                    - occasions/events
                    - objects
                    - visual characteristics

                    Do NOT guess names, exact identities, dates,
                    or relationships that cannot be reliably inferred.

                    Return only the tags.
                `
            }
        ],

        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: "object",

                properties: {
                    tags: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },

                required: ["tags"]
            }
        }
    });

    // Parse Gemini response
    const data = JSON.parse(result.text);

    return data.tags;
};