

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GenerationFormat, Industry, Quality, BackgroundStyle, ColorOption, BrandSettings } from '../types';

if (!process.env.API_KEY) {
  throw new Error("CRITICAL: Gemini API Key is missing. Please add 'API_KEY' to your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getFormatInstruction = (format: '16:9' | '9:16' | '1:1'): string => {
    let description = '';
    switch (format) {
        case '1:1':
            description = `a perfect square image (1:1 ratio)`;
            break;
        case '16:9':
            description = `a horizontal widescreen banner image (16:9 ratio)`;
            break;
        case '9:16':
            description = `a vertical tall poster image (9:16 ratio)`;
            break;
    }
    return `**CRITICAL DIRECTIVE: The final output image MUST be ${description}. This is the most important, non-negotiable rule. All elements must be composed within this frame from the start.**`;
}

const callGeminiImageAPI = async (parts: any[], errorMessage: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error(errorMessage);
    }
}

export const removeBackgroundImage = async (
    base64ImageData: string,
    mimeType: string,
): Promise<string | null> => {
    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: `You are an expert photo editing AI specializing in background removal.
Your task is to perfectly isolate the main subject from its background in the provided image.

**CRITICAL INSTRUCTIONS:**
1.  **Identify and Isolate:** Precisely identify the main subject(s) of the image.
2.  **Remove Background:** Completely remove the existing background.
3.  **Output Format:** The output MUST be a PNG image.
4.  **Transparency:** The new background MUST be fully transparent.
5.  **No Additions:** Do NOT add any new elements, shadows, reflections, borders, or effects.
6.  **Preserve Subject:** Do NOT alter the subject in any way (color, shape, texture).

The final result should be only the main subject on a transparent background.` };
    
    return callGeminiImageAPI([imagePart, textPart], "Failed to communicate with the AI model for background removal.");
}

export const generateUnifiedBackground = async (settings: BrandSettings): Promise<string | null> => {
    let prompt: string;

    if (settings.industry.id === 'food-beverage') {
        prompt = `
        Create the background scene for a high-end editorial-style advertising photo. The scene should be set up to feature a hero beverage as the main focus, but DO NOT include the beverage itself.
        
        The background must strictly follow a vertical ratio (9:16) and be styled like a studio lifestyle shoot, using natural textures such as stone, linen fabric, or wood surfaces.

        Use warm, directional lighting (sunset glow or soft studio light) to create gentle shadows and depth. Add subtle artistic touches like condensation droplets and a few garnish elements (like mint leaves or small berries) naturally scattered nearby for realism.

        The surrounding space should be minimalist yet refined, possibly including props like a stylish magazine cover, ceramic plates, or softly blurred background objects.

        The color palette should be warm neutrals — soft gold, beige, amber tones — evoking an elegant, modern, premium lifestyle aesthetic. The brand's primary color (${settings.colors.primary}) and secondary color (${settings.colors.secondary}) should be subtly hinted at in the lighting or props.

        The final composition should feel artistic, luxurious, and editorial-worthy, suitable for international magazines, café posters, or social media campaigns. The most important rule is: Generate ONLY the background, leaving the central space empty and ready for a product.
        `;
    } else {
        prompt = `
        Generate a high-quality, professional studio background suitable for a ${settings.industry.name} product.
        This background MUST be in a 9:16 vertical poster format.
        The branding details are as follows:
        - Brand Personality/Model: ${settings.model.prompt}
        - Brand Colors: The primary color is ${settings.colors.primary} and the secondary color is ${settings.colors.secondary}. These colors should be subtly integrated into the lighting, gradient, or scene elements.

        The final image should be clean, professional, and visually appealing, leaving ample space for a product to be placed in the foreground. Do not include any text, products, or distracting elements. Focus on creating a beautiful, branded environment.
        `;
    }
    const textPart = { text: prompt };
    return callGeminiImageAPI([textPart], "Failed to generate unified background.");
};


