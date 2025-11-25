import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const AuthRouter = Router();

AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/register", AuthController.register);

export default AuthRouter;