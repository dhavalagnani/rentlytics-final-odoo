# 🚀 Rentlytics - Smart Equipment Rental Platform

A modern, responsive rental management platform built with React, Vite, and Tailwind CSS. Streamline your equipment rental business with our comprehensive solution.

![Rentlytics Platform](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-7.1.0-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 🎯 Core Rental Management
- **Product Catalog**: Browse and manage equipment inventory
- **Order Management**: Complete order lifecycle from booking to return
- **Schedule Management**: Visual calendar for pickup/return scheduling
- **Pricing Management**: Flexible pricing tiers and discount rules
- **Customer Portal**: Self-service portal for end users

### 🔔 Smart Notifications
- **Automated Reminders**: Return date notifications
- **Payment Alerts**: Deposit and payment confirmations
- **Late Fee Notifications**: Automatic late fee calculations
- **Multi-channel Delivery**: Email and portal notifications

### 📊 Analytics & Reporting
- **Revenue Analytics**: Track rental income and trends
- **Equipment Utilization**: Monitor product usage rates
- **Customer Insights**: Analyze customer behavior
- **Export Options**: PDF, XLSX, and CSV reports

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark blue theme with glass morphism
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: CSS animations and transitions
- **Interactive Elements**: Hover effects and micro-interactions

### 🔐 Authentication & Security
- **User Authentication**: Login/register with social options
- **Role-based Access**: Customer and admin roles
- **Secure Payments**: Multiple payment gateway support
- **Data Protection**: Privacy-focused design

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.0
- **Styling**: Tailwind CSS 4.1.11
- **Routing**: Hash-based routing (no external dependencies)
- **Icons**: Custom SVG icons
- **Fonts**: Inter + Plus Jakarta Sans
- **Animations**: CSS animations and Intersection Observer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rentlytics.git
   cd rentlytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174` (or the port shown in terminal)

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Main navigation with auth
│   ├── Footer.jsx      # Site footer with links
│   ├── AuthModal.jsx   # Login/register modal
│   ├── AnimatedHero.jsx # Landing page hero
│   ├── ProductCard.jsx # Product display component
│   ├── OrderRow.jsx    # Order table row
│   ├── ScheduleEvent.jsx # Calendar event component
│   ├── NotificationItem.jsx # Notification display
│   ├── PricingCard.jsx # Pricing tier component
│   └── ReportCard.jsx  # Analytics report component
├── pages/              # Page components
│   ├── CustomerPortal.jsx # Customer dashboard
│   └── ProductDetails.jsx # Product detail page
├── App.jsx             # Main app with routing
├── main.jsx            # Entry point
└── index.css           # Global styles and animations
```

## 🎨 Design System

### Color Palette
- **Primary**: Sky Blue (#0ea5e9)
- **Accent**: Violet (#a78bfa)
- **Surface**: Dark Blue (#0b1020)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)

### Typography
- **Primary Font**: Inter (400, 500, 600, 700, 800)
- **Display Font**: Plus Jakarta Sans (400, 600, 700, 800)

### Components
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with smooth transitions

## 📱 Responsive Design

The platform is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

## 🔧 Customization

### Theme Colors
Update colors in `src/index.css`:
```css
@theme {
  --color-primary: #0ea5e9;
  --color-accent: #a78bfa;
  --color-surface: #0b1020;
  /* ... other colors */
}
```

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

### Custom Animations
Add new animations in `src/index.css`:
```css
@keyframes yourAnimation {
  from { /* start state */ }
  to { /* end state */ }
}

.animate-yourAnimation { 
  animation: yourAnimation 0.6s ease-out; 
}
```

## 📊 Performance Features

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: Images and components
- **Optimized Fonts**: Preloaded with display swap
- **Minimal Bundle**: Tree-shaking enabled
- **Fast HMR**: Hot module replacement

## 🔍 SEO Optimization

- **Meta Tags**: Complete Open Graph and Twitter cards
- **Structured Data**: JSON-LD schema markup
- **Semantic HTML**: Proper heading hierarchy
- **Performance**: Core Web Vitals optimized
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the fast build tool
- **React** for the component library
- **Inter & Plus Jakarta Sans** for beautiful typography

## 📞 Support

- **Email**: support@rentlytics.com
- **Documentation**: [docs.rentlytics.com](https://docs.rentlytics.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/rentlytics/issues)

---

Made with ❤️ by the Rentlytics Team
