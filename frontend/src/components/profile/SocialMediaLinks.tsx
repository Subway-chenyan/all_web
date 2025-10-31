import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Share2,
  Plus,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Camera,
  Music,
  Gamepad2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

import type { SocialMediaLink } from '@/types/profile';

interface SocialMediaLinksProps {
  socialLinks: SocialMediaLink[];
  onChange: (socialLinks: SocialMediaLink[]) => void;
  maxLinks?: number;
  showVerification?: boolean;
  enableVisibilityControl?: boolean;
}

const SOCIAL_PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
    placeholder: 'https://linkedin.com/in/username',
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    description: 'Professional networking platform'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-gray-800',
    placeholder: 'https://github.com/username',
    pattern: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
    description: 'Code repository platform'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500',
    placeholder: 'https://twitter.com/username',
    pattern: /^https?:\/\/(www\.)?twitter\.com\/[\w-]+\/?$/,
    description: 'Microblogging platform'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-600',
    placeholder: 'https://instagram.com/username',
    pattern: /^https?:\/\/(www\.)?instagram\.com\/[\w-]+\/?$/,
    description: 'Photo and video sharing'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    placeholder: 'https://youtube.com/channel/username',
    pattern: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|@)?[\w-]+\/?$/,
    description: 'Video sharing platform'
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: Camera,
    color: 'bg-blue-500',
    placeholder: 'https://behance.net/username',
    pattern: /^https?:\/\/(www\.)?behance\.net\/[\w-]+\/?$/,
    description: 'Creative portfolio platform'
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: Gamepad2,
    color: 'bg-pink-500',
    placeholder: 'https://dribbble.com/username',
    pattern: /^https?:\/\/(www\.)?dribbble\.com\/[\w-]+\/?$/,
    description: 'Design showcase platform'
  },
  {
    id: 'wechat',
    name: '微信',
    icon: MessageCircle,
    color: 'bg-green-600',
    placeholder: 'WeChat ID or QR code image',
    pattern: null, // Custom validation for WeChat
    description: 'Chinese messaging app'
  },
  {
    id: 'weibo',
    name: '微博',
    icon: Camera,
    color: 'bg-red-500',
    placeholder: 'https://weibo.com/username',
    pattern: /^https?:\/\/(www\.)?weibo\.com\/[\w-]+\/?$/,
    description: 'Chinese microblogging platform'
  },
  {
    id: 'qq',
    name: 'QQ',
    icon: MessageCircle,
    color: 'bg-blue-500',
    placeholder: 'QQ number',
    pattern: /^\d{5,11}$/,
    description: 'Chinese messaging app'
  },
  {
    id: 'website',
    name: 'Personal Website',
    icon: Globe,
    color: 'bg-purple-600',
    placeholder: 'https://yourwebsite.com',
    pattern: /^https?:\/\/.+\..+/,
    description: 'Personal portfolio or website'
  }
];

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  socialLinks,
  onChange,
  maxLinks = 10,
  showVerification = false,
  enableVisibilityControl = true
}) => {
  const { t } = useTranslation();
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [newLink, setNewLink] = useState<Partial<SocialMediaLink>>({
    platform: 'github',
    url: '',
    username: '',
    followers: 0,
    isVerified: false
  });

  const validateSocialLink = useCallback((platform: string, url: string): boolean => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === platform);
    if (!platformConfig) return false;

    if (platform === 'wechat' || platform === 'qq') {
      // Custom validation for WeChat and QQ
      return url.trim().length > 0;
    }

    if (platformConfig.pattern) {
      return platformConfig.pattern.test(url);
    }

    // Basic URL validation for other platforms
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const extractUsername = useCallback((platform: string, url: string): string => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === platform);
    if (!platformConfig) return '';

    if (platform === 'wechat' || platform === 'qq') {
      return url.trim(); // For WeChat ID or QQ number
    }

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Extract username from different URL patterns
      switch (platform) {
        case 'linkedin':
          const linkedinMatch = pathname.match(/\/in\/([\w-]+)/);
          return linkedinMatch ? linkedinMatch[1] : '';

        case 'github':
          const githubMatch = pathname.match(/\/([\w-]+)/);
          return githubMatch ? githubMatch[1] : '';

        case 'twitter':
        case 'instagram':
        case 'behance':
        case 'dribbble':
          const socialMatch = pathname.match(/\/([\w-]+)/);
          return socialMatch ? socialMatch[1] : '';

        case 'youtube':
          const youtubeMatch = pathname.match(/\/(channel\/|c\/|@)?([\w-]+)/);
          return youtubeMatch ? youtubeMatch[2] : '';

        case 'weibo':
          const weiboMatch = pathname.match(/\/([\w-]+)/);
          return weiboMatch ? weiboMatch[1] : '';

        default:
          return '';
      }
    } catch {
      return '';
    }
  }, []);

  const handleAddLink = useCallback(() => {
    if (!newLink.url?.trim()) {
      toast.error(t('profile.social.urlRequired'));
      return;
    }

    if (!validateSocialLink(newLink.platform!, newLink.url)) {
      toast.error(t('profile.social.invalidUrl'));
      return;
    }

    if (socialLinks.some(link => link.platform === newLink.platform)) {
      toast.error(t('profile.social.platformExists'));
      return;
    }

    if (socialLinks.length >= maxLinks) {
      toast.error(t('profile.social.maxReached', { max: maxLinks }));
      return;
    }

    const username = extractUsername(newLink.platform!, newLink.url);

    const socialLink: SocialMediaLink = {
      platform: newLink.platform as any,
      url: newLink.url!,
      username: username || newLink.username || '',
      followers: newLink.followers || 0,
      isVerified: newLink.isVerified || false
    };

    onChange([...socialLinks, socialLink]);
    setNewLink({
      platform: 'github',
      url: '',
      username: '',
      followers: 0,
      isVerified: false
    });
    setIsAddingLink(false);
    toast.success(t('profile.social.linkAdded'));
  }, [newLink, socialLinks, onChange, maxLinks, validateSocialLink, extractUsername, t]);

  const handleUpdateLink = useCallback(() => {
    if (!editingLink || !editingLink.url?.trim()) {
      toast.error(t('profile.social.urlRequired'));
      return;
    }

    if (!validateSocialLink(editingLink.platform, editingLink.url)) {
      toast.error(t('profile.social.invalidUrl'));
      return;
    }

    const username = extractUsername(editingLink.platform, editingLink.url);
    const updatedLink = {
      ...editingLink,
      username: username || editingLink.username
    };

    const updatedLinks = socialLinks.map(link =>
      link.platform === editingLink.platform ? updatedLink : link
    );
    onChange(updatedLinks);
    setEditingLink(null);
    toast.success(t('profile.social.linkUpdated'));
  }, [editingLink, socialLinks, onChange, validateSocialLink, extractUsername, t]);

  const handleDeleteLink = useCallback((platform: string) => {
    const updatedLinks = socialLinks.filter(link => link.platform !== platform);
    onChange(updatedLinks);
    toast.success(t('profile.social.linkDeleted'));
  }, [socialLinks, onChange, t]);

  const getPlatformIcon = (platform: string) => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === platform);
    return platformConfig ? platformConfig.icon : Globe;
  };

  const getPlatformInfo = (platform: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platform) || {
      name: platform,
      icon: Globe,
      color: 'bg-gray-600',
      placeholder: '',
      pattern: null,
      description: ''
    };
  };

  const getDisplayUrl = (url: string, platform: string) => {
    if (platform === 'wechat' || platform === 'qq') {
      return url;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => !socialLinks.some(link => link.platform === platform.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {t('profile.social.title')}
              <Badge variant="outline">{socialLinks.length}</Badge>
            </CardTitle>

            <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
              <DialogTrigger asChild>
                <Button
                  disabled={socialLinks.length >= maxLinks || availablePlatforms.length === 0}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('profile.social.addLink')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('profile.social.addNewLink')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('profile.social.platform')}</Label>
                    <Select
                      value={newLink.platform}
                      onValueChange={(value) => setNewLink({ ...newLink, platform: value, url: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlatforms.map(platform => {
                          const Icon = platform.icon;
                          return (
                            <SelectItem key={platform.id} value={platform.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{platform.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {newLink.platform && (
                      <p className="text-xs text-gray-500">
                        {getPlatformInfo(newLink.platform).description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">{t('profile.social.url')}</Label>
                    <Input
                      id="url"
                      value={newLink.url || ''}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder={getPlatformInfo(newLink.platform || '').placeholder}
                    />
                    <p className="text-xs text-gray-500">
                      {t('profile.social.urlHelp')}
                    </p>
                  </div>

                  {enableVisibilityControl && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="showFollowers"
                        checked={newLink.followers !== undefined}
                        onCheckedChange={(checked) =>
                          setNewLink({ ...newLink, followers: checked ? 0 : undefined })
                        }
                      />
                      <Label htmlFor="showFollowers" className="text-sm">
                        {t('profile.social.showFollowers')}
                      </Label>
                    </div>
                  )}

                  {newLink.followers !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="followers">{t('profile.social.followers')}</Label>
                      <Input
                        id="followers"
                        type="number"
                        min="0"
                        value={newLink.followers}
                        onChange={(e) => setNewLink({ ...newLink, followers: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAddLink}>
                      {t('common.add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {socialLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t('profile.social.noLinks')}</h3>
              <p className="text-sm mb-4">{t('profile.social.noLinks.description')}</p>
              <Button onClick={() => setIsAddingLink(true)}>
                {t('profile.social.addFirstLink')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {socialLinks.map(link => {
                const platformInfo = getPlatformInfo(link.platform);
                const Icon = platformInfo.icon;

                return (
                  <Card key={link.platform} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Platform Icon */}
                        <div className={`w-12 h-12 ${platformInfo.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Link Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {platformInfo.name}
                            </h3>
                            {link.isVerified && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Check className="h-3 w-3 mr-1" />
                                {t('profile.social.verified')}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <span className="font-medium">@{link.username}</span>
                            {link.followers !== undefined && link.followers > 0 && (
                              <>
                                <span>•</span>
                                <span>{link.followers.toLocaleString()} {t('profile.social.followers')}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {getDisplayUrl(link.url, link.platform)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLink(link)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.platform)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Available Platforms */}
          {availablePlatforms.length > 0 && socialLinks.length < maxLinks && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">
                {t('profile.social.availablePlatforms')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.slice(0, 6).map(platform => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewLink({ ...newLink, platform: platform.id, url: '' });
                        setIsAddingLink(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {platform.name}
                    </Button>
                  );
                })}
                {availablePlatforms.length > 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingLink(true)}
                  >
                    +{availablePlatforms.length - 6} {t('common.more')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Link Dialog */}
      {editingLink && (
        <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('profile.social.editLink')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.social.platform')}</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {React.createElement(getPlatformIcon(editingLink.platform), {
                    className: 'h-4 w-4'
                  })}
                  <span>{getPlatformInfo(editingLink.platform).name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editUrl">{t('profile.social.url')}</Label>
                <Input
                  id="editUrl"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  placeholder={getPlatformInfo(editingLink.platform).placeholder}
                />
              </div>

              {enableVisibilityControl && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="editShowFollowers"
                    checked={editingLink.followers !== undefined}
                    onCheckedChange={(checked) =>
                      setEditingLink({ ...editingLink, followers: checked ? 0 : undefined })
                    }
                  />
                  <Label htmlFor="editShowFollowers" className="text-sm">
                    {t('profile.social.showFollowers')}
                  </Label>
                </div>
              )}

              {editingLink.followers !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="editFollowers">{t('profile.social.followers')}</Label>
                  <Input
                    id="editFollowers"
                    type="number"
                    min="0"
                    value={editingLink.followers}
                    onChange={(e) => setEditingLink({ ...editingLink, followers: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingLink(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdateLink}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('profile.social.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.social.tips.useRealUrls')}</li>
              <li>• {t('profile.social.tips.keepUpdated')}</li>
              <li>• {t('profile.social.tips.beProfessional')}</li>
              <li>• {t('profile.social.tips.showcaseWork')}</li>
              <li>• {t('profile.social.tips.privacyAware')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};