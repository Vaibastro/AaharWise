
import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, UserProfile, HistorySummary, Nutrients } from "../types";

export interface MealAnalysisResult {
  foodName: string;
  nutrients: Nutrients;
  isBlendedDrink: boolean;
}

export const analyzeMealImage = async (base64Image: string): Promise<MealAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identify the main food in this image. Estimate its total calories and macronutrients. IMPORTANT: If this is a juice, milkshake, smoothie, or any blended liquid drink, set isBlendedDrink to true. Return the result in JSON format." }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
          isBlendedDrink: { type: Type.BOOLEAN }
        },
        required: ["foodName", "calories", "carbs", "protein", "fats", "fiber", "isBlendedDrink"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    foodName: data.foodName || "Unknown Meal",
    isBlendedDrink: !!data.isBlendedDrink,
    nutrients: {
      calories: data.calories || 0,
      carbs: data.carbs || 0,
      protein: data.protein || 0,
      fats: data.fats || 0,
      fiber: data.fiber || 0
    }
  };
};

export const getNutrientsFromIngredients = async (ingredients: string, foodName: string): Promise<Nutrients> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following ingredients for a ${foodName}: "${ingredients}". Provide total nutrients (calories, carbs, protein, fats, fiber). Return JSON only.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER }
        },
        required: ["calories", "carbs", "protein", "fats", "fiber"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    calories: data.calories || 0,
    carbs: data.carbs || 0,
    protein: data.protein || 0,
    fats: data.fats || 0,
    fiber: data.fiber || 0
  };
};

export const generateHealthAnalysis = async (
  todayLog: DailyLog,
  historyLogs: DailyLog[] = []
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalNutrients = todayLog.meals.reduce((acc, m) => {
    if (m.nutrients) {
      acc.calories += m.nutrients.calories;
      acc.carbs += m.nutrients.carbs;
      acc.protein += m.nutrients.protein;
      acc.fats += m.nutrients.fats;
      acc.fiber += m.nutrients.fiber;
    }
    return acc;
  }, { calories: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 });

  const systemInstruction = `
    You are AaharWise - an elite preventive health strategist. 
    Your goal is to show the user the "Biological Destination" of their current lifestyle.

    Structure your response EXACTLY as follows:
    ### VERDICT: [HIGH-IMPACT STATUS e.g., ACCELERATED AGING, PEAK VITALITY, METABOLIC DECAY]
    [One sharp sentence on the current state.]

    ### THE LONG-TERM FORECAST (5-10 YEARS)
    [Based on the user's age (${todayLog.profileSnapshot.age}), gender, and habits, describe exactly what will happen to their body if this intake pattern continues. Mention specific risks like insulin resistance, visceral fat, muscle loss, or skin health.]

    ### VITAL SCORE: [X]/10 - [CREATIVE LABEL]

    ### THE BIOLOGICAL FIX
    - [Immediate change to stop the damage]
    - [Long-term habit to build resilience]

    ### HISTORICAL PATTERN
    [Synthesize today's data with their history. Are they improving or sliding? Mention if they are consistently hitting or missing protein/fiber/water goals.]
  `;

  const profile = todayLog.profileSnapshot;
  const historyStr = historyLogs.length > 0 
    ? historyLogs.slice(0, 5).map(log => `- ${log.date}: ${log.totalNutrients?.calories} cal, ${log.meals.filter(m => m.isJunk).length} cheat meals`).join('\n')
    : "No previous history available.";

  const userPrompt = `
    User: ${profile.age}yo ${profile.gender}, Goal: ${profile.conditions}
    Today's Intake: ${totalNutrients.calories} cal, ${totalNutrients.protein}g Protein, ${totalNutrients.fiber}g Fiber, ${todayLog.waterMl}ml Water.
    Cheat Meals Today: ${todayLog.meals.filter(m => m.isJunk).length}
    
    Recent History Trend:
    ${historyStr}
    
    Predict the future health of this person if this intake becomes their standard lifestyle.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "Coach is offline.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analysis hit a wall. Try again.";
  }
};
