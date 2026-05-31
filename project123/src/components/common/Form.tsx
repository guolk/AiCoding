import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export function Input({
  label, placeholder, value, onChange, type = 'text', className, required, disabled, error, helperText }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-dark-text">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'input w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-dark-muted">{helperText}</p>}
    </div>
  );
}

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function Textarea({
  label, placeholder, value, onChange, rows = 4, className, required, disabled, error
}: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
      <label className="block text-sm font-medium text-dark-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        'textarea w-full',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function Select({
  label, options, value, onChange, className, required, disabled, placeholder
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
      <label className="block text-sm font-medium text-dark-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'select w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    </div>
  );
}

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function NumberInput({
  label, value, onChange, min, max, step = 1, className, required, disabled
}: NumberInputProps) {
  return (
    <div className="space-y-1">
      {label && (
      <label className="block text-sm font-medium text-dark-text">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'input w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    />
    </div>
  );
}

interface TagProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  label, tags, onChange, placeholder = '按回车添加...', className }: TagProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-text">{label}</label>
      )}
      <div className="input flex flex-wrap gap-2 items-center min-h-[42px]">
        {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-600/30 rounded text-sm text-primary-200"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-white"
          >
            ×
          </button>
        </span>
      ))}
        <input
          type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-dark-text"
      />
      </div>
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function Button({
  children, onClick, variant = 'primary', size = 'md', className, disabled, type = 'button'
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    gold: 'btn-gold',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'rounded-lg transition-all duration-200 font-medium',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
