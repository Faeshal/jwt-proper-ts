import express from "express";
import * as authController from "../../controllers/auth";
import { body } from "express-validator";
const router = express.Router();

router.post(
  "/auth/login",
  [
    body("email", "email is required & must be valid email").isEmail(),
    body("password", "passwordis required").not().isEmpty(),
  ],
  authController.login
);

router.post(
  "/auth/register",
  [
    body("username", "username is required").not().isEmpty().trim(),
    body("email", "email is required & must be valid email").isEmail(),
    body("password", "password lenghth minimum is 5")
      .isLength({ min: 5 })
      .trim(),
    body("role", "role must be between user or admin")
      .optional()
      .isIn(["user", "admin"]),
  ],
  authController.register
);

router.post(
  "/auth/refresh",
  [body("refreshToken", "refreshToken is required").not().isEmpty().trim()],
  authController.refresh
);

export default router;
