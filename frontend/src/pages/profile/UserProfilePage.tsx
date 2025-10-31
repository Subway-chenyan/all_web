import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileHeader, ServiceShowcase, PortfolioGallery, ReviewSummary, ContactCard, VerificationBadges, SkillsDisplay, SocialProof } from '@/components/profile/public';
import { StatsCard } from '@/components/dashboard';
import { DollarSign, Users, Star, TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark, Flag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Mock data - in a real app, this would come from API
const mockProfileData = {
  name: '张明',
  title: '全栈开发工程师 & UI/UX 设计师',
  avatar: '/api/placeholder/200/200',
  coverImage: '/api/placeholder/1200/400',
  bio: '我是一名经验丰富的全栈开发工程师，拥有8年以上的开发经验。专注于React、Node.js和云原生应用开发。同时我也是一名UI/UX设计师，注重用户体验和界面美观。已成功完成200+项目，帮助客户实现他们的数字化目标。',
  location: '北京, 中国',
  joinedDate: new Date('2020-03-15'),
  rating: 4.9,
  totalReviews: 156,
  completedOrders: 234,
  responseTime: '1小时内',
  languages: ['中文', '英语', '日语'],
  verificationStatus: {
    email: true,
    phone: true,
    identity: true,
    professional: true,
  },
  badges: [
    {
      type: 'top_rated' as const,
      label: '顶级卖家',
      description: '平台评分最高的卖家之一',
    },
    {
      type: 'expert' as const,
      label: '专家认证',
      description: '经过专业认证的高级开发者',
    },
  ],
  contact: {
    email: 'zhangming@example.com',
    website: 'https://zhangming.dev',
  },
  totalEarnings: 1250000,
  totalClients: 189,
  repeatClientRate: 78,
  averageOrderValue: 5350,
  memberSince: new Date('2020-03-15'),
  certifications: ['AWS认证架构师', 'Google Cloud专业认证', 'Scrum Master认证'],
  featuredIn: ['科技日报', '创业邦', '36氪'],
};

const mockServices = [
  {
    id: '1',
    title: 'React应用开发 - 从零到部署',
    description: '专业的React应用开发服务，包括需求分析、设计、开发、测试和部署全流程',
    price: 5000,
    originalPrice: 6000,
    imageUrl: '/api/placeholder/400/300',
    category: 'Web开发',
    rating: 4.9,
    reviews: 45,
    orders: 67,
    deliveryTime: '7天',
    features: ['React Hooks', 'TypeScript', 'Redux', '响应式设计'],
    tags: ['React', 'TypeScript', 'Node.js'],
    isFeatured: true,
    seller: {
      name: '张明',
      avatar: '/api/placeholder/200/200',
      level: '顶级卖家',
    },
  },
  {
    id: '2',
    title: 'UI/UX设计服务',
    description: '专业的用户界面和用户体验设计，打造美观实用的产品',
    price: 3000,
    imageUrl: '/api/placeholder/400/300',
    category: '设计',
    rating: 4.8,
    reviews: 23,
    orders: 34,
    deliveryTime: '5天',
    features: ['Figma设计', '原型制作', '设计系统'],
    tags: ['UI设计', 'UX设计', 'Figma'],
    seller: {
      name: '张明',
      avatar: '/api/placeholder/200/200',
      level: '顶级卖家',
    },
  },
  {
    id: '3',
    title: 'Node.js后端API开发',
    description: '高性能的Node.js后端API开发，支持微服务架构',
    price: 4500,
    imageUrl: '/api/placeholder/400/300',
    category: '后端开发',
    rating: 4.9,
    reviews: 31,
    orders: 42,
    deliveryTime: '10天',
    features: ['Express.js', 'MongoDB', 'JWT认证', 'API文档'],
    tags: ['Node.js', 'Express', 'MongoDB'],
    seller: {
      name: '张明',
      avatar: '/api/placeholder/200/200',
      level: '顶级卖家',
    },
  },
];

const mockPortfolios = [
  {
    id: '1',
    title: '电商平台开发',
    description: '为某知名品牌开发的现代化电商平台，支持多语言、多货币',
    imageUrl: '/api/placeholder/600/400',
    category: 'Web开发',
    tags: ['React', 'Node.js', 'MongoDB', '电商'],
    projectUrl: 'https://example-ecommerce.com',
    client: '时尚品牌有限公司',
    completionDate: new Date('2024-01-15'),
    featured: true,
    likes: 45,
    views: 234,
  },
  {
    id: '2',
    title: '金融科技仪表板',
    description: '实时数据可视化的金融分析平台，支持多种图表和报表',
    imageUrl: '/api/placeholder/600/400',
    category: '数据可视化',
    tags: ['React', 'D3.js', 'WebSocket', '金融'],
    client: '金融科技创业公司',
    completionDate: new Date('2024-02-20'),
    likes: 38,
    views: 189,
  },
  {
    id: '3',
    title: '社交媒体应用设计',
    description: '为创业公司设计的全新社交媒体应用，注重用户体验',
    imageUrl: '/api/placeholder/600/400',
    category: 'UI/UX设计',
    tags: ['UI设计', 'UX研究', '移动端', '社交'],
    client: '科技创业公司',
    completionDate: new Date('2024-03-10'),
    likes: 52,
    views: 312,
  },
];

const mockReviews = [
  {
    id: '1',
    rating: 5,
    title: '非常专业的开发体验',
    content: '张明是一位非常专业的开发者，技术过硬，沟通顺畅。项目按时交付，质量超出预期。强烈推荐！',
    reviewer: {
      name: '李经理',
      level: '金牌买家',
    },
    serviceTitle: 'React应用开发 - 从零到部署',
    date: new Date('2024-03-15'),
    helpful: 12,
    verified: true,
    response: {
      content: '感谢您的信任和好评！很高兴能为您完成这个项目，期待未来的合作机会。',
      date: new Date('2024-03-16'),
    },
  },
  {
    id: '2',
    rating: 5,
    title: '设计水平很高',
    content: '设计作品非常有创意，很好地理解了我们的需求。修改也很及时，合作愉快！',
    reviewer: {
      name: '王总',
      level: '银牌买家',
    },
    serviceTitle: 'UI/UX设计服务',
    date: new Date('2024-03-10'),
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    rating: 4,
    title: '技术实力强',
    content: '技术能力很强，代码质量很好。希望能在项目沟通方面更主动一些。',
    reviewer: {
      name: '陈总',
      level: '铜牌买家',
    },
    serviceTitle: 'Node.js后端API开发',
    date: new Date('2024-03-05'),
    helpful: 6,
    verified: true,
    response: {
      content: '感谢您的反馈！我会注意加强项目沟通，确保信息同步及时。',
      date: new Date('2024-03-06'),
    },
  },
];

const mockSkills = [
  {
    id: '1',
    name: 'React.js',
    level: 5,
    category: '前端开发',
    experience: '5年以上',
    description: '精通React生态系统，包括Hooks、Redux、Next.js等',
    endorsements: 23,
    featured: true,
  },
  {
    id: '2',
    name: 'Node.js',
    level: 5,
    category: '后端开发',
    experience: '4年以上',
    description: '熟练使用Node.js构建高性能后端服务',
    endorsements: 18,
  },
  {
    id: '3',
    name: 'TypeScript',
    level: 4,
    category: '编程语言',
    experience: '3年以上',
    description: '熟练使用TypeScript进行类型安全的开发',
    endorsements: 15,
  },
  {
    id: '4',
    name: 'UI/UX设计',
    level: 4,
    category: '设计',
    experience: '3年以上',
    description: '具备良好的设计审美和用户体验思维',
    endorsements: 12,
  },
  {
    id: '5',
    name: 'MongoDB',
    level: 4,
    category: '数据库',
    experience: '3年以上',
    description: '熟练使用MongoDB进行数据建模和优化',
    endorsements: 10,
  },
];

const mockBadges = [
  {
    type: 'identity' as const,
    label: '身份认证',
    description: '已通过实名认证',
    verified: true,
    verifiedDate: new Date('2020-03-20'),
  },
  {
    type: 'email' as const,
    label: '邮箱认证',
    description: '已验证邮箱地址',
    verified: true,
    verifiedDate: new Date('2020-03-15'),
  },
  {
    type: 'phone' as const,
    label: '手机认证',
    description: '已验证手机号码',
    verified: true,
    verifiedDate: new Date('2020-03-16'),
  },
  {
    type: 'professional' as const,
    label: '专业认证',
    description: '已通过专业技能认证',
    verified: true,
    verifiedDate: new Date('2020-06-15'),
  },
  {
    type: 'top_rated' as const,
    label: '顶级卖家',
    description: '平台评分最高的卖家之一',
    verified: true,
    verifiedDate: new Date('2023-01-01'),
  },
];

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  // In a real app, fetch user data based on id
  const profileData = mockProfileData;

  const handleContactClick = () => {
    // Handle contact action
    console.log('Contact seller');
  };

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    // Handle share action
    if (navigator.share) {
      navigator.share({
        title: `${profileData.name} - ${profileData.title}`,
        text: profileData.bio,
        url: window.location.href,
      });
    }
  };

  const handleBookmark = () => {
    // Handle bookmark action
    console.log('Bookmark profile');
  };

  const handleReport = () => {
    // Handle report action
    console.log('Report profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{profileData.name} - {profileData.title} | 自由职业者平台</title>
        <meta name="description" content={profileData.bio} />
        <meta name="keywords" content={`${profileData.name}, ${profileData.title}, 全栈开发, UI设计, React, Node.js`} />
        <meta property="og:title" content={`${profileData.name} - ${profileData.title}`} />
        <meta property="og:description" content={profileData.bio} />
        <meta property="og:image" content={profileData.avatar} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Profile Header */}
      <ProfileHeader
        profile={profileData}
        onContactClick={handleContactClick}
        onFollowClick={handleFollowClick}
        isFollowing={isFollowing}
        isOwnProfile={false}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <ContactCard
              profile={{
                name: profileData.name,
                avatar: profileData.avatar,
                responseTime: profileData.responseTime,
                lastOnline: new Date(),
                languages: profileData.languages,
                contactMethods: {
                  email: true,
                  phone: true,
                  chat: true,
                },
              }}
              onContactClick={handleContactClick}
            />

            {/* Stats Overview */}
            <div className="space-y-4">
              <StatsCard
                title="总收入"
                value={`¥${(profileData.totalEarnings! / 10000).toFixed(1)}万`}
                icon={DollarSign}
                iconColor="text-green-600"
                bgColor="bg-green-50"
              />
              <StatsCard
                title="服务客户"
                value={profileData.totalClients!}
                icon={Users}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="评分"
                value={profileData.rating.toFixed(1)}
                icon={Star}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-50"
              />
              <StatsCard
                title="回头客率"
                value={`${profileData.repeatClientRate}%`}
                icon={TrendingUp}
                iconColor="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Verification Badges */}
            <VerificationBadges
              badges={mockBadges}
              layout="compact"
              showUnverified={false}
            />

            {/* Social Proof */}
            <SocialProof
              profile={profileData}
              layout="compact"
              showEarnings={true}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === 'services'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    服务 ({mockServices.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === 'portfolio'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    作品集 ({mockPortfolios.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === 'reviews'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    评价 ({mockReviews.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleReport}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Display */}
            <SkillsDisplay
              skills={mockSkills}
              title="技能专长"
              showEndorsements={true}
              showLevel={true}
              groupByCategory={true}
            />

            {/* Tab Content */}
            {activeTab === 'services' && (
              <ServiceShowcase
                services={mockServices}
                title="提供服务"
                showSearch={true}
                showFilters={true}
                onServiceClick={(service) => console.log('View service:', service)}
                onContactClick={(seller) => console.log('Contact seller:', seller)}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioGallery
                portfolios={mockPortfolios}
                title="作品展示"
                showFilters={true}
                showCategories={true}
                onPortfolioClick={(portfolio) => console.log('View portfolio:', portfolio)}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewSummary
                reviews={mockReviews}
                title="客户评价"
                showFilters={true}
                showSearch={true}
                onReviewClick={(review) => console.log('View review:', review)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;