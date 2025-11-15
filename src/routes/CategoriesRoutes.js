import express from "express";
import CategoryController from "../controllers/CategoriesController.js";

const categoryController = new CategoryController()
const router = express.Router()


router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
