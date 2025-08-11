import { Router } from "express";
import {
  addCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} from "../controller/category.controller.js";

const router = Router();

// All routes could be admin-protected if needed
router.route("/").get(getAllCategory);
router.route("/").post(addCategory);
router.route("/").patch(updateCategory);
router.route("/").delete(deleteCategory);
router.route("/getCategory/:categoryId").get(getCategoryById);

export default router;
