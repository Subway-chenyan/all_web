import React, { useState, useCallback } from 'react';
import { Star, Plus, X, TrendingUp, Award, Target } from 'lucide-react';
import { FreelancerProfile, SkillItem } from '../../types';

interface SkillAssessmentProps {
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}

const SKILL_CATEGORIES = [
  { id: 'development', name: '开发编程', icon: '💻', color: 'blue' },
  { id: 'design', name: '设计创意', icon: '🎨', color: 'purple' },
  { id: 'marketing', name: '市场营销', icon: '📈', color: 'green' },
  { id: 'writing', name: '写作翻译', icon: '✍️', color: 'yellow' },
  { id: 'video', name: '视频制作', icon: '🎬', color: 'red' },
  { id: 'audio', name: '音频制作', icon: '🎵', color: 'indigo' },
  { id: 'business', name: '商业咨询', icon: '💼', color: 'gray' },
  { id: 'data', name: '数据分析', icon: '📊', color: 'teal' },
];

const COMMON_SKILLS = {
  development: [
    { name: 'JavaScript', level: 'intermediate', category: 'development' },
    { name: 'Python', level: 'intermediate', category: 'development' },
    { name: 'React', level: 'intermediate', category: 'development' },
    { name: 'Vue.js', level: 'intermediate', category: 'development' },
    { name: 'Node.js', level: 'intermediate', category: 'development' },
    { name: 'TypeScript', level: 'intermediate', category: 'development' },
    { name: 'Java', level: 'intermediate', category: 'development' },
    { name: 'PHP', level: 'intermediate', category: 'development' },
    { name: 'C++', level: 'intermediate', category: 'development' },
    { name: 'Go', level: 'intermediate', category: 'development' },
    { name: 'Ruby', level: 'intermediate', category: 'development' },
    { name: 'Swift', level: 'intermediate', category: 'development' },
    { name: 'Kotlin', level: 'intermediate', category: 'development' },
    { name: 'Docker', level: 'intermediate', category: 'development' },
    { name: 'Kubernetes', level: 'intermediate', category: 'development' },
    { name: 'AWS', level: 'intermediate', category: 'development' },
    { name: 'Azure', level: 'intermediate', category: 'development' },
    { name: 'Google Cloud', level: 'intermediate', category: 'development' },
  ],
  design: [
    { name: 'UI设计', level: 'intermediate', category: 'design' },
    { name: 'UX设计', level: 'intermediate', category: 'design' },
    { name: '平面设计', level: 'intermediate', category: 'design' },
    { name: 'Photoshop', level: 'intermediate', category: 'design' },
    { name: 'Illustrator', level: 'intermediate', category: 'design' },
    { name: 'Figma', level: 'intermediate', category: 'design' },
    { name: 'Sketch', level: 'intermediate', category: 'design' },
    { name: 'Adobe XD', level: 'intermediate', category: 'design' },
    { name: '3D建模', level: 'intermediate', category: 'design' },
    { name: '品牌设计', level: 'intermediate', category: 'design' },
  ],
  marketing: [
    { name: 'SEO', level: 'intermediate', category: 'marketing' },
    { name: 'SEM', level: 'intermediate', category: 'marketing' },
    { name: '社交媒体营销', level: 'intermediate', category: 'marketing' },
    { name: '内容营销', level: 'intermediate', category: 'marketing' },
    { name: '邮件营销', level: 'intermediate', category: 'marketing' },
    { name: '品牌营销', level: 'intermediate', category: 'marketing' },
    { name: '增长黑客', level: 'intermediate', category: 'marketing' },
    { name: '数据分析', level: 'intermediate', category: 'marketing' },
  ],
  writing: [
    { name: '文案写作', level: 'intermediate', category: 'writing' },
    { name: '技术写作', level: 'intermediate', category: 'writing' },
    { name: '翻译', level: 'intermediate', category: 'writing' },
    { name: '内容创作', level: 'intermediate', category: 'writing' },
    { name: '编辑校对', level: 'intermediate', category: 'writing' },
    { name: '博客写作', level: 'intermediate', category: 'writing' },
    { name: '创意写作', level: 'intermediate', category: 'writing' },
  ],
  video: [
    { name: '视频剪辑', level: 'intermediate', category: 'video' },
    { name: 'After Effects', level: 'intermediate', category: 'video' },
    { name: 'Premiere Pro', level: 'intermediate', category: 'video' },
    { name: 'Final Cut Pro', level: 'intermediate', category: 'video' },
    { name: '动画制作', level: 'intermediate', category: 'video' },
    { name: '视频脚本', level: 'intermediate', category: 'video' },
    { name: '视频拍摄', level: 'intermediate', category: 'video' },
  ],
  audio: [
    { name: '音频编辑', level: 'intermediate', category: 'audio' },
    { name: '播客制作', level: 'intermediate', category: 'audio' },
    { name: '声音设计', level: 'intermediate', category: 'audio' },
    { name: '音乐制作', level: 'intermediate', category: 'audio' },
    { name: '配音', level: 'intermediate', category: 'audio' },
    { name: '混音', level: 'intermediate', category: 'audio' },
    { name: '母带处理', level: 'intermediate', category: 'audio' },
  ],
  business: [
    { name: '商业策略', level: 'intermediate', category: 'business' },
    { name: '市场研究', level: 'intermediate', category: 'business' },
    { name: '财务咨询', level: 'intermediate', category: 'business' },
    { name: '技术咨询', level: 'intermediate', category: 'business' },
    { name: '管理咨询', level: 'intermediate', category: 'business' },
    { name: '项目管理', level: 'intermediate', category: 'business' },
    { name: '敏捷开发', level: 'intermediate', category: 'business' },
    { name: 'Scrum', level: 'intermediate', category: 'business' },
  ],
  data: [
    { name: '数据分析', level: 'intermediate', category: 'data' },
    { name: 'Excel', level: 'intermediate', category: 'data' },
    { name: 'SQL', level: 'intermediate', category: 'data' },
    { name: 'Tableau', level: 'intermediate', category: 'data' },
    { name: 'Power BI', level: 'intermediate', category: 'data' },
    { name: 'Python数据分析', level: 'intermediate', category: 'data' },
    { name: 'R语言', level: 'intermediate', category: 'data' },
    { name: '机器学习', level: 'intermediate', category: 'data' },
  ],
};

const SKILL_LEVELS = {
  beginner: { name: '初学者', description: '刚入门，需要指导', color: 'gray' },
  intermediate: { name: '中级', description: '能独立完成工作', color: 'blue' },
  advanced: { name: '高级', description: '经验丰富，能处理复杂问题', color: 'purple' },
  expert: { name: '专家', description: '行业权威，能指导他人', color: 'green' },
};

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  data,
  onUpdate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customSkill, setCustomSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddSkill = useCallback((skillName: string, category: string, level: string = 'intermediate') => {
    const newSkill: SkillItem = {
      id: Date.now().toString(),
      name: skillName,
      category,
      level: level as SkillItem['level'],
      yearsExperience: 1,
      isVerified: false,
    };

    const existingSkills = data.skills || [];

    // Check for duplicates
    if (existingSkills.some(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
      return;
    }

    onUpdate({
      ...data,
      skills: [...existingSkills, newSkill]
    });

    setCustomSkill('');
    setShowSuggestions(false);
  }, [data, onUpdate]);

  const handleRemoveSkill = useCallback((skillId: string) => {
    const existingSkills = data.skills || [];
    onUpdate({
      ...data,
      skills: existingSkills.filter(skill => skill.id !== skillId)
    });
  }, [data, onUpdate]);

  const handleUpdateSkill = useCallback((skillId: string, field: keyof SkillItem, value: any) => {
    const existingSkills = data.skills || [];
    onUpdate({
      ...data,
      skills: existingSkills.map(skill =>
        skill.id === skillId ? { ...skill, [field]: value } : skill
      )
    });
  }, [data, onUpdate]);

  const getSkillsByCategory = useCallback((category: string) => {
    return COMMON_SKILLS[category as keyof typeof COMMON_SKILLS] || [];
  }, []);

  const calculateSkillScore = useCallback(() => {
    const skills = data.skills || [];
    if (skills.length === 0) return 0;

    const levelScores = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };

    const totalScore = skills.reduce((sum, skill) => {
      const levelScore = levelScores[skill.level] || 1;
      const experienceBonus = Math.min(skill.yearsExperience * 0.1, 1);
      return sum + (levelScore + experienceBonus);
    }, 0);

    return Math.round((totalScore / skills.length) * 25);
  }, [data.skills]);

  const currentSkills = data.skills || [];
  const skillScore = calculateSkillScore();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">技能评估</h2>
        <p className="text-gray-600">
          选择您擅长的技能，诚实地评估您的熟练程度和经验
        </p>
      </div>

      {/* Skill Score */}
      {currentSkills.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">技能评分</h3>
              <p className="text-sm text-gray-600">基于您的技能水平和工作经验</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{skillScore}</div>
              <div className="text-sm text-gray-600">/ 100</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(skillScore, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">选择技能类别</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SKILL_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-gray-900">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Skill Suggestions */}
      {selectedCategory && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {SKILL_CATEGORIES.find(cat => cat.id === selectedCategory)?.name} 技能
          </h3>

          <div className="mb-4">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => {
                setCustomSkill(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="搜索或输入自定义技能..."
            />
          </div>

          {/* Common Skills */}
          <div className="space-y-3">
            {getSkillsByCategory(selectedCategory)
              .filter(skill =>
                skill.name.toLowerCase().includes(customSkill.toLowerCase()) ||
                customSkill.length === 0
              )
              .slice(0, 8)
              .map(skill => {
                const isAdded = currentSkills.some(s => s.name === skill.name);
                return (
                  <div key={skill.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-500">
                          {SKILL_LEVELS[skill.level as keyof typeof SKILL_LEVELS]?.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSkill(skill.name, skill.category, skill.level)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAdded ? '已添加' : '添加'}
                    </button>
                  </div>
                );
              })}

            {/* Custom Skill */}
            {customSkill && !getSkillsByCategory(selectedCategory).some(s =>
              s.name.toLowerCase().includes(customSkill.toLowerCase())
            ) && (
              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{customSkill}</div>
                    <div className="text-sm text-gray-500">自定义技能</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddSkill(customSkill, selectedCategory)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  添加自定义
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Skills */}
      {currentSkills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">已选择的技能 ({currentSkills.length})</h3>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              技能评分: {skillScore}
            </div>
          </div>

          <div className="space-y-3">
            {currentSkills.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${SKILL_LEVELS[skill.level].color}-100 text-${SKILL_LEVELS[skill.level].color}-700`}>
                      {SKILL_LEVELS[skill.level].name}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">熟练度</label>
                      <select
                        value={skill.level}
                        onChange={(e) => handleUpdateSkill(skill.id, 'level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {Object.entries(SKILL_LEVELS).map(([value, level]) => (
                          <option key={value} value={value}>{level.name} - {level.description}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">经验年限</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={skill.yearsExperience}
                          onChange={(e) => handleUpdateSkill(skill.id, 'yearsExperience', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {skill.yearsExperience}年
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="ml-4 p-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Award className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">技能评估建议</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 选择您真正擅长并能够提供高质量服务的技能</li>
              <li>• 诚实地评估您的熟练程度，这有助于建立客户信任</li>
              <li>• 建议添加5-15个核心技能，突出您的专业优势</li>
              <li>• 定期更新您的技能水平，反映真实的成长进度</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};