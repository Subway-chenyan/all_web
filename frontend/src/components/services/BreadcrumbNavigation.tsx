import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = ''
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const generateSchemaData = () => {
    const itemList = [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('home'),
        item: window.location.origin
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? `${window.location.origin}${item.href}` : undefined
      }))
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemList
    };
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(generateSchemaData())}
      </script>

      <nav
        className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
        aria-label={t('breadcrumb')}
      >
        {/* Home Link */}
        <Link
          to="/"
          className="flex items-center hover:text-gray-900 transition-colors duration-200"
          aria-label={t('goToHome')}
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Breadcrumb Items */}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

            {item.href && !item.isActive ? (
              <Link
                to={item.href}
                className="hover:text-gray-900 transition-colors duration-200 truncate max-w-xs"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-medium truncate max-w-xs ${
                  item.isActive ? 'text-gray-900' : 'text-gray-700'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

// Hook to generate breadcrumb items for service pages
export const useServiceBreadcrumbs = (
  categoryName?: string,
  subcategoryName?: string,
  serviceTitle?: string
): BreadcrumbItem[] => {
  const { t } = useTranslation();

  const items: BreadcrumbItem[] = [];

  // Services
  items.push({
    label: t('services'),
    href: '/services'
  });

  // Category
  if (categoryName) {
    items.push({
      label: categoryName,
      href: `/services?category=${encodeURIComponent(categoryName.toLowerCase())}`
    });
  }

  // Subcategory
  if (subcategoryName) {
    items.push({
      label: subcategoryName,
      href: `/services?subcategory=${encodeURIComponent(subcategoryName.toLowerCase())}`
    });
  }

  // Service Title
  if (serviceTitle) {
    items.push({
      label: serviceTitle,
      isActive: true
    });
  }

  return items;
};

export default BreadcrumbNavigation;