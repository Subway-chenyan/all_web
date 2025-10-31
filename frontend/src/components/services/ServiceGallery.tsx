import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, X, Download } from 'lucide-react';

interface ServiceGalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  order: number;
}

interface ServiceGalleryProps {
  items: ServiceGalleryItem[];
  className?: string;
}

export const ServiceGallery: React.FC<ServiceGalleryProps> = ({
  items,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const currentItem = items[currentIndex];
  const hasMultipleItems = items.length > 1;

  useEffect(() => {
    setIsLoading(true);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handlePrevious = () => {
    if (hasMultipleItems) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const handleNext = () => {
    if (hasMultipleItems) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (isZoomed) {
          setIsZoomed(false);
          setZoomLevel(1);
        }
        break;
      case '+':
      case '=':
        if (isZoomed) {
          setZoomLevel((prev) => Math.min(prev + 0.5, 3));
        }
        break;
      case '-':
      case '_':
        if (isZoomed) {
          setZoomLevel((prev) => Math.max(prev - 0.5, 1));
        }
        break;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleZoomToggle = () => {
    if (currentItem?.type === 'image') {
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        setZoomLevel(2);
      } else {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isZoomed) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.max(1, Math.min(3, prev + delta)));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isZoomed && zoomLevel > 1) {
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
        setPosition({ x, y });
      }
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDownload = async () => {
    if (currentItem?.type === 'image') {
      try {
        const response = await fetch(currentItem.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `service-image-${currentItem.id}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsZoomed(false);
    setZoomLevel(1);
  };

  if (!items.length) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400">暂无图片</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Gallery */}
      <div className="relative group">
        <div
          ref={imageRef}
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          tabIndex={0}
          role="img"
          aria-label={`Gallery item ${currentIndex + 1} of ${items.length}`}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Image/Video Content */}
          {currentItem?.type === 'image' ? (
            <img
              src={currentItem.url}
              alt={currentItem.caption || `Service image ${currentIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}%, ${position.y}%)`,
                transformOrigin: 'center'
              }}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          ) : (
            <video
              src={currentItem.url}
              className="w-full h-full object-cover"
              controls
              onLoadStart={handleImageLoad}
              onCanPlay={handleImageLoad}
            >
              您的浏览器不支持视频播放
            </video>
          )}

          {/* Navigation Arrows */}
          {hasMultipleItems && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {currentItem?.type === 'image' && (
              <>
                <button
                  onClick={handleZoomToggle}
                  className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                  aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                  aria-label="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={openFullscreen}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
              aria-label="Fullscreen"
            >
              <ChevronRight className="w-4 h-4 rotate-45" />
            </button>
          </div>

          {/* Image Counter */}
          {hasMultipleItems && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {items.length}
            </div>
          )}
        </div>

        {/* Caption */}
        {currentItem?.caption && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
            {currentItem.caption}
          </p>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleItems && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Go to image ${index + 1}`}
              aria-pressed={index === currentIndex}
            >
              {item.type === 'image' ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                  <Play className="w-6 h-6 text-gray-600" />
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={`Video thumbnail ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {currentItem?.type === 'image' ? (
              <img
                src={currentItem.url}
                alt={currentItem.caption || `Service image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentItem.url}
                className="max-w-full max-h-full"
                controls
                autoPlay
              >
                您的浏览器不支持视频播放
              </video>
            )}
          </div>

          {hasMultipleItems && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceGallery;