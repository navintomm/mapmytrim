import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { emailConfig } from '../config/email';

const transporter = nodemailer.createTransport(emailConfig);

export interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

export const sendEmail = async ({ to, subject, template, context }: EmailOptions) => {
    try {
        const compiledTemplate = handlebars.compile(template);
        const html = compiledTemplate(context);

        const mailOptions = {
            from: emailConfig.from,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendFeedbackNotificationEmail = async (to: string, context: Record<string, any>) => {
    const { feedbackNotificationTemplate } = await import('../templates/feedbackNotification');

    return sendEmail({
        to,
        subject: `New ${context.feedbackTypeLabel} from ${context.userName}`,
        template: feedbackNotificationTemplate,
        context,
    });
};

