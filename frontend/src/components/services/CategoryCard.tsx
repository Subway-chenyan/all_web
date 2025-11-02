import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { Card, CardContent } from '../ui/Card';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  return (
    <Link to={`/services?category=${category.id}`} className={className}>
      <Card hover padding="lg" className="text-center group">
        <CardContent>
          {/* Category Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-200">
            <span className="text-2xl">{category.icon}</span>
          </div>

          {/* Category Name */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>

          {/* Category Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {category.description}
          </p>

          {/* Service Count */}
          <div className="text-xs text-gray-500">
            {category.serviceCount} 个服务
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;