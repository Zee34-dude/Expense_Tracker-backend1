import express from "express";
import AccountController from "../controllers/AccountController.js";

const router = express.Router();
const accountController = new AccountController();

router.get("/", accountController.getAllAccounts);
router.post("/", accountController.createAccount);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

export default router;
