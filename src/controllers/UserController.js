// controllers/UserController.js
import { db, auth } from "../config/firebase.js";
import prisma from "../config/prisma.js";

class UserController {
  // GET /api/users
  async getUsers(req, res) {
    try {
      const snapshot = await db.collection("users").get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/users
  async addUser(req, res) {
    try {
      const { email, name,user_uid } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          fullName: name || email.split("@")[0],
          email,
          user_uid, // Firebase handles authentication
        },
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // POST /api/users/login
  async loginUser(req, res) {
    try {
      const { uid } = req.user; // frontend sends Firebase ID token
      const userRef = db.collection("users").doc(uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "User not found in database" });
      }

      res.status(200).json({
        message: "Login successful",
        uid,
        user: doc.data(),
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(401).json({ error: "Invalid token or login failed" });
    }
  }

  // GET /users/:uid
  async getUserProfile(req, res) {
    const { uid } = req.params;
    try {
      const doc = await db.collection("users").doc(uid).get();
      if (!doc.exists) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ uid, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /users/:uid
  async updateUserProfile(req, res) {
    const { uid } = req.params;
    const { name, email, avatar } = req.body;

    try {
      const userRef = db.collection("users").doc(uid);
      const doc = await userRef.get();
      if (!doc.exists) return res.status(404).json({ message: "User not found" });

      const updatedData = {};
      if (name) updatedData.name = name;
      if (avatar) updatedData.avatar = avatar;

      await userRef.update(updatedData);

      if (email) {
        await auth.updateUser(uid, { email });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /users/:uid
  async deleteUser(req, res) {
    const { uid } = req.params;
    try {
      await auth.deleteUser(uid);
      await db.collection("users").doc(uid).delete();
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;
