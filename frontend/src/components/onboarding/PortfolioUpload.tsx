import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Link2, Plus, X, Camera, Video, FileText } from 'lucide-react';
import { FreelancerProfile, PortfolioItem } from '../../types';

interface PortfolioUploadProps {
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}

const COMMON_TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
  'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Swift',
  'Kotlin', 'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'Google Cloud', 'Git', 'CI/CD', 'Agile',
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
  'After Effects', 'Premiere Pro', 'Final Cut Pro', 'Blender'
];

export const PortfolioUpload: React.FC<PortfolioUploadProps> = ({
  data,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem> & { tempId: string }>({
    tempId: Date.now().toString(),
    title: '',
    description: '',
    projectUrl: '',
    technologies: [],
    images: [] as File[],
    completedAt: new Date().toISOString().split('T')[0],
  });

  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB per image
    const maxImages = 10;

    if ((newItem.images?.length || 0) + imageFiles.length > maxImages) {
      alert(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    const validImages = imageFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} 不是支持的图片格式`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`${file.name} 大小超过 5MB`);
        return false;
      }

      return true;
    });

    const newImages = [...(newItem.images || []), ...validImages];
    handleInputChange('images', newImages);

    // Generate preview URLs
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setPreviewImages(newPreviews);
  }, [newItem.images, handleInputChange]);

  const removeImage = useCallback((index: number) => {
    const newImages = (newItem.images || []).filter((_, i) => i !== index);
    handleInputChange('images', newImages);

    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  }, [newItem.images, previewImages, handleInputChange]);

  const toggleTechnology = useCallback((tech: string) => {
    setSelectedTechnologies(prev => {
      const newTechs = prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech];

      handleInputChange('technologies', newTechs);
      return newTechs;
    });
  }, [handleInputChange]);

  const addPortfolioItem = useCallback(() => {
    if (!newItem.title?.trim()) {
      alert('请输入项目标题');
      return;
    }

    if (!newItem.description?.trim()) {
      alert('请输入项目描述');
      return;
    }

    if (!newItem.images || newItem.images.length === 0) {
      alert('请至少上传一张项目图片');
      return;
    }

    if (!newItem.technologies || newItem.technologies.length === 0) {
      alert('请选择使用的技术');
      return;
    }

    const portfolioItem: PortfolioItem = {
      id: Date.now().toString(),
      title: newItem.title!,
      description: newItem.description!,
      images: previewImages,
      projectUrl: newItem.projectUrl || undefined,
      technologies: newItem.technologies!,
      completedAt: newItem.completedAt || new Date().toISOString(),
    };

    const existingPortfolio = data.portfolio || [];
    onUpdate({
      ...data,
      portfolio: [...existingPortfolio, portfolioItem]
    });

    // Reset form
    setNewItem({
      tempId: Date.now().toString(),
      title: '',
      description: '',
      projectUrl: '',
      technologies: [],
      images: [],
      completedAt: new Date().toISOString().split('T')[0],
    });
    setSelectedTechnologies([]);
    setPreviewImages([]);
    setIsAdding(false);
  }, [newItem, previewImages, data, onUpdate]);

  const removePortfolioItem = useCallback((itemId: string) => {
    const existingPortfolio = data.portfolio || [];
    onUpdate({
      ...data,
      portfolio: existingPortfolio.filter(item => item.id !== itemId)
    });
  }, [data, onUpdate]);

  const currentPortfolio = data.portfolio || [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">作品集</h2>
        <p className="text-gray-600">
          展示您最优秀的项目作品，让客户更好地了解您的专业能力
        </p>
      </div>

      {/* Portfolio Stats */}
      {currentPortfolio.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">作品集统计</h3>
              <p className="text-sm text-gray-600">展示您的专业作品和项目经验</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{currentPortfolio.length}</div>
              <div className="text-sm text-gray-600">个项目</div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Portfolio Items */}
      {currentPortfolio.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">已上传的作品</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {currentPortfolio.map(item => (
              <div key={item.id} className="bg-white border rounded-lg overflow-hidden">
                {/* Image Preview */}
                <div className="aspect-video bg-gray-100 relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {item.images && item.images.length > 1 && (
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

                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.technologies.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{item.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {item.projectUrl && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Link2 className="w-3 h-3 mr-1" />
                      <span className="truncate">{item.projectUrl}</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    完成于 {new Date(item.completedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Portfolio Item Form */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">添加新作品</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目标题 *
            </label>
            <input
              type="text"
              value={newItem.title || ''}
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
              value={newItem.description || ''}
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
                value={newItem.projectUrl || ''}
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
                value={newItem.completedAt || ''}
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
                      selectedTechnologies.includes(tech)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
            {selectedTechnologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTechnologies.map(tech => (
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
              {previewImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
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
                  tempId: Date.now().toString(),
                  title: '',
                  description: '',
                  projectUrl: '',
                  technologies: [],
                  images: [],
                  completedAt: new Date().toISOString().split('T')[0],
                });
                setSelectedTechnologies([]);
                setPreviewImages([]);
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">作品集建议</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 选择您最优秀和最具代表性的项目</li>
              <li>• 提供清晰的项目描述和您的具体贡献</li>
              <li>• 上传高质量的项目截图或照片</li>
              <li>• 如有可能，提供项目链接或在线演示</li>
              <li>• 真实地标注使用的技术和工具</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};