import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  MessageCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

import type { ContactInfo } from '@/types/profile';

interface ContactInfoEditorProps {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
  showVerification?: boolean;
  showPrivacyControls?: boolean;
}

const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京时间 (GMT+8)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: '东京时间 (GMT+9)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: '首尔时间 (GMT+9)', offset: '+09:00' },
  { value: 'America/New_York', label: '纽约时间 (GMT-5)', offset: '-05:00' },
  { value: 'Europe/London', label: '伦敦时间 (GMT+0)', offset: '+00:00' },
  { value: 'Europe/Paris', label: '巴黎时间 (GMT+1)', offset: '+01:00' },
  { value: 'Australia/Sydney', label: '悉尼时间 (GMT+10)', offset: '+10:00' }
];

const COUNTRIES = [
  { code: 'CN', name: '中国', flag: '🇨🇳' },
  { code: 'US', name: '美国', flag: '🇺🇸' },
  { code: 'UK', name: '英国', flag: '🇬🇧' },
  { code: 'JP', name: '日本', flag: '🇯🇵' },
  { code: 'KR', name: '韩国', flag: '🇰🇷' },
  { code: 'SG', name: '新加坡', flag: '🇸🇬' },
  { code: 'AU', name: '澳大利亚', flag: '🇦🇺' },
  { code: 'CA', name: '加拿大', flag: '🇨🇦' },
  { code: 'DE', name: '德国', flag: '🇩🇪' },
  { code: 'FR', name: '法国', flag: '🇫🇷' }
];

const PHONE_VALIDATION_PATTERNS = {
  CN: /^1[3-9]\d{9}$/,
  US: /^\+1\d{10}$/,
  UK: /^\+44\d{10,11}$/,
  default: /^\+?[1-9]\d{1,14}$/
};

