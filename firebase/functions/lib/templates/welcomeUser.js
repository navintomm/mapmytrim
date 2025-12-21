"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeUserTemplate = void 0;
exports.welcomeUserTemplate = `
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
    <h1>Welcome to MapMyTrim! ✂️</h1>
  </div>
  <div class="content">
    <p>Hi {{userName}},</p>
    <p>Welcome to MapMyTrim! We're excited to have you on board.</p>
    <p>With MapMyTrim, you can:</p>
    <ul>
      <li>Discover top-rated salons near you</li>
      <li>Join queues remotely</li>
      <li>Book appointments effortlessly</li>
    </ul>
    <p>Ready to look your best?</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{appLink}}" class="button">Explore Salons</a>
    </div>
  </div>
</body>
</html>
`;
//# sourceMappingURL=welcomeUser.js.map