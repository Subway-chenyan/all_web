import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Plus,
  Calendar,
  Building,
  Award,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  MoveUp,
  MoveDown,
  Upload,
  FileText,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import type { EducationItem } from '@/types/profile';

interface EducationManagerProps {
  education: EducationItem[];
  onChange: (education: EducationItem[]) => void;
  maxItems?: number;
  enableReordering?: boolean;
  showDocumentUpload?: boolean;
}

const EDUCATION_LEVELS = [
  { value: 'high_school', label: '高中', weight: 1 },
  { value: 'associate', label: '专科', weight: 2 },
  { value: 'bachelor', label: '本科', weight: 3 },
  { value: 'master', label: '硕士', weight: 4 },
  { value: 'doctorate', label: '博士', weight: 5 },
  { value: 'postdoc', label: '博士后', weight: 6 },
  { value: 'certificate', label: '证书', weight: 2 },
  { value: 'diploma', label: '文凭', weight: 2 }
];

const FIELDS_OF_STUDY = [
  'Computer Science', 'Engineering', 'Business', 'Medicine', 'Law',
  'Arts', 'Science', 'Mathematics', 'Education', 'Psychology',
  'Design', 'Architecture', 'Journalism', 'Literature', 'History',
  'Philosophy', 'Economics', 'Finance', 'Marketing', 'Communication'
];

const COMMON_INSTITUTIONS = [
  '清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学',
  '南京大学', '中山大学', '华中科技大学', '西安交通大学', '哈尔滨工业大学',
  'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Oxford University',
  'Cambridge University', 'ETH Zurich', 'NUS', 'University of Tokyo', 'Tsinghua University'
];

export const EducationManager: React.FC<EducationManagerProps> = ({
  education,
  onChange,
  maxItems = 10,
  enableReordering = true,
  showDocumentUpload = true
}) => {
  const { t } = useTranslation();
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEducation, setNewEducation] = useState<Partial<EducationItem>>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    diplomaDocument: ''
  });

  const handleAddEducation = useCallback(() => {
    if (!newEducation.institution?.trim() || !newEducation.degree?.trim() || !newEducation.field?.trim()) {
      toast.error(t('profile.education.requiredFields'));
      return;
    }

    if (education.length >= maxItems) {
      toast.error(t('profile.education.maxReached', { max: maxItems }));
      return;
    }

    const educationItem: EducationItem = {
      id: Date.now().toString(),
      institution: newEducation.institution!,
      degree: newEducation.degree!,
      field: newEducation.field!,
      startDate: newEducation.startDate!,
      endDate: newEducation.isCurrent ? '' : newEducation.endDate || '',
      isCurrent: newEducation.isCurrent || false,
      diplomaDocument: newEducation.diplomaDocument || ''
    };

    onChange([...education, educationItem]);
    setNewEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      diplomaDocument: ''
    });
    setShowAddDialog(false);
    toast.success(t('profile.education.added'));
  }, [newEducation, education, onChange, maxItems, t]);

  const handleUpdateEducation = useCallback(() => {
    if (!editingEducation || !editingEducation.institution?.trim() || !editingEducation.degree?.trim() || !editingEducation.field?.trim()) {
      toast.error(t('profile.education.requiredFields'));
      return;
    }

    const updatedEducation = education.map(edu =>
      edu.id === editingEducation.id ? editingEducation : edu
    );
    onChange(updatedEducation);
    setEditingEducation(null);
    toast.success(t('profile.education.updated'));
  }, [editingEducation, education, onChange, t]);

  const handleDeleteEducation = useCallback((educationId: string) => {
    const updatedEducation = education.filter(edu => edu.id !== educationId);
    onChange(updatedEducation);
    toast.success(t('profile.education.deleted'));
  }, [education, onChange, t]);

  const handleReorderEducation = useCallback((index: number, direction: 'up' | 'down') => {
    if (!enableReordering) return;

    const reorderedEducation = [...education];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < reorderedEducation.length) {
      [reorderedEducation[index], reorderedEducation[targetIndex]] =
      [reorderedEducation[targetIndex], reorderedEducation[index]];
      onChange(reorderedEducation);
    }
  }, [education, onChange, enableReordering]);

  const toggleExpanded = useCallback((id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  }, [expandedItems]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  const calculateDuration = (startDate: string, endDate: string, isCurrent: boolean) => {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : new Date(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return remainingMonths > 0
        ? `${years}年${remainingMonths}个月`
        : `${years}年`;
    }
    return `${remainingMonths}个月`;
  };

  const getEducationLevelWeight = (degree: string) => {
    const level = EDUCATION_LEVELS.find(l => l.label === degree || l.value === degree);
    return level ? level.weight : 0;
  };

  const sortEducationByLevel = (items: EducationItem[]) => {
    return [...items].sort((a, b) => {
      const weightA = getEducationLevelWeight(a.degree);
      const weightB = getEducationLevelWeight(b.degree);
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      // If same level, sort by date (most recent first)
      const dateA = a.isCurrent ? new Date() : new Date(a.endDate || a.startDate);
      const dateB = b.isCurrent ? new Date() : new Date(b.endDate || b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const sortedEducation = sortEducationByLevel(education);

  const handleDocumentUpload = useCallback(async (file: File) => {
    // TODO: Implement actual file upload
    const mockDocumentUrl = URL.createObjectURL(file);
    return mockDocumentUrl;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {t('profile.education.title')}
              <Badge variant="outline">{education.length}</Badge>
            </CardTitle>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={education.length >= maxItems}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('profile.education.add')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('profile.education.addNew')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">{t('profile.education.institution')} *</Label>
                    <Input
                      id="institution"
                      value={newEducation.institution || ''}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                      placeholder={t('profile.education.institution.placeholder')}
                    />
                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2">
                      {COMMON_INSTITUTIONS.filter(inst =>
                        inst.toLowerCase().includes((newEducation.institution || '').toLowerCase())
                      ).slice(0, 5).map(inst => (
                        <Button
                          key={inst}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewEducation({ ...newEducation, institution: inst })}
                          className="text-xs"
                        >
                          {inst}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">{t('profile.education.degree')} *</Label>
                      <Select
                        value={newEducation.degree || ''}
                        onValueChange={(value) => setNewEducation({ ...newEducation, degree: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.education.degree.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.label}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="field">{t('profile.education.field')} *</Label>
                      <Input
                        id="field"
                        value={newEducation.field || ''}
                        onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                        placeholder={t('profile.education.field.placeholder')}
                      />
                      {/* Field suggestions */}
                      <div className="flex flex-wrap gap-2">
                        {FIELDS_OF_STUDY.filter(field =>
                          field.toLowerCase().includes((newEducation.field || '').toLowerCase())
                        ).slice(0, 3).map(field => (
                          <Button
                            key={field}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewEducation({ ...newEducation, field })}
                            className="text-xs"
                          >
                            {field}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">{t('profile.education.startDate')} *</Label>
                      <Input
                        id="startDate"
                        type="month"
                        value={newEducation.startDate || ''}
                        onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">{t('profile.education.endDate')}</Label>
                      <Input
                        id="endDate"
                        type="month"
                        value={newEducation.endDate || ''}
                        onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                        disabled={newEducation.isCurrent}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isCurrent"
                          checked={newEducation.isCurrent || false}
                          onCheckedChange={(checked) =>
                            setNewEducation({
                              ...newEducation,
                              isCurrent: checked as boolean,
                              endDate: checked ? '' : newEducation.endDate
                            })
                          }
                        />
                        <Label htmlFor="isCurrent" className="text-sm">
                          {t('profile.education.currentlyStudy')}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {showDocumentUpload && (
                    <div className="space-y-2">
                      <Label htmlFor="diplomaDocument">{t('profile.education.diplomaDocument')}</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="diplomaDocument"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const documentUrl = await handleDocumentUpload(file);
                              setNewEducation({ ...newEducation, diplomaDocument: documentUrl });
                            }
                          }}
                          className="flex-1"
                        />
                        {newEducation.diplomaDocument && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('profile.education.documentHelp')}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAddEducation}>
                      {t('common.add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {sortedEducation.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t('profile.education.noEducation')}</h3>
              <p className="text-sm mb-4">{t('profile.education.noEducation.description')}</p>
              <Button onClick={() => setShowAddDialog(true)}>
                {t('profile.education.addFirst')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEducation.map((edu, index) => (
                <Card key={edu.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {enableReordering && (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderEducation(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderEducation(index, 'down')}
                            disabled={index === sortedEducation.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {edu.degree}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Building className="h-4 w-4" />
                              <span className="font-medium">{edu.institution}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Award className="h-4 w-4" />
                              <span>{edu.field}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(edu.startDate)} - {edu.isCurrent ? t('profile.education.present') : formatDate(edu.endDate)}
                              </span>
                              <span className="text-gray-400">
                                ({calculateDuration(edu.startDate, edu.endDate || '', edu.isCurrent)})
                              </span>
                              {edu.isCurrent && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  {t('profile.education.current')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {edu.diplomaDocument && (
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(edu.id)}
                            >
                              {expandedItems.has(edu.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEducation(edu)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {expandedItems.has(edu.id) && (
                          <div className="mt-4 space-y-3">
                            {edu.diplomaDocument && (
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                  {t('profile.education.documentUploaded')}
                                </span>
                                <Button variant="outline" size="sm" className="ml-auto">
                                  <Download className="h-4 w-4 mr-1" />
                                  {t('common.download')}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Education Dialog */}
      {editingEducation && (
        <Dialog open={!!editingEducation} onOpenChange={() => setEditingEducation(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('profile.education.edit')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editInstitution">{t('profile.education.institution')} *</Label>
                <Input
                  id="editInstitution"
                  value={editingEducation.institution}
                  onChange={(e) => setEditingEducation({ ...editingEducation, institution: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDegree">{t('profile.education.degree')} *</Label>
                  <Select
                    value={editingEducation.degree}
                    onValueChange={(value) => setEditingEducation({ ...editingEducation, degree: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.label}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editField">{t('profile.education.field')} *</Label>
                  <Input
                    id="editField"
                    value={editingEducation.field}
                    onChange={(e) => setEditingEducation({ ...editingEducation, field: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartDate">{t('profile.education.startDate')} *</Label>
                  <Input
                    id="editStartDate"
                    type="month"
                    value={editingEducation.startDate}
                    onChange={(e) => setEditingEducation({ ...editingEducation, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editEndDate">{t('profile.education.endDate')}</Label>
                  <Input
                    id="editEndDate"
                    type="month"
                    value={editingEducation.endDate || ''}
                    onChange={(e) => setEditingEducation({ ...editingEducation, endDate: e.target.value })}
                    disabled={editingEducation.isCurrent}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="editIsCurrent"
                      checked={editingEducation.isCurrent}
                      onCheckedChange={(checked) =>
                        setEditingEducation({
                          ...editingEducation,
                          isCurrent: checked as boolean,
                          endDate: checked ? '' : editingEducation.endDate
                        })
                      }
                    />
                    <Label htmlFor="editIsCurrent" className="text-sm">
                      {t('profile.education.currentlyStudy')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEducation(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdateEducation}>
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
            <p className="font-medium">{t('profile.education.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.education.tips.beAccurate')}</li>
              <li>• {t('profile.education.tips.includeDates')}</li>
              <li>• {t('profile.education.tips.uploadDocuments')}</li>
              <li>• {t('profile.education.tips.listInReverse')}</li>
              <li>• {t('profile.education.tips.includeRelevant')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};