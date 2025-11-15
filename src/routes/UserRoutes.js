import express from "express";
import UserController from "../controllers/UserController.js";
import verifyToken from "../middleware/authMiddleware.js";
const userController= new UserController()
const router = express.Router();

router.get("/",userController.getUsers);
router.get('/:uid',userController.getUserProfile)
router.post("/",verifyToken, userController.addUser);
router.post('/login', verifyToken,userController.loginUser)
router.patch('/:uid', verifyToken,userController.updateUserProfile)
router.delete('/:uid',userController.deleteUser)


export default router;
