# HeyDoc Deployment Guide

## SendGrid Setup & Email OTP Implementation

### Prerequisites
1. **SendGrid Account**: Sign up at [sendgrid.com](https://sendgrid.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Redis Instance**: For email rate limiting

### SendGrid Configuration

1. **Create SendGrid API Key**:
   - Go to SendGrid Dashboard → Settings → API Keys
   - Create a new API key with "Full Access"
   - Copy the API key (starts with `SG.`)

2. **Verify Sender Email**:
   - Go to Settings → Sender Authentication
   - Verify your email address or domain
   - Use this verified email as `FROM_EMAIL`

### Render Deployment

1. **Environment Variables** (Set in Render Dashboard):
   ```bash
   SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com  # Must be verified in SendGrid
   FRONTEND_URL=https://your-frontend-domain.com
   DEBUG=False
   SECRET_KEY=your-auto-generated-secret-key
   ```

2. **Deploy Backend**:
   - Connect your GitHub repo to Render
   - Use the `render.yaml` configuration
   - Set environment variables in Render Dashboard

3. **Database Migration**:
   ```bash
   python manage.py makemigrations accounts
   python manage.py migrate
   ```

### Email Rate Limiting Features

- **Daily Limit**: 100 emails per day (SendGrid free tier)
- **Automatic Fallback**: Shows "Daily limit reached" when exceeded
- **Redis-based Counting**: Resets at midnight UTC
- **Monitoring**: Check remaining emails via `/api/auth/email/status/`

### API Endpoints

- `POST /api/auth/otp/send/` - Send OTP for registration
- `POST /api/auth/otp/verify/` - Verify OTP and create account  
- `POST /api/auth/otp/resend/` - Resend OTP code
- `GET /api/auth/email/status/` - Check email service status

### Frontend Usage

1. User fills registration form
2. Form sends OTP to email via `/api/auth/otp/send/`
3. User enters 6-digit code
4. Code verified via `/api/auth/otp/verify/`
5. Account created on successful verification

### Security Features

- **OTP Expiration**: 10 minutes
- **Attempt Limiting**: Max 3 attempts per OTP
- **Rate Limiting**: Prevent OTP spam
- **Email Validation**: Duplicate email prevention
- **Secure Codes**: 6-digit random codes

### Testing

1. **Local Testing**:
   ```bash
   # Set environment variables
   SENDGRID_API_KEY=SG.your-test-key
   FROM_EMAIL=test@yourdomain.com
   
   # Start Redis
   redis-server
   
   # Run Django
   python manage.py runserver
   ```

2. **Production Testing**:
   - Test registration flow end-to-end
   - Verify email delivery
   - Check rate limiting works
   - Monitor logs for errors

### Monitoring

- **Email Count**: Monitor daily usage via Redis
- **Error Logs**: Check SendGrid delivery status
- **User Registration**: Track successful verifications
- **Rate Limits**: Monitor when limits are hit

### Troubleshooting

1. **Emails not sending**:
   - Check SendGrid API key is valid
   - Verify FROM_EMAIL is authenticated in SendGrid
   - Check SendGrid activity log

2. **Rate limiting issues**:
   - Ensure Redis is connected
   - Check Redis cache keys: `email_count_YYYYMMDD`

3. **OTP not working**:
   - Check OTP expiration (10 minutes)
   - Verify attempt count (max 3)
   - Check email formatting

### Cost Optimization

- **SendGrid Free**: 100 emails/day forever
- **Render Redis**: $7/month starter plan
- **Database**: Free PostgreSQL tier available
- **Total Monthly Cost**: ~$7 for email service

### Future Enhancements

- SMS OTP fallback option
- Email template customization
- Advanced rate limiting (per user)
- Email delivery analytics
- Internationalization support