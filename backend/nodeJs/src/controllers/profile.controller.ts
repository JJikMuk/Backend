import { Request, Response } from "express";
import { dbpool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { CreateProfileRequest } from "../types/profile.types";
import ValidationService from "../services/validation.service";

class ProfileController {
  static async createProfile(req: Request, res: Response) {
    const { height, weight, ageRange, allergies = [], diseases = [] }: CreateProfileRequest = req.body;
    const userId = (req as any).user.uuid;

    // Validation
    if (!height || !weight || !ageRange) {
      return res.status(400).json({
        success: false,
        error: "Height, weight, and ageRange are required"
      });
    }

    if (!ValidationService.validateHeight(height)) {
      return res.status(400).json({
        success: false,
        error: "Height must be between 50 and 300 cm"
      });
    }

    if (!ValidationService.validateWeight(weight)) {
      return res.status(400).json({
        success: false,
        error: "Weight must be between 20 and 300 kg"
      });
    }

    if (!ValidationService.validateAgeRange(ageRange)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age range. Must be one of: 10대, 20대, 30대, etc."
      });
    }

    if (!ValidationService.validateStringArray(allergies)) {
      return res.status(400).json({
        success: false,
        error: "Allergies must be an array of strings"
      });
    }

    if (!ValidationService.validateStringArray(diseases)) {
      return res.status(400).json({
        success: false,
        error: "Diseases must be an array of strings"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if profile already exists
      const [existingProfiles] = await connection.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((existingProfiles as any[]).length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: "Profile already exists for this user"
        });
      }

      const profileId = uuidv4();

      await connection.query(
        `INSERT INTO user_profiles
         (id, user_id, height, weight, age_range, allergies, diseases)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId,
          userId,
          height,
          weight,
          ageRange,
          JSON.stringify(allergies),
          JSON.stringify(diseases)
        ]
      );

      await connection.commit();

      const [createdProfile] = await connection.query(
        "SELECT * FROM user_profiles WHERE id = ?",
        [profileId]
      );

      const profile = (createdProfile as any[])[0];

      return res.status(201).json({
        success: true,
        message: "User profile created successfully",
        data: {
          userId: profile.user_id,
          height: profile.height,
          weight: profile.weight,
          ageRange: profile.age_range,
          allergies: JSON.parse(profile.allergies),
          diseases: JSON.parse(profile.diseases),
          createdAt: profile.created_at
        }
      });

    } catch (error) {
      console.error("Create profile error:", error);
      await connection.rollback();
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }

  static async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.uuid;

    try {
      const [profiles] = await dbpool.query(
        "SELECT * FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if ((profiles as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: "Profile not found"
        });
      }

      const profile = (profiles as any[])[0];

      return res.status(200).json({
        success: true,
        data: {
          height: profile.height,
          weight: profile.weight,
          ageRange: profile.age_range,
          allergies: JSON.parse(profile.allergies),
          diseases: JSON.parse(profile.diseases),
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      });

    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = (req as any).user.uuid;
    const updates = req.body;

    // Validate updates if provided
    if (updates.height && !ValidationService.validateHeight(updates.height)) {
      return res.status(400).json({
        success: false,
        error: "Invalid height value"
      });
    }

    if (updates.weight && !ValidationService.validateWeight(updates.weight)) {
      return res.status(400).json({
        success: false,
        error: "Invalid weight value"
      });
    }

    if (updates.ageRange && !ValidationService.validateAgeRange(updates.ageRange)) {
      return res.status(400).json({
        success: false,
        error: "Invalid age range"
      });
    }

    const connection = await dbpool.getConnection();

    try {
      await connection.beginTransaction();

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.height) {
        updateFields.push("height = ?");
        updateValues.push(updates.height);
      }
      if (updates.weight) {
        updateFields.push("weight = ?");
        updateValues.push(updates.weight);
      }
      if (updates.ageRange) {
        updateFields.push("age_range = ?");
        updateValues.push(updates.ageRange);
      }
      if (updates.allergies) {
        updateFields.push("allergies = ?");
        updateValues.push(JSON.stringify(updates.allergies));
      }
      if (updates.diseases) {
        updateFields.push("diseases = ?");
        updateValues.push(JSON.stringify(updates.diseases));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update"
        });
      }

      updateValues.push(userId);

      await connection.query(
        `UPDATE user_profiles SET ${updateFields.join(", ")} WHERE user_id = ?`,
        updateValues
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully"
      });

    } catch (error) {
      console.error("Update profile error:", error);
      await connection.rollback();
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    } finally {
      connection.release();
    }
  }
}

export default ProfileController;
