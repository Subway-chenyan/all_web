import React, { useState, useCallback } from 'react';
import { MapPin, Globe, Clock, User, Building, Briefcase, GraduationCap } from 'lucide-react';
import { FreelancerProfile } from '../../types';

interface ProfessionalInfoFormProps {
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}

const CHINA_PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东',
  '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'
];

const CHINA_TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'Asia/Urumqi', label: '乌鲁木齐时间 (UTC+6)' },
];

const LANGUAGES = [
  { code: 'zh', name: '中文', levels: ['native', 'professional'] },
  { code: 'en', name: '英语', levels: ['basic', 'conversational', 'professional'] },
  { code: 'ja', name: '日语', levels: ['basic', 'conversational', 'professional'] },
  { code: 'ko', name: '韩语', levels: ['basic', 'conversational', 'professional'] },
  { code: 'fr', name: '法语', levels: ['basic', 'conversational', 'professional'] },
  { code: 'de', name: '德语', levels: ['basic', 'conversational', 'professional'] },
  { code: 'es', name: '西班牙语', levels: ['basic', 'conversational', 'professional'] },
];

const LANGUAGE_LEVELS = {
  basic: '基础',
  conversational: '会话',
  professional: '专业',
  native: '母语'
};

export const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({
  data,
  onUpdate,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof FreelancerProfile, value: any) => {
    onUpdate({ ...data, [field]: value });
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [data, onUpdate, errors]);

  const handleLanguageChange = useCallback((index: number, field: string, value: any) => {
    const languages = [...(data.languages || [])];
    if (!languages[index]) {
      languages[index] = { language: '', proficiency: 'basic' as const };
    }
    languages[index] = { ...languages[index], [field]: value };
    handleChange('languages', languages);
  }, [data.languages, handleChange]);

  const addLanguage = useCallback(() => {
    const languages = [...(data.languages || [])];
    languages.push({ language: '', proficiency: 'basic' as const });
    handleChange('languages', languages);
  }, [data.languages, handleChange]);

  const removeLanguage = useCallback((index: number) => {
    const languages = [...(data.languages || [])];
    languages.splice(index, 1);
    handleChange('languages', languages);
  }, [data.languages, handleChange]);

  const handleEducationChange = useCallback((index: number, field: string, value: any) => {
    const education = [...(data.education || [])];
    if (!education[index]) {
      education[index] = {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      };
    }
    education[index] = { ...education[index], [field]: value };
    handleChange('education', education);
  }, [data.education, handleChange]);

  const addEducation = useCallback(() => {
    const education = [...(data.education || [])];
    education.push({
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
    handleChange('education', education);
  }, [data.education, handleChange]);

  const removeEducation = useCallback((index: number) => {
    const education = [...(data.education || [])];
    education.splice(index, 1);
    handleChange('education', education);
  }, [data.education, handleChange]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!data.professionalTitle?.trim()) {
      newErrors.professionalTitle = '请输入职业头衔';
    }

    if (!data.bio?.trim()) {
      newErrors.bio = '请输入个人简介';
    } else if (data.bio.length < 50) {
      newErrors.bio = '个人简介至少需要50个字符';
    } else if (data.bio.length > 1000) {
      newErrors.bio = '个人简介不能超过1000个字符';
    }

    if (!data.hourlyRate || data.hourlyRate <= 0) {
      newErrors.hourlyRate = '请输入有效的小时费率';
    }

    if (!data.responseTime || data.responseTime <= 0) {
      newErrors.responseTime = '请输入有效的响应时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">专业信息</h2>
        <p className="text-gray-600">
          完善您的专业资料，让客户更好地了解您的专业能力
        </p>
      </div>

      {/* Company Information for Business Accounts */}
      {data.accountType === 'company' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            企业信息
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公司名称 *
              </label>
              <input
                type="text"
                value={data.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入公司全称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                统一社会信用代码
              </label>
              <input
                type="text"
                value={data.companyRegistrationNumber || ''}
                onChange={(e) => handleChange('companyRegistrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入统一社会信用代码"
              />
            </div>
          </div>
        </div>
      )}

      {/* Professional Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          职业头衔 *
        </label>
        <input
          type="text"
          value={data.professionalTitle || ''}
          onChange={(e) => handleChange('professionalTitle', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.professionalTitle ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="例如：高级前端开发工程师、UI/UX设计师"
        />
        {errors.professionalTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.professionalTitle}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          个人简介 *
        </label>
        <textarea
          value={data.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="详细描述您的专业背景、工作经验、专业技能和服务优势..."
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            {errors.bio || '请输入至少50个字符的个人简介'}
          </p>
          <p className="text-xs text-gray-500">
            {data.bio?.length || 0} / 1000
          </p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4 inline mr-1" />
          所在地
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          <select
            value={data.location?.country || '中国'}
            onChange={(e) => handleChange('location', { ...data.location, country: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="中国">中国</option>
          </select>

          <select
            value={data.location?.province || ''}
            onChange={(e) => handleChange('location', { ...data.location, province: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">选择省份</option>
            {CHINA_PROVINCES.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>

          <input
            type="text"
            value={data.location?.city || ''}
            onChange={(e) => handleChange('location', { ...data.location, city: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="城市"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Clock className="w-4 h-4 inline mr-1" />
          时区
        </label>
        <select
          value={data.location?.timezone || 'Asia/Shanghai'}
          onChange={(e) => handleChange('location', { ...data.location, timezone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {CHINA_TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          语言能力
        </label>
        <div className="space-y-3">
          {(data.languages || []).map((lang, index) => (
            <div key={index} className="flex items-center space-x-3">
              <select
                value={lang.language}
                onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择语言</option>
                {LANGUAGES.map(language => (
                  <option key={language.code} value={language.code}>{language.name}</option>
                ))}
              </select>

              <select
                value={lang.proficiency}
                onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(LANGUAGE_LEVELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <button
                onClick={() => removeLanguage(index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addLanguage}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 添加语言
        </button>
      </div>

      {/* Education */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-1" />
          教育背景
        </label>
        <div className="space-y-4">
          {(data.education || []).map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">学校名称</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="学校或培训机构"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">专业</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="专业领域"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">学位</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="如：本科、硕士、博士"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">时间</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span>至</span>
                    {edu.isCurrent ? (
                      <span className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">至今</span>
                    ) : (
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={edu.isCurrent}
                      onChange={(e) => handleEducationChange(index, 'isCurrent', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">在读</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => removeEducation(index)}
                className="mt-3 text-sm text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addEducation}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 添加教育经历
        </button>
      </div>

      {/* Professional Settings */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            小时费率 (¥) *
          </label>
          <input
            type="number"
            value={data.hourlyRate || ''}
            onChange={(e) => handleChange('hourlyRate', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="100"
            min="1"
          />
          {errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-600">{errors.hourlyRate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            平均响应时间 (小时) *
          </label>
          <input
            type="number"
            value={data.responseTime || ''}
            onChange={(e) => handleChange('responseTime', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.responseTime ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1"
            min="1"
            max="24"
          />
          {errors.responseTime && (
            <p className="mt-1 text-sm text-red-600">{errors.responseTime}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          可用状态
        </label>
        <select
          value={data.availabilityStatus || 'available'}
          onChange={(e) => handleChange('availabilityStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="available">可接单</option>
          <option value="busy">忙碌中</option>
          <option value="unavailable">暂停接单</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={validateForm}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存并继续
        </button>
      </div>
    </div>
  );
};