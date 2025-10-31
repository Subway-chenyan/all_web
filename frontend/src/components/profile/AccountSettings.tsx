import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Bell,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
  User,
  Trash2,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Key,
  Clock,
  Smartphone as PhoneIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import type { ProfileSettings, AccountSecuritySettings, ActiveSession } from '@/types/profile';

interface AccountSettingsProps {
  settings: ProfileSettings;
  onChange: (settings: ProfileSettings) => void;
  showDangerZone?: boolean;
}

const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
];

const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京时间 (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: '东京时间 (GMT+9)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: '首尔时间 (GMT+9)', offset: '+09:00' },
  { value: 'America/New_York', label: '纽约时间 (GMT-5)', offset: '-05:00' },
  { value: 'Europe/London', label: '伦敦时间 (GMT+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: '巴黎时间 (GMT+1)', offset: '+01:00' }
];

const CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'KRW', name: '韩元', symbol: '₩' }
];

const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    browser: 'Chrome 120.0',
    location: '北京, 中国',
    ipAddress: '192.168.1.100',
    lastAccess: '2024-01-20T10:30:00Z',
    isCurrent: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    browser: 'Safari 17.2',
    location: '上海, 中国',
    ipAddress: '192.168.1.101',
    lastAccess: '2024-01-19T15:45:00Z',
    isCurrent: false
  }
];

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  settings,
  onChange,
  showDangerZone = true
}) => {
  const { t } = useTranslation();
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(MOCK_ACTIVE_SESSIONS);

  const handleSettingChange = useCallback((category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof ProfileSettings],
        [key]: value
      }
    };
    onChange(newSettings);
    setHasChanges(true);
  }, [settings, onChange]);

  const handleBasicSettingChange = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onChange(newSettings);
    setHasChanges(true);
  }, [settings, onChange]);

  const handleSaveSettings = useCallback(() => {
    // TODO: Save settings to API
    setHasChanges(false);
    toast.success(t('profile.account.settingsSaved'));
  }, [t]);

  const handlePasswordChange = useCallback(async (oldPassword: string, newPassword: string) => {
    // TODO: Implement password change
    setShowPasswordDialog(false);
    toast.success(t('profile.account.passwordChanged'));
  }, [t]);

  const handleEnable2FA = useCallback(async (method: 'sms' | 'email' | 'app') => {
    // TODO: Implement 2FA enablement
    setShow2FADialog(false);
    toast.success(t('profile.account.twoFactorEnabled'));
  }, [t]);

  const handleTerminateSession = useCallback((sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    toast.success(t('profile.account.sessionTerminated'));
  }, [t]);

  const handleExportData = useCallback(() => {
    // TODO: Implement data export
    setShowExportDialog(false);
    toast.success(t('profile.account.exportStarted'));
  }, [t]);

  const handleDeleteAccount = useCallback(() => {
    // TODO: Implement account deletion
    setShowDeleteDialog(false);
    toast.success(t('profile.account.deletionRequested'));
  }, [t]);

  const getNotificationCount = () => {
    const notifications = settings.notifications;
    return Object.values(notifications).filter(Boolean).length;
  };

  const getSecurityLevel = () => {
    let score = 0;
    if (true) score++; // Password strength (mock)
    if (false) score++; // 2FA enabled (mock)
    if (activeSessions.length <= 2) score++; // Limited sessions
    if (settings.privacy.profileVisibility !== 'public') score++; // Privacy settings

    if (score >= 3) return { level: 'high', color: 'text-green-600', text: t('profile.account.security.high') };
    if (score >= 2) return { level: 'medium', color: 'text-yellow-600', text: t('profile.account.security.medium') };
    return { level: 'low', color: 'text-red-600', text: t('profile.account.security.low') };
  };

  const security = getSecurityLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('profile.account.title')}
            </CardTitle>

            <div className="flex items-center gap-3">
              {/* Security Level Indicator */}
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${security.color}`} />
                <span className={security.color}>{security.text}</span>
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
            {t('profile.account.description')}
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('profile.account.notifications')}
            {getNotificationCount() > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                {getNotificationCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('profile.account.language')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('profile.account.security')}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            {t('profile.account.sessions')}
          </TabsTrigger>
          {showDangerZone && (
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('profile.account.dangerZone')}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('profile.account.notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.account.emailNotifications')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.account.emailNotifications.description')}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                {settings.notifications.emailNotifications && (
                  <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('profile.account.projectUpdates')}</Label>
                      <Switch
                        checked={settings.notifications.projectUpdates}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'projectUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('profile.account.messageAlerts')}</Label>
                      <Switch
                        checked={settings.notifications.messageAlerts}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'messageAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('profile.account.reviewNotifications')}</Label>
                      <Switch
                        checked={settings.notifications.reviewNotifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'reviewNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('profile.account.promotionalEmails')}</Label>
                      <Switch
                        checked={settings.notifications.promotionalEmails}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'promotionalEmails', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.account.pushNotifications')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.account.pushNotifications.description')}</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                />
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.account.smsNotifications')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.account.smsNotifications.description')}</p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language and Region */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('profile.account.languageRegion')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <Label>{t('profile.account.language')}</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleBasicSettingChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(language => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>{t('profile.account.timezone')}</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleBasicSettingChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(timezone => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        <div className="flex flex-col">
                          <span>{timezone.label}</span>
                          <span className="text-xs text-gray-500">{timezone.offset}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>{t('profile.account.currency')}</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => handleBasicSettingChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currency.symbol}</span>
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  {t('profile.account.languageNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('profile.account.security')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Password */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.account.password')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.account.password.description')}</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        {t('profile.account.changePassword')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('profile.account.changePassword')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">{t('profile.account.currentPassword')}</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">{t('profile.account.newPassword')}</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">{t('profile.account.confirmPassword')}</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={() => handlePasswordChange('old', 'new')}>
                            {t('profile.account.updatePassword')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{t('profile.account.twoFactorAuth')}</Label>
                    <p className="text-sm text-gray-600">{t('profile.account.twoFactorAuth.description')}</p>
                  </div>
                  <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Smartphone className="h-4 w-4 mr-2" />
                        {t('profile.account.enable2FA')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('profile.account.enable2FA')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('profile.account.twoFactorAuth.selectMethod')}
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleEnable2FA('sms')}
                          >
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {t('profile.account.twoFactorAuth.sms')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleEnable2FA('email')}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {t('profile.account.twoFactorAuth.email')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleEnable2FA('app')}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            {t('profile.account.twoFactorAuth.app')}
                          </Button>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('profile.account.loginAlerts')}</Label>
                  <p className="text-sm text-gray-600">{t('profile.account.loginAlerts.description')}</p>
                </div>
                <Switch
                  checked={true} // Mock value
                  onCheckedChange={() => {}} // Mock handler
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('profile.account.activeSessions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSessions.map(session => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{session.device}</div>
                        <div className="text-sm text-gray-600">
                          {session.browser} • {session.location}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('profile.account.lastAccess')}: {new Date(session.lastAccess).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {t('profile.account.currentSession')}
                        </Badge>
                      )}
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          {t('profile.account.terminate')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {t('profile.account.sessionsNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        {showDangerZone && (
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t('profile.account.dangerZone')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export Data */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{t('profile.account.exportData')}</Label>
                      <p className="text-sm text-gray-600">{t('profile.account.exportData.description')}</p>
                    </div>
                    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {t('profile.account.exportData')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('profile.account.exportData')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            {t('profile.account.exportData.confirmation')}
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                              {t('common.cancel')}
                            </Button>
                            <Button onClick={handleExportData}>
                              {t('profile.account.exportData.start')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Separator />

                {/* Delete Account */}
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium text-red-600">{t('profile.account.deleteAccount')}</Label>
                      <p className="text-sm text-gray-600">{t('profile.account.deleteAccount.description')}</p>
                    </div>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('profile.account.deleteAccount')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-red-600">
                            {t('profile.account.deleteAccount.confirmation')}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {t('profile.account.deleteAccount.warning')}
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-2">
                            <Label>{t('profile.account.deleteAccount.reason')}</Label>
                            <Textarea
                              placeholder={t('profile.account.deleteAccount.reason.placeholder')}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <input type="checkbox" />
                              {t('profile.account.deleteAccount.confirmation.checkbox')}
                            </Label>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              {t('common.cancel')}
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                              {t('profile.account.deleteAccount.confirm')}
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
        )}
      </Tabs>
    </div>
  );
};