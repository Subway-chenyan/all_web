import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Plus,
  X,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Upload,
  Calendar,
  Tag,
  Play,
  Maximize2,
  Check,
  AlertCircle,
  Star,
  Grid,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import type { PortfolioItem, PortfolioMedia } from '@/types/profile';

interface PortfolioManagerProps {
  portfolio: PortfolioItem[];
  onChange: (portfolio: PortfolioItem[]) => void;
  maxItems?: number;
  maxImagesPerItem?: number;
  enableVideo?: boolean;
  enableDocuments?: boolean;
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const COMMON_TAGS = [
  'Web Design', 'Mobile App', 'UI/UX', 'Branding', 'Logo Design',
  'Frontend', 'Backend', 'Full Stack', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'E-commerce', 'SaaS', 'Mobile First',
  'Responsive', 'Animation', 'Illustration', 'Photography', 'Video'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_IMAGES_PER_ITEM = 10;

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolio,
  onChange,
  maxItems = 20,
  maxImagesPerItem = MAX_IMAGES_PER_ITEM,
  enableVideo = true,
  enableDocuments = true
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    images: [],
    projectUrl: '',
    technologies: [],
    completedAt: new Date().toISOString().split('T')[0]
  });

  const handleAddItem = useCallback(() => {
    if (!newItem.title?.trim()) {
      toast.error(t('profile.portfolio.titleRequired'));
      return;
    }

    if (portfolio.length >= maxItems) {
      toast.error(t('profile.portfolio.maxReached', { max: maxItems }));
      return;
    }

    const portfolioItem: PortfolioItem = {
      id: Date.now().toString(),
      title: newItem.title!,
      description: newItem.description || '',
      images: newItem.images || [],
      projectUrl: newItem.projectUrl || '',
      technologies: newItem.technologies || [],
      completedAt: newItem.completedAt || new Date().toISOString()
    };

    onChange([...portfolio, portfolioItem]);
    setNewItem({
      title: '',
      description: '',
      images: [],
      projectUrl: '',
      technologies: [],
      completedAt: new Date().toISOString().split('T')[0]
    });
    setIsAddingItem(false);
    toast.success(t('profile.portfolio.itemAdded'));
  }, [newItem, portfolio, onChange, maxItems, t]);

  const handleUpdateItem = useCallback(() => {
    if (!editingItem || !editingItem.title?.trim()) {
      toast.error(t('profile.portfolio.titleRequired'));
      return;
    }

    const updatedPortfolio = portfolio.map(item =>
      item.id === editingItem.id ? editingItem : item
    );
    onChange(updatedPortfolio);
    setEditingItem(null);
    toast.success(t('profile.portfolio.itemUpdated'));
  }, [editingItem, portfolio, onChange, t]);

  const handleDeleteItem = useCallback((itemId: string) => {
    const updatedPortfolio = portfolio.filter(item => item.id !== itemId);
    onChange(updatedPortfolio);
    toast.success(t('profile.portfolio.itemDeleted'));
  }, [portfolio, onChange, t]);

  const handleFileUpload = useCallback(async (files: FileList | null, targetItem: Partial<PortfolioItem>) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      const isValidType = [
        ...SUPPORTED_IMAGE_TYPES,
        ...(enableVideo ? SUPPORTED_VIDEO_TYPES : []),
        ...(enableDocuments ? SUPPORTED_DOCUMENT_TYPES : [])
      ].includes(file.type);

      const isValidSize = file.size <= MAX_FILE_SIZE;

      if (!isValidType) {
        setUploadErrors(prev => [...prev, t('profile.portfolio.invalidFileType', { fileName: file.name })]);
        return false;
      }

      if (!isValidSize) {
        setUploadErrors(prev => [...prev, t('profile.portfolio.fileTooLarge', { fileName: file.name })]);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const currentImages = targetItem.images || [];
    if (currentImages.length + validFiles.length > maxImagesPerItem) {
      toast.error(t('profile.portfolio.tooManyFiles', { max: maxImagesPerItem }));
      return;
    }

    // Simulate file upload
    for (const file of validFiles) {
      const fileId = `${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }

        // Create file URL (in production, this would be the URL from the server)
        const fileUrl = URL.createObjectURL(file);
        const updatedImages = [...currentImages, fileUrl];

        if (targetItem.id) {
          // Update existing item
          setEditingItem(prev => prev ? { ...prev, images: updatedImages } : null);
        } else {
          // Update new item
          setNewItem(prev => ({ ...prev, images: updatedImages }));
        }

        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });

      } catch (error) {
        console.error('Upload error:', error);
        setUploadErrors(prev => [...prev, t('profile.portfolio.uploadError', { fileName: file.name })]);
      }
    }
  }, [enableVideo, enableDocuments, maxImagesPerItem, t]);

  const handlePreviewItem = useCallback((item: PortfolioItem) => {
    setPreviewItem(item);
    setShowPreviewDialog(true);
  }, []);

  const handleAddTag = useCallback((tag: string, targetItem: Partial<PortfolioItem>) => {
    if (!tag.trim()) return;

    const currentTags = targetItem.technologies || [];
    if (currentTags.includes(tag)) return;

    const updatedTags = [...currentTags, tag];

    if (targetItem.id) {
      setEditingItem(prev => prev ? { ...prev, technologies: updatedTags } : null);
    } else {
      setNewItem(prev => ({ ...prev, technologies: updatedTags }));
    }
  }, []);

  const handleRemoveTag = useCallback((tag: string, targetItem: Partial<PortfolioItem>) => {
    const currentTags = targetItem.technologies || [];
    const updatedTags = currentTags.filter(t => t !== tag);

    if (targetItem.id) {
      setEditingItem(prev => prev ? { ...prev, technologies: updatedTags } : null);
    } else {
      setNewItem(prev => ({ ...prev, technologies: updatedTags }));
    }
  }, []);

  const getMediaType = (url: string): 'image' | 'video' | 'document' => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'video';
    if (url.match(/\.(pdf|doc|docx)$/i)) return 'document';
    return 'image';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const sortedPortfolio = [...portfolio].sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t('profile.portfolio.title')}
              <Badge variant="outline">{portfolio.length}</Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button
                    disabled={portfolio.length >= maxItems}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('profile.portfolio.addItem')}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('profile.portfolio.addNewItem')}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{t('profile.portfolio.title')} *</Label>
                        <Input
                          id="title"
                          value={newItem.title || ''}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          placeholder={t('profile.portfolio.title.placeholder')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">{t('profile.portfolio.description')}</Label>
                        <Textarea
                          id="description"
                          value={newItem.description || ''}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder={t('profile.portfolio.description.placeholder')}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="projectUrl">{t('profile.portfolio.projectUrl')}</Label>
                          <Input
                            id="projectUrl"
                            type="url"
                            value={newItem.projectUrl || ''}
                            onChange={(e) => setNewItem({ ...newItem, projectUrl: e.target.value })}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="completedAt">{t('profile.portfolio.completedAt')}</Label>
                          <Input
                            id="completedAt"
                            type="date"
                            value={newItem.completedAt || ''}
                            onChange={(e) => setNewItem({ ...newItem, completedAt: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-4">
                      <Label>{t('profile.portfolio.media')}</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="text-lg font-medium">{t('profile.portfolio.uploadMedia')}</p>
                            <p className="text-sm text-gray-600">
                              {t('profile.portfolio.uploadDescription')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t('profile.portfolio.supportedFormats')} • {t('profile.portfolio.maxSize', { size: '10MB' })}
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={[...SUPPORTED_IMAGE_TYPES, ...(enableVideo ? SUPPORTED_VIDEO_TYPES : [])].join(',')}
                            onChange={(e) => handleFileUpload(e.target.files, newItem)}
                            className="hidden"
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4"
                          >
                            {t('profile.portfolio.selectFiles')}
                          </Button>
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {Object.entries(uploadProgress).map(([fileId, progress]) => (
                        <div key={fileId} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{t('profile.portfolio.uploading')}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      ))}

                      {/* Preview Uploaded Images */}
                      {newItem.images && newItem.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {newItem.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                {getMediaType(image) === 'image' ? (
                                  <img
                                    src={image}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : getMediaType(image) === 'video' ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-8 w-8 text-gray-400" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const updatedImages = newItem.images?.filter((_, i) => i !== index) || [];
                                  setNewItem({ ...newItem, images: updatedImages });
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Technologies */}
                    <div className="space-y-4">
                      <Label>{t('profile.portfolio.technologies')}</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {newItem.technologies?.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => handleRemoveTag(tech, newItem)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_TAGS.filter(tag => !newItem.technologies?.includes(tag)).slice(0, 8).map(tag => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTag(tag, newItem)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                      <Input
                        placeholder={t('profile.portfolio.addCustomTag')}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            handleAddTag(target.value, newItem);
                            target.value = '';
                          }
                        }}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleAddItem}>
                        {t('profile.portfolio.addItem')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {portfolio.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t('profile.portfolio.noItems')}</h3>
              <p className="text-sm mb-4">{t('profile.portfolio.noItems.description')}</p>
              <Button onClick={() => setIsAddingItem(true)}>
                {t('profile.portfolio.addFirstItem')}
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {sortedPortfolio.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div className="group">
                        {/* Media Preview */}
                        <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100 relative">
                          {item.images.length > 0 ? (
                            getMediaType(item.images[0]) === 'image' ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-12 w-12 text-gray-400" />
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-300" />
                            </div>
                          )}

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handlePreviewItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Multiple Images Indicator */}
                          {item.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              +{item.images.length - 1} {t('profile.portfolio.moreImages')}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Technologies */}
                          {item.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.technologies.slice(0, 3).map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {item.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatDate(item.completedAt)}</span>
                            {item.projectUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => window.open(item.projectUrl, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="p-6">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.images.length > 0 ? (
                              getMediaType(item.images[0]) === 'image' ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="h-8 w-8 text-gray-400" />
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreviewItem(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Technologies */}
                            {item.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.technologies.slice(0, 5).map((tech, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {item.technologies.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.technologies.length - 5}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatDate(item.completedAt)}</span>
                              <div className="flex items-center gap-2">
                                {item.images.length > 0 && (
                                  <span>{item.images.length} {t('profile.portfolio.images')}</span>
                                )}
                                {item.projectUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => window.open(item.projectUrl, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {previewItem && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewItem.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Media Gallery */}
              {previewItem.images.length > 0 && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {getMediaType(previewItem.images[0]) === 'image' ? (
                      <img
                        src={previewItem.images[0]}
                        alt={previewItem.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          src={previewItem.images[0]}
                          controls
                          className="max-w-full max-h-full"
                        />
                      </div>
                    )}
                  </div>

                  {previewItem.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {previewItem.images.slice(1).map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-blue-500">
                          {getMediaType(image) === 'image' ? (
                            <img
                              src={image}
                              alt={`${previewItem.title} ${index + 2}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                {previewItem.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('profile.portfolio.description')}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{previewItem.description}</p>
                  </div>
                )}

                {previewItem.technologies.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('profile.portfolio.technologies')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {t('profile.portfolio.completedOn')}: {formatDate(previewItem.completedAt)}
                  </span>
                  {previewItem.projectUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(previewItem.projectUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('profile.portfolio.visitProject')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {uploadErrors.map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('profile.portfolio.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.portfolio.tips.highQuality')}</li>
              <li>• {t('profile.portfolio.tips.showVariety')}</li>
              <li>• {t('profile.portfolio.tips.describeWork')}</li>
              <li>• {t('profile.portfolio.tips.useTags')}</li>
              <li>• {t('profile.portfolio.tips.keepUpdated')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};