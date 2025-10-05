import "server-only";
import SUCCESS_EMAIL_TEMPLATE from "@/constants/success-email-template";
import { EmailInfo, EmailPayload, EventInfo } from "@/constants/types";
import { fetchEmailInfo, fetchOfflineEventInfo } from "./SpreadSheet";
import nodemailer from "nodemailer";
import { Cache } from "@/lib/cache";
import { retryEmail } from "@/dal/retry";

const getEmailInfo = async (): Promise<{
  error: boolean;
  data: EmailInfo | undefined;
}> => {
  try {
    const cachedEmailInfo = await Cache.get("email-info");
    if (cachedEmailInfo) {
      return { error: false, data: JSON.parse(cachedEmailInfo as string) };
    }

    const emailInfo = await fetchEmailInfo();
    if (!emailInfo.error && emailInfo.data) {
      await Cache.set(
        "email-info",
        JSON.stringify(emailInfo.data),
        60 * 60 * 24 * 100
      ); // Cache for 100 days
    }
    if (emailInfo.error) {
      return { error: true, data: undefined };
    }
    return emailInfo;
  } catch (error) {
    console.error("Failed to fetch email info:", error);
    return { error: true, data: undefined };
  }
};

const getEventInfo = async (): Promise<{
  error: boolean;
  data: EventInfo | undefined;
}> => {
  try {
    const cachedEventInfo = await Cache.get("offline-event-info");
    if (cachedEventInfo) {
      return { error: false, data: JSON.parse(cachedEventInfo as string) };
    }

    const eventInfo = await fetchOfflineEventInfo();
    if (!eventInfo.error && eventInfo.data) {
      await Cache.set(
        "offline-event-info",
        JSON.stringify(eventInfo.data),
        60 * 60 * 24 * 100
      ); // Cache for 100 days
    }
    if (eventInfo.error) {
      return { error: true, data: undefined };
    }
    return eventInfo;
  } catch (error) {
    console.error("Failed to fetch form info:", error);
    return { error: true, data: undefined };
  }
};

export async function sendSuccessEmail({
  email,
  studentName,
  eventDay,
  eventYear,
  homeroom,
  ticketType,
  studentId,
  eventType,
  purchaseTime,
}: EmailPayload) {
  const [emailInfoResult, eventInfoResult] = await Promise.allSettled([
    getEmailInfo(),
    getEventInfo(),
  ]);

  const emailInfo =
    emailInfoResult.status === "fulfilled"
      ? emailInfoResult.value
      : { error: true, data: undefined };

  const eventInfo =
    eventInfoResult.status === "fulfilled"
      ? eventInfoResult.value
      : { error: true, data: undefined };

  if (
    emailInfo.error ||
    eventInfo.error ||
    !emailInfo.data ||
    !eventInfo.data
  ) {
    throw new Error("Failed to fetch email or event info");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const htmlContent = SUCCESS_EMAIL_TEMPLATE({
    email,
    eventName: eventInfo.data.eventName,
    eventDay,
    eventYear,
    homeroom,
    ticketType,
    eventType,
    studentName,
    bannerImage: emailInfo.data.emailBannerImage,
    studentId,
    purchaseTime,
  });

  const mailOptionsPrivate = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: emailInfo.data.emailSubject,
    html: htmlContent,
  };
  await retryEmail(async () => {
    // Verify transporter configuration before sending
    await transporter.verify();

    const result = await transporter.sendMail(mailOptionsPrivate);

    // Check if messageId exists (indicates successful queuing)
    if (!result.messageId) {
      throw new Error("Failed to send email - no message ID returned");
    }

    // Check accepted recipients
    if (result.accepted.length === 0) {
      throw new Error("No recipients accepted");
    }

    // Log successful send
    console.log(
      `Email sent successfully to ${email}, messageId: ${result.messageId}`
    );

    return result;
  }, `sending success email to ${email}`);
}
