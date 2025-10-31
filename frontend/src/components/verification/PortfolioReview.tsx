import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Link2, Plus, X, Camera, Video } from 'lucide-react';
import { verificationService } from '../../services/verification';
import { PortfolioItem } from '../../types';

interface PortfolioReviewProps {
  onPortfolioUpdate: (portfolio: PortfolioItem[]) => void;
  onVerificationError: (error: string) => void;
}

interface PortfolioForm {
  id: string;
  title: string;
  description: string;
  projectUrl: string;
  technologies: string[];
  images: File[];
  completedAt: string;
}

const COMMON_TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
  'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Swift',
  'Kotlin', 'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'Google Cloud', 'Git', 'CI/CD', 'Agile'
];

export const PortfolioReview: React.FC<PortfolioReviewProps> = ({
  onPortfolioUpdate,
  onVerificationError,
}) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioForm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [newItem, setNewItem] = useState<PortfolioForm>({
    id: Date.now().toString(),
    title: '',
    description: '',
    projectUrl: '',
    technologies: [],
    images: [],
    completedAt: '',
  });

  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  const handleInputChange = useCallback((
    field: keyof PortfolioForm,
    value: string | File[] | string[]
  ) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB per image
    const maxImages = 10;

    if (newItem.images.length + imageFiles.length > maxImages) {
      onVerificationError(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    const validImages = imageFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        onVerificationError(`${file.name} 不是支持的图片格式`);
        return false;
      }

      if (file.size > maxSize) {
        onVerificationError(`${file.name} 大小超过 5MB`);
        return false;
      }

      return true;
    });

    handleInputChange('images', [...newItem.images, ...validImages]);
  }, [newItem.images, handleInputChange, onVerificationError]);

  const removeImage = useCallback((index: number) => {
    setNewItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleTechnology = useCallback((tech: string) => {
    setSelectedTechs(prev => {
      const newTechs = prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech];

      handleInputChange('technologies', newTechs);
      return newTechs;
    });
  }, [handleInputChange]);

  const addPortfolioItem = useCallback(() => {
    // Validate required fields
    if (!newItem.title.trim()) {
      onVerificationError('请输入项目标题');
      return;
    }

    if (!newItem.description.trim()) {
      onVerificationError('请输入项目描述');
      return;
    }

    if (newItem.images.length === 0) {
      onVerificationError('请至少上传一张项目图片');
      return;
    }

    if (newItem.technologies.length === 0) {
      onVerificationError('请选择使用的技术');
      return;
    }

    setPortfolioItems(prev => [...prev, newItem]);
    setNewItem({
      id: Date.now().toString(),
      title: '',
      description: '',
      projectUrl: '',
      technologies: [],
      images: [],
      completedAt: '',
    });
    setSelectedTechs([]);
    setIsAdding(false);
  }, [newItem, onVerificationError]);

  const removePortfolioItem = useCallback((id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const uploadPortfolio = useCallback(async () => {
    if (portfolioItems.length === 0) {
      onVerificationError('请至少添加一个作品集项目');
      return;
    }

    setIsUploading(true);

    try {
      const uploadedItems: PortfolioItem[] = [];

      for (const item of portfolioItems) {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [item.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const uploadedItem = await verificationService.uploadPortfolioItem(
          item.title,
          item.description,
          item.images,
          item.technologies,
          item.projectUrl || undefined
        );

        uploadedItems.push({
          ...uploadedItem,
          completedAt: item.completedAt || new Date().toISOString(),
        });
      }

      onPortfolioUpdate(uploadedItems);

    } catch (error: any) {
      onVerificationError(error.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [portfolioItems, onPortfolioUpdate, onVerificationError]);

  const PortfolioCard: React.FC<{ item: PortfolioForm }> = ({ item }) => (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Image Preview */}
      <div className="aspect-video bg-gray-100 relative">
        {item.images.length > 0 ? (
          <img
            src={URL.createObjectURL(item.images[0])}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {item.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            +{item.images.length - 1}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
          <button
            onClick={() => removePortfolioItem(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

        {item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {item.projectUrl && (
          <div className="flex items-center text-sm text-blue-600">
            <Link2 className="w-3 h-3 mr-1" />
            <span className="truncate">{item.projectUrl}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{item.images.length} 张图片</span>
          {item.completedAt && <span>完成于 {item.completedAt}</span>}
        </div>

        {uploadProgress[item.id] !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress[item.id]}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Video className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">作品集要求</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• 展示您最优秀的项目作品</li>
              <li>• 提供清晰的项目描述和使用的技术</li>
              <li>• 上传高质量的项目截图或照片</li>
              <li>• 确保项目能够体现您的专业技能</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Existing Portfolio Items */}
      {portfolioItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">已添加的作品</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioItems.map(item => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Add New Portfolio Item Form */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">添加作品集项目</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目标题 *
            </label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：电商网站开发"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目描述 *
            </label>
            <textarea
              value={newItem.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="详细描述项目的目标、您的职责、遇到的挑战和解决方案..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                项目链接
              </label>
              <input
                type="url"
                value={newItem.projectUrl}
                onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                完成时间
              </label>
              <input
                type="date"
                value={newItem.completedAt}
                onChange={(e) => handleInputChange('completedAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Technologies Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用的技术 *
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {COMMON_TECHNOLOGIES.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTechnology(tech)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTechs.includes(tech)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
            {selectedTechs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTechs.map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目图片 *
            </label>
            <div className="space-y-3">
              {newItem.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {newItem.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleImageSelect(e.target.files)}
                  className="hidden"
                  id="portfolio-images"
                />
                <label
                  htmlFor="portfolio-images"
                  className="cursor-pointer flex flex-col items-center justify-center py-4"
                >
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    点击上传项目图片
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    最多 10 张，支持 JPG、PNG、WebP，单张不超过 5MB
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewItem({
                  id: Date.now().toString(),
                  title: '',
                  description: '',
                  projectUrl: '',
                  technologies: [],
                  images: [],
                  completedAt: '',
                });
                setSelectedTechs([]);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={addPortfolioItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加作品
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加作品集项目
        </button>
      )}

      {/* Upload Button */}
      {portfolioItems.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={uploadPortfolio}
            disabled={isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? '上传中...' : '提交作品集'}
          </button>
        </div>
      )}
    </div>
  );
};