import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Briefcase,
  GraduationCap,
  Image as ImageIcon,
  Share2,
  Settings,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Import profile components
import { ProfileAvatarUpload } from '@/components/profile/ProfileAvatarUpload';
import { BioEditor } from '@/components/profile/BioEditor';
import { SkillsManager } from '@/components/profile/SkillsManager';
import { ExperienceManager } from '@/components/profile/ExperienceManager';
import { EducationManager } from '@/components/profile/EducationManager';
import { PortfolioManager } from '@/components/profile/PortfolioManager';
import { SocialMediaLinks } from '@/components/profile/SocialMediaLinks';
import { ContactInfoEditor } from '@/components/profile/ContactInfoEditor';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';

import type {
  ProfileEditState,
  ProfileCompletion as ProfileCompletionType,
  ValidationError
} from '@/types/profile';
import type { User as UserType } from '@/types';

interface EditProfilePageProps {
  user: UserType;
  onSave: (profile: ProfileEditState) => Promise<void>;
  onPreview?: (profile: ProfileEditState) => void;
}

export const EditProfilePage: React.FC<EditProfilePageProps> = ({
  user,
  onSave,
  onPreview
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basic');
  const [profileData, setProfileData] = useState<ProfileEditState | null>(null);
  const [originalData, setOriginalData] = useState<ProfileEditState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionType | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        // TODO: Fetch profile data from API
        const initialData: ProfileEditState = {
          basicInfo: {
            displayName: user.firstName + ' ' + user.lastName,
            avatar: user.avatar,
            bio: user.bio,
            title: user.profile.displayName,
            location: {
              country: '',
              province: '',
              city: '',
              timezone: ''
            },
            website: user.profile.website,
            languages: user.profile.languages
          },
          professionalInfo: {
            professionalTitle: user.profile.displayName,
            hourlyRate: user.profile.hourlyRate || 0,
            currency: 'CNY',
            availabilityStatus: user.profile.availability ? 'available' : 'unavailable',
            responseTime: user.profile.responseTime,
            totalEarnings: user.profile.totalEarnings,
            completedProjects: user.profile.completedProjects,
            accountType: 'individual'
          },
          contactInfo: {
            email: user.email,
            phone: user.phone,
            timezone: 'Asia/Shanghai'
          },
          socialMedia: user.profile.socialLinks.map(link => ({
            platform: link.platform,
            url: link.url,
            username: link.username,
            followers: 0,
            isVerified: false
          })),
          portfolio: user.profile.portfolio,
          skills: user.profile.skills.map((skill, index) => ({
            id: `skill-${index}`,
            name: skill,
            category: 'general',
            level: 'intermediate' as const,
            yearsExperience: 1,
            isVerified: false
          })),
          experience: [],
          education: [],
          languages: user.profile.languages.map(lang => ({
            language: lang,
            proficiency: 'professional' as const
          })),
          certifications: [],
          settings: {
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
            allowMessages: true,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            marketingEmails: false,
            projectUpdates: true,
            messageAlerts: true,
            reviewNotifications: true,
            promotionalEmails: false
          }
        };

        setProfileData(initialData);
        setOriginalData(JSON.parse(JSON.stringify(initialData)));
      } catch (error) {
        console.error('Error initializing profile:', error);
        toast.error(t('profile.edit.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [user, t]);

  // Calculate profile completion
  useEffect(() => {
    if (profileData) {
      const completion = calculateProfileCompletion(profileData);
      setCompletionStatus(completion);
    }
  }, [profileData]);

  // Track unsaved changes
  useEffect(() => {
    if (originalData && profileData) {
      const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [profileData, originalData]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || isPreviewMode) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        // TODO: Implement auto-save API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setAutoSaveStatus('saved');
        setOriginalData(JSON.parse(JSON.stringify(profileData)));

        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [profileData, hasUnsavedChanges, isPreviewMode]);

  const calculateProfileCompletion = (data: ProfileEditState): ProfileCompletionType => {
    const sections = [
      { key: 'basicInfo', weight: 20 },
      { key: 'professionalInfo', weight: 15 },
      { key: 'contactInfo', weight: 10 },
      { key: 'skills', weight: 15 },
      { key: 'experience', weight: 15 },
      { key: 'education', weight: 10 },
      { key: 'portfolio', weight: 10 },
      { key: 'socialMedia', weight: 5 }
    ];

    let totalPercentage = 0;
    const completedSections: string[] = [];
    const incompleteSections: string[] = [];
    const suggestions: any[] = [];

    sections.forEach(section => {
      const isComplete = checkSectionCompletion(section.key, data);
      if (isComplete) {
        completedSections.push(section.key);
        totalPercentage += section.weight;
      } else {
        incompleteSections.push(section.key);
        suggestions.push({
          section: section.key,
          message: t(`profile.completion.suggestions.${section.key}`),
          priority: section.weight >= 15 ? 'high' : 'medium'
        });
      }
    });

    return {
      percentage: totalPercentage,
      completedSections,
      incompleteSections,
      suggestions
    };
  };

  const checkSectionCompletion = (section: string, data: ProfileEditState): boolean => {
    switch (section) {
      case 'basicInfo':
        return !!(data.basicInfo.displayName && data.basicInfo.avatar && data.basicInfo.bio);
      case 'professionalInfo':
        return !!(data.professionalInfo.professionalTitle && data.professionalInfo.hourlyRate);
      case 'contactInfo':
        return !!(data.contactInfo.email && data.contactInfo.phone);
      case 'skills':
        return data.skills.length > 0;
      case 'experience':
        return data.experience.length > 0;
      case 'education':
        return data.education.length > 0;
      case 'portfolio':
        return data.portfolio.length > 0;
      case 'socialMedia':
        return data.socialMedia.length > 0;
      default:
        return false;
    }
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      const errors = validateProfile(profileData);

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error(t('profile.edit.validationError'));
        return;
      }

      await onSave(profileData);
      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      setHasUnsavedChanges(false);
      toast.success(t('profile.edit.saveSuccess'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('profile.edit.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const validateProfile = (data: ProfileEditState): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.basicInfo.displayName.trim()) {
      errors.push({
        field: 'displayName',
        message: t('profile.validation.displayName.required'),
        type: 'error'
      });
    }

    if (data.basicInfo.displayName.length > 100) {
      errors.push({
        field: 'displayName',
        message: t('profile.validation.displayName.tooLong'),
        type: 'error'
      });
    }

    if (!data.contactInfo.email.trim()) {
      errors.push({
        field: 'email',
        message: t('profile.validation.email.required'),
        type: 'error'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.contactInfo.email && !emailRegex.test(data.contactInfo.email)) {
      errors.push({
        field: 'email',
        message: t('profile.validation.email.invalid'),
        type: 'error'
      });
    }

    return errors;
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      // TODO: Show confirmation dialog
    }
    setActiveTab(value);
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode && onPreview && profileData) {
      onPreview(profileData);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setProfileData(JSON.parse(JSON.stringify(originalData)));
      setValidationErrors([]);
      toast.success(t('profile.edit.resetSuccess'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('profile.edit.loadError')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profileSections = [
    { id: 'basic', label: t('profile.tabs.basic'), icon: User },
    { id: 'professional', label: t('profile.tabs.professional'), icon: Briefcase },
    { id: 'skills', label: t('profile.tabs.skills'), icon: Shield },
    { id: 'experience', label: t('profile.tabs.experience'), icon: Briefcase },
    { id: 'education', label: t('profile.tabs.education'), icon: GraduationCap },
    { id: 'portfolio', label: t('profile.tabs.portfolio'), icon: ImageIcon },
    { id: 'social', label: t('profile.tabs.social'), icon: Share2 },
    { id: 'settings', label: t('profile.tabs.settings'), icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.edit.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('profile.edit.description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          {autoSaveStatus !== 'idle' && (
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {autoSaveStatus === 'saved' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {autoSaveStatus === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={
                autoSaveStatus === 'saved' ? 'text-green-600' :
                autoSaveStatus === 'error' ? 'text-red-600' : 'text-gray-600'
              }>
                {t(`profile.edit.autoSave.${autoSaveStatus}`)}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <Button
            variant="outline"
            onClick={togglePreview}
            className="flex items-center gap-2"
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? t('profile.edit.exitPreview') : t('profile.edit.preview')}
          </Button>

          {hasUnsavedChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              {t('common.reset')}
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('common.save')}
          </Button>
        </div>
      </div>

      {/* Profile Completion Card */}
      {completionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              {t('profile.completion.title')}
            </CardTitle>
            <CardDescription>
              {t('profile.completion.description', { percentage: completionStatus.percentage })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={completionStatus.percentage} className="h-2" />
            <div className="mt-4 flex flex-wrap gap-2">
              {completionStatus.completedSections.map(section => (
                <Badge key={section} variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t(`profile.sections.${section}`)}
                </Badge>
              ))}
              {completionStatus.incompleteSections.map(section => (
                <Badge key={section} variant="outline" className="text-gray-600">
                  {t(`profile.sections.${section}`)}
                </Badge>
              ))}
            </div>
            {completionStatus.suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                {completionStatus.suggestions.map((suggestion, index) => (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {suggestion.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">
                  {error.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('profile.edit.sections')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {profileSections.map(section => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  const isCompleted = completionStatus?.completedSections.includes(section.id);

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleTabChange(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{section.label}</span>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              {profileSections.map(section => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="hidden lg:flex"
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.basic.title')}</CardTitle>
                  <CardDescription>{t('profile.basic.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProfileAvatarUpload
                    value={profileData.basicInfo.avatar}
                    onChange={(avatar) => setProfileData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, avatar }
                    }) : null)}
                  />
                  <BioEditor
                    value={profileData.basicInfo}
                    onChange={(basicInfo) => setProfileData(prev => prev ? ({
                      ...prev,
                      basicInfo
                    }) : null)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.professional.title')}</CardTitle>
                  <CardDescription>{t('profile.professional.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Professional info editor will be added here */}
                  <div className="text-center py-8 text-gray-500">
                    Professional info editor coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <SkillsManager
                skills={profileData.skills}
                onChange={(skills) => setProfileData(prev => prev ? ({
                  ...prev,
                  skills
                }) : null)}
              />
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <ExperienceManager
                experience={profileData.experience}
                onChange={(experience) => setProfileData(prev => prev ? ({
                  ...prev,
                  experience
                }) : null)}
              />
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <EducationManager
                education={profileData.education}
                onChange={(education) => setProfileData(prev => prev ? ({
                  ...prev,
                  education
                }) : null)}
              />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <PortfolioManager
                portfolio={profileData.portfolio}
                onChange={(portfolio) => setProfileData(prev => prev ? ({
                  ...prev,
                  portfolio
                }) : null)}
              />
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <SocialMediaLinks
                socialLinks={profileData.socialMedia}
                onChange={(socialMedia) => setProfileData(prev => prev ? ({
                  ...prev,
                  socialMedia
                }) : null)}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6">
                <PrivacySettings
                  settings={profileData.settings.privacy}
                  onChange={(privacy) => setProfileData(prev => prev ? ({
                    ...prev,
                    settings: { ...prev.settings, privacy }
                  }) : null)}
                />
                <AccountSettings
                  settings={profileData.settings}
                  onChange={(settings) => setProfileData(prev => prev ? ({
                    ...prev,
                    settings
                  }) : null)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          size="lg"
          className="rounded-full shadow-lg"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};