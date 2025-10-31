import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { cn } from '@/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'order' | 'delivery';
  description?: string;
  location?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CalendarWidgetProps {
  events: CalendarEvent[];
  title?: string;
  view?: 'month' | 'week' | 'list';
  showEvents?: boolean;
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  loading?: boolean;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  title = '日历',
  view = 'month',
  showEvents = true,
  className = '',
  onEventClick,
  onDateClick,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case 'meeting':
        return {
          label: '会议',
          color: 'bg-blue-500',
          lightColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        };
      case 'deadline':
        return {
          label: '截止',
          color: 'bg-red-500',
          lightColor: 'bg-red-100',
          textColor: 'text-red-700',
        };
      case 'reminder':
        return {
          label: '提醒',
          color: 'bg-yellow-500',
          lightColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
        };
      case 'order':
        return {
          label: '订单',
          color: 'bg-green-500',
          lightColor: 'bg-green-100',
          textColor: 'text-green-700',
        };
      case 'delivery':
        return {
          label: '交付',
          color: 'bg-purple-500',
          lightColor: 'bg-purple-100',
          textColor: 'text-purple-700',
        };
      default:
        return {
          label: '其他',
          color: 'bg-gray-500',
          lightColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        };
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 leading-chinese">
            {title}
          </h3>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无日程安排</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.slice(0, 5).map((event) => {
              const typeInfo = getEventTypeInfo(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => onEventClick?.(event)}
                >
                  <div className={cn('w-3 h-3 rounded-full mt-1.5', typeInfo.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <span className={cn('text-xs px-2 py-1 rounded-full', typeInfo.lightColor, typeInfo.textColor)}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{event.date.toLocaleDateString('zh-CN')}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-600 mt-1 leading-chinese">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 leading-chinese">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all duration-200',
                'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500',
                isToday(date) && 'bg-red-50 text-red-600 font-bold',
                isSelected(date) && 'bg-red-500 text-white hover:bg-red-600',
                !isToday(date) && !isSelected(date) && 'text-gray-700'
              )}
            >
              <span>{date.getDate()}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 h-1 rounded-full',
                        getEventTypeInfo(event.type).color
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Events List */}
      {showEvents && selectedDate && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {selectedDate.toLocaleDateString('zh-CN')} 的日程
          </h4>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                该日期暂无日程
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className={cn('w-2 h-2 rounded-full', typeInfo.color)} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      {event.time && (
                        <div className="text-xs text-gray-600">{event.time}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;