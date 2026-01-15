import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { 
  generateImageSchema, 
  removeBackgroundSchema, 
  generateUnifiedBgSchema,
  suggestColorsSchema,
  GenerateImageInput,
  RemoveBackgroundInput,
  GenerateUnifiedBgInput,
  SuggestColorsInput
} from '../schemas/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dynamic import for Gemini SDK (to keep it lightweight)
let geminiClient: any = null;

const getGeminiClient = async () => {
  if (!geminiClient) {
    const { GoogleGenAI } = await import('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return geminiClient;
};

// Modality enum from Gemini SDK
const Modality = {
  IMAGE: 'IMAGE' as const,
  TEXT: 'TEXT' as const,
};

/**
 * Helper: Call Gemini Image API
 * Uses imagen-3.0-generate-002 for image generation
 */
const callGeminiImageAPI = async (
  parts: any[], 
  errorMessage: string
): Promise<string | null> => {
  try {
    const ai = await getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: {
        responseModalities: [Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error(errorMessage);
  }
};

/**
 * Helper: Call Gemini Text API
 */
const callGeminiTextAPI = async (
  parts: any[],
  errorMessage: string
): Promise<string | null> => {
  try {
    const ai = await getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini Text API call failed:', error);
    throw new Error(errorMessage);
  }
};

/**
 * Deduct credits from user
 */
const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user || user.credits < amount) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: amount } },
  });

  return true;
};

/**
 * POST /generate/remove-background
 * Remove background from image
 */
router.post(
  '/remove-background',
  generationLimiter,
  validate(removeBackgroundSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { base64ImageData, mimeType } = req.body as RemoveBackgroundInput;

    // Check and deduct credits
    const hasCredits = await deductCredits(req.user!.userId, 5);
    if (!hasCredits) {
      res.status(402).json({
        success: false,
        error: 'Insufficient credits',
      });
      return;
    }

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { 
      text: `You are an expert photo editing AI specializing in background removal.
Your task is to perfectly isolate the main subject from its background in the provided image.

**CRITICAL INSTRUCTIONS:**
1.  **Identify and Isolate:** Precisely identify the main subject(s) of the image.
2.  **Remove Background:** Completely remove the existing background.
3.  **Output Format:** The output MUST be a PNG image.
4.  **Transparency:** The new background MUST be fully transparent.
5.  **No Additions:** Do NOT add any new elements, shadows, reflections, borders, or effects.
6.  **Preserve Subject:** Do NOT alter the subject in any way (color, shape, texture).

The final result should be only the main subject on a transparent background.` 
    };

    const result = await callGeminiImageAPI(
      [imagePart, textPart], 
      'Failed to remove background'
    );

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to process image',
      });
      return;
    }

    res.json({
      success: true,
      data: { imageUrl: result },
    });
  })
);

/**
 * POST /generate/studio-image
 * Generate studio image
 */
router.post(
  '/studio-image',
  generationLimiter,
  validate(generateImageSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { 
      base64ImageData, 
      mimeType, 
      prompt, 
      industry, 
      quality, 
      format, 
      background 
    } = req.body as GenerateImageInput;

    // Check and deduct credits
    const creditCost = quality.id === 'premium' ? 20 : 10;
    const hasCredits = await deductCredits(req.user!.userId, creditCost);
    if (!hasCredits) {
      res.status(402).json({
        success: false,
        error: 'Insufficient credits',
      });
      return;
    }

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
    const isBeverage = beverageKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    if (industry.id === 'food-beverage' && isBeverage) {
      const isMilkTea = prompt.toLowerCase().includes('trà sữa') || prompt.toLowerCase().includes('milk tea');
      const milkTeaConstraint = isMilkTea ? 'Crucially, as this is a milk tea, do NOT include any lemons or citrus fruit as decoration.' : '';

      systemPrompt = `A high-end editorial-style advertising photo featuring a hero beverage ("${prompt}") presented in a transparent cup or glass with logo, placed centrally as the main focus.
The drink should look realistic and visually rich, with vibrant colors, glossy ice cubes, and visible toppings or garnishes depending on the drink type.
The background must strictly adhere to the user's selected aspect ratio (${format.value}) and be styled as a studio lifestyle shoot using this specific style: "${background.prompt}".
Use warm, directional lighting (sunset glow or soft studio light) to create gentle shadows and depth.
${milkTeaConstraint}
${coreInstructions}`;
    } else if (industry.id === 'food-beverage') {
      systemPrompt = `${formatInstruction}

You are a high-end editorial food and beverage photographer. Your task is to create an ultra-realistic, editorial-style advertising photo.

**HERO SUBJECT:** The user has provided a real photo of a product, which is a "${prompt}".
${coreInstructions}

**BACKGROUND & SCENE:** The background must be styled like a professional studio lifestyle shoot. Use the user-selected style: "${background.prompt}".`;
    } else {
      systemPrompt = `${formatInstruction}

You are a world-class commercial photographer. Your task is to create a stunning, professional product photo.

**HERO SUBJECT:** The user has provided a real photo of a product for the "${industry.name}" industry. The product is: "${prompt}".
${coreInstructions}

**BACKGROUND & SCENE:** Use the user-selected style: "${background.prompt}".`;
    }

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: systemPrompt };

    const result = await callGeminiImageAPI(
      [imagePart, textPart],
      'Failed to generate studio image'
    );

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate image',
      });
      return;
    }

    res.json({
      success: true,
      data: { imageUrl: result },
    });
  })
);

