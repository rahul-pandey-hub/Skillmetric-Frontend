# SkillMetric Frontend

Modern React frontend for the SkillMetric Online Assessment Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **React Query** - Server state
- **React Router v6** - Routing
- **Framer Motion** - Animations
- **Socket.IO** - Real-time features
- **Recharts** - Data visualization

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── layout/          # Layout components
│   ├── shared/          # Reusable components
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── pages/               # Page components by role
│   ├── auth/           # Login, register
│   ├── recruiter/      # Recruiter pages
│   ├── student/        # Student pages
│   └── org-admin/      # Organization admin
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & configs
├── store/               # Zustand stores
├── types/               # TypeScript types
└── routes/              # Route definitions
```

## 🎨 Key Features Implemented

✅ **Authentication**
- Login with role-based access
- Protected routes
- Token management
- Auto-redirect on 401

✅ **Recruiter Dashboard**
- Stats overview (active exams, students, completion rate)
- Quick actions (create exam, monitoring, bulk enroll)
- Recent exams list
- Animated cards

✅ **Live Monitoring**
- Real-time session tracking
- Socket.IO integration
- Violation monitoring
- Tab switch detection
- Filter by status/violations
- Auto-refresh every 5s

✅ **Shared Components**
- StatsCard - Animated stat cards
- DataTable - Sortable, filterable tables
- FileUpload - Drag & drop file upload
- And many more...

✅ **State Management**
- Auth store (with persistence)
- Exam store
- Proctoring store

✅ **API Integration**
- Axios client with interceptors
- React Query hooks
- Auto-retry on failure
- Error handling

## 🎯 Available Routes

### Public Routes
- `/login` - Login page

### Recruiter Routes (Protected)
- `/recruiter` - Dashboard
- `/recruiter/monitoring` - Live monitoring (all exams)
- `/recruiter/monitoring/:examId` - Monitor specific exam

### Student Routes (Protected)
- `/student` - Student dashboard

## 🔧 Development

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npm run build  # TypeScript is checked during build
```

## 📦 Key Dependencies

- `react` & `react-dom` - UI
- `react-router-dom` - Routing
- `@tanstack/react-query` - Server state
- `zustand` - Client state
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `lucide-react` - Icons
- `socket.io-client` - Real-time
- `react-hook-form` & `zod` - Forms
- `sonner` - Toasts

## 🎨 Theming

Colors are defined in `tailwind.config.js` and CSS variables in `src/index.css`.

### Primary Colors
- Primary: Purple (#667eea)
- Secondary: Deep purple (#764ba2)
- Success: Green (#48bb78)
- Warning: Orange (#ed8936)

### Dark Mode
Dark mode is supported. Toggle with `dark` class on `<html>` element.

## 📝 Coding Conventions

- Use **functional components** with hooks
- Use **TypeScript** for all new files
- Follow **shadcn/ui** patterns for components
- Use **Tailwind** for styling (no CSS modules)
- Keep components **small and focused**
- Extract **reusable logic** to custom hooks
- Use **Zustand** for client state
- Use **React Query** for server state

## 🚧 Pending Features

See `FRONTEND-IMPLEMENTATION-SUMMARY.md` for full list of pending features:

1. Create Exam Wizard (5 steps)
2. Exam List Page
3. Bulk Enrollment
4. Student Exam Taking Interface
5. Analytics Page
6. Question Bank Management
7. Results & Reporting

## 🐛 Known Issues

- Old files have TypeScript warnings (will be replaced)
- Build succeeds but shows some unused import warnings

## 📚 Documentation

- `COMPLETE-FRONTEND-REFACTORING.md` - Full refactoring guide
- `FRONTEND-IMPLEMENTATION-SUMMARY.md` - What's been implemented
- `MASTER-REFACTORING-DOCUMENT.md` - Backend schemas & APIs

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript
3. Write meaningful commit messages
4. Test your changes before committing

## 📄 License

Private - SkillMetric © 2024
