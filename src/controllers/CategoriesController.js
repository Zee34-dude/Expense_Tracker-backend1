import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class CategoryController {
  /**
   * CREATE CATEGORY
   * POST /api/categories
   */
  async createCategory(req, res) {
    try {
      const userId = req.user.uid;
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }

      // Check if category exists
      const exists = await prisma.category.findFirst({
        where: { userId, name },
      });

      if (exists) {
        return res.status(400).json({ error: "Category already exists" });
      }

      const category = await prisma.category.create({
        data: { name, type, userId },
      });

      return res.status(201).json({
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      console.error("Create Category Error:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }
  }

  /**
   * GET ALL CATEGORIES
   * GET /api/categories
   */
  async getCategories(req, res) {
    try {
      const userId = req.user.uid;

      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      return res.json(categories);
    } catch (error) {
      console.error("Get Categories Error:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  /**
   * GET ONE CATEGORY
   * GET /api/categories/:id
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
      });

      if (!category || category.userId !== userId) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.json(category);
    } catch (error) {
      console.error("Get Category Error:", error);
      return res.status(500).json({ error: "Failed to fetch category" });
    }
  }

  /**
   * UPDATE CATEGORY
   * PUT /api/categories/:id
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const userId = req.user.uid;

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
      });

      if (!category || category.userId !== userId) {
        return res.status(404).json({ error: "Category not found" });
      }

      const updated = await prisma.category.update({
        where: { id: Number(id) },
        data: { name, type },
      });

      return res.json({
        message: "Category updated successfully",
        category: updated,
      });
    } catch (error) {
      console.error("Update Category Error:", error);
      return res.status(500).json({ error: "Failed to update category" });
    }
  }

  /**
   * DELETE CATEGORY
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const category = await prisma.category.findUnique({
        where: { id: Number(id) },
      });

      if (!category || category.userId !== userId) {
        return res.status(404).json({ error: "Category not found" });
      }

      await prisma.category.delete({
        where: { id: Number(id) },
      });

      return res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete Category Error:", error);
      return res.status(500).json({ error: "Failed to delete category" });
    }
  }
}

// Export instance (so router can use it directly)
export default  CategoryController;
