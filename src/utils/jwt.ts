import "dotenv/config";
import fs from "fs";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";
import log4js from "log4js";
import path from "path";
const log = log4js.getLogger("utils:jwt");
log.level = "info";

// * Read PEM
const pemFilePath = path.join(__dirname, "../cert/private-pkcs8.pem");
const secret = fs.readFileSync(pemFilePath, "utf8");
const JWK_URL: any = process.env.JWK_URL;

const generateToken = async (payload: any) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: "15m",
        algorithm: "RS256",
      },
      (err, token) => {
        if (err) {
          log.warn(err.message);
          return reject(new Error("Error:" + err));
        }
        resolve(token);
      }
    );
  });
};

const verifyToken = async (token: string) => {
  // * api call - get jwk
  const response = await axios.get(JWK_URL);

  const keyObj = response.data;
  log.info("keyObj", keyObj);

  // * compare
  const publicConvert = jwkToPem(keyObj);
  log.warn("publicConvert", publicConvert);
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      publicConvert,
      { algorithms: ["RS256"] },
      (err, decoded) => {
        if (err) {
          log.error("Error:" + err.message);
          return reject(new Error("Error:" + err));
        }
        log.info("🌟 decoded JWT:", decoded);
        resolve(decoded);
      }
    );
  });
};

const generateRefreshToken = async (payload: any) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: "30d",
        algorithm: "RS256",
      },
      (err, token) => {
        if (err) {
          log.error(err.message);
          return reject(new Error("Error:" + err));
        }
        resolve(token);
      }
    );
  });
};

export { generateToken, generateRefreshToken, verifyToken };
