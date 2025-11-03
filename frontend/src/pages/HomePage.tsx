import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play, ArrowRight, Star, TrendingUp, Shield, Users } from 'lucide-react';
import { useCategories, useServicesLoading, useServicesError, useServicesStore } from '../store';
import MainLayout from '../components/layout/MainLayout';
import CategoryCard from '../components/services/CategoryCard';
import FeaturedServices from '../components/services/FeaturedServices';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PageLoading } from '../components/ui/Loading';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const categories = useCategories();
  const isLoading = useServicesLoading();
  const error = useServicesError();
  const { fetchCategories } = useServicesStore.getState();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implement newsletter subscription
      alert('感谢您的订阅！我们会定期向您发送最新的服务和优惠信息。');
      setEmail('');
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center">
            <h1 className="hero-title">
              发现专业人才，
              <br />
              <span className="text-green-400">实现创意项目</span>
            </h1>
            <p className="hero-subtitle">
              连接中国最优秀的自由职业者，获得卓越的服务质量和成果
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-container">
              <input
                type="text"
                placeholder="搜索设计、编程、写作、营销等任何服务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="category-pills">
              <span className="text-gray-500 text-sm font-medium">热门搜索:</span>
              {['Logo设计', '网站开发', '内容写作', '视频剪辑', '数据分析'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/services?search=${encodeURIComponent(term)}`);
                  }}
                  className="category-pill"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white border-b border-gray-200">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10万+</div>
              <div className="stat-label">专业自由职业者</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50万+</div>
              <div className="stat-label">成功订单</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">平均评分</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">客户支持</div>
            </div>
          </div>
        </div>
      </section>

        {/* Categories Section */}
      <section className="section bg-gray-50">
        <div className="container">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              浏览服务分类
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              从设计开发到写作营销，找到您需要的专业技能
            </p>
          </div>

          {/* Categories Grid */}
          {isLoading && !categories.length ? (
            <PageLoading text="加载分类中..." />
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchCategories} className="btn btn-primary">
                重试
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 12).map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  className="h-full"
                />
              ))}
            </div>
          )}

          {/* View All Categories */}
          <div className="text-center mt-8">
            <Link to="/categories">
              <button className="btn btn-outline btn-large">
                查看所有分类
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <FeaturedServices />

      {/* How It Works Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              如何使用技能集市
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              简单三步，找到专业的服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="card-body">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  1. 搜索服务
                </h3>
                <p className="text-gray-600">
                  浏览或搜索您需要的服务类型，查看卖家的资料和评价
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="card-body">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  2. 联系卖家
                </h3>
                <p className="text-gray-600">
                  与卖家沟通需求，确认服务细节和时间安排
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="card-body">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  3. 安全交易
                </h3>
                <p className="text-gray-600">
                  通过平台安全付款，确认满意后资金才会释放给卖家
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                为什么选择技能集市？
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      质量保证
                    </h3>
                    <p className="text-gray-600">
                      所有卖家都经过严格筛选，确保提供高质量的专业服务
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      安全保障
                    </h3>
                    <p className="text-gray-600">
                      采用第三方托管付款，保护买家和卖家的权益
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      成长支持
                    </h3>
                    <p className="text-gray-600">
                      为自由职业者提供培训资源和成长机会
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      7x24支持
                    </h3>
                    <p className="text-gray-600">
                      专业的客服团队随时为您解决问题
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/how-it-works">
                  <Button size="lg">
                    了解更多
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                  alt="远程工作"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
                  <Play className="h-6 w-6 text-primary-600 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            准备开始您的项目？
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            立即发布需求，获得专业人才的报价
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/post-request">
              <Button size="lg" variant="secondary">
                发布需求
              </Button>
            </Link>
            <Link to="/become-seller">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                成为卖家
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              订阅我们的通讯
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              获取最新的服务推荐、专业见解和独家优惠
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="输入您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">
                订阅
              </Button>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              我们尊重您的隐私，随时可以取消订阅
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;