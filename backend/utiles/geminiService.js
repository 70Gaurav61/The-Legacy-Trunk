import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const generateImageTags = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return [];

    const contents = [];

    // Process all images
    for (const url of imageUrls) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to download image: ${response.status} - ${url}`);
                continue;
            }
            const arrayBuffer = await response.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get("content-type") || "image/jpeg";
            const base64Image = imageBuffer.toString("base64");
            
            contents.push({
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            });
        } catch (err) {
             console.error(`Error processing image ${url}:`, err);
        }
    }

    if (contents.length === 0) return []; // No valid images

    // Add the prompt text
    contents.push({
        text: `
            Analyze the provided image(s) for a family memory archive.

            Generate 5 to 10 useful tags that describe the overall context across these images:
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
    });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
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

        const data = JSON.parse(result.text);
        return data.tags || [];
    } catch (err) {
        console.error("Gemini API Error:", err);
        return [];
    }
};