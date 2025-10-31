import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Eye,
  EyeOff,
  Users,
  Lock,
  Globe,
  Search,
  Bell,
  MessageSquare,
  Check,
  AlertTriangle,
  Info,
  UserCheck,
  UserX,
  Settings,
  Smartphone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

import type { PrivacySettings as PrivacySettingsType } from '@/types/profile';

interface PrivacySettingsProps {
  settings: PrivacySettingsType;
  onChange: (settings: PrivacySettingsType) => void;
  showAdvanced?: boolean;
}

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: '公开',
    description: '所有人都可以查看您的个人资料',
    icon: Globe,
    color: 'text-green-600'
  },
  {
    value: 'clients_only',
    label: '仅客户',
    description: '只有与您有业务往来的用户可以查看',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    value: 'private',
    label: '私密',
    description: '只有您可以查看个人资料',
    icon: Lock,
    color: 'text-red-600'
  }
];

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings,
  onChange,
  showAdvanced = true
}) => {
  const { t } = useTranslation();
  const [hasChanges, setHasChanges] = useState(false);
  const [showDataExportDialog, setShowDataExportDialog] = useState(false);
  const [showBlockedListDialog, setShowBlockedListDialog] = useState(false);

  const handleSettingChange = useCallback((key: keyof PrivacySettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onChange(newSettings);
    setHasChanges(true);
  }, [settings, onChange]);

  const handleSaveSettings = useCallback(() => {
    // TODO: Save settings to API
    setHasChanges(false);
    toast.success(t('profile.privacy.settingsSaved'));
  }, [t]);

  const getVisibilityIcon = (visibility: string) => {
    const option = VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
    return option ? option.icon : Globe;
  };

  const getVisibilityColor = (visibility: string) => {
    const option = VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
    return option ? option.color : 'text-gray-600';
  };

  const privacyLevel = settings.profileVisibility === 'private' ? 'high' :
                      settings.profileVisibility === 'clients_only' ? 'medium' : 'low';

  const getPrivacyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrivacyLevelText = (level: string) => {
    switch (level) {
      case 'high': return t('profile.privacy.levels.high');
      case 'medium': return t('profile.privacy.levels.medium');
      case 'low': return t('profile.privacy.levels.low');
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('profile.privacy.title')}
            </CardTitle>

            <div className="flex items-center gap-3">
              {/* Privacy Level Indicator */}
              <Badge variant="outline" className={getPrivacyLevelColor(privacyLevel)}>
                {getPrivacyIcon(settings.profileVisibility)}
                <span className="ml-1">{getPrivacyLevelText(privacyLevel)}</span>
              </Badge>

              {hasChanges && (
                <Button onClick={handleSaveSettings}>
                  <Check className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </Button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {t('profile.privacy.description')}
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="visibility" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visibility">{t('profile.privacy.tabs.visibility')}</TabsTrigger>
          <TabsTrigger value="profile">{t('profile.privacy.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="communication">{t('profile.privacy.tabs.communication')}</TabsTrigger>
          {showAdvanced && <TabsTrigger value="advanced">{t('profile.privacy.tabs.advanced')}</TabsTrigger>}
        </TabsList>

        {/* Visibility Settings */}
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('profile.privacy.profileVisibility')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {VISIBILITY_OPTIONS.map(option => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        settings.profileVisibility === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSettingChange('profileVisibility', option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${option.color}`} />
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300">
                          {settings.profileVisibility === option.value && (
                            <div className="w-full h-full rounded-full bg-blue-600"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('profile.privacy.visibilityNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Search and Discovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('profile.privacy.searchDiscovery')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.privacy.allowSearch')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.privacy.allowSearch.description')}</p>
                </div>
                <Switch
                  checked={settings.allowSearch}
                  onCheckedChange={(checked) => handleSettingChange('allowSearch', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.privacy.allowRecommendations')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.privacy.allowRecommendations.description')}</p>
                </div>
                <Switch
                  checked={settings.allowRecommendations}
                  onCheckedChange={(checked) => handleSettingChange('allowRecommendations', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Information */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {t('profile.privacy.profileInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Email Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showEmail')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showEmail.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <Separator />

                {/* Phone Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showPhone')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showPhone.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                  />
                </div>

                <Separator />

                {/* Location Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showLocation')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showLocation.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
                  />
                </div>

                <Separator />

                {/* Website Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showWebsite')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showWebsite.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showWebsite}
                    onCheckedChange={(checked) => handleSettingChange('showWebsite', checked)}
                  />
                </div>

                <Separator />

                {/* Social Media Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showSocialMedia')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showSocialMedia.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showSocialMedia}
                    onCheckedChange={(checked) => handleSettingChange('showSocialMedia', checked)}
                  />
                </div>

                <Separator />

                {/* Portfolio Visibility */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showPortfolio')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showPortfolio.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showPortfolio}
                    onCheckedChange={(checked) => handleSettingChange('showPortfolio', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Settings */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('profile.privacy.communication')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.privacy.allowMessages')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.privacy.allowMessages.description')}</p>
                </div>
                <Switch
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
                />
              </div>

              {settings.allowMessages && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <Label className="font-medium mb-2 block">
                    {t('profile.privacy.whoCanMessage')}
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('profile.privacy.everyone')}</SelectItem>
                      <SelectItem value="clients">{t('profile.privacy.clientsOnly')}</SelectItem>
                      <SelectItem value="verified">{t('profile.privacy.verifiedOnly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.privacy.showContactInfo')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.privacy.showContactInfo.description')}</p>
                  </div>
                  <Switch
                    checked={settings.showContactInfo}
                    onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
                  />
                </div>

                {settings.showContactInfo && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t('profile.privacy.contactInfoWarning')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        {showAdvanced && (
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('profile.privacy.advanced')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data Export */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('profile.privacy.dataExport')}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('profile.privacy.dataExport.description')}
                  </p>
                  <Dialog open={showDataExportDialog} onOpenChange={setShowDataExportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Smartphone className="h-4 w-4 mr-2" />
                        {t('profile.privacy.exportData')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('profile.privacy.exportData')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('profile.privacy.exportData.confirmation')}
                        </p>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            {t('profile.privacy.exportData.profile')}
                          </Label>
                          <Label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            {t('profile.privacy.exportData.portfolio')}
                          </Label>
                          <Label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            {t('profile.privacy.exportData.transactions')}
                          </Label>
                          <Label className="flex items-center gap-2">
                            <input type="checkbox" />
                            {t('profile.privacy.exportData.messages')}
                          </Label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowDataExportDialog(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={() => {
                            // TODO: Implement data export
                            toast.success(t('profile.privacy.exportData.started'));
                            setShowDataExportDialog(false);
                          }}>
                            {t('profile.privacy.exportData.start')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                {/* Blocked Users */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{t('profile.privacy.blockedUsers')}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('profile.privacy.blockedUsers.description')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowBlockedListDialog(true)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {t('profile.privacy.viewBlocked')}
                  </Button>
                </div>

                <Separator />

                {/* Privacy Checklist */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">{t('profile.privacy.checklist')}</h4>
                  <div className="space-y-2">
                    {[
                      settings.profileVisibility !== 'public',
                      !settings.showEmail,
                      !settings.showPhone,
                      settings.allowSearch,
                      settings.showPortfolio
                    ].map((checked, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          checked ? 'bg-green-600 border-green-600' : 'bg-gray-300 border-gray-300'
                        }`}>
                          {checked && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">
                          {t(`profile.privacy.checklist.items.${index}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Blocked Users Dialog */}
      <Dialog open={showBlockedListDialog} onOpenChange={setShowBlockedListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.privacy.blockedUsers')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('profile.privacy.noBlockedUsers')}
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowBlockedListDialog(false)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Tips */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('profile.privacy.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.privacy.tips.reviewRegularly')}</li>
              <li>• {t('profile.privacy.tips.limitPersonalInfo')}</li>
              <li>• {t('profile.privacy.tips.useStrongPasswords')}</li>
              <li>• {t('profile.privacy.tips.monitorActivity')}</li>
              <li>• {t('profile.privacy.tips.understandSettings')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};