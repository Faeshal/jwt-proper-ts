import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import log4js from "log4js";
const log = log4js.getLogger("utils:ses");
log.level = "info";

// Interface for Email Options (optional, but improves type safety)
interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
}

// Generic function to send email with SES
export async function sendEmailWithSES(options: EmailOptions): Promise<void> {
  const sesClient = new SESClient({ region: "REGION" });

  const emailParams = {
    Destination: {
      ToAddresses: [options.to],
    },
    Source: options.from,
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: options.textBody || "", // Include textBody if provided
        },
        Html: {
          Charset: "UTF-8",
          Data: options.htmlBody || "", // Include htmlBody if provided
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: options.subject,
      },
    },
  };

  try {
    const sendEmailCommand = new SendEmailCommand(emailParams);
    const result = await sesClient.send(sendEmailCommand);
    log.info("🟩 Email sent", result);
  } catch (error) {
    log.error("SES error:", error);
    if (error instanceof Error) {
      throw new Error(`SES sendEmail error: ${error.message}`);
    }
    throw new Error("SES sendEmail error");
  }
}
