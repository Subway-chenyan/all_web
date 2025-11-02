import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">技</span>
              </div>
              <span className="text-xl font-bold">技能集市</span>
            </div>
            <p className="text-gray-300 mb-4">
              中国领先的自由职业者服务平台，连接人才与机会，创造价值。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">客户</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  如何工作
                </Link>
              </li>
              <li>
                <Link to="/find-freelancers" className="text-gray-300 hover:text-white transition-colors">
                  寻找自由职业者
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  服务分类
                </Link>
              </li>
              <li>
                <Link to="/fiverr-pro" className="text-gray-300 hover:text-white transition-colors">
                  专业服务
                </Link>
              </li>
              <li>
                <Link to="/fiverr-business" className="text-gray-300 hover:text-white transition-colors">
                  企业服务
                </Link>
              </li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">自由职业者</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/become-seller" className="text-gray-300 hover:text-white transition-colors">
                  成为卖家
                </Link>
              </li>
              <li>
                <Link to="/seller-guide" className="text-gray-300 hover:text-white transition-colors">
                  卖家指南
                </Link>
              </li>
              <li>
                <Link to="/seller-community" className="text-gray-300 hover:text-white transition-colors">
                  社区
                </Link>
              </li>
              <li>
                <Link to="/seller-protection" className="text-gray-300 hover:text-white transition-colors">
                  卖家保障
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-gray-300 hover:text-white transition-colors">
                  成功案例
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">支持</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  帮助中心
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  联系我们
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" className="text-gray-300 hover:text-white transition-colors">
                  信任与安全
                </Link>
              </li>
              <li>
                <Link to="/quality-standards" className="text-gray-300 hover:text-white transition-colors">
                  质量标准
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  服务条款
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Mail className="h-5 w-5 text-primary-400" />
              <span className="text-gray-300">support@jinengshiji.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Phone className="h-5 w-5 text-primary-400" />
              <span className="text-gray-300">400-123-4567</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <MapPin className="h-5 w-5 text-primary-400" />
              <span className="text-gray-300">北京市朝阳区建国路88号</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 技能集市. 保留所有权利.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                隐私政策
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                服务条款
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;