import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Import i18n configuration
import '@/i18n';
import { I18nProvider } from '@/i18n';

// Import theme provider
import ThemeProvider from '@/theme/ThemeProvider';

// Import layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Import pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ServicesPage } from '@/pages/services/ServicesPage';
import { ServiceDetailPage } from '@/pages/services/ServiceDetailPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { MessagesPage } from '@/pages/messages/MessagesPage';
import { ConversationPage } from '@/pages/messages/ConversationPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import DesignDemo from '@/pages/DesignDemo';
import ShowcasePage from '@/pages/Showcase';

// Import providers
import { NotificationProvider } from '@/components/providers/NotificationProvider';

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Showcase Route */}
                  <Route path="/showcase" element={<ShowcasePage />} />

                  {/* Design Demo Route */}
                  <Route path="/demo" element={<DesignDemo />} />

                {/* Public routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="services/:id" element={<ServiceDetailPage />} />
                  <Route path="about" element={<div>关于我们页面</div>} />
                  <Route path="contact" element={<div>联系我们页面</div>} />
                  <Route path="terms" element={<div>服务条款页面</div>} />
                  <Route path="privacy" element={<div>隐私政策页面</div>} />
                  <Route path="help" element={<div>帮助中心页面</div>} />
                  <Route path="search" element={<div>搜索页面</div>} />
                  <Route path="categories" element={<div>分类页面</div>} />
                  <Route path="categories/:slug" element={<div>分类详情页面</div>} />
                  <Route path="sellers/:id" element={<div>卖家资料页面</div>} />
                </Route>

                {/* Auth routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<div>忘记密码页面</div>} />
                  <Route path="reset-password" element={<div>重置密码页面</div>} />
                  <Route path="verify-email" element={<div>邮箱验证页面</div>} />
                </Route>

                {/* Protected routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/edit" element={<div>编辑资料页面</div>} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="messages/:id" element={<ConversationPage />} />
                  <Route path="wallet" element={<div>钱包页面</div>} />
                  <Route path="settings" element={<div>设置页面</div>} />
                  <Route path="notifications" element={<div>通知页面</div>} />
                  <Route path="become-seller" element={<div>成为卖家页面</div>} />
                  <Route path="my-services" element={<div>我的服务页面</div>} />
                  <Route path="create-service" element={<div>创建服务页面</div>} />
                  <Route path="edit-service/:id" element={<div>编辑服务页面</div>} />
                  <Route path="my-orders" element={<div>我的订单页面</div>} />
                  <Route path="my-reviews" element={<div>我的评价页面</div>} />
                </Route>

                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
