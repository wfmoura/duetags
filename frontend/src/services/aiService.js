// src/services/aiService.js
import { config } from '../config/config';

/**
 * Service to handle AI generation using Google Gemini API.
 */

export const generateThemeImages = async (prompt, seed = null) => {
    console.log("Generating themes for prompt:", prompt, "Seed:", seed);
    const apiKey = config.ai.apiKey;

    if (!apiKey) {
        throw new Error("API Key da IA não configurada.");
    }

    // Try Nano Banana (gemini-2.5-flash-image) first
    try {
        const images = await generateImagesParallel(prompt, apiKey, 'gemini-2.5-flash-image', seed);
        if (images.length > 0) return images;
    } catch (error) {
        console.warn("Nano Banana (gemini-2.5-flash-image) failed or empty:", error);

        // Check if we should fallback (e.g. 404 or other non-quota errors)
        // If 429, we might want to throw instead of fallback? 
        // User said "altere novamente o modelo para o nano banana", so priority is Nano Banana.
        // If 404 (not found), we fallback.
        if (error.message.includes("404") || error.message.includes("not found")) {
            console.log("Falling back to gemini-2.0-flash-exp...");
            return generateThemeImagesFallback(prompt, apiKey, seed);
        }

        throw error;
    }
};

// Fallback function using gemini-2.0-flash-exp
async function generateThemeImagesFallback(prompt, apiKey, seed) {
    try {
        return await generateImagesParallel(prompt, apiKey, 'gemini-2.0-flash-exp', seed);
    } catch (error) {
        console.error("Erro na geração de imagens (Fallback):", error);
        throw error;
    }
}

// Helper to generate images in parallel (since candidateCount > 1 is not supported on some models)
async function generateImagesParallel(prompt, apiKey, model, seed) {
    // We want 2 options, so we make 2 parallel requests
    const promises = [0, 1].map(id => fetchSingleImage(prompt, apiKey, model, id, seed));

    const results = await Promise.allSettled(promises);
    const images = [];
    let lastError = null;

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            images.push(...result.value);
        } else if (result.status === 'rejected') {
            lastError = result.reason;
        }
    });

    if (images.length > 0) {
        return images;
    }

    // If no images generated, throw the last error
    if (lastError) throw lastError;

    throw new Error("Nenhuma imagem foi gerada.");
}

async function fetchSingleImage(prompt, apiKey, model, requestId, seed) {
    // Use a unique seed per request if no seed is provided, or base it on the provided seed
    const finalSeed = seed !== null ? (seed + requestId) : Math.floor(Math.random() * 2147483647);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: ` Tema da imagem: ${prompt}

REQUISITOS DE COMPOSIÇÃO (CRÍTICOS):
1. PERSONAGEM: Personagem ou objeto central, estético, sem bordas grossas ou contornos. Pode incluir alguns elementos na imagem, externos ao personagem relevantes ao tema.
2. BACKGROUND: Fundo ABSOLUTAMENTE BRANCO PURO (#FFFFFF), sem manchas, sombras ou degradês.
3. ENQUADRAMENTO: O personagem deve estar centralizado no quadrado de forma equilibrada.
4. FORMATO: Quadrado (SQUARE), na proporção exata 1:1.
5. ESTILO: Ilustração profissional, desenho realista em alta definição.
6. RESTRIÇÃO: NÃO inclua nenhuma letra, número ou texto. NÃO use contornos brancos ou pretos grossos. NÃO use fundos quadriculados, grids ou padrões de transparência simulada.`
                    }]
                }],
                generationConfig: {
                    seed: finalSeed
                }
            })
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`AI API Error (Req ${requestId}):`, errorData);

        if (response.status === 429) {
            throw new Error("Limite de uso excedido. Tente novamente mais tarde.");
        }

        throw new Error(errorData.error?.message || `Erro na API da IA: ${response.status}`);
    }

    const data = await response.json();
    return parseGeminiResponse(data, prompt, requestId, finalSeed);
}

// Optimization helper to resize/compress image
async function optimizeImage(base64Str) {
    if (typeof window === 'undefined') return base64Str; // Server-side safety

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Target size: Square asset (1024x1024)
            const targetWidth = 1024;
            const targetHeight = 1024;

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            // Calculate crop (cover mode) to handle AIs that don't respect 2:1 strictly
            const imgAspect = img.width / img.height;
            const targetAspect = targetWidth / targetHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgAspect > targetAspect) {
                // Image is wider than 2:1 -> crop sides
                drawHeight = targetHeight;
                drawWidth = img.width * (targetHeight / img.height);
                offsetX = -(drawWidth - targetWidth) / 2;
                offsetY = 0;
            } else {
                // Image is taller than 2:1 -> crop top/bottom
                drawWidth = targetWidth;
                drawHeight = img.height * (targetWidth / img.width);
                offsetX = 0;
                offsetY = -(drawHeight - targetHeight) / 2;
            }

            // Use better interpolation for downscaling if needed
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // Remove White Background (True Transparency)
            const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If pixel is white or very close to white (threshold), set alpha to 0
                if (r > 245 && g > 245 && b > 245) {
                    data[i + 3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);

            // Export as PNG for true transparency
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(base64Str); // Fallback on error
        img.src = base64Str;
    });
}

async function parseGeminiResponse(data, prompt, requestId, finalSeed) {
    const images = [];
    if (data.candidates) {
        // Use Promise.all to process all images in parallel
        const processedImages = await Promise.all(
            data.candidates.map(async (candidate, cIndex) => {
                if (candidate.content && candidate.content.parts) {
                    const parts = await Promise.all(candidate.content.parts.map(async (part, pIndex) => {
                        if (part.inlineData) {
                            const rawUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                            const optimizedUrl = await optimizeImage(rawUrl);
                            return {
                                id: `ai-gen-${Date.now()}-${requestId}-${cIndex}-${pIndex}`,
                                url: optimizedUrl,
                                prompt: prompt,
                                seed: finalSeed
                            };
                        }
                        return null;
                    }));
                    return parts.filter(Boolean);
                }
                return [];
            })
        );

        processedImages.flat().forEach(img => images.push(img));
    }
    return images;
}
