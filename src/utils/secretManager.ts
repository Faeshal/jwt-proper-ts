import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
} from "@aws-sdk/client-secrets-manager";
import log4js from "log4js";

const log = log4js.getLogger("utils:secretManager");
log.level = "info";

// Replace with your AWS region
const AWS_REGION = process.env.AWS_REGION;

const client = new SecretsManagerClient({ region: AWS_REGION });

export async function getSecret(secretName: string): Promise<string> {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response: GetSecretValueCommandOutput = await client.send(command);
    if (!response.SecretString) {
      throw new Error("SecretString is missing in the response.");
    }
    log.info("⭐ aws secret manager:", response);
    return response.SecretString;
  } catch (error) {
    log.error("secret manager error:", error);
    throw new Error("Failed to retrieve secret.");
  }
}
