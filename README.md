# HeyDoc - Healthcare Management Platform

A full-stack healthcare management platform built with Django (backend) and Next.js (frontend).

## 🏗️ Project Structure

```
HeyDocApp/
├── heydocfrontend/     # Next.js frontend application
└── heydocbackend/      # Django REST API backend
```

## 🚀 Quick Start

### Frontend (Next.js)
```bash
cd heydocfrontend
npm install
cp .env.example .env.local  # Configure environment variables
npm run dev
```

### Backend (Django)
```bash
cd heydocbackend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🌐 Production Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy:
- **Frontend**: Deploy to Vercel (connects to `heydocfrontend/`)
- **Backend**: Deploy to Render (connects to `heydocbackend/`)

## 📱 Features

- **Patient Management**: Registration, profiles, appointment booking
- **Doctor Profiles**: Specializations, availability, clinic management  
- **Appointment System**: Booking, scheduling, history tracking
- **Review System**: Patient feedback and ratings
- **Real-time Notifications**: Appointment updates and reminders
- **Email Integration**: OTP verification via SendGrid

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS (via CDN)
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Backend  
- **Framework**: Django + Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT tokens
- **Email**: SendGrid integration
- **Caching**: Redis
- **File Storage**: Django static files

## 🔧 Development

### Environment Variables

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=HeyDoc
```

**Backend** (`.env`):
```bash
SECRET_KEY=your-secret-key
DEBUG=True
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
```

## 📄 License

© 2025 nskbobby. All rights reserved.