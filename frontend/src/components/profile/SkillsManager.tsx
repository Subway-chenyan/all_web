import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Star,
  Clock,
  Award,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import type { SkillItem, SkillCategory } from '@/types/profile';

interface SkillsManagerProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
  maxSkills?: number;
  showVerification?: boolean;
  enableReordering?: boolean;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'programming',
    name: 'Programming',
    skills: ['JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js', 'Vue.js', 'Angular', 'Go', 'Rust'],
    icon: '💻'
  },
  {
    id: 'design',
    name: 'Design',
    skills: ['UI/UX', 'Photoshop', 'Figma', 'Sketch', 'Illustrator', 'Adobe XD', 'InDesign', 'After Effects'],
    icon: '🎨'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    skills: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Email Marketing', 'Google Analytics', 'Facebook Ads'],
    icon: '📈'
  },
  {
    id: 'writing',
    name: 'Writing',
    skills: ['Technical Writing', 'Copywriting', 'Content Writing', 'Blog Writing', 'Grant Writing', 'Resume Writing'],
    icon: '✍️'
  },
  {
    id: 'business',
    name: 'Business',
    skills: ['Project Management', 'Business Analysis', 'Data Analysis', 'Market Research', 'Strategic Planning', 'Consulting'],
    icon: '💼'
  },
  {
    id: 'language',
    name: 'Languages',
    skills: ['English', 'Mandarin', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Arabic'],
    icon: '🌍'
  }
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-500', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-500', description: 'Comfortable with basic tasks' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-500', description: 'Can handle complex projects' },
  { value: 'expert', label: 'Expert', color: 'bg-yellow-500', description: 'Mastery level' }
] as const;

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onChange,
  maxSkills = 20,
  showVerification = true,
  enableReordering = true
}) => {
  const { t } = useTranslation();
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'experience'>('name');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillItem>>({
    name: '',
    category: 'programming',
    level: 'intermediate',
    yearsExperience: 1,
    isVerified: false
  });

  const filteredAndSortedSkills = useMemo(() => {
    let filtered = skills;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          const levelOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          return levelOrder[b.level] - levelOrder[a.level];
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        default:
          return 0;
      }
    });
  }, [skills, searchTerm, selectedCategory, sortBy]);

  const skillStats = useMemo(() => {
    const stats = {
      total: skills.length,
      verified: skills.filter(s => s.isVerified).length,
      expert: skills.filter(s => s.level === 'expert').length,
      advanced: skills.filter(s => s.level === 'advanced').length,
      categories: {} as Record<string, number>
    };

    skills.forEach(skill => {
      stats.categories[skill.category] = (stats.categories[skill.category] || 0) + 1;
    });

    return stats;
  }, [skills]);

  const handleAddSkill = useCallback(() => {
    if (!newSkill.name?.trim()) {
      toast.error(t('profile.skills.nameRequired'));
      return;
    }

    if (skills.some(s => s.name.toLowerCase() === newSkill.name!.toLowerCase())) {
      toast.error(t('profile.skills.alreadyExists'));
      return;
    }

    if (skills.length >= maxSkills) {
      toast.error(t('profile.skills.maxReached', { max: maxSkills }));
      return;
    }

    const skill: SkillItem = {
      id: Date.now().toString(),
      name: newSkill.name!,
      category: newSkill.category || 'programming',
      level: newSkill.level as any,
      yearsExperience: newSkill.yearsExperience || 1,
      isVerified: false
    };

    onChange([...skills, skill]);
    setNewSkill({
      name: '',
      category: 'programming',
      level: 'intermediate',
      yearsExperience: 1,
      isVerified: false
    });
    setShowAddDialog(false);
    toast.success(t('profile.skills.added'));
  }, [newSkill, skills, onChange, maxSkills, t]);

  const handleUpdateSkill = useCallback(() => {
    if (!editingSkill || !editingSkill.name?.trim()) {
      toast.error(t('profile.skills.nameRequired'));
      return;
    }

    const updatedSkills = skills.map(skill =>
      skill.id === editingSkill.id ? editingSkill : skill
    );
    onChange(updatedSkills);
    setEditingSkill(null);
    toast.success(t('profile.skills.updated'));
  }, [editingSkill, skills, onChange, t]);

  const handleDeleteSkill = useCallback((skillId: string) => {
    const updatedSkills = skills.filter(skill => skill.id !== skillId);
    onChange(updatedSkills);
    toast.success(t('profile.skills.deleted'));
  }, [skills, onChange, t]);

  const handleReorderSkills = useCallback((dragIndex: number, dropIndex: number) => {
    if (!enableReordering) return;

    const reorderedSkills = [...filteredAndSortedSkills];
    const [removed] = reorderedSkills.splice(dragIndex, 1);
    reorderedSkills.splice(dropIndex, 0, removed);
    onChange(reorderedSkills);
  }, [filteredAndSortedSkills, onChange, enableReordering]);

  const getProficiencyBadge = (level: string) => {
    const proficiency = PROFICIENCY_LEVELS.find(p => p.value === level);
    return proficiency ? (
      <Badge variant="secondary" className={`${proficiency.color} text-white`}>
        {proficiency.label}
      </Badge>
    ) : null;
  };

  const getExperienceColor = (years: number) => {
    if (years >= 10) return 'text-purple-600';
    if (years >= 5) return 'text-blue-600';
    if (years >= 2) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('profile.skills.title')}
              <Badge variant="outline">{skillStats.total}</Badge>
            </CardTitle>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={skills.length >= maxSkills}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('profile.skills.add')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('profile.skills.addNew')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skillName">{t('profile.skills.name')}</Label>
                    <Input
                      id="skillName"
                      value={newSkill.name || ''}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder={t('profile.skills.name.placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('profile.skills.category')}</Label>
                    <Select
                      value={newSkill.category}
                      onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('profile.skills.level')}</Label>
                    <Select
                      value={newSkill.level}
                      onValueChange={(value) => setNewSkill({ ...newSkill, level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-gray-500">{level.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">{t('profile.skills.experience')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        max="50"
                        value={newSkill.yearsExperience || 1}
                        onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value) || 1 })}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">{t('profile.skills.years')}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAddSkill}>
                      {t('common.add')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{skillStats.total}</div>
              <div className="text-sm text-gray-600">{t('profile.skills.stats.total')}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{skillStats.verified}</div>
              <div className="text-sm text-gray-600">{t('profile.skills.stats.verified')}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{skillStats.expert}</div>
              <div className="text-sm text-gray-600">{t('profile.skills.stats.expert')}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillStats.advanced}</div>
              <div className="text-sm text-gray-600">{t('profile.skills.stats.advanced')}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('profile.skills.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('profile.skills.filterCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('profile.skills.allCategories')}</SelectItem>
                {SKILL_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('profile.skills.sortByName')}</SelectItem>
                <SelectItem value="level">{t('profile.skills.sortByLevel')}</SelectItem>
                <SelectItem value="experience">{t('profile.skills.sortByExperience')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skills List */}
          {filteredAndSortedSkills.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t('profile.skills.noSkills')}</h3>
              <p className="text-sm mb-4">{t('profile.skills.noSkills.description')}</p>
              <Button onClick={() => setShowAddDialog(true)}>
                {t('profile.skills.addFirst')}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedSkills.map((skill, index) => (
                <Card key={skill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {enableReordering && (
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{skill.name}</h3>
                          {getProficiencyBadge(skill.level)}
                          {skill.isVerified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              {t('profile.skills.verified')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className={getExperienceColor(skill.yearsExperience)}>
                              {skill.yearsExperience} {t('profile.skills.years')}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>{SKILL_CATEGORIES.find(c => c.id === skill.category)?.icon}</span>
                            <span>{SKILL_CATEGORIES.find(c => c.id === skill.category)?.name}</span>
                          </span>
                        </div>

                        {/* Experience Progress Bar */}
                        <div className="mt-2">
                          <Progress
                            value={Math.min((skill.yearsExperience / 10) * 100, 100)}
                            className="h-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSkill(skill)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Skill Dialog */}
      {editingSkill && (
        <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('profile.skills.editSkill')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editSkillName">{t('profile.skills.name')}</Label>
                <Input
                  id="editSkillName"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('profile.skills.category')}</Label>
                <Select
                  value={editingSkill.category}
                  onValueChange={(value) => setEditingSkill({ ...editingSkill, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('profile.skills.level')}</Label>
                <Select
                  value={editingSkill.level}
                  onValueChange={(value) => setEditingSkill({ ...editingSkill, level: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editYearsExperience">{t('profile.skills.experience')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="editYearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={editingSkill.yearsExperience}
                    onChange={(e) => setEditingSkill({ ...editingSkill, yearsExperience: parseInt(e.target.value) || 1 })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">{t('profile.skills.years')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSkill(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdateSkill}>
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
            <p className="font-medium">{t('profile.skills.tips.title')}:</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('profile.skills.tips.beSpecific')}</li>
              <li>• {t('profile.skills.tips.showProgression')}</li>
              <li>• {t('profile.skills.tips.relevantSkills')}</li>
              <li>• {t('profile.skills.tips.verifySkills')}</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};