import React, { useEffect } from 'react';
import { useFeaturedServices, useServicesLoading, useServicesError, useServicesStore } from '../../store';
import ServiceCard from './ServiceCard';
import { PageLoading } from '../ui/Loading';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const FeaturedServices: React.FC = () => {
  const featuredServices = useFeaturedServices();
  const isLoading = useServicesLoading();
  const error = useServicesError();
  const { fetchFeaturedServices } = useServicesStore.getState();

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  if (isLoading && !featuredServices.length) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageLoading text="加载精选服务中..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchFeaturedServices}>重试</Button>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredServices.length) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            精选服务
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现我们平台上最受欢迎和高质量的服务，来自经过验证的专业自由职业者
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              className="h-full"
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/services">
            <Button variant="outline" size="lg">
              查看所有服务
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;