import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, maxLength, id, value, className = '', ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const length = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink-900"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500/70
            transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40
            ${error ? 'border-red-400' : 'border-ink-900/15 focus:border-brand-500'} ${className}`}
          {...rest}
        />
        <div className="mt-1 flex items-center justify-between">
          {error ? (
            <p className="text-xs font-medium text-red-600">{error}</p>
          ) : (
            <span />
          )}
          {maxLength && (
            <span className="text-xs text-ink-500">
              {length}/{maxLength} characters
            </span>
          )}
        </div>
      </div>
    );
  },
);
TextArea.displayName = 'TextArea';

export default TextArea;
