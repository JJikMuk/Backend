import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import FastAPIService from "../services/fastapi.service";
import { RAGAnalysisRequest } from "../types/rag.types";

class RAGController {
  static async analyzeProduct(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const { productData, scanId } = req.body;

    if (!productData) {
      return res.status(400).json({
        success: false,
        error: "Product data is required"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      // Get user profile
      const [profiles] = await connection.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((profiles as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: "User profile not found. Please create profile first."
        });
      }

      const profile = (profiles as any[])[0];
      const userProfile = {
        height: profile.height,
        weight: profile.weight,
        ageRange: profile.age_range,
        allergies: JSON.parse(profile.allergies),
        diseases: JSON.parse(profile.diseases)
      };

      // Check allergen compatibility
      const productAllergens = productData.allergens || [];
      const userAllergies = userProfile.allergies || [];
      const isAllergenSafe = !productAllergens.some((allergen: string) =>
        userAllergies.some((allergy: string) =>
          allergen.toLowerCase().includes(allergy.toLowerCase()) ||
          allergy.toLowerCase().includes(allergen.toLowerCase())
        )
      );

      // Prepare RAG request
      const ragRequest: RAGAnalysisRequest = {
        userId,
        productData,
        userProfile
      };

      // Call FastAPI RAG service
      const ragResponse = await FastAPIService.analyzeWithRAG(ragRequest);

      if (!ragResponse.success) {
        return res.status(500).json({
          success: false,
          error: "RAG analysis failed"
        });
      }

      const analysis = ragResponse.analysis;

      // Store analysis in database
      const analysisId = uuidv4();

      await connection.query(
        `INSERT INTO rag_analyses
         (id, user_id, ocr_scan_id, request_data, rag_response, suitability_score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          analysisId,
          userId,
          scanId || null,
          JSON.stringify(ragRequest),
          JSON.stringify(analysis),
          analysis.score
        ]
      );

      return res.status(200).json({
        success: true,
        data: {
          analysisId,
          productAnalysis: {
            suitability: analysis.suitability,
            score: analysis.score,
            isAllergenSafe
          },
          recommendations: analysis.recommendations,
          alternatives: analysis.alternatives || [],
          nutritionalAdvice: analysis.nutritionalAdvice,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("RAG analysis error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }

  static async getAnalysisHistory(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const [analyses] = await dbpool.query(
        `SELECT id, rag_response, suitability_score, created_at
         FROM rag_analyses
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return res.status(200).json({
        success: true,
        data: (analyses as any[]).map(analysis => ({
          analysisId: analysis.id,
          analysis: JSON.parse(analysis.rag_response),
          score: analysis.suitability_score,
          createdAt: analysis.created_at
        }))
      });

    } catch (error) {
      console.error("Get analysis history error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }
}

export default RAGController;
