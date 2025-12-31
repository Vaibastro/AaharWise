
import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, UserProfile, Nutrients } from "../types";

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
    You are AaharWise - a metabolic strategist. Analyze logs into biological fates based on age (${todayLog.profileSnapshot.age}).
    Analyze TODAY's intake combined with their HISTORY. Focus on future health consequences of repeating today's pattern.
    
    Structure your response EXACTLY like this:
    ### THE VERDICT: [2-word blunt biological status]
    [One sharp sentence describing the overall health condition for their age based on today and history.]

    ### THE TOLL: [Impact of TODAY's specific intake on their organs/metabolism right now.]

    ### THE FORECAST: [A creative, high-stakes prediction of their body state in 10 years if TODAY'S intake remains their permanent standard.]

    ### THE FIX: [One vital metabolic correction.]
    
    Constraint: Under 70 words total. Brutally honest, creative, and urgent.
  `;

  const profile = todayLog.profileSnapshot;
  const historyData = historyLogs.length > 0 
    ? `Historical Intake: ${historyLogs.slice(0, 5).map(l => `${l.totalNutrients?.calories}kcal`).join(' -> ')}.` 
    : "No history (Baseline).";

  const userPrompt = `
    Subject: ${profile.age}yo ${profile.gender}. 
    Today: ${totalNutrients.calories}kcal, ${totalNutrients.protein}g Protein, ${totalNutrients.fiber}g Fiber, ${todayLog.waterMl}ml Water.
    Junk Count Today: ${todayLog.meals.filter(m => m.isJunk).length}.
    ${historyData}
    
    What is the biological price and long-term trajectory of this pattern?
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: { systemInstruction, temperature: 1.0 }
    });
    return response.text || "Feedback engine error.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Forecasting interrupted.";
  }
};
