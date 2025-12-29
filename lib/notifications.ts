import "server-only";
import nodemailer from "nodemailer";
import twilio from "twilio";
import type { NotificationRequest, NotificationResult } from "@/types";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM,
  TWILIO_WHATSAPP_FROM,
} = process.env;

let smtpTransport: nodemailer.Transporter | null = null;
let twilioClient: ReturnType<typeof twilio> | null = null;

const getSmtpTransport = (): nodemailer.Transporter => {
  if (smtpTransport) return smtpTransport;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured");
  }

  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
  const secure = port === 465;

  smtpTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return smtpTransport;
};

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio is not configured");
  }
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
};

const normalizeWhatsappAddress = (value: string) =>
  value.startsWith("whatsapp:") ? value : `whatsapp:${value}`;

export const sendEmail = async (
  to: string,
  subject: string,
  message: string
): Promise<NotificationResult> => {
  const from = SMTP_FROM || SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM is not configured");
  }

  const transport = getSmtpTransport();
  const info = await transport.sendMail({
    from,
    to,
    subject,
    text: message,
  });

  return { provider: "smtp", messageId: info.messageId };
};

export const sendWhatsApp = async (
  to: string,
  message: string
): Promise<NotificationResult> => {
  if (!TWILIO_WHATSAPP_FROM) {
    throw new Error("TWILIO_WHATSAPP_FROM is not configured");
  }
  const client = getTwilioClient();
  const result = await client.messages.create({
    from: normalizeWhatsappAddress(TWILIO_WHATSAPP_FROM),
    to: normalizeWhatsappAddress(to),
    body: message,
  });

  return { provider: "twilio", messageId: result.sid };
};

export const sendSms = async (
  to: string,
  message: string
): Promise<NotificationResult> => {
  if (!TWILIO_SMS_FROM) {
    throw new Error("TWILIO_SMS_FROM is not configured");
  }
  const client = getTwilioClient();
  const result = await client.messages.create({
    from: TWILIO_SMS_FROM,
    to,
    body: message,
  });

  return { provider: "twilio", messageId: result.sid };
};

export const sendNotification = async (
  payload: NotificationRequest
): Promise<NotificationResult> => {
  const message = payload.message?.trim();
  const to = payload.to?.trim();

  if (!to || !message) {
    throw new Error("Missing destination or message");
  }

  switch (payload.channel) {
    case "email":
      return sendEmail(
        to,
        payload.subject?.trim() || "Weekly Task Organizer",
        message
      );
    case "whatsapp":
      return sendWhatsApp(to, message);
    case "sms":
      return sendSms(to, message);
    default:
      throw new Error("Unsupported notification channel");
  }
};
