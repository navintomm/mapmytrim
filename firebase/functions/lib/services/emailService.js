"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFeedbackNotificationEmail = exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const handlebars = __importStar(require("handlebars"));
const email_1 = require("../config/email");
const transporter = nodemailer.createTransport(email_1.emailConfig);
const sendEmail = async ({ to, subject, template, context }) => {
    try {
        const compiledTemplate = handlebars.compile(template);
        const html = compiledTemplate(context);
        const mailOptions = {
            from: email_1.emailConfig.from,
            to,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendFeedbackNotificationEmail = async (to, context) => {
    const { feedbackNotificationTemplate } = await Promise.resolve().then(() => __importStar(require('../templates/feedbackNotification')));
    return (0, exports.sendEmail)({
        to,
        subject: `New ${context.feedbackTypeLabel} from ${context.userName}`,
        template: feedbackNotificationTemplate,
        context,
    });
};
exports.sendFeedbackNotificationEmail = sendFeedbackNotificationEmail;
//# sourceMappingURL=emailService.js.map