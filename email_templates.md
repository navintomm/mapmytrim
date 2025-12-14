# EmailJS HTML Templates

Copy and paste these HTML codes into the **"Source Code"** (< > icon) view of your EmailJS Filter templates.

## 1. Welcome Email (New User)

**Variables to add in EmailJS parameters:** `{{user_name}}`, `{{app_link}}`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #7c3aed; margin: 0; font-size: 24px; }
    .content { font-size: 16px; color: #4b5563; }
    .features { background: #f5f3ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .features li { margin-bottom: 8px; }
    .button { display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to MapMyTrim! ✂️</h1>
    </div>
    <div class="content">
      <p>Hi {{user_name}},</p>
      <p>Welcome to <strong>MapMyTrim</strong>! We're thrilled to have you join our community of style enthusiasts.</p>
      
      <div class="features">
        <p style="margin-top:0; font-weight:bold;">Get started right away:</p>
        <ul style="padding-left: 20px; margin-bottom: 0;">
          <li>📍 Find top-rated salons near you</li>
          <li>⏳ Join live queues from home</li>
          <li>📅 Book appointments in seconds</li>
        </ul>
      </div>

      <p>Ready to find your next look?</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_link}}" class="button">Explore Salons Now</a>
      </div>
      
      <p>Best regards,<br>The MapMyTrim Team</p>
    </div>
    <div class="footer">
      <p>© 2025 MapMyTrim. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Cancellation Email

**Variables to add in EmailJS parameters:** `{{user_name}}`, `{{salon_name}}`, `{{service_name}}`, `{{appointment_date}}`, `{{appointment_time}}`, `{{cancellation_reason}}`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef2f2; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 5px solid #ef4444; }
    .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #dc2626; margin: 0; font-size: 24px; }
    .content { font-size: 16px; color: #4b5563; }
    .details-box { background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #fecaca; padding-bottom: 8px; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #7f1d1d; }
    .value { color: #1f2937; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4b5563; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Cancelled 📅</h1>
    </div>
    
    <div class="content">
      <p>Hi {{user_name}},</p>
      <p>We're sorry to inform you that your upcoming appointment has been cancelled.</p>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="label">Salon:</span>
          <span class="value">{{salon_name}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service:</span>
          <span class="value">{{service_name}}</span>
        </div>
        <div class="detail-row">
          <span class="label">When:</span>
          <span class="value">{{appointment_date}} at {{appointment_time}}</span>
        </div>
        <div class="detail-row" style="margin-top: 10px;">
          <span class="label">Reason:</span>
          <span class="value" style="color: #dc2626;">{{cancellation_reason}}</span>
        </div>
      </div>

      <p>Don't worry! You can easily book a new slot or find another salon nearby.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/home" class="button">Book New Appointment</a>
      </div>
      
      <p>If you have any questions, please contact the salon directly.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 MapMyTrim. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```
