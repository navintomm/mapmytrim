"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentCancelledTemplate = void 0;
exports.appointmentCancelledTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #fee2e2; padding-bottom: 20px; }
    .content { padding: 20px 0; }
    .highlight { font-weight: bold; color: #dc2626; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #dc2626;">Appointment Cancelled 📅</h1>
  </div>
  <div class="content">
    <p>Hi {{userName}},</p>
    <p>Your appointment has been cancelled.</p>
    <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Salon:</strong> {{salonName}}</p>
      <p><strong>Service:</strong> {{serviceName}}</p>
      <p><strong>Date & Time:</strong> {{date}} at {{time}}</p>
      <p class="highlight">Reason: {{reason}}</p>
    </div>
    <p>You can book a new appointment at any time.</p>
  </div>
</body>
</html>
`;
//# sourceMappingURL=appointmentCancelled.js.map