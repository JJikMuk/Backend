import { Router } from "express";
import OCRController from "../controllers/ocr.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const OCRRouter = Router();

OCRRouter.use(authMiddleware);

OCRRouter.post("/process", upload.single("image"), OCRController.processImage);
OCRRouter.get("/history", OCRController.getScanHistory);

export default OCRRouter;
