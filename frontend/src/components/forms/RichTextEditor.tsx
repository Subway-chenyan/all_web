import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  toolbar?: boolean;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入内容...',
  maxLength = 5000,
  className = '',
  disabled = false,
  toolbar = true,
  height = '200px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML || '';
      const plainText = content.replace(/<[^>]*>/g, '');

      if (plainText.length <= maxLength) {
        onChange(content);
        setCharCount(plainText.length);
      } else {
        // Truncate to max length
        const truncated = plainText.substring(0, maxLength);
        editorRef.current.innerText = truncated;
        onChange(editorRef.current.innerHTML);
        setCharCount(maxLength);
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('请输入链接地址:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('请输入图片地址:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  const Toolbar = () => (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
      <div className="flex gap-1 border-r border-gray-300 pr-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className={cn(
            'p-2 rounded hover:bg-gray-200 transition-colors',
            'font-bold text-gray-700'
          )}
          title="粗体"
          disabled={disabled}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className={cn(
            'p-2 rounded hover:bg-gray-200 transition-colors',
            'italic text-gray-700'
          )}
          title="斜体"
          disabled={disabled}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className={cn(
            'p-2 rounded hover:bg-gray-200 transition-colors',
            'underline text-gray-700'
          )}
          title="下划线"
          disabled={disabled}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          className={cn(
            'p-2 rounded hover:bg-gray-200 transition-colors',
            'line-through text-gray-700'
          )}
          title="删除线"
          disabled={disabled}
        >
          S
        </button>
      </div>

      <div className="flex gap-1 border-r border-gray-300 pr-1">
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="左对齐"
          disabled={disabled}
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="居中"
          disabled={disabled}
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="右对齐"
          disabled={disabled}
        >
          ≡
        </button>
      </div>

      <div className="flex gap-1 border-r border-gray-300 pr-1">
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="无序列表"
          disabled={disabled}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="有序列表"
          disabled={disabled}
        >
          1.
        </button>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="插入链接"
          disabled={disabled}
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="插入图片"
          disabled={disabled}
        >
          🖼️
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
      {toolbar && <Toolbar />}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'p-3 min-h-[100px] outline-none transition-colors',
          'focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          isFocused ? 'bg-white' : 'bg-gray-50',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
        style={{ height }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          支持富文本格式
        </div>
        <div className={cn(
          'text-xs',
          charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
        )}>
          {charCount} / {maxLength}
        </div>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;