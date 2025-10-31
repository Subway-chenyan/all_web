import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, Clock, Star, Award, AlertCircle, Plus, X } from 'lucide-react';
import { verificationService } from '../../services/verification';
import { SkillItem } from '../../types';

interface SkillsVerificationProps {
  onSkillsUpdate: (skills: SkillItem[]) => void;
  onVerificationError: (error: string) => void;
}

interface SkillForm {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  document?: File;
}

const SKILL_CATEGORIES = [
  { id: 'programming', name: '编程开发', icon: '💻' },
  { id: 'design', name: '设计创意', icon: '🎨' },
  { id: 'marketing', name: '市场营销', icon: '📈' },
  { id: 'writing', name: '写作翻译', icon: '✍️' },
  { id: 'data', name: '数据分析', icon: '📊' },
  { id: 'management', name: '项目管理', icon: '📋' },
  { id: 'video', name: '视频制作', icon: '🎬' },
  { id: 'audio', name: '音频制作', icon: '🎵' },
  { id: 'consulting', name: '商业咨询', icon: '💼' },
  { id: 'other', name: '其他技能', icon: '⚡' },
];

const LEVEL_DESCRIPTIONS = {
  beginner: '初学者 - 基础了解，需要指导',
  intermediate: '中级水平 - 可以独立完成任务',
  advanced: '高级水平 - 经验丰富，能处理复杂问题',
  expert: '专家级别 - 行业权威，可以指导他人',
};

const COMMON_SKILLS = {
  programming: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'PHP', 'C++'],
  design: ['UI设计', '平面设计', 'Photoshop', 'Figma', '插画', '3D建模', '品牌设计'],
  marketing: ['SEO', 'SEM', '社交媒体营销', '内容营销', '邮件营销', '品牌营销'],
  writing: ['文案写作', '技术写作', '翻译', '内容创作', '编辑校对', '博客写作'],
  data: ['数据分析', 'Excel', 'SQL', 'Tableau', 'Python数据分析', '商业分析'],
  management: ['项目管理', '敏捷开发', '团队管理', 'Scrum', '产品管理'],
  video: ['视频剪辑', 'After Effects', 'Premiere Pro', '动画制作', '视频脚本'],
  audio: ['音频编辑', '播客制作', '声音设计', '音乐制作', '配音'],
  consulting: ['商业策略', '市场研究', '财务咨询', '技术咨询', '管理咨询'],
  other: ['客户服务', '虚拟助理', '数据录入', '市场调研', '培训'],
};

export const SkillsVerification: React.FC<SkillsVerificationProps> = ({
  onSkillsUpdate,
  onVerificationError,
}) => {
  const [skills, setSkills] = useState<SkillForm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);

  const [newSkill, setNewSkill] = useState<SkillForm>({
    id: Date.now().toString(),
    name: '',
    category: '',
    level: 'intermediate',
    yearsExperience: 1,
  });

  const handleInputChange = useCallback((
    field: keyof SkillForm,
    value: string | number | File
  ) => {
    setNewSkill(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addSkill = useCallback(() => {
    if (!newSkill.name.trim()) {
      onVerificationError('请输入技能名称');
      return;
    }

    if (!newSkill.category) {
      onVerificationError('请选择技能分类');
      return;
    }

    // Check for duplicates
    if (skills.some(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase())) {
      onVerificationError('该技能已存在');
      return;
    }

    setSkills(prev => [...prev, newSkill]);
    setNewSkill({
      id: Date.now().toString(),
      name: '',
      category: '',
      level: 'intermediate',
      yearsExperience: 1,
    });
    setSelectedCategory('');
    setIsAdding(false);
  }, [newSkill, skills, onVerificationError]);

  const removeSkill = useCallback((id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  }, []);

  const updateSkillLevel = useCallback((id: string, level: SkillForm['level']) => {
    setSkills(prev => prev.map(skill =>
      skill.id === id ? { ...skill, level } : skill
    ));
  }, []);

  const updateSkillExperience = useCallback((id: string, yearsExperience: number) => {
    setSkills(prev => prev.map(skill =>
      skill.id === id ? { ...skill, yearsExperience } : skill
    ));
  }, []);

  const assessSkills = useCallback(async () => {
    if (skills.length === 0) {
      onVerificationError('请先添加技能');
      return;
    }

    try {
      const assessmentData = skills.map(skill => ({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        years_experience: skill.yearsExperience,
      }));

      const results = await verificationService.assessSkills(assessmentData);
      setAssessmentResults(results);
    } catch (error: any) {
      onVerificationError(error.message || '技能评估失败');
    }
  }, [skills, onVerificationError]);

  const submitSkills = useCallback(async () => {
    if (skills.length === 0) {
      onVerificationError('请至少添加一个技能');
      return;
    }

    try {
      const skillItems: SkillItem[] = skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        yearsExperience: skill.yearsExperience,
        isVerified: false,
      }));

      onSkillsUpdate(skillItems);
    } catch (error: any) {
      onVerificationError(error.message || '提交失败');
    }
  }, [skills, onSkillsUpdate, onVerificationError]);

  const getFilteredSkills = useCallback(() => {
    if (!selectedCategory) return [];
    return COMMON_SKILLS[selectedCategory as keyof typeof COMMON_SKILLS] || [];
  }, [selectedCategory]);

  const getLevelIcon = (level: SkillForm['level']) => {
    switch (level) {
      case 'beginner': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'intermediate': return <Star className="w-4 h-4 text-blue-500" />;
      case 'advanced': return <Award className="w-4 h-4 text-purple-500" />;
      case 'expert': return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const SkillCard: React.FC<{ skill: SkillForm }> = ({ skill }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {getLevelIcon(skill.level)}
            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {SKILL_CATEGORIES.find(cat => cat.id === skill.category)?.name}
          </p>
        </div>
        <button
          onClick={() => removeSkill(skill.id)}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">熟练度</label>
          <select
            value={skill.level}
            onChange={(e) => updateSkillLevel(skill.id, e.target.value as SkillForm['level'])}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(LEVEL_DESCRIPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">经验年限</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="20"
              value={skill.yearsExperience}
              onChange={(e) => updateSkillExperience(skill.id, parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-700 w-12 text-right">
              {skill.yearsExperience}年
            </span>
          </div>
        </div>
      </div>

      {assessmentResults.find(r => r.skill === skill.name) && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-xs text-green-800">
            ✓ 技能评估匹配度: {assessmentResults.find(r => r.skill === skill.name)?.match_score}%
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">技能验证说明</h3>
            <p className="mt-1 text-sm text-blue-800">
              选择您擅长的技能，诚实评估您的熟练程度和经验年限。我们将通过专业评估来验证您的技能水平。
            </p>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {skills.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">已添加的技能 ({skills.length})</h3>
            {assessmentResults.length === 0 && (
              <button
                onClick={assessSkills}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                评估技能匹配度
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Add New Skill Form */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">添加新技能</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              技能分类 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {SKILL_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    handleInputChange('category', category.id);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  技能名称 *
                </label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入您的技能名称"
                />

                {/* Common Skills Suggestions */}
                {getFilteredSkills().length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">常见技能建议：</p>
                    <div className="flex flex-wrap gap-1">
                      {getFilteredSkills()
                        .filter(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleInputChange('name', skill)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
                          >
                            {skill}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    熟练度 *
                  </label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => handleInputChange('level', e.target.value as SkillForm['level'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(LEVEL_DESCRIPTIONS).map(([value, label]) => (
                      <option key={value} value={value}>{label.split(' - ')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    经验年限 *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newSkill.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSkill({
                  id: Date.now().toString(),
                  name: '',
                  category: '',
                  level: 'intermediate',
                  yearsExperience: 1,
                });
                setSelectedCategory('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={addSkill}
              disabled={!selectedCategory || !newSkill.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              添加技能
            </button>
          </div>
        </div>
      )}

      {/* Add Skill Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加技能
        </button>
      )}

      {/* Assessment Results */}
      {assessmentResults.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2">技能评估结果</h4>
          <div className="space-y-1">
            {assessmentResults.map((result, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-green-800">{result.skill}</span>
                <span className="text-green-700 font-medium">
                  {result.match_score}% 匹配度
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {skills.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={submitSkills}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            提交技能列表
          </button>
        </div>
      )}
    </div>
  );
};