/**
 * POST /generate/unified-background
 * Generate unified brand background
 */
router.post(
  '/unified-background',
  generationLimiter,
  validate(generateUnifiedBgSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { settings } = req.body as GenerateUnifiedBgInput;

    // Check and deduct credits
    const hasCredits = await deductCredits(req.user!.userId, 15);
    if (!hasCredits) {
      res.status(402).json({
        success: false,
        error: 'Insufficient credits',
      });
      return;
    }

    let prompt: string;

    if (settings.industry.id === 'food-beverage') {
      prompt = `
Create the background scene for a high-end editorial-style advertising photo. The scene should be set up to feature a hero beverage as the main focus, but DO NOT include the beverage itself.

The background must strictly follow a vertical ratio (9:16) and be styled like a studio lifestyle shoot.

Use warm, directional lighting to create gentle shadows and depth. The color palette should include hints of the brand's primary color (${settings.colors.primary}) and secondary color (${settings.colors.secondary}).

Generate ONLY the background, leaving the central space empty and ready for a product.`;
    } else {
      prompt = `
Generate a high-quality, professional studio background suitable for a ${settings.industry.name} product.
This background MUST be in a 9:16 vertical poster format.
Brand Colors: primary ${settings.colors.primary}, secondary ${settings.colors.secondary}.
Brand Personality: ${settings.model.prompt}

The final image should be clean and professional, leaving space for a product in the foreground. Do not include any text or products.`;
    }

    const textPart = { text: prompt };
    const result = await callGeminiImageAPI([textPart], 'Failed to generate background');

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate background',
      });
      return;
    }

    res.json({
      success: true,
      data: { imageUrl: result },
    });
  })
);

/**
 * POST /generate/suggest-colors
 * Suggest text colors based on image
 */
router.post(
  '/suggest-colors',
  generationLimiter,
  validate(suggestColorsSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { base64ImageData, mimeType } = req.body as SuggestColorsInput;

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = {
      text: `Analyze this image and suggest 5 text colors that would look good overlaid on it.
      
For each color, provide:
1. A descriptive name
2. The hex color value

Return ONLY a JSON array in this exact format, with no other text:
[
  {"id": "1", "name": "Color Name", "value": "#HEXCODE", "isGradient": false}
]

Consider contrast, readability, and aesthetic harmony with the image.`
    };

    const result = await callGeminiTextAPI(
      [imagePart, textPart],
      'Failed to suggest colors'
    );

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to analyze image',
      });
      return;
    }

    try {
      // Extract JSON from response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const colors = JSON.parse(jsonMatch[0]);
      
      res.json({
        success: true,
        data: { colors },
      });
    } catch {
      res.status(500).json({
        success: false,
        error: 'Failed to parse color suggestions',
      });
    }
  })
);

/**
 * GET /generate/credits
 * Get current credit balance
 */
router.get(
  '/credits',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { credits: true },
    });

    res.json({
      success: true,
      data: { credits: user?.credits || 0 },
    });
  })
);

/**
 * Helper: Get format instruction for prompts
 */
function getFormatInstruction(format: '16:9' | '9:16' | '1:1'): string {
  let description = '';
  switch (format) {
    case '1:1':
      description = 'a perfect square image (1:1 ratio)';
      break;
    case '16:9':
      description = 'a horizontal widescreen banner image (16:9 ratio)';
      break;
    case '9:16':
      description = 'a vertical tall poster image (9:16 ratio)';
      break;
  }
  return `**CRITICAL DIRECTIVE: The final output image MUST be ${description}. This is the most important, non-negotiable rule.**`;
}

export default router;
