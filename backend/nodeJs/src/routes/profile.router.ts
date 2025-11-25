import { Router } from "express";
import ProfileController from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const ProfileRouter = Router();

// All routes require authentication
ProfileRouter.use(authMiddleware);

ProfileRouter.post("/", ProfileController.createProfile);
ProfileRouter.get("/", ProfileController.getProfile);
ProfileRouter.put("/", ProfileController.updateProfile);

export default ProfileRouter;
