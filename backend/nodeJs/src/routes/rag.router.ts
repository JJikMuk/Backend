import { Router } from "express";
import RAGController from "../controllers/rag.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const RAGRouter = Router();

RAGRouter.use(authMiddleware);

RAGRouter.post("/analyze", RAGController.analyzeProduct);
RAGRouter.get("/history", RAGController.getAnalysisHistory);

export default RAGRouter;
