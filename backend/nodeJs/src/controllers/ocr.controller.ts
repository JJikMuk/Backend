import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import FastAPIService from "../services/fastapi.service";
import ParserUtil from "../utils/parser.util";

class OCRController {
  static async processImage(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided"
      });
    }

    try {
      // Call FastAPI OCR service
      const ocrResponse = await FastAPIService.processOCR(file.buffer, file.originalname);

      if (!ocrResponse.success || !ocrResponse.extractedText) {
        return res.status(500).json({
          success: false,
          error: "OCR processing failed"
        });
      }

      // Parse OCR text into structured data
      const parsedData = ParserUtil.parseOCRText(
        ocrResponse.extractedText,
        ocrResponse.confidence || 0
      );

      // Store in database
      const scanId = uuidv4();
      const connection = await dbpool.getConnection();

      try {
        await connection.query(
          `INSERT INTO ocr_scans
           (id, user_id, image_url, extracted_text, parsed_data, confidence)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            scanId,
            userId,
            `uploads/${scanId}_${file.originalname}`,
            ocrResponse.extractedText,
            JSON.stringify(parsedData),
            parsedData.confidence
          ]
        );

        return res.status(200).json({
          success: true,
          data: {
            scanId,
            ...parsedData
          }
        });

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error("OCR processing error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }

  static async getScanHistory(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const [scans] = await dbpool.query(
        `SELECT id, image_url, parsed_data, confidence, created_at
         FROM ocr_scans
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      return res.status(200).json({
        success: true,
        data: (scans as any[]).map(scan => ({
          scanId: scan.id,
          imageUrl: scan.image_url,
          parsedData: JSON.parse(scan.parsed_data),
          confidence: scan.confidence,
          createdAt: scan.created_at
        }))
      });

    } catch (error) {
      console.error("Get scan history error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }
}

export default OCRController;
