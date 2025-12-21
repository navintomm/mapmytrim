"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeStylistTemplate = void 0;
exports.welcomeStylistTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
     <h1>Welcome to MapMyTrim Partner! 💈</h1>
  </div>
  <div class="content">
    <p>Hi {{userName}},</p>
    <p>Thank you for joining MapMyTrim as a partner! We are thrilled to help you manage your salon more efficiently.</p>
    <p>To get started, please complete your salon profile and set up your services.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardLink}}" class="button">Go to Dashboard</a>
    </div>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  </div>
</body>
</html>
`;
//# sourceMappingURL=welcomeStylist.js.map