export const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({
  value,
  onChange,
  showVerification = true,
  showPrivacyControls = true
}) => {
  const { t } = useTranslation();
  const [isEmailVerified, setIsEmailVerified] = useState(true); // Mock state
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // Mock state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');

  const handleFieldChange = useCallback((field: keyof ContactInfo, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  }, [value, onChange]);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string, countryCode?: string) => {
    if (!phone) return true;

    // Remove all non-digit characters except + at the beginning
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    if (countryCode && PHONE_VALIDATION_PATTERNS[countryCode as keyof typeof PHONE_VALIDATION_PATTERNS]) {
      return PHONE_VALIDATION_PATTERNS[countryCode as keyof typeof PHONE_VALIDATION_PATTERNS].test(cleanPhone);
    }

    return PHONE_VALIDATION_PATTERNS.default.test(cleanPhone);
  }, []);

  const validateWebsite = useCallback((website: string) => {
    if (!website) return true;
    try {
      const url = website.startsWith('http') ? website : `https://${website}`;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleEmailVerification = useCallback(async () => {
    // TODO: Implement email verification
    setIsEmailVerified(true);
    setShowEmailVerification(false);
    toast.success(t('profile.contact.emailVerified'));
  }, [t]);

  const handlePhoneVerification = useCallback(async () => {
    // TODO: Implement phone verification
    setIsPhoneVerified(true);
    setShowPhoneVerification(false);
    toast.success(t('profile.contact.phoneVerified'));
  }, [t]);

  const getFieldValidationMessage = (field: string, fieldValue: string) => {
    switch (field) {
      case 'email':
        if (fieldValue && !validateEmail(fieldValue)) {
          return t('profile.contact.validation.email.invalid');
        }
        break;
      case 'phone':
        if (fieldValue && !validatePhone(fieldValue)) {
          return t('profile.contact.validation.phone.invalid');
        }
        break;
      case 'website':
        if (fieldValue && !validateWebsite(fieldValue)) {
          return t('profile.contact.validation.website.invalid');
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const getCompletionPercentage = () => {
    const fields = ['email', 'phone', 'city', 'province', 'country'];
    const completedFields = fields.filter(field => value[field as keyof ContactInfo]?.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getContactStrength = () => {
    const percentage = getCompletionPercentage();
    if (percentage >= 80) return { level: 'excellent', color: 'text-green-600', text: t('profile.contact.strength.excellent') };
    if (percentage >= 60) return { level: 'good', color: 'text-blue-600', text: t('profile.contact.strength.good') };
    if (percentage >= 40) return { level: 'fair', color: 'text-yellow-600', text: t('profile.contact.strength.fair') };
    return { level: 'poor', color: 'text-red-600', text: t('profile.contact.strength.poor') };
  };

  const strength = getContactStrength();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('profile.contact.title')}
              </CardTitle>

              <div className="flex items-center gap-3">
                {/* Contact Strength Indicator */}
                <Badge variant="outline" className={`flex items-center gap-1 ${strength.color}`}>
                  <Shield className="h-3 w-3" />
                  <span>{strength.text}</span>
                </Badge>

                {/* Completion Percentage */}
                <div className="text-sm text-gray-600">
                  {getCompletionPercentage()}% {t('profile.contact.completed')}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {t('profile.contact.description')}
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{t('profile.contact.tabs.basic')}</TabsTrigger>
            <TabsTrigger value="location">{t('profile.contact.tabs.location')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('profile.contact.tabs.preferences')}</TabsTrigger>
          </TabsList>

          {/* Basic Contact Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('profile.contact.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('profile.contact.email')} *
                    {showVerification && isEmailVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        {t('profile.contact.verified')}
                      </Badge>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={value.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder={t('profile.contact.email.placeholder')}
                      className="flex-1"
                    />
                    {showVerification && !isEmailVerified && value.email && validateEmail(value.email) && (
                      <Button
                        variant="outline"
                        onClick={() => setShowEmailVerification(true)}
                      >
                        {t('profile.contact.verify')}
                      </Button>
                    )}
                  </div>
                  {value.email && (
                    <p className={`text-xs ${
                      validateEmail(value.email) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validateEmail(value.email) ? t('profile.contact.validation.email.valid') : t('profile.contact.validation.email.invalid')}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('profile.contact.phone')}
                    {showVerification && isPhoneVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        {t('profile.contact.verified')}
                      </Badge>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={value.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder={t('profile.contact.phone.placeholder')}
                      className="flex-1"
                    />
                    {showVerification && !isPhoneVerified && value.phone && validatePhone(value.phone) && (
                      <Button
                        variant="outline"
                        onClick={() => setShowPhoneVerification(true)}
                      >
                        {t('profile.contact.verify')}
                      </Button>
                    )}
                  </div>
                  {value.phone && (
                    <p className={`text-xs ${
                      validatePhone(value.phone) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validatePhone(value.phone) ? t('profile.contact.validation.phone.valid') : t('profile.contact.validation.phone.invalid')}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('profile.contact.website')}
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={value.website || ''}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder={t('profile.contact.website.placeholder')}
                  />
                  {value.website && (
                    <p className={`text-xs ${
                      validateWebsite(value.website) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validateWebsite(value.website) ? t('profile.contact.validation.website.valid') : t('profile.contact.validation.website.invalid')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Information */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('profile.contact.location')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">{t('profile.contact.country')}</Label>
                  <Select
                    value={value.country || ''}
                    onValueChange={(value) => handleFieldChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.contact.country.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Province/State */}
                <div className="space-y-2">
                  <Label htmlFor="province">{t('profile.contact.province')}</Label>
                  <Input
                    id="province"
                    value={value.province || ''}
                    onChange={(e) => handleFieldChange('province', e.target.value)}
                    placeholder={t('profile.contact.province.placeholder')}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">{t('profile.contact.city')}</Label>
                  <Input
                    id="city"
                    value={value.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder={t('profile.contact.city.placeholder')}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">{t('profile.contact.address')}</Label>
                  <Input
                    id="address"
                    value={value.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder={t('profile.contact.address.placeholder')}
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('profile.contact.postalCode')}</Label>
                  <Input
                    id="postalCode"
                    value={value.postalCode || ''}
                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                    placeholder={t('profile.contact.postalCode.placeholder')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('profile.contact.preferences')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('profile.contact.timezone')}</Label>
                  <Select
                    value={value.timezone || ''}
                    onValueChange={(value) => handleFieldChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('profile.contact.timezone.placeholder')} />
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

                {/* Preferred Contact Method */}
                <div className="space-y-2">
                  <Label>{t('profile.contact.preferredMethod')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'email', label: t('profile.contact.email'), icon: Mail },
                      { value: 'phone', label: t('profile.contact.phone'), icon: Phone },
                      { value: 'message', label: t('profile.contact.message'), icon: MessageCircle },
                      { value: 'video', label: t('profile.contact.video'), icon: Globe }
                    ].map(method => {
                      const Icon = method.icon;
                      return (
                        <Button
                          key={method.value}
                          variant="outline"
                          className="justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {method.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Response Time */}
                <div className="space-y-2">
                  <Label>{t('profile.contact.responseTime')}</Label>
                  <Select defaultValue="within_24h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="within_1h">{t('profile.contact.response.within1h')}</SelectItem>
                      <SelectItem value="within_6h">{t('profile.contact.response.within6h')}</SelectItem>
                      <SelectItem value="within_24h">{t('profile.contact.response.within24h')}</SelectItem>
                      <SelectItem value="within_48h">{t('profile.contact.response.within48h')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Working Hours */}
                <div className="space-y-2">
                  <Label>{t('profile.contact.workingHours')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" defaultValue="09:00" />
                    <Input type="time" defaultValue="18:00" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('profile.contact.workingHours.note')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Controls */}
            {showPrivacyControls && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('profile.contact.privacy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{t('profile.contact.showEmail')}</Label>
                      <p className="text-sm text-gray-600">{t('profile.contact.showEmail.description')}</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{t('profile.contact.showPhone')}</Label>
                      <p className="text-sm text-gray-600">{t('profile.contact.showPhone.description')}</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{t('profile.contact.showLocation')}</Label>
                      <p className="text-sm text-gray-600">{t('profile.contact.showLocation.description')}</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Email Verification Dialog */}
        {showEmailVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{t('profile.contact.verifyEmail')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('profile.contact.verifyEmail.description')}
                </p>
                <Input
                  placeholder={t('profile.contact.verificationCode')}
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEmailVerification(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleEmailVerification}>
                    {t('profile.contact.verify')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phone Verification Dialog */}
        {showPhoneVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{t('profile.contact.verifyPhone')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('profile.contact.verifyPhone.description')}
                </p>
                <Input
                  placeholder={t('profile.contact.verificationCode')}
                  value={phoneVerificationCode}
                  onChange={(e) => setPhoneVerificationCode(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPhoneVerification(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handlePhoneVerification}>
                    {t('profile.contact.verify')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{t('profile.contact.tips.title')}:</p>
              <ul className="space-y-1 text-sm">
                <li>• {t('profile.contact.tips.verifyContact')}</li>
                <li>• {t('profile.contact.tips.keepUpdated')}</li>
                <li>• {t('profile.contact.tips.useProfessional')}</li>
                <li>• {t('profile.contact.tips.privacyAware')}</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );
};