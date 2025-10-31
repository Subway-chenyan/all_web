import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Smartphone,
  User,
  CreditCard,
  Trash2,
  AlertTriangle,
  Check,
  Save,
  Eye,
  EyeOff,
  Key,
  Clock,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Import settings components
import { AccountSettings } from '@/components/profile/AccountSettings';
import { PrivacySettings } from '@/components/profile/PrivacySettings';

import type { User } from '@/types';
import type { ProfileSettings, PrivacySettings as PrivacySettingsType } from '@/types/profile';

interface AccountSettingsPageProps {
  user: User;
  onSave?: (settings: Partial<ProfileSettings & PrivacySettingsType>) => Promise<void>;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user,
  onSave
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Initialize settings with default values
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showWebsite: true,
      showSocialMedia: true,
      showPortfolio: true,
      allowSearch: true,
      allowRecommendations: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      projectUpdates: true,
      messageAlerts: true,
      reviewNotifications: true,
      promotionalEmails: false,
      newOrderAlerts: true,
      orderStatusChanges: true,
      paymentNotifications: true,
      reviewRequests: true,
      newsletterSubscription: false
    },
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    currency: 'CNY',
    profileVisibility: 'public',
    showContactInfo: false,
    allowMessages: true
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showWebsite: true,
    showSocialMedia: true,
    showPortfolio: true,
    allowSearch: true,
    allowRecommendations: true
  });

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [profileSettings, privacySettings]);

  const handleProfileSettingsChange = useCallback((newSettings: ProfileSettings) => {
    setProfileSettings(newSettings);
  }, []);

  const handlePrivacySettingsChange = useCallback((newSettings: PrivacySettingsType) => {
    setPrivacySettings(newSettings);
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave({
        ...profileSettings,
        privacy: privacySettings
      });
      setHasChanges(false);
      toast.success(t('profile.settings.saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('profile.settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  }, [profileSettings, privacySettings, onSave, t]);

  const handleExportData = useCallback(() => {
    // TODO: Implement data export
    setShowExportDialog(false);
    toast.success(t('profile.settings.exportStarted'));
  }, [t]);

  const handleDeleteAccount = useCallback(() => {
    // TODO: Implement account deletion
    setShowDeleteDialog(false);
    toast.success(t('profile.settings.deletionRequested'));
  }, [t]);

  const getSecurityLevel = () => {
    // Calculate security level based on various factors
    let score = 0;
    if (true) score++; // Password strength (mock)
    if (false) score++; // 2FA enabled (mock)
    if (profileSettings.privacy.profileVisibility !== 'public') score++; // Privacy settings
    if (profileSettings.notifications.emailNotifications) score++; // Email alerts

    if (score >= 3) return { level: 'high', color: 'text-green-600', text: t('profile.settings.security.high') };
    if (score >= 2) return { level: 'medium', color: 'text-yellow-600', text: t('profile.settings.security.medium') };
    return { level: 'low', color: 'text-red-600', text: t('profile.settings.security.low') };
  };

  const security = getSecurityLevel();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.settings.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('profile.settings.description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Security Level Indicator */}
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${security.color}`} />
            <span className={security.color}>{security.text}</span>
          </Badge>

          {hasChanges && (
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('common.save')}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.settings.overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Account Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{t('profile.settings.account')}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>{user.firstName} {user.lastName}</div>
                <div className="text-gray-600">{user.email}</div>
                <div className="text-gray-600">{user.userType}</div>
              </div>
            </div>

            {/* Security Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">{t('profile.settings.security')}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>{t('profile.settings.securityLevel')}: <span className={security.color}>{security.text}</span></div>
                <div className="text-gray-600">2FA: {t('profile.settings.disabled')}</div>
                <div className="text-gray-600">{t('profile.settings.lastLogin')}: 2小时前</div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium">{t('profile.settings.activity')}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>{t('profile.settings.memberSince')}: {new Date(user.createdAt).toLocaleDateString()}</div>
                <div className="text-gray-600">{t('profile.settings.lastActive')}: 30分钟前</div>
                <div className="text-gray-600">{t('profile.settings.activeStatus')}: {t('profile.settings.online')}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              {t('profile.settings.changePassword')}
            </Button>
            <Button variant="outline" size="sm">
              <Smartphone className="h-4 w-4 mr-2" />
              {t('profile.settings.enable2FA')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('profile.settings.exportData')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('profile.settings.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('profile.settings.tabs.privacy')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('profile.settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t('profile.settings.tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('profile.settings.tabs.danger')}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <AccountSettings
            settings={profileSettings}
            onChange={handleProfileSettingsChange}
            showDangerZone={false}
          />
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings
            settings={privacySettings}
            onChange={handlePrivacySettingsChange}
            showAdvanced={true}
          />
        </TabsContent>

        {/* Notifications - Simplified View */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('profile.settings.notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{t('profile.settings.communication')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.emailNotifications')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.emailNotifications.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.emailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.pushNotifications')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.pushNotifications.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.pushNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.smsNotifications')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.smsNotifications.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.smsNotifications} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">{t('profile.settings.content')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.projectUpdates')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.projectUpdates.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.projectUpdates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.messageAlerts')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.messageAlerts.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.messageAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t('profile.settings.reviewNotifications')}</div>
                        <div className="text-sm text-gray-600">{t('profile.settings.reviewNotifications.description')}</div>
                      </div>
                      <input type="checkbox" defaultChecked={profileSettings.notifications.reviewNotifications} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('profile.settings.security')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('profile.settings.password')}</div>
                    <div className="text-sm text-gray-600">{t('profile.settings.password.description')}</div>
                  </div>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    {t('profile.settings.changePassword')}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('profile.settings.twoFactorAuth')}</div>
                    <div className="text-sm text-gray-600">{t('profile.settings.twoFactorAuth.description')}</div>
                  </div>
                  <Button variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t('profile.settings.enable2FA')}
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('profile.settings.activeSessions')}</div>
                    <div className="text-sm text-gray-600">
                      {t('profile.settings.currentSession')}: Chrome on Windows • 北京, 中国
                    </div>
                  </div>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('profile.settings.viewAll')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                {t('profile.settings.dangerZone')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('profile.settings.dangerZone.warning')}
                </AlertDescription>
              </Alert>

              {/* Export Data */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('profile.settings.exportData')}</div>
                    <div className="text-sm text-gray-600">{t('profile.settings.exportData.description')}</div>
                  </div>
                  <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        {t('profile.settings.exportData')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('profile.settings.exportData')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('profile.settings.exportData.confirmation')}
                        </p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleExportData}>
                            {t('profile.settings.exportData.start')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Delete Account */}
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-600">{t('profile.settings.deleteAccount')}</div>
                    <div className="text-sm text-gray-600">{t('profile.settings.deleteAccount.description')}</div>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('profile.settings.deleteAccount')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600">
                          {t('profile.settings.deleteAccount.confirmation')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {t('profile.settings.deleteAccount.warning')}
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t('profile.settings.deleteAccount.reason')}
                          </label>
                          <textarea
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            placeholder={t('profile.settings.deleteAccount.reason.placeholder')}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteAccount}>
                            {t('profile.settings.deleteAccount.confirm')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('profile.settings.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.settings.tips.reviewRegularly')}</li>
              <li>• {t('profile.settings.tips.enable2FA')}</li>
              <li>• {t('profile.settings.tips.stayUpdated')}</li>
              <li>• {t('profile.settings.tips.backupData')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};