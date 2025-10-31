import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, HelpCircle, MessageSquare } from 'lucide-react';
import { ServiceFAQ } from '@/services/services';
import { useI18n } from '@/i18n';

interface ServiceFAQsProps {
  faqs: ServiceFAQ[];
  className?: string;
  onQuestionClick?: (question: ServiceFAQ) => void;
  onHelpfulClick?: (faqId: number) => void;
}

interface FAQItemProps {
  faq: ServiceFAQ;
  isExpanded: boolean;
  onToggle: () => void;
  onHelpfulClick?: (faqId: number) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  isExpanded,
  onToggle,
  onHelpfulClick
}) => {
  const { formatDate } = useI18n();
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpfulClick = () => {
    if (!hasVoted && onHelpfulClick) {
      onHelpfulClick(faq.id);
      setHasVoted(true);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-200 text-left"
        aria-expanded={isExpanded}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <div className="flex items-start space-x-3 flex-1">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          id={`faq-answer-${faq.id}`}
          className="px-4 pb-4 bg-gray-50"
        >
          <div className="ml-8">
            <div
              className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />

            {/* FAQ Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleHelpfulClick}
                  disabled={hasVoted}
                  className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${
                    hasVoted
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                  <span>有帮助 ({faq.isHelpful})</span>
                </button>

                <button
                  onClick={() => {
                    // This could open a contact modal with the question pre-filled
                    console.log('Ask follow-up question:', faq.question);
                  }}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>追问</span>
                </button>
              </div>

              <div className="text-xs text-gray-500">
                更新于 {formatDate(faq.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ServiceFAQs: React.FC<ServiceFAQsProps> = ({
  faqs,
  className = '',
  onQuestionClick,
  onHelpfulClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (faqId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
      const faq = faqs.find(f => f.id === faqId);
      if (faq && onQuestionClick) {
        onQuestionClick(faq);
      }
    }
    setExpandedItems(newExpanded);
  };

  const handleHelpfulClick = (faqId: number) => {
    if (onHelpfulClick) {
      onHelpfulClick(faqId);
    }
  };

  const expandAll = () => {
    setExpandedItems(new Set(faqs.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">常见问题</h2>
        {faqs.length > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              全部展开
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              全部收起
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {faqs.length > 3 && (
        <div className="relative">
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* FAQ List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedItems.has(faq.id)}
              onToggle={() => handleToggle(faq.id)}
              onHelpfulClick={handleHelpfulClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            {searchTerm ? '没有找到相关问题' : '暂无常见问题'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              清除搜索
            </button>
          )}
        </div>
      )}

      {/* Contact Seller for More Questions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">还有其他问题？</h4>
            <p className="text-sm text-blue-800 mb-3">
              如果您没有找到答案，可以直接联系卖家咨询。
            </p>
            <button
              onClick={() => {
                // This would open the contact modal
                console.log('Contact seller for more questions');
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              联系卖家
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Stats */}
      {faqs.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          共 {faqs.length} 个常见问题
          {faqs.reduce((sum, faq) => sum + faq.isHelpful, 0) > 0 && (
            <span>，{faqs.reduce((sum, faq) => sum + faq.isHelpful, 0)} 次认为有帮助</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceFAQs;