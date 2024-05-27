import "dotenv/config";
import fs from "fs";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";
import log4js from "log4js";
import path from "path";
const log = log4js.getLogger("utils:jwt");
log.level = "info";

// * CRED PEM
const pemFilePath = path.join(__dirname, "../cert/private-pkcs8.pem");
const secret = fs.readFileSync(pemFilePath, "utf8");

const pemPublicPath = path.join(__dirname, "../cert/public.pem");
const publicKey = fs.readFileSync(pemPublicPath, "utf8");
// const JWK_URL: any = process.env.JWK_URL;

const generateToken = async (type: string, payload: any) => {
  //  declare
  var option: any = new Object();
  option.expiresIn = "1m";
  option.algorithm = "RS256";
  option.issuer = "https://auth.faas.com";
  option.audience = "https://client.faas.com";

  if (type == "refreshToken") {
    option.expiresIn = "7d";
  }

  log.warn("option", option);

  // generate
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, option, (err, token) => {
      if (err) {
        log.error("JWT generate error:", err.message);
        return reject(new Error("Error:" + err));
      }
      resolve(token);
    });
  });
};

const verifyToken = async (token: string) => {
  try {
    log.info("verify utils:", token);
    // api call for get jwk
    // const response = await axios.get(JWK_URL);
    // const keyObj = response.data;
    // log.info("keyObj", keyObj);

    // convert to public pem
    // const publicConvert = jwkToPem(keyObj);
    const publicConvert = publicKey;

    // verify prosess
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        publicConvert,
        { algorithms: ["RS256"] },
        (err, decoded: any) => {
          if (err) {
            log.error("JWT verify error:", err.message);
            return reject(new Error("Error:" + err));
          }
          log.info("🌟 decoded JWT:", decoded);

          // extra check
          if (decoded.iss !== "https://auth.faas.com") {
            return reject(new Error("unaothirized"));
          }
          if (decoded.aud !== "https://client.faas.com") {
            return reject(new Error("unaothirized"));
          }

          resolve(decoded);
        }
      );
    });
  } catch (err) {
    log.error("token verif err: ", err);
    throw new Error("token verif err: " + err);
  }
};

export { generateToken, verifyToken };
