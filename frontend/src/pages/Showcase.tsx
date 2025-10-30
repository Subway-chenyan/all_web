import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useI18n } from '@/i18n';

const ShowcasePage: React.FC = () => {
  const { t, formatCurrency } = useI18n();

  // 模拟服务数据
  const mockService = {
    id: 1,
    title: '专业Logo设计服务，为您的品牌打造独特形象',
    description: '拥有10年设计经验的专业设计师，为您提供高质量、原创的Logo设计服务。包含多款初稿选择，无限修改直到满意为止。',
    price: 299,
    rating: 4.8,
    reviews: 156,
    imageUrl: '/api/placeholder/400/300',
    seller: {
      id: 1,
      name: '张设计师',
      level: '顶级卖家',
      avatar: '/api/placeholder/40/40'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-chinese">
            中文自由职业平台 - 组件展示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-chinese">
            基于 Tailwind CSS 构建的现代化中文用户界面组件库
          </p>
        </div>

        {/* 按钮组件展示 */}
        <Card className="mb-8">
          <Card.Header title="按钮组件展示" />
          <Card.Body>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">边框按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="danger">危险按钮</Button>
              <Button variant="success">成功按钮</Button>
            </div>

            <div className="border-t pt-6 mb-6">
              <div className="flex flex-wrap gap-4">
                <Button size="sm" variant="primary">小按钮</Button>
                <Button size="md" variant="primary">中按钮</Button>
                <Button size="lg" variant="primary">大按钮</Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-4">
                <Button loading variant="primary">加载中</Button>
                <Button disabled variant="primary">禁用状态</Button>
                <Button fullWidth variant="primary">全宽按钮</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 卡片组件展示 */}
        <Card className="mb-8">
          <Card.Header title="卡片组件展示" />
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="default" hover>
                <Card.Header
                  title="默认卡片"
                  subtitle="基础的卡片样式"
                />
                <Card.Body>
                  <p className="text-gray-600 leading-chinese">
                    这是一个默认样式的卡片组件，基于 Tailwind CSS 构建。
                  </p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant="primary">查看更多</Button>
                </Card.Footer>
              </Card>

              <Card variant="shadow" hover>
                <Card.Header
                  title="阴影卡片"
                  subtitle="带阴影效果的卡片"
                />
                <Card.Body>
                  <p className="text-gray-600 leading-chinese">
                    这个卡片具有阴影效果，鼠标悬停时会有动画过渡。
                  </p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant="outline">查看更多</Button>
                </Card.Footer>
              </Card>

              <Card variant="elevated" hover>
                <Card.Header
                  title="立体卡片"
                  subtitle="更明显的阴影效果"
                />
                <Card.Body>
                  <p className="text-gray-600 leading-chinese">
                    这个卡片有更明显的阴影效果，适合突出重要内容。
                  </p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant="ghost">查看更多</Button>
                </Card.Footer>
              </Card>
            </div>
          </Card.Body>
        </Card>

        {/* 服务卡片展示 */}
        <Card className="mb-8">
          <Card.Header title="服务卡片展示" />
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card.Service
                service={mockService}
                onFavorite={(id) => console.log('收藏服务:', id)}
                onContact={(sellerId) => console.log('联系卖家:', sellerId)}
              />

              <Card.Service
                service={{
                  ...mockService,
                  id: 2,
                  title: '专业网站开发，响应式设计',
                  price: 1999,
                  rating: 4.9,
                  reviews: 89,
                  seller: {
                    ...mockService.seller,
                    id: 2,
                    name: '李开发',
                    level: '专业卖家'
                  }
                }}
                onFavorite={(id) => console.log('收藏服务:', id)}
                onContact={(sellerId) => console.log('联系卖家:', sellerId)}
              />

              <Card.Service
                service={{
                  ...mockService,
                  id: 3,
                  title: '文案撰写，品牌故事创作',
                  description: '专业的文案撰写服务，为您打造动人的品牌故事，提升品牌影响力。',
                  price: 599,
                  rating: 4.7,
                  reviews: 234,
                  seller: {
                    ...mockService.seller,
                    id: 3,
                    name: '王文案',
                    level: '优秀卖家'
                  }
                }}
                onFavorite={(id) => console.log('收藏服务:', id)}
                onContact={(sellerId) => console.log('联系卖家:', sellerId)}
              />
            </div>
          </Card.Body>
        </Card>

        {/* 响应式布局展示 */}
        <Card>
          <Card.Header
            title="响应式布局展示"
            subtitle="适配各种设备尺寸"
          />
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-100"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {item}
                    </div>
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">响应式项目 {item}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-chinese">
                    这个项目会根据屏幕尺寸自动调整布局，在手机、平板和桌面设备上都能完美显示。
                  </p>
                  <Button size="sm" variant="primary" fullWidth>
                    了解详情
                  </Button>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* 设计系统特性 */}
        <Card className="mt-8">
          <Card.Header
            title="设计系统特性"
            subtitle="针对中文用户优化的设计系统"
          />
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">中文字体优化</h3>
                  <p className="text-gray-600 leading-chinese">
                    使用 PingFang SC、Microsoft YaHei 等中文字体，确保在各个平台上的最佳显示效果。
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">色彩搭配</h3>
                  <p className="text-gray-600 leading-chinese">
                    采用中国红作为主色调，搭配金色和专业的灰色，符合中国用户的审美偏好。
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">间距和布局</h3>
                  <p className="text-gray-600 leading-chinese">
                    针对中文内容的特点优化了行高、字间距和段落间距，提升阅读体验。
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">移动优先</h3>
                  <p className="text-gray-600 leading-chinese">
                    采用移动优先的设计理念，确保在手机端有优秀的用户体验。
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">无障碍设计</h3>
                  <p className="text-gray-600 leading-chinese">
                    遵循无障碍设计原则，确保所有用户都能方便地使用平台。
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">性能优化</h3>
                  <p className="text-gray-600 leading-chinese">
                    使用 Tailwind CSS 的 JIT 模式和 Tree Shaking，确保最佳的加载性能。
                  </p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ShowcasePage;