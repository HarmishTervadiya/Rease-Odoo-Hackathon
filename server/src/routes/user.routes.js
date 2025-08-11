import { Router } from "express";
import { userLogin } from "../controller/user.controller";

const router = Router()

router.use('/login', userLogin);

export default router