export const generateStudioImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  industry: Industry,
  quality: Quality,
  format: GenerationFormat,
  background: BackgroundStyle,
): Promise<string | null> => {

  const formatInstruction = getFormatInstruction(format.value);
  let systemPrompt: string;

  const coreInstructions = `
**PRODUCT REALISM (NON-NEGOTIABLE):** The user-provided product image is a REAL PHOTOGRAPH. You MUST place it into the scene while preserving 100% of its original photographic details, textures, lighting, and reflections. It must look like it was photographed within the scene you create, not like a sticker placed on top. Maintain its authentic look at all costs.

**COMPOSITION:**
- Create the scene FIRST based on the user's background style.
- Place the REAL product photo into the scene as the central hero element.
- Add subtle, realistic props, lighting, and soft shadows that complement the product and scene.
- **DO NOT add any text, watermarks, or annotations.**
- **FINAL CHECK: The aspect ratio must strictly be ${format.value}.**`;

  const beverageKeywords = ['tea', 'drink', 'beverage', 'coffee', 'juice', 'soda', 'trà', 'cà phê', 'nước ép', 'milk tea', 'trà sữa', 'latte', 'cappuccino', 'smoothie', 'sinh tố'];
  const isBeverge = beverageKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

  if (industry.id === 'food-beverage' && isBeverge) {
    const isMilkTea = prompt.toLowerCase().includes('trà sữa') || prompt.toLowerCase().includes('milk tea');
    const milkTeaConstraint = isMilkTea ? 'Crucially, as this is a milk tea, do NOT include any lemons or citrus fruit as decoration.' : '';

    systemPrompt = `A high-end editorial-style advertising photo featuring a hero beverage ("${prompt}") presented in a transparent cup or glass with logo, placed centrally as the main focus.
The drink should look realistic and visually rich, with vibrant colors, glossy ice cubes, and visible toppings or garnishes (such as pearls, fruit slices, cream foam, or herbs) depending on the drink type.
The background must strictly adhere to the user's selected aspect ratio (${format.value}) and be styled as a studio lifestyle shoot using this specific style: "${background.prompt}".
Use warm, directional lighting (sunset glow or soft studio light) to create gentle shadows and depth. Add subtle artistic touches like condensation droplets on the cup and a few garnish or topping elements naturally scattered nearby for realism.
Surrounding space should be minimalist yet refined, possibly including props like linen napkins, ceramic plates, green leaves, or softly blurred background objects.
The overall composition should feel artistic, luxurious, and editorial-worthy, suitable for international magazines, café posters, or social media campaigns.
${milkTeaConstraint}
${coreInstructions}`;
  } else if (industry.id === 'food-beverage') {
    systemPrompt = `${formatInstruction}

You are a high-end editorial food and beverage photographer. Your task is to create an ultra-realistic, editorial-style advertising photo.

**HERO SUBJECT:** The user has provided a real photo of a product, which is a "${prompt}". 
${coreInstructions}

**BACKGROUND & SCENE:** The background must be styled like a professional studio lifestyle shoot. Use the user-selected style: "${background.prompt}".
`;
  } else {
    systemPrompt = `${formatInstruction}

You are a world-class professional product photographer. Your task is to create a stunning, high-quality advertisement poster for a "${prompt}" in the ${industry.name} category.
${coreInstructions}

**BACKGROUND & SCENE:** Create a hyper-realistic professional studio scene based on this description: "${background.prompt}".
`;
  }

  const imagePart = { inlineData: { data: base64ImageData, mimeType } };
  const textPart = { text: systemPrompt };

  return callGeminiImageAPI([imagePart, textPart], "Failed to communicate with the AI model for poster generation.");
};

export const suggestTextColors = async (
    base64ImageData: string,
): Promise<ColorOption[]> => {
    const imagePart = { inlineData: { data: base64ImageData, mimeType: 'image/png' } };
    const textPart = { text: "Analyze the provided image. Suggest 5 distinct, solid (non-gradient) text colors that would have high contrast and be aesthetically pleasing against the image's background. Provide a descriptive name for each color. Return the answer ONLY as a valid JSON array of objects. Each object must have keys: 'id', 'name', and 'value' (a hex color string like '#RRGGBB'). Add `isGradient: false` to each object." };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            value: { type: Type.STRING },
                            isGradient: { type: Type.BOOLEAN },
                        }
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const suggestedColors = JSON.parse(jsonString);
        return suggestedColors as ColorOption[];

    } catch (error) {
        console.error("Failed to suggest text colors:", error);
        // Return a default palette on failure
        return [
            { id: 'default-white', name: 'White', value: '#FFFFFF', isGradient: false },
            { id: 'default-black', name: 'Black', value: '#000000', isGradient: false },
        ];
    }
}