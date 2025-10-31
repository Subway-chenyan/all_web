import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Send, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';

export interface ContactCardProps {
  profile: {
    name: string;
    avatar: string;
    responseTime?: string;
    lastOnline?: Date;
    languages?: string[];
    contactMethods: {
      email?: boolean;
      phone?: boolean;
      chat: boolean;
    };
    availability?: {
      weekdays: string[];
      timezone: string;
    };
  };
  className?: string;
  onContactClick?: (method: 'chat' | 'email' | 'phone') => void;
  loading?: boolean;
  isOnline?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  profile,
  className = '',
  onContactClick,
  loading = false,
  isOnline = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'email' | 'phone'>('chat');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onContactClick?.(selectedMethod);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (isOnline) {
      return {
        text: '在线',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        dotColor: 'bg-green-500'
      };
    }

    if (profile.lastOnline) {
      const now = new Date();
      const diff = now.getTime() - profile.lastOnline.getTime();
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (hours < 1) {
        return {
          text: '刚刚在线',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-400'
        };
      } else if (hours < 24) {
        return {
          text: `${hours}小时前在线`,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-400'
        };
      } else if (days < 7) {
        return {
          text: `${days}天前在线`,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-400'
        };
      } else {
        return {
          text: '离线',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-400'
        };
      }
    }

    return {
      text: '未知状态',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      dotColor: 'bg-gray-400'
    };
  };

  const availabilityStatus = getAvailabilityStatus();

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
            availabilityStatus.dotColor
          )} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">联系 {profile.name}</h3>
          <div className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1',
            availabilityStatus.bgColor,
            availabilityStatus.color
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              availabilityStatus.dotColor
            )} />
            {availabilityStatus.text}
          </div>
        </div>
      </div>

      {/* Response Time */}
      {profile.responseTime && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            平均响应时间: {profile.responseTime}
          </span>
        </div>
      )}

      {/* Contact Methods */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">联系方式</h4>
        <div className="space-y-2">
          {profile.contactMethods.chat && (
            <button
              onClick={() => setSelectedMethod('chat')}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                selectedMethod === 'chat'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <MessageCircle className={cn(
                'w-5 h-5',
                selectedMethod === 'chat' ? 'text-red-600' : 'text-gray-600'
              )} />
              <div className="text-left">
                <div className="font-medium text-gray-900">在线聊天</div>
                <div className="text-xs text-gray-600">推荐 - 最快的回复</div>
              </div>
              {selectedMethod === 'chat' && (
                <CheckCircle className="w-4 h-4 text-red-600 ml-auto" />
              )}
            </button>
          )}

          {profile.contactMethods.email && (
            <button
              onClick={() => setSelectedMethod('email')}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                selectedMethod === 'email'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Mail className={cn(
                'w-5 h-5',
                selectedMethod === 'email' ? 'text-red-600' : 'text-gray-600'
              )} />
              <div className="text-left">
                <div className="font-medium text-gray-900">邮件</div>
                <div className="text-xs text-gray-600">24小时内回复</div>
              </div>
              {selectedMethod === 'email' && (
                <CheckCircle className="w-4 h-4 text-red-600 ml-auto" />
              )}
            </button>
          )}

          {profile.contactMethods.phone && (
            <button
              onClick={() => setSelectedMethod('phone')}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                selectedMethod === 'phone'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Phone className={cn(
                'w-5 h-5',
                selectedMethod === 'phone' ? 'text-red-600' : 'text-gray-600'
              )} />
              <div className="text-left">
                <div className="font-medium text-gray-900">电话</div>
                <div className="text-xs text-gray-600">工作时间可联系</div>
              </div>
              {selectedMethod === 'phone' && (
                <CheckCircle className="w-4 h-4 text-red-600 ml-auto" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick Contact Form */}
      {selectedMethod === 'chat' && (
        <form onSubmit={handleSubmitMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快速消息
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="告诉 {profile.name} 您的需求..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!message.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            发送消息
          </Button>
        </form>
      )}

      {selectedMethod === 'email' && (
        <Button
          onClick={() => onContactClick?.('email')}
          className="w-full"
          variant="outline"
        >
          <Mail className="w-4 h-4 mr-2" />
          打开邮件客户端
        </Button>
      )}

      {selectedMethod === 'phone' && (
        <Button
          onClick={() => onContactClick?.('phone')}
          className="w-full"
          variant="outline"
        >
          <Phone className="w-4 h-4 mr-2" />
          显示电话号码
        </Button>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">语言</h4>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((language) => (
              <span
                key={language}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {profile.availability && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">工作时间</h4>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              {profile.availability.weekdays.join(', ')}
            </div>
            <div className="text-sm text-gray-600">
              时区: {profile.availability.timezone}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCard;