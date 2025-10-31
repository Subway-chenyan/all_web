# Service Detail Components

This directory contains comprehensive components for displaying service details in the Chinese freelance marketplace platform.

## Overview

The service detail system provides a complete user experience for browsing, evaluating, and purchasing freelance services. It includes gallery viewing, package selection, seller information, reviews, FAQs, and ordering functionality.

## Components

### 1. ServiceDetailPage
**Location**: `/src/pages/services/ServiceDetailPage.tsx`

Main page component that orchestrates all service detail functionality.

**Features**:
- SEO optimization with structured data
- Service view tracking
- Recently viewed services management
- Social sharing functionality
- Modal management for contact and order flows
- Responsive design with mobile-first approach

**Usage**:
```tsx
// Route configuration
<Route path="/services/:serviceId" element={<ServiceDetailPage />} />
```

### 2. BreadcrumbNavigation
**Location**: `/src/components/services/BreadcrumbNavigation.tsx`

Provides navigation breadcrumbs with structured data for SEO.

**Features**:
- Schema.org structured data
- Accessibility support (ARIA labels)
- Keyboard navigation
- Responsive truncation

**Usage**:
```tsx
<BreadcrumbNavigation
  items={[
    { label: '服务', href: '/services' },
    { label: '设计', href: '/services?category=design' },
    { label: 'Logo设计', isActive: true }
  ]}
/>
```

### 3. ServiceGallery
**Location**: `/src/components/services/ServiceGallery.tsx`

Advanced gallery component with zoom and video support.

**Features**:
- Image zoom with mouse wheel support
- Video playback
- Fullscreen mode
- Thumbnail navigation
- Download functionality
- Keyboard shortcuts (arrows, escape, +/-)
- Lazy loading for performance

**Usage**:
```tsx
<ServiceGallery
  items={[
    {
      id: 1,
      type: 'image',
      url: 'https://example.com/image1.jpg',
      thumbnail: 'https://example.com/thumb1.jpg',
      caption: '示例作品'
    }
  ]}
/>
```

### 4. ServicePricing
**Location**: `/src/components/services/ServicePricing.tsx`

Package selection and comparison component.

**Features**:
- Single/multiple package support
- Package comparison modal
- Interactive selection states
- Responsive grid layout
- Popular package highlighting

**Usage**:
```tsx
<ServicePricing
  packages={servicePackages}
  selectedPackage={selectedId}
  onPackageSelect={handleSelect}
  currency="CNY"
/>
```

### 5. SellerProfileCard
**Location**: `/src/components/services/SellerProfileCard.tsx`

Comprehensive seller information display.

**Features**:
- Avatar and verification status
- Ratings and statistics
- Skills and languages
- Badges and achievements
- Contact and profile links
- Trust indicators

**Usage**:
```tsx
<SellerProfileCard
  seller={sellerData}
  sellerProfile={sellerProfileData}
/>
```

### 6. ServiceDescription
**Location**: `/src/components/services/ServiceDescription.tsx`

Rich content display for service details.

**Features**:
- Collapsible sections
- File attachments
- Video gallery
- Feature lists
- Delivery information

**Usage**:
```tsx
<ServiceDescription
  title="服务详情"
  description={serviceDescription}
  features={serviceFeatures}
  files={attachments}
  videos={demoVideos}
/>
```

### 7. ServiceFAQs
**Location**: `/src/components/services/ServiceFAQs.tsx`

Interactive FAQ component with search and voting.

**Features**:
- Accordion-style expansion
- Search functionality
- Helpful voting
- Follow-up questions
- Expand/collapse all controls

**Usage**:
```tsx
<ServiceFAQs
  faqs={serviceFaqs}
  onHelpfulClick={handleVote}
  onQuestionClick={handleQuestion}
/>
```

### 8. ServiceReviews
**Location**: `/src/components/services/ServiceReviews.tsx`

Complete review system with filtering and pagination.

**Features**:
- Review filtering and sorting
- Rating distribution
- Pagination with page size control
- Helpful voting
- Seller responses
- Search within reviews

**Usage**:
```tsx
<ServiceReviews
  serviceId={serviceId}
  averageRating={4.5}
  totalReviews={128}
/>
```

### 9. RelatedServices
**Location**: `/src/components/services/RelatedServices.tsx`

Related services recommendation component.

**Features**:
- Grid/list layout
- Service cards with hover effects
- Quick view support
- Category display
- Responsive design

**Usage**:
```tsx
<RelatedServices
  services={relatedServices}
  title="相关服务推荐"
/>
```

### 10. ContactSeller
**Location**: `/src/components/services/ContactSeller.tsx`

Modal for contacting sellers with rich form support.

**Features**:
- Quick question templates
- File attachments
- Drag and drop support
- Form validation
- Budget and timeline inputs
- Loading states

**Usage**:
```tsx
<ContactSeller
  serviceId={serviceId}
  serviceTitle={serviceTitle}
  sellerId={sellerId}
  sellerName={sellerName}
  isOpen={isModalOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
/>
```

### 11. OrderNow
**Location**: `/src/components/services/OrderNow.tsx`

Multi-step order creation wizard.

**Features**:
- Step-by-step process
- Package selection
- Requirements form
- File uploads
- Order review
- Form validation
- Progress indicators

**Usage**:
```tsx
<OrderNow
  serviceId={serviceId}
  serviceTitle={serviceTitle}
  packages={packages}
  requirements={requirements}
  isOpen={isOrderOpen}
  onClose={handleClose}
  onSuccess={handleOrderSuccess}
/>
```

## Review System Components

### ReviewCard
**Location**: `/src/components/reviews/ReviewCard.tsx`

Individual review display with interaction features.

**Features**:
- Rating display
- Reviewer information
- Helpful voting
- Reply functionality
- Report options
- Seller responses

### ReviewSummary
**Location**: `/src/components/reviews/ReviewSummary.tsx`

Review statistics and rating distribution.

**Features**:
- Average rating display
- Rating distribution bars
- Review count
- Trust indicators

### ReviewFilter
**Location**: `/src/components/reviews/ReviewFilter.tsx`

Review filtering and search interface.

**Features**:
- Rating filters
- Search functionality
- Sort options
- Active filter display
- Clear filters action

### ReviewPagination
**Location**: `/src/components/reviews/ReviewPagination.tsx`

Pagination controls for review lists.

**Features**:
- Page navigation
- Page size selection
- Jump to page
- Results summary

## API Integration

### Service API
**Location**: `/src/services/services.ts`

Complete API service for service-related operations.

**Key Functions**:
- `getServiceDetail()` - Fetch service details
- `getServiceReviews()` - Get service reviews
- `getServiceFAQs()` - Get service FAQs
- `getRelatedServices()` - Get related services
- `contactSeller()` - Contact seller
- `createOrder()` - Create order
- `addToFavorites()` - Add to favorites
- `trackView()` - Track service views

## TypeScript Types

### ServiceDetail
Extended service type with additional properties:
```typescript
interface ServiceDetail extends Service {
  packages: ServicePackage[];
  requirements: ServiceRequirement[];
  faqs: ServiceFAQ[];
  sellerProfile: UserProfile;
  gallery: ServiceGalleryItem[];
  statistics: ServiceStatistics;
  relatedServices: Service[];
  isFavorited: boolean;
}
```

### ServiceFAQ
```typescript
interface ServiceFAQ {
  id: number;
  service: number;
  question: string;
  answer: string;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
}
```

### ServiceStatistics
```typescript
interface ServiceStatistics {
  views: number;
  likes: number;
  shares: number;
  bookmarks: number;
  averageResponseTime: number;
  completionRate: number;
  onTimeDelivery: number;
  repeatCustomers: number;
}
```

## Styling

### CSS Classes
Components use Tailwind CSS with consistent utility classes:
- `bg-white` - White backgrounds
- `rounded-lg` - Consistent border radius
- `shadow-sm` - Subtle shadows
- `border-gray-200` - Standard borders
- `text-gray-900` - Primary text color
- `hover:bg-gray-50` - Hover states

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Grid layouts for main content
- Stack layouts on mobile

### Print Styles
**Location**: `/src/styles/print.css`

Print-friendly styles for service details:
- Hides navigation and modals
- Optimizes images and tables
- Maintains content structure
- Includes watermarks/branding

## Accessibility

Features implemented:
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader support
- High contrast support
- Semantic HTML structure

## Performance Optimizations

- Lazy loading for images
- Code splitting for components
- Optimized bundle sizes
- Efficient re-renders with React.memo
- Debounced search inputs
- Virtual scrolling for large lists

## Internationalization

Components support Chinese localization:
- Complete translation coverage
- Date/time formatting
- Currency formatting
- Number formatting
- RTL support (if needed)

## Testing

Recommended test coverage:
- Unit tests for components
- Integration tests for API calls
- E2E tests for user flows
- Accessibility testing
- Performance testing
- Cross-browser testing

## Security Considerations

- XSS prevention in rich content
- File upload validation
- CSRF protection
- Input sanitization
- Secure API communication

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Progressive enhancement
- Graceful degradation

## Future Enhancements

Potential improvements:
- Real-time chat integration
- Video calling features
- AI-powered recommendations
- Advanced search filters
- Social login integration
- Multi-language support
- Dark mode support
- PWA capabilities