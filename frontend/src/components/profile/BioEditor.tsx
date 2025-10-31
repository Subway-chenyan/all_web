import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { BasicInfo } from '@/types/profile';

interface BioEditorProps {
  value: BasicInfo;
  onChange: (value: BasicInfo) => void;
  maxLength?: number;
  minLength?: number;
  showPreview?: boolean;
  placeholder?: string;
  enableFormatting?: boolean;
}

const DEFAULT_OPTIONS = {
  maxLength: 2000,
  minLength: 50,
  showPreview: true,
  placeholder: 'Tell us about yourself, your experience, and what makes you unique...',
  enableFormatting: true
};

export const BioEditor: React.FC<BioEditorProps> = ({
  value,
  onChange,
  maxLength = DEFAULT_OPTIONS.maxLength,
  minLength = DEFAULT_OPTIONS.minLength,
  showPreview = DEFAULT_OPTIONS.showPreview,
  placeholder = DEFAULT_OPTIONS.placeholder,
  enableFormatting = DEFAULT_OPTIONS.enableFormatting
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [isFormatting, setIsFormatting] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(value.bio?.length || 0);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    setCharCount(value.bio?.length || 0);
    validateBio(value.bio || '');
  }, [value.bio]);

  const validateBio = (text: string) => {
    const newWarnings: string[] = [];

    if (text.length < minLength) {
      newWarnings.push(t('profile.bio.tooShort', { minLength }));
    }

    if (text.length > maxLength * 0.9) {
      newWarnings.push(t('profile.bio approachingLimit'));
    }

    // Check for common issues
    if (text.includes('http://') || text.includes('https://')) {
      newWarnings.push(t('profile.bio.useLinkTool'));
    }

    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length === 1 && text.length > 300) {
      newWarnings.push(t('profile.bio.considerParagraphs'));
    }

    setWarnings(newWarnings);
  };

  const handleBioChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    if (newBio.length <= maxLength) {
      onChange({
        ...value,
        bio: newBio
      });
    }
  }, [value, onChange, maxLength]);

  const handleBasicInfoChange = useCallback((field: keyof BasicInfo, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  }, [value, onChange]);

  const insertFormatting = useCallback((type: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.bio?.slice(start, end) || '';
    let formattedText = '';

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        if (selectedText) {
          setLinkText(selectedText);
        }
        setShowLinkDialog(true);
        return;
      case 'list':
        formattedText = '\n• Item 1\n• Item 2\n• Item 3';
        break;
      case 'ordered-list':
        formattedText = '\n1. Item 1\n2. Item 2\n3. Item 3';
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || 'Quote text'}`;
        break;
      default:
        return;
    }

    const newBio = (value.bio || '').slice(0, start) + formattedText + (value.bio || '').slice(end);
    onChange({
      ...value,
      bio: newBio
    });

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  }, [value, onChange]);

  const insertLink = useCallback(() => {
    if (!linkUrl.trim()) return;

    const linkTextToUse = linkText.trim() || linkUrl;
    const formattedLink = `[${linkTextToUse}](${linkUrl})`;

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const newBio = (value.bio || '').slice(0, start) + formattedLink + (value.bio || '').slice(start);

      onChange({
        ...value,
        bio: newBio
      });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + formattedLink.length,
          start + formattedLink.length
        );
      }, 0);
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  }, [value, onChange, linkUrl, linkText]);

  const renderPreview = () => {
    if (!value.bio) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>{t('profile.bio.noContent')}</p>
        </div>
      );
    }

    // Simple markdown parser (in production, use a proper markdown library)
    const parseMarkdown = (text: string) => {
      return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
        // Unordered lists
        .replace(/• (.+)(\n|$)/g, '<li class="ml-4">• $1</li>')
        // Ordered lists
        .replace(/^\d+\. (.+)(\n|$)/gm, '<li class="ml-4">$1</li>')
        // Quotes
        .replace(/^> (.+)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
        // Line breaks
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/\n/g, '<br />');
    };

    return (
      <div className="prose prose-sm max-w-none">
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: `<p class="mb-4">${parseMarkdown(value.bio)}</p>`
          }}
        />
      </div>
    );
  };

  const getCharacterCountColor = () => {
    const percentage = (charCount / maxLength) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('profile.bio.basicInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('profile.displayName')}</Label>
              <Input
                id="displayName"
                value={value.displayName || ''}
                onChange={(e) => handleBasicInfoChange('displayName', e.target.value)}
                placeholder={t('profile.displayName.placeholder')}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t('profile.title')}</Label>
              <Input
                id="title"
                value={value.title || ''}
                onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                placeholder={t('profile.title.placeholder')}
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">{t('profile.location')}</Label>
              <Input
                id="location"
                value={value.location?.city || ''}
                onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                placeholder={t('profile.location.placeholder')}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t('profile.website')}</Label>
              <Input
                id="website"
                type="url"
                value={value.website || ''}
                onChange={(e) => handleBasicInfoChange('website', e.target.value)}
                placeholder={t('profile.website.placeholder')}
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.languages')}</Label>
            <div className="flex flex-wrap gap-2">
              {value.languages?.map((language, index) => (
                <Badge key={index} variant="secondary">
                  {language}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-1"
                    onClick={() => {
                      const newLanguages = value.languages?.filter((_, i) => i !== index) || [];
                      handleBasicInfoChange('languages', newLanguages.join(','));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Input
                placeholder={t('profile.languages.add')}
                className="w-32"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const newLanguage = target.value.trim();
                    if (newLanguage && !value.languages?.includes(newLanguage)) {
                      const newLanguages = [...(value.languages || []), newLanguage];
                      handleBasicInfoChange('languages', newLanguages.join(','));
                      target.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Editor Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              {t('profile.bio.title')}
            </CardTitle>

            {showPreview && (
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'edit' | 'preview')}>
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    {t('common.edit')}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {t('common.preview')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Formatting Toolbar */}
          {enableFormatting && activeView === 'edit' && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('bold')}
                className="h-8 px-2"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('italic')}
                className="h-8 px-2"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('code')}
                className="h-8 px-2"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('link')}
                className="h-8 px-2"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('list')}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('ordered-list')}
                className="h-8 px-2"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('quote')}
                className="h-8 px-2"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Text Editor */}
          {activeView === 'edit' ? (
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={value.bio || ''}
                onChange={handleBioChange}
                placeholder={placeholder}
                className="min-h-[200px] resize-none"
                maxLength={maxLength}
              />

              {/* Character Count */}
              <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-2 ${getCharacterCountColor()}`}>
                  <span>{charCount}</span>
                  <span>/</span>
                  <span>{maxLength}</span>
                  {charCount < minLength && (
                    <span className="text-orange-600">
                      (Minimum {minLength} characters)
                    </span>
                  )}
                </div>

                {charCount >= maxLength * 0.9 && (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[200px] p-4 border rounded-lg bg-gray-50">
              {renderPreview()}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <div key={index} className="text-sm">
                      {warning}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">{t('profile.bio.tips.title')}:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('profile.bio.tips.beSpecific')}</li>
              <li>{t('profile.bio.tips.showExperience')}</li>
              <li>{t('profile.bio.tips.useKeywords')}</li>
              <li>{t('profile.bio.tips.keepConcise')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('profile.bio.addLink')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkText">{t('profile.bio.linkText')}</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder={t('profile.bio.linkText.placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">{t('profile.bio.linkUrl')}</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={insertLink} disabled={!linkUrl.trim()}>
                  <Check className="h-4 w-4 mr-2" />
                  {t('common.add')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};