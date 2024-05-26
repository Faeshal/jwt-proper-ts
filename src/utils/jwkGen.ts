import fs from "fs";
import path from "path";
import { importPKCS8, exportJWK } from "jose";
import log4js from "log4js";
const log = log4js.getLogger("utils:jwkGen");
log.level = "info";

async function convertPemToJwk() {
  try {
    // Resolve the path to the PEM file
    const pemFilePath = path.join(__dirname, "../cert/private-pkcs8.pem");
    log.info("pemFilePath", pemFilePath);
    const pem = fs.readFileSync(pemFilePath, "utf8");

    // Import the PEM key (assuming it's an RSA key, adjust the algorithm if needed)
    const privateKey = await importPKCS8(pem, "RS256");

    // Export the key as JWK
    const jwk = await exportJWK(privateKey);
    return jwk;
  } catch (error) {
    log.error("Error converting PEM to JWK:", error);
    throw error;
  }
}

export { convertPemToJwk };
