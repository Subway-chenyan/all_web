# Layout Components

A comprehensive set of core layout components for the Chinese freelance marketplace platform (技能集市).

## Components Overview

### 📱 Header Component (`Header.tsx`)

**Features:**
- Logo and branding with hover effects
- Main navigation menu with active states
- Search bar with real-time suggestions
- User menu with dropdown
- Notifications with badge indicators
- Shopping cart for service orders
- Mobile hamburger menu with overlay
- Responsive design for mobile/tablet/desktop
- Scroll effects and transitions
- Accessibility features (ARIA labels, keyboard navigation)

**Props:**
```typescript
interface HeaderProps {
  onMenuClick: () => void;
  className?: string;
}
```

### 🦶 Footer Component (`Footer.tsx`)

**Features:**
- Company information and contact details
- Service categories and links
- Support and help resources
- Social media integration
- Payment methods display
- Newsletter signup
- Mobile app download section
- Copyright and legal information
- Fully responsive grid layout

**Props:**
```typescript
interface FooterProps {
  className?: string;
  showNewsletter?: boolean;
  showAppDownload?: boolean;
}
```

### 📋 Sidebar Component (`Sidebar.tsx`)

**Features:**
- Dashboard navigation with icons
- User profile quick access
- Quick actions (发布服务、查看订单等)
- Collapsible design for desktop
- Mobile overlay behavior
- Submenu navigation with animations
- Active state indicators
- Badge notifications
- User statistics display
- Search functionality

**Props:**
```typescript
interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
```

### 🏗️ MainLayout Component (`MainLayout.tsx`)

**Features:**
- Integration of Header, Footer, and optional Sidebar
- Breadcrumb navigation
- Page content wrapper
- Loading states with skeleton screens
- Error boundaries with fallback UI
- Route-based page headers
- Mobile-first responsive design
- Smooth transitions and animations

**Props:**
```typescript
interface MainLayoutProps {
  children?: React.ReactNode;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarCollapsible?: boolean;
  className?: string;
}
```

### 🔐 AuthLayout Component (`AuthLayout.tsx`)

**Features:**
- Clean centered layout for login/register pages
- Split-screen design with branding
- Social login integration (微信, QQ, 支付宝)
- Background patterns and gradients
- Trust badges and security indicators
- Mobile responsive design
- Loading states and error handling
- Form validation support

**Props:**
```typescript
interface AuthLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBranding?: boolean;
  backgroundImage?: string;
  className?: string;
}
```

## Usage Examples

### Basic MainLayout Usage

```typescript
import { MainLayout } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <div>Your page content here</div>
    </MainLayout>
  );
}
```

### Custom Layout Configuration

```typescript
import { MainLayout } from '@/components/layout';

function DashboardPage() {
  return (
    <MainLayout
      showFooter={false}
      sidebarCollapsible={true}
      className="bg-gray-100"
    >
      <DashboardContent />
    </MainLayout>
  );
}
```

### AuthLayout for Login/Register

```typescript
import { AuthLayout } from '@/components/layout';

function LoginPage() {
  return (
    <AuthLayout
      title="欢迎回来"
      subtitle="登录您的技能集市账户"
      showBranding={true}
    >
      <LoginForm />
    </AuthLayout>
  );
}
```

## Design System Integration

### Chinese Design Preferences
- Red color scheme (`red-500`) as primary brand color
- Chinese typography with proper line height (`leading-chinese`)
- Mobile-first responsive design approach
- Semantic HTML5 elements
- Proper spacing and padding for Chinese content

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast ratios
- Semantic markup

### Performance Optimizations
- Lazy loading for images
- Debounced search functionality
- Optimized animations with CSS transforms
- Efficient state management
- Code splitting ready
- Skeleton loading states

## Internationalization Support

All components are integrated with the i18n system:

```typescript
import { useI18n } from '@/i18n';

const { t } = useI18n();
// Usage: t('navigation.home'), t('auth.login'), etc.
```

## Responsive Breakpoints

- **Mobile:** < 640px (`sm:` prefix)
- **Tablet:** 640px - 1024px (`md:` prefix)
- **Desktop:** ≥ 1024px (`lg:` prefix)

## State Management

Components are designed to work with:
- React Context for user authentication
- Zustand stores for global state
- Local state for component-specific data
- URL-based routing state

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Contributing

When modifying layout components:

1. Maintain TypeScript type safety
2. Follow existing naming conventions
3. Add appropriate ARIA labels
4. Test responsive behavior
5. Ensure accessibility compliance
6. Update this README for new features

## Dependencies

- React 18+
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- Existing utility functions (`@/utils`)
- i18n system (`@/i18n`)