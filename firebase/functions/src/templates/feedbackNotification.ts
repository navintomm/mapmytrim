export const feedbackNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f7f7f7;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .header h1 {
      color: #7c3aed;
      margin: 0;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 15px 0;
    }
    .badge-suggestion {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-feedback {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-complaint {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .content {
      padding: 20px 0;
    }
    .info-row {
      margin: 15px 0;
      padding: 12px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-value {
      color: #111827;
      font-size: 14px;
    }
    .message-box {
      background-color: #f9fafb;
      border-left: 4px solid #7c3aed;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ New {{feedbackTypeLabel}}</h1>
      <span class="badge badge-{{feedbackType}}">{{feedbackTypeLabel}}</span>
    </div>

    <div class="content">
      <p>Hello <strong>{{salonName}}</strong> Team,</p>
      <p>You have received a new {{feedbackTypeLabel}} from a customer:</p>

      <div class="info-row">
        <div class="info-label">From</div>
        <div class="info-value">{{userName}} ({{userEmail}})</div>
      </div>

      <div class="info-row">
        <div class="info-label">Subject</div>
        <div class="info-value">{{subject}}</div>
      </div>

      <div class="message-box">
        <div class="info-label">Message</div>
        <p style="margin: 10px 0 0 0; white-space: pre-wrap;">{{message}}</p>
      </div>

      <div style="text-align: center;">
        <a href="{{dashboardLink}}" class="button">View in Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from MapMyTrim</p>
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
`;
