"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentConfirmationTemplate = void 0;
exports.appointmentConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; }
    .details { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .detail-row:last-child { border-bottom: none; }
    .button { display: inline-block; padding: 12px 24px; background-color: #a855f7; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
    .map-link { color: #a855f7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed! 🎉</h1>
    </div>
    
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>Your appointment at <strong>{{salonName}}</strong> has been successfully booked. We're looking forward to seeing you!</p>
      
      <div class="details">
        <div class="detail-row">
          <strong>📅 Date:</strong>
          <span>{{date}}</span>
        </div>
        <div class="detail-row">
          <strong>⏰ Time:</strong>
          <span>{{time}}</span>
        </div>
        <div class="detail-row">
          <strong>✂️ Service:</strong>
          <span>{{serviceName}}</span>
        </div>
        {{#if stylistName}}
        <div class="detail-row">
          <strong>👤 Stylist:</strong>
          <span>{{stylistName}}</span>
        </div>
        {{/if}}
        <div class="detail-row">
          <strong>💰 Total:</strong>
          <span>\${{price}}</span>
        </div>
      </div>

      <p>
        <strong>📍 Location:</strong><br>
        {{salonAddress}}<br>
        <a href="{{googleMapsLink}}" class="map-link" target="_blank">Get Directions</a>
      </p>

      <div style="text-align: center;">
        <a href="{{appLink}}" class="button">Manage Appointment</a>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        <strong>Cancellation Policy:</strong> Please initiate any cancellations at least 2 hours before your scheduled time to avoid fees.
      </p>
    </div>

    <div class="footer">
      <p>MapMyTrim - Smart Queue Management</p>
      <p>Questions? Contact us at {{salonPhone}}</p>
      <p>
        <a href="{{calendarLink}}" style="color: #666; text-decoration: underline;">Add to Calendar</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
//# sourceMappingURL=appointmentConfirmation.js.map