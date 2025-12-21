"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackReplyTemplate = void 0;
exports.feedbackReplyTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
    .content { padding: 20px 0; }
    .original-message { background-color: #f9fafb; padding: 15px; border-left: 4px solid #d1d5db; color: #6b7280; font-style: italic; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reply from {{salonName}} 💬</h1>
  </div>
  <div class="content">
    <p>Hi {{userName}},</p>
    <p><strong>{{salonName}}</strong> has replied to your {{feedbackType}}:</p>
    <p>--------------------------------------------------</p>
    <p style="white-space: pre-wrap;">{{replyMessage}}</p>
    <p>--------------------------------------------------</p>
    
    <div class="original-message">
      <small>Original Message:</small><br/>
      {{originalMessage}}
    </div>
    
    <p>Thank you for using MapMyTrim!</p>
  </div>
</body>
</html>
`;
//# sourceMappingURL=feedbackReply.js.map