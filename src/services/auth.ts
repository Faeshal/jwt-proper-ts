import "dotenv/config";
import * as userRepo from "../repositories/user";
import { ErrorResponse } from "../middleware/errorHandler";
import { generateToken, verifyToken } from "../utils/jwt";
import { LoginRequest, RegisterRequest } from "../interfaces/user";
import redis from "../utils/redis";
import bcrypt from "bcrypt";
import log4js from "log4js";
import { axiosReq } from "../utils/axios";
const log = log4js.getLogger("service:auth");

export const register = async (body: RegisterRequest) => {
  log.info("body:", body);
  const { username, email, password, role, gender, job, address, age } = body;

  // * call repo (check double email)
  const emailExist = await userRepo.findOne({ email });
  if (emailExist) {
    throw new ErrorResponse("email already exist", 400);
  }

  // * call repo (check double uname)
  const unameExist = await userRepo.findOne({ username });
  if (unameExist) {
    throw new ErrorResponse("username already exist", 400);
  }

  // * hash Pass
  const hashedPw = await bcrypt.hash(password, 12);

  // save profile first [old ways, separate insert operation]
  // const profile = await userRepo.createProfile({ gender, job, address, age }) // return profile.id -> then save fk to join table

  // * save user [including profile, one operation]
  const result = await userRepo.create({
    username,
    email,
    password: hashedPw,
    role,
    profile: { gender, job, address, age },
  });

  // * formating return data
  const fmtData = { id: result.id, username, email };
  return fmtData;
};

export const login = async (body: LoginRequest) => {
  log.info("body:", body);
  const { email, password } = body;

  // * check is email exist ?
  const user = await userRepo.findOne({ email });
  if (!user) {
    throw new ErrorResponse("email / password doesn't match or exists", 400);
  }

  // * compare Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ErrorResponse("email / password doesn't match or exists", 400);
  }

  // * generate jwt token
  const tokenPayload = {
    id: user.id,
    role: user.role,
    timestamp: Date.now(),
  };
  const accessToken = await generateToken("accessToken", tokenPayload);
  const refreshToken: any = await generateToken("refreshToken", tokenPayload);
  log.warn("🍥 access token:", accessToken);
  log.info("🍥 refresh token:", accessToken);

  // cache refreshToken
  const setCache = await redis.set(refreshToken, user.id, "EX", 691200); // 8 days
  log.info("SET CACHE:", setCache);

  await axiosReq("https://reqres.in/api/users", "get");

  // * formating data
  const fmtData = {
    isLoggedIn: true,
    accessToken,
    refreshToken,
  };
  return fmtData;
};

export const refresh = async (refreshToken: string) => {
  log.info("refreshToken:", refreshToken);

  // check is refresh token exist
  const inCache = await redis.get(refreshToken);
  log.info("inCache ⭐", inCache);
  if (inCache == undefined) {
    log.warn("refresh token not exist!");
    throw new ErrorResponse("invalid refreshToken", 400);
  }

  // verify refresh token
  const decoded: any = await verifyToken(refreshToken);
  const { id, role } = decoded;

  // generate new token
  const tokenPayload = {
    id,
    role,
    timestamp: Date.now(),
  };
  const accToken: any = await generateToken("accessToken", tokenPayload);
  const refToken: any = await generateToken("refreshToken", tokenPayload);

  // store refresh token in cache
  const setCache = await redis.set(refToken, id, "EX", 691200);
  log.info("SET CACHE:", setCache);

  // delete old refresh token
  const deleteCache = await redis.del(refreshToken);
  log.info("delete cache:", deleteCache);

  // * formating data
  const fmtData = {
    isLoggedIn: true,
    accessToken: accToken,
    refreshToken: refToken,
  };
  return fmtData;
};

// Logout endpoint
// app.post("/api/logout", authenticateToken, async (req, res) => {
//   const userId = req.user.id; // Assuming the user ID is stored in the token

//   // Delete all refresh tokens related to this user
//   // await deleteAllUserRefreshTokens(userId);

//   // Optionally, you can blacklist the access token until it expires

//   res.json({ message: "Logged out successfully" });
// });
