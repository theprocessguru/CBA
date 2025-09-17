import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface QRCodeResult {
  success: boolean;
  data?: string;
  error?: string;
}

export async function analyzeQRCodeImage(base64Image: string): Promise<QRCodeResult> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and extract the QR code content. If there is a QR code visible, return ONLY the text/data contained within the QR code. If no QR code is found, respond with 'NO_QR_CODE_FOUND'. Do not include any other text or explanation."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 200,
    });

    const result = visionResponse.choices[0].message.content?.trim();
    
    if (!result || result === 'NO_QR_CODE_FOUND') {
      return {
        success: false,
        error: 'No QR code found in image'
      };
    }

    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    console.error('OpenAI Vision QR analysis failed:', error);
    return {
      success: false,
      error: 'Failed to analyze image: ' + error.message
    };
  }
}

export async function analyzeQRCodeImageAdvanced(base64Image: string): Promise<QRCodeResult> {
  // Try with the latest model first, fallback to older models if not available
  const models = ["gpt-5", "gpt-4o", "gpt-4o-mini"];
  
  for (const model of models) {
    try {
      const visionResponse = await openai.chat.completions.create({
        model: model, // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are a QR code reading expert. Extract the exact text/data from QR codes in images. Respond with JSON in this format: { 'found': boolean, 'data': string, 'confidence': number }"
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Scan this image for QR codes and extract the exact content. Look carefully for QR code patterns (square black and white matrix barcodes). Return the raw data/text encoded in the QR code."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const responseText = visionResponse.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(responseText);
      
      if (!parsed.found || !parsed.data) {
        return {
          success: false,
          error: 'No QR code found in image'
        };
      }

      return {
        success: true,
        data: parsed.data
      };

    } catch (error: any) {
      console.error(`OpenAI Vision QR analysis failed with model ${model}:`, error);
      
      // If this is the last model, fallback to simple method
      if (model === models[models.length - 1]) {
        console.log('All advanced models failed, falling back to simple text extraction');
        return analyzeQRCodeImage(base64Image);
      }
      
      // Otherwise continue to next model
      continue;
    }
  }

  // Final fallback (should not reach here, but just in case)
  return analyzeQRCodeImage(base64Image);
}