import "server-only";
import SUCCESS_EMAIL_TEMPLATE from "@/constants/success-email-template";
import { updateOfflineOrderEmailStatus } from "./SpreadSheet";
import nodemailer from "nodemailer";
import { retryEmail } from "@/dal/retry";
import { EmailInfo, EventInfo } from "@/constants/types";

export async function sendSuccessEmail({
  email,
  studentName,
  homeroom,
  ticketType,
  emailInfo,
  eventInfo,
  studentId,
  purchaseTime,
}: {
  email: string;
  studentName: string;
  homeroom: string;
  ticketType: string;
  emailInfo: EmailInfo;
  eventInfo: EventInfo;
  studentId: string;
  purchaseTime: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const htmlContent = SUCCESS_EMAIL_TEMPLATE({
      email,
      eventName: eventInfo.eventName,
      eventDay: eventInfo.eventDate,
      eventYear: eventInfo.eventYear,
      homeroom,
      ticketType,
      eventType: eventInfo.eventType,
      studentName,
      bannerImage: emailInfo.emailBannerImage,
      studentId,
      purchaseTime,
    });

    const mailOptionsPrivate = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: emailInfo.emailSubject,
      html: htmlContent,
    };

    try {
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
      }, `sending success email to ${email}`);
      await updateOfflineOrderEmailStatus({
        studentEmail: email,
        emailStatus: "Đã gửi email",
      });
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      await updateOfflineOrderEmailStatus({
        studentEmail: email,
        emailStatus: "Lỗi gửi email",
      });
    }
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}
