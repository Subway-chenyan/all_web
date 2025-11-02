import React from 'react';
import { cn } from '@/utils';

// 纯 Tailwind CSS 卡片组件
export interface CardProps {
  variant?: 'default' | 'bordered' | 'shadow' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
}) => {
  // 获取基础样式
  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-200';

  // 根据 variant 获取样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 bg-white';
      case 'shadow':
        return 'bg-white shadow-md hover:shadow-lg';
      case 'elevated':
        return 'bg-white shadow-lg hover:shadow-xl';
      case 'flat':
        return 'bg-gray-50';
      default:
        return 'bg-white shadow-chinese hover:shadow-chinese-lg';
    }
  };

  // 根据 padding 获取样式
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-5';
      case 'lg':
        return 'p-8';
      default:
        return 'p-5';
    }
  };

  return (
    <div
      className={cn(
        baseStyles,
        getVariantStyles(),
        getPaddingStyles(),
        hover && 'transform hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
};

// Card Header 组件
interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  extra,
  className = '',
  children
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between pb-4 border-b border-gray-200',
      className
    )}>
      <div className="flex-1">
        {title && (
          <div className="text-lg font-semibold text-gray-900 leading-chinese">
            {title}
          </div>
        )}
        {subtitle && (
          <div className="text-sm text-gray-500 mt-1 leading-chinese">
            {subtitle}
          </div>
        )}
        {children}
      </div>
      {extra && (
        <div className="ml-4 flex-shrink-0">
          {extra}
        </div>
      )}
    </div>
  );
};

// Card Body 组件
interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children
}) => {
  return (
    <div className={cn(
      'leading-chinese',
      className
    )}>
      {children}
    </div>
  );
};

// Card Footer 组件
interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between pt-4 mt-4 border-t border-gray-200 bg-gray-50/50 -m-5 px-5 pb-5',
      className
    )}>
      {children}
    </div>
  );
};

// 服务卡片专用组件
interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
    imageUrl?: string;
    seller: {
      name: string;
      avatar?: string;
      level: string;
    };
  };
  onFavorite?: (id: number) => void;
  onContact?: (sellerId: number) => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onFavorite,
  onContact,
  className = ''
}) => {
  return (
    <Card
      variant="shadow"
      hover
      className={cn('group cursor-pointer', className)}
      padding="md"
    >
      <div className="relative">
        {/* 服务图片 */}
        {service.imageUrl && (
          <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg -m-5 mb-4">
            <img
              src={service.imageUrl}
              alt={service.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardHeader className="pb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2 leading-chinese">
              {service.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 leading-chinese mb-2">
              {service.description}
            </p>
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          {/* 卖家信息 */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">{service.seller.name}</div>
              <div className="text-xs text-gray-500">{service.seller.level}</div>
            </div>
          </div>

          {/* 评分信息 */}
          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-400 mr-2">
              {'★'.repeat(Math.floor(service.rating))}
              {'☆'.repeat(5 - Math.floor(service.rating))}
            </div>
            <span className="text-sm text-gray-600">
              {service.rating} ({service.reviews}条评价)
            </span>
          </div>

          {/* 价格 */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-red-500">
              ¥{service.price}
            </div>
            <div className="flex gap-2">
              {onFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(service.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              {onContact && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(service.seller.id);
                  }}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  联系卖家
                </button>
              )}
            </div>
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Service = ServiceCard;

export { Card };
export default Card;