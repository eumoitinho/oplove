# OpenLove Social Network

A modern social network built with Next.js 15, focusing on authentic connections and relationships in Brazil.

## 🚀 Features

- **Authentication**: Secure login/register with Supabase Auth
- **Social Feed**: Real-time posts and interactions
- **User Profiles**: Customizable profiles with verification
- **Messaging**: Real-time chat system
- **Events**: Community events and meetups
- **Premium Plans**: Tiered subscription system
- **Business Dashboard**: Analytics and advertising tools

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

\`\`\`
/app
  /(auth)          # Authentication routes
  /(main)          # Main application routes
  /(business)      # Business dashboard
  /api/v1          # API endpoints
/components
  /auth            # Auth components
  /common          # Shared components
  /feed            # Feed components
  /profile         # Profile components
  /chat            # Chat components
/hooks             # Custom React hooks
/lib               # Utilities and configurations
/services          # API service functions
/types             # TypeScript definitions
/styles            # Global styles
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: Purple (#9333ea)
- **Secondary**: Pink (#ec4899)
- **Accent**: Cyan (#0891b2)

### Components
- Consistent spacing and typography
- Glass morphism effects
- Smooth animations and transitions
- Mobile-first responsive design

## 🚀 Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-org/openlove-social.git
   cd openlove-social
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   # Fill in your environment variables
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Use meaningful component and function names
- Implement proper error handling
- Write comprehensive tests

### Component Architecture
- Use composition over inheritance
- Keep components small and focused
- Implement proper prop types
- Use custom hooks for shared logic

### State Management
- Use Zustand for global state
- Use SWR for server state
- Keep local state minimal
- Implement proper loading states

## 🧪 Testing

\`\`\`bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run type checking
npm run type-check
\`\`\`

## 📦 Deployment

The application is optimized for deployment on Vercel:

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Framer Motion](https://www.framer.com/motion/) for animations
\`\`\`

This completes the comprehensive Next.js 15 OpenLove social network application with a modular architecture. The project includes:

1. **Complete project structure** with proper organization
2. **Context files** for each directory explaining purpose and responsibilities
3. **TypeScript configuration** with strict mode
4. **Tailwind CSS** with custom OpenLove theme colors
5. **Authentication system** with Supabase integration
6. **State management** with Zustand
7. **Data fetching** with SWR
8. **Form handling** with React Hook Form and Zod
9. **Component library** with consistent design system
10. **API routes** structure for backend functionality
11. **Testing approach** and development guidelines

The architecture is modular, scalable, and follows Next.js 15 best practices with proper separation of concerns and comprehensive documentation.
