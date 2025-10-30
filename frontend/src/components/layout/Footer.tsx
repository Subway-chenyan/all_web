import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">技能集市</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              中国领先的技能服务与交易平台，连接技能服务提供者和需求方，创造价值共赢的生态系统。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">微信</span>
                {/* WeChat icon */}
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">微博</span>
                {/* Weibo icon */}
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.29 16.29c-2.23.4-4.15-.47-4.29-1.95-.14-1.47 1.55-2.97 3.78-3.37 2.23-.4 4.15.47 4.29 1.95.14 1.47-1.55 2.97-3.78 3.37zm1.42-2.53c-.23-.41-.82-.6-1.32-.43-.49.17-.73.64-.5 1.05.23.41.82.6 1.32.43.49-.17.73-.64.5-1.05zm-1.03-.84c-.09-.15-.32-.22-.51-.16-.2.07-.3.26-.21.41.09.15.32.22.51.16.2-.07.3-.26.21-.41zm3.44 2.14c-.78-.14-1.45-.57-1.73-1.15-.38-.78.03-1.66.9-1.96.88-.3 1.9.13 2.28.91.38.78-.03 1.66-.9 1.96-.17.06-.35.09-.53.1h-.02zm.69-1.34c-.07-.13-.25-.19-.4-.14-.16.05-.23.2-.16.33.07.13.25.19.4.14.16-.05.23-.2.16-.33z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">QQ</span>
                {/* QQ icon */}
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.SERVICES} className="text-gray-600 hover:text-gray-900">
                  浏览服务
                </Link>
              </li>
              <li>
                <Link to="/become-seller" className="text-gray-600 hover:text-gray-900">
                  成为服务提供者
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900">
                  工作原理
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                  定价方案
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">支持</h4>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HELP} className="text-gray-600 hover:text-gray-900">
                  帮助中心
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="text-gray-600 hover:text-gray-900">
                  联系我们
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                  常见问题
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-gray-900">
                  社区论坛
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">法律</h4>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.TERMS} className="text-gray-600 hover:text-gray-900">
                  服务条款
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY} className="text-gray-600 hover:text-gray-900">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-gray-900">
                  Cookie 政策
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-600 hover:text-gray-900">
                  免责声明
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 技能集市. 保留所有权利.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                ICP备案号
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                营业执照
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};