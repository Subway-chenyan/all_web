import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Plus,
  Calendar,
  MapPin,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building,
  ExternalLink,
  Check,
  AlertCircle,
  MoveUp,
  MoveDown,
  GripVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import type { ExperienceItem } from '@/types/profile';

interface ExperienceManagerProps {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
  maxItems?: number;
  enableReordering?: boolean;
  showTechnologies?: boolean;
}

const COMMON_TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Agile', 'Scrum'
];

const INDUSTRY_TYPES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
  'Media', 'Consulting', 'Manufacturing', 'Real Estate', 'Government',
  'Non-profit', 'Retail', 'Transportation', 'Energy', 'Telecommunications'
];

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experience,
  onChange,
  maxItems = 10,
  enableReordering = true,
  showTechnologies = true
}) => {
  const { t } = useTranslation();
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<ExperienceItem>>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    location: '',
    technologies: []
  });

  const handleAddExperience = useCallback(() => {
    if (!newExperience.company?.trim() || !newExperience.position?.trim()) {
      toast.error(t('profile.experience.requiredFields'));
      return;
    }

    if (experience.length >= maxItems) {
      toast.error(t('profile.experience.maxReached', { max: maxItems }));
      return;
    }

    const experienceItem: ExperienceItem = {
      id: Date.now().toString(),
      company: newExperience.company!,
      position: newExperience.position!,
      description: newExperience.description || '',
      startDate: newExperience.startDate!,
      endDate: newExperience.isCurrent ? '' : newExperience.endDate || '',
      isCurrent: newExperience.isCurrent || false,
      location: newExperience.location || '',
      technologies: newExperience.technologies || []
    };

    onChange([...experience, experienceItem]);
    setNewExperience({
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      technologies: []
    });
    setShowAddDialog(false);
    toast.success(t('profile.experience.added'));
  }, [newExperience, experience, onChange, maxItems, t]);

  const handleUpdateExperience = useCallback(() => {
    if (!editingExperience || !editingExperience.company?.trim() || !editingExperience.position?.trim()) {
      toast.error(t('profile.experience.requiredFields'));
      return;
    }

    const updatedExperience = experience.map(exp =>
      exp.id === editingExperience.id ? editingExperience : exp
    );
    onChange(updatedExperience);
    setEditingExperience(null);
    toast.success(t('profile.experience.updated'));
  }, [editingExperience, experience, onChange, t]);

  const handleDeleteExperience = useCallback((experienceId: string) => {
    const updatedExperience = experience.filter(exp => exp.id !== experienceId);
    onChange(updatedExperience);
    toast.success(t('profile.experience.deleted'));
  }, [experience, onChange, t]);

  const handleReorderExperience = useCallback((index: number, direction: 'up' | 'down') => {
    if (!enableReordering) return;

    const reorderedExperience = [...experience];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < reorderedExperience.length) {
      [reorderedExperience[index], reorderedExperience[targetIndex]] =
      [reorderedExperience[targetIndex], reorderedExperience[index]];
      onChange(reorderedExperience);
    }
  }, [experience, onChange, enableReordering]);

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

  const sortExperienceByDate = (items: ExperienceItem[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.isCurrent ? new Date() : new Date(a.endDate || a.startDate);
      const dateB = b.isCurrent ? new Date() : new Date(b.endDate || b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const sortedExperience = sortExperienceByDate(experience);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('profile.experience.title')}
              <Badge variant="outline">{experience.length}</Badge>
            </CardTitle>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={experience.length >= maxItems}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('profile.experience.add')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('profile.experience.addNew')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">{t('profile.experience.company')} *</Label>
                      <Input
                        id="company"
                        value={newExperience.company || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        placeholder={t('profile.experience.company.placeholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">{t('profile.experience.position')} *</Label>
                      <Input
                        id="position"
                        value={newExperience.position || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                        placeholder={t('profile.experience.position.placeholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">{t('profile.experience.startDate')} *</Label>
                      <Input
                        id="startDate"
                        type="month"
                        value={newExperience.startDate || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">{t('profile.experience.endDate')}</Label>
                      <Input
                        id="endDate"
                        type="month"
                        value={newExperience.endDate || ''}
                        onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                        disabled={newExperience.isCurrent}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isCurrent"
                          checked={newExperience.isCurrent || false}
                          onCheckedChange={(checked) =>
                            setNewExperience({
                              ...newExperience,
                              isCurrent: checked as boolean,
                              endDate: checked ? '' : newExperience.endDate
                            })
                          }
                        />
                        <Label htmlFor="isCurrent" className="text-sm">
                          {t('profile.experience.currentlyWork')}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t('profile.experience.location')}</Label>
                    <Input
                      id="location"
                      value={newExperience.location || ''}
                      onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                      placeholder={t('profile.experience.location.placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('profile.experience.description')}</Label>
                    <Textarea
                      id="description"
                      value={newExperience.description || ''}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      placeholder={t('profile.experience.description.placeholder')}
                      rows={4}
                    />
                  </div>

                  {showTechnologies && (
                    <div className="space-y-2">
                      <Label>{t('profile.experience.technologies')}</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {COMMON_TECHNOLOGIES.map(tech => (
                          <Badge
                            key={tech}
                            variant={newExperience.technologies?.includes(tech) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const technologies = newExperience.technologies || [];
                              if (technologies.includes(tech)) {
                                setNewExperience({
                                  ...newExperience,
                                  technologies: technologies.filter(t => t !== tech)
                                });
                              } else {
                                setNewExperience({
                                  ...newExperience,
                                  technologies: [...technologies, tech]
                                });
                              }
                            }}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder={t('profile.experience.technologies.custom')}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            const tech = target.value.trim();
                            if (tech && !newExperience.technologies?.includes(tech)) {
                              setNewExperience({
                                ...newExperience,
                                technologies: [...(newExperience.technologies || []), tech]
                              });
                              target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAddExperience}>
                      {t('common.add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {sortedExperience.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t('profile.experience.noExperience')}</h3>
              <p className="text-sm mb-4">{t('profile.experience.noExperience.description')}</p>
              <Button onClick={() => setShowAddDialog(true)}>
                {t('profile.experience.addFirst')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedExperience.map((exp, index) => (
                <Card key={exp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {enableReordering && (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderExperience(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorderExperience(index, 'down')}
                            disabled={index === sortedExperience.length - 1}
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
                              {exp.position}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Building className="h-4 w-4" />
                              <span className="font-medium">{exp.company}</span>
                              {exp.location && (
                                <>
                                  <MapPin className="h-4 w-4 ml-2" />
                                  <span>{exp.location}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(exp.startDate)} - {exp.isCurrent ? t('profile.experience.present') : formatDate(exp.endDate)}
                              </span>
                              <span className="text-gray-400">
                                ({calculateDuration(exp.startDate, exp.endDate || '', exp.isCurrent)})
                              </span>
                              {exp.isCurrent && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  {t('profile.experience.current')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(exp.id)}
                            >
                              {expandedItems.has(exp.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingExperience(exp)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {expandedItems.has(exp.id) && (
                          <div className="mt-4 space-y-3">
                            {exp.description && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {t('profile.experience.description')}
                                </h4>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                  {exp.description}
                                </p>
                              </div>
                            )}

                            {showTechnologies && exp.technologies && exp.technologies.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {t('profile.experience.technologies')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {exp.technologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="secondary">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
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

      {/* Edit Experience Dialog */}
      {editingExperience && (
        <Dialog open={!!editingExperience} onOpenChange={() => setEditingExperience(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('profile.experience.edit')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCompany">{t('profile.experience.company')} *</Label>
                  <Input
                    id="editCompany"
                    value={editingExperience.company}
                    onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPosition">{t('profile.experience.position')} *</Label>
                  <Input
                    id="editPosition"
                    value={editingExperience.position}
                    onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartDate">{t('profile.experience.startDate')} *</Label>
                  <Input
                    id="editStartDate"
                    type="month"
                    value={editingExperience.startDate}
                    onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editEndDate">{t('profile.experience.endDate')}</Label>
                  <Input
                    id="editEndDate"
                    type="month"
                    value={editingExperience.endDate || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                    disabled={editingExperience.isCurrent}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="editIsCurrent"
                      checked={editingExperience.isCurrent}
                      onCheckedChange={(checked) =>
                        setEditingExperience({
                          ...editingExperience,
                          isCurrent: checked as boolean,
                          endDate: checked ? '' : editingExperience.endDate
                        })
                      }
                    />
                    <Label htmlFor="editIsCurrent" className="text-sm">
                      {t('profile.experience.currentlyWork')}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editLocation">{t('profile.experience.location')}</Label>
                <Input
                  id="editLocation"
                  value={editingExperience.location || ''}
                  onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">{t('profile.experience.description')}</Label>
                <Textarea
                  id="editDescription"
                  value={editingExperience.description || ''}
                  onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingExperience(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdateExperience}>
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
            <p className="font-medium">{t('profile.experience.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.experience.tips.beSpecific')}</li>
              <li>• {t('profile.experience.tips.quantifyAchievements')}</li>
              <li>• {t('profile.experience.tips.useKeywords')}</li>
              <li>• {t('profile.experience.tips.focusOnRelevant')}</li>
              <li>• {t('profile.experience.tips.includeDates')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};