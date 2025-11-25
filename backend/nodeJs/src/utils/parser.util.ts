import { OCRParsedData, NutritionalInfo } from "../types/ocr.types";

class ParserUtil {
  static parseOCRText(extractedText: string, confidence: number): OCRParsedData {
    const lines = extractedText.split("\\n").map(line => line.trim());

    const nutritionalInfo: NutritionalInfo = {};
    let ingredients: string[] = [];
    let allergens: string[] = [];
    let productName: string | undefined;

    for (const line of lines) {
      // Parse calories
      const caloriesMatch = line.match(/열량[:\\s]*([\\d]+)\\s*kcal/i);
      if (caloriesMatch) {
        nutritionalInfo.calories = parseInt(caloriesMatch[1]);
      }

      // Parse carbohydrates
      const carbsMatch = line.match(/탄수화물[:\\s]*([\\d.]+)\\s*g/i);
      if (carbsMatch) {
        nutritionalInfo.carbohydrates = parseFloat(carbsMatch[1]);
      }

      // Parse protein
      const proteinMatch = line.match(/단백질[:\\s]*([\\d.]+)\\s*g/i);
      if (proteinMatch) {
        nutritionalInfo.protein = parseFloat(proteinMatch[1]);
      }

      // Parse fat
      const fatMatch = line.match(/지방[:\\s]*([\\d.]+)\\s*g/i);
      if (fatMatch) {
        nutritionalInfo.fat = parseFloat(fatMatch[1]);
      }

      // Parse sodium
      const sodiumMatch = line.match(/나트륨[:\\s]*([\\d.]+)\\s*mg/i);
      if (sodiumMatch) {
        nutritionalInfo.sodium = parseFloat(sodiumMatch[1]);
      }

      // Parse ingredients
      const ingredientsMatch = line.match(/원재료[:\\s]*(.+)/i);
      if (ingredientsMatch) {
        ingredients = ingredientsMatch[1].split(/[,、]/).map(i => i.trim());
      }

      // Parse allergens
      const allergensMatch = line.match(/알레르기[:\\s]*(.+)/i);
      if (allergensMatch) {
        allergens = allergensMatch[1].split(/[,、]/).map(a => a.trim());
      }
    }

    return {
      productName,
      nutritionalInfo,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      confidence
    };
  }
}

export default ParserUtil;
