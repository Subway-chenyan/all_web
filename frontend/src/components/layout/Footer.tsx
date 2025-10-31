import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';

interface FooterProps {
  className?: string;
  showNewsletter?: boolean;
  showAppDownload?: boolean;
}

interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
    badge?: string;
  }[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: string;
  color: string;
}

interface PaymentMethod {
  name: string;
  icon: string;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  showNewsletter = true,
  showAppDownload = true
}) => {
  const { t } = useI18n();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Footer sections configuration
  const footerSections: FooterSection[] = [
    {
      title: '服务分类',
      links: [
        { label: '技术开发', href: '/category/development' },
        { label: '设计创意', href: '/category/design' },
        { label: '写作翻译', href: '/category/writing' },
        { label: '视频音频', href: '/category/media' },
        { label: '营销推广', href: '/category/marketing' },
        { label: '商业咨询', href: '/category/consulting' },
        { label: '生活方式', href: '/category/lifestyle' },
        { label: '教育培训', href: '/category/education', badge: '热门' },
      ],
    },
    {
      title: '关于我们',
      links: [
        { label: '公司介绍', href: '/about' },
        { label: '工作原理', href: '/how-it-works' },
        { label: '成为卖家', href: '/become-seller', badge: '赚钱' },
        { label: '定价方案', href: '/pricing' },
        { label: '成功案例', href: '/success-stories' },
        { label: '媒体报道', href: '/press' },
        { label: '加入我们', href: '/careers', badge: '招聘' },
        { label: '合作伙伴', href: '/partners' },
      ],
    },
    {
      title: '帮助支持',
      links: [
        { label: '帮助中心', href: '/help' },
        { label: '常见问题', href: '/faq' },
        { label: '联系客服', href: '/contact' },
        { label: '社区论坛', href: '/community' },
        { label: '服务保障', href: '/protection' },
        { label: '纠纷处理', href: '/disputes' },
        { label: '安全中心', href: '/security' },
        { label: '意见反馈', href: '/feedback' },
      ],
    },
    {
      title: '政策条款',
      links: [
        { label: '用户协议', href: '/terms' },
        { label: '隐私政策', href: '/privacy' },
        { label: 'Cookie政策', href: '/cookies' },
        { label: '知识产权政策', href: '/ip-policy' },
        { label: '社区准则', href: '/community-guidelines' },
        { label: '退款政策', href: '/refund-policy' },
        { label: '免责声明', href: '/disclaimer' },
        { label: '网站地图', href: '/sitemap' },
      ],
    },
  ];

  // Social media links
  const socialLinks: SocialLink[] = [
    {
      name: '微信',
      href: '#',
      icon: 'M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z',
      color: 'hover:text-green-500',
    },
    {
      name: '微博',
      href: '#',
      icon: 'M9.29 16.29c-2.23.4-4.15-.47-4.29-1.95-.14-1.47 1.55-2.97 3.78-3.37 2.23-.4 4.15.47 4.29 1.95.14 1.47-1.55 2.97-3.78 3.37zm1.42-2.53c-.23-.41-.82-.6-1.32-.43-.49.17-.73.64-.5 1.05.23.41.82.6 1.32.43.49-.17.73-.64.5-1.05zm-1.03-.84c-.09-.15-.32-.22-.51-.16-.2.07-.3.26-.21.41.09.15.32.22.51.16.2-.07.3-.26.21-.41zm3.44 2.14c-.78-.14-1.45-.57-1.73-1.15-.38-.78.03-1.66.9-1.96.88-.3 1.9.13 2.28.91.38.78-.03 1.66-.9 1.96-.17.06-.35.09-.53.1h-.02zm.69-1.34c-.07-.13-.25-.19-.4-.14-.16.05-.23.2-.16.33.07.13.25.19.4.14.16-.05.23-.2.16-.33z',
      color: 'hover:text-red-500',
    },
    {
      name: 'QQ',
      href: '#',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      color: 'hover:text-blue-500',
    },
    {
      name: '抖音',
      href: '#',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      color: 'hover:text-black',
    },
    {
      name: 'B站',
      href: '#',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
      color: 'hover:text-pink-500',
    },
  ];

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { name: '支付宝', icon: '💰' },
    { name: '微信支付', icon: '💚' },
    { name: '银联', icon: '💳' },
    { name: 'PayPal', icon: '🅿️' },
    { name: '信用卡', icon: '💳' },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribeMessage('订阅成功！感谢您的关注。');
      setEmail('');
    } catch (error) {
      setSubscribeMessage('订阅失败，请稍后重试。');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className={cn('bg-gray-50 border-t border-gray-200', className)}>
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">
                🎉 订阅我们的新闻通讯
              </h3>
              <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                获取最新的技能服务趋势、独家优惠和平台动态，助力您的自由职业之旅
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱地址"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={isSubscribing}
                  loading={isSubscribing}
                  className="bg-white text-red-500 hover:bg-gray-100 font-semibold"
                >
                  {isSubscribing ? '订阅中...' : '立即订阅'}
                </Button>
              </form>
              {subscribeMessage && (
                <p className={cn(
                  'mt-4 text-sm',
                  subscribeMessage.includes('成功') ? 'text-green-100' : 'text-red-100'
                )}>
                  {subscribeMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Download Section */}
      {showAppDownload && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  📱 下载移动应用
                </h3>
                <p className="text-gray-600 mb-4">
                  随时随地管理您的服务订单，与客户保持联系
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#"
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  <span className="text-4xl">📱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Company Info - 4 columns */}
          <div className="lg:col-span-4">
            <Link to={ROUTES.HOME} className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                技
              </div>
              <span className="text-xl font-bold text-gray-900">技能集市</span>
            </Link>

            <p className="text-gray-600 mb-6 leading-relaxed">
              中国领先的技能服务与交易平台，连接优秀的服务提供者和需求方，
              创造价值共赢的生态系统。让每个人的技能都能发挥价值。
            </p>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">联系我们</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  <span>400-888-8888</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <span>service@jishimarket.com</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🕐</span>
                  <span>周一至周日 9:00-21:00</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>北京市朝阳区建国路88号</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">关注我们</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={cn(
                      'w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-200',
                      social.color,
                      'hover:shadow-md hover:scale-105'
                    )}
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Sections - 8 columns */}
          {footerSections.map((section, index) => (
            <div key={section.title} className={cn(
              'lg:col-span-2',
              index === 3 && 'lg:col-span-2'
            )}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2"
                      >
                        {link.label}
                        {link.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className={cn(
                          'text-sm text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2',
                          location.pathname === link.href && 'text-red-500 font-medium'
                        )}
                      >
                        {link.label}
                        {link.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">支付方式</h4>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-sm hover:border-red-300 transition-colors"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>ICP备案号：京ICP备12345678号</span>
              <span>京公网安备 11010502012345号</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2024 技能集市. 保留所有权利.
              <Link to="/licenses" className="ml-2 hover:text-gray-700">
                开源许可
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link to="/sitemap" className="text-gray-500 hover:text-gray-700">
                网站地图
              </Link>
              <Link to="/security" className="text-gray-500 hover:text-gray-700">
                安全认证
              </Link>
              <Link to="/business-license" className="text-gray-500 hover:text-gray-700">
                营业执照
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">网站版本:</span>
                <span className="text-gray-700 font-medium">v2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};