import React from 'react';
import { MessageCircle, Clock, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/utils';

export interface Message {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  conversationId: string;
  type: 'inquiry' | 'order' | 'support' | 'general';
  priority?: 'low' | 'medium' | 'high';
}

export interface MessagePreviewProps {
  messages: Message[];
  title?: string;
  maxItems?: number;
  showType?: boolean;
  showPriority?: boolean;
  className?: string;
  onMessageClick?: (messageId: string, conversationId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  loading?: boolean;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  messages,
  title = '消息中心',
  maxItems = 5,
  showType = true,
  showPriority = true,
  className = '',
  onMessageClick,
  onMarkAsRead,
  loading = false,
}) => {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'inquiry':
        return { label: '咨询', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'order':
        return { label: '订单', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'support':
        return { label: '支持', color: 'text-purple-600', bgColor: 'bg-purple-50' };
      default:
        return { label: '一般', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { label: '高', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'medium':
        return { label: '中', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      default:
        return { label: '低', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return timestamp.toLocaleDateString('zh-CN');
  };

  const handleMessageClick = (message: Message) => {
    if (!message.isRead) {
      onMarkAsRead?.(message.id);
    }
    onMessageClick?.(message.id, message.conversationId);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 leading-chinese">
            {title}
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无消息</p>
          </div>
        ) : (
          messages.slice(0, maxItems).map((message) => {
            const typeInfo = getTypeInfo(message.type);
            const priorityInfo = getPriorityInfo(message.priority);

            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  message.isRead
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                )}
                onClick={() => handleMessageClick(message)}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {message.senderName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {!message.isRead && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {message.senderName}
                      </span>
                      {showType && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          typeInfo.color,
                          typeInfo.bgColor
                        )}>
                          {typeInfo.label}
                        </span>
                      )}
                      {showPriority && message.priority && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          priorityInfo.color,
                          priorityInfo.bgColor
                        )}>
                          {priorityInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 leading-chinese">
                    {message.content}
                  </p>
                </div>

                {/* Read Status */}
                <div className="flex items-center">
                  {message.isRead ? (
                    <CheckCheck className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {messages.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            查看全部 {messages.length} 条消息
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagePreview;