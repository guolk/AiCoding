import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'search' | 'date' | 'time';

interface BaseInputProps {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  isRequired?: boolean;
}

interface TextInputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  as?: 'input';
  register?: UseFormRegisterReturn;
}

interface TextAreaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
  register?: UseFormRegisterReturn;
}

type InputProps = TextInputProps | TextAreaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      isRequired = false,
      className = '',
      as = 'input',
      register,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!error;

    const baseInputClasses =
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200';

    const inputClasses = [
      baseInputClasses,
      hasError
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
    const errorClasses = 'mt-1 text-sm text-red-600';
    const helperClasses = 'mt-1 text-sm text-gray-500';

    const inputProps = {
      ref,
      className: inputClasses,
      'aria-invalid': hasError,
      'aria-describedby': errorMessage ? 'input-error' : helperText ? 'input-helper' : undefined,
      ...register,
      ...props,
    };

    const renderInput = () => {
      if (as === 'textarea') {
        return (
          <textarea
            {...(inputProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      }
      return <input {...(inputProps as InputHTMLAttributes<HTMLInputElement>)} />;
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className={labelClasses}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          {renderInput()}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {errorMessage && (
          <p id="input-error" className={errorClasses}>
            {errorMessage}
          </p>
        )}
        {!errorMessage && helperText && (
          <p id="input-helper" className={helperClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
