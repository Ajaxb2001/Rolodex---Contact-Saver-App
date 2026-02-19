# 📇 Rolodex – Contact Saver Application

A modern full-stack Contact Management Web Application built using **Next.js, Supabase, Google OAuth, and Vercel**.

This application allows users to securely log in using Google and manage their personal contacts with full CRUD functionality.

---

## 🚀 Live Demo

🔗 https://rolodex-contact-saver-m0jsw1mbo-ajaxb2001s-projects.vercel.app/

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Custom CSS
- Google Fonts

### Backend & Services
- Supabase (Auth + PostgreSQL)
- Google OAuth (via Supabase)

### Deployment
- Vercel

---

## ✨ Features

- 🔐 Secure Google Authentication
- 🧑‍💼 User-specific Dashboard
- ➕ Add Contacts
- ✏️ Edit Contacts
- 🗑 Delete Contacts
- 🔍 Search Contacts
- 🎨 Dynamic Avatar Generation
- 📱 Responsive UI
- 🔔 Toast Notifications
- 🔒 Row-Level Security (RLS)

---

## 🏗 System Architecture

---

## 🔐 Security Implementation

### Row Level Security (RLS)

Enabled on the `contacts` table:

```sql
auth.uid() = user_id
contact-saver/
│
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── lib/
│   └── supabase.ts
│
├── types/
│   └── contact.ts
│
├── public/
│
├── .env.local
├── package.json
└── README.md
git clone https://github.com/YOUR_USERNAME/Rolodex---Contact-Saver-App.git
cd Rolodex---Contact-Saver-App


