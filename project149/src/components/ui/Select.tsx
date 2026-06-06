import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = '请选择',
  error,
  disabled = false,
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-1.5">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={clsx(
              'w-full px-4 py-2.5 rounded-lg border-2 bg-white text-left',
              'transition-all duration-200 flex items-center justify-between',
              'focus:outline-none focus:ring-2 focus:ring-primary-200',
              error
                ? 'border-coral-500 focus:border-coral-500 focus:ring-coral-200'
                : 'border-gray-200 hover:border-primary-300 focus:border-primary-500',
              disabled && 'bg-gray-50 cursor-not-allowed opacity-50'
            )}
          >
            <span
              className={clsx(
                'truncate',
                selectedOption ? 'text-charcoal' : 'text-gray-400'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white py-1 shadow-lg border border-gray-100 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected, disabled }) =>
                    clsx(
                      'relative cursor-pointer select-none px-4 py-2.5',
                      'transition-colors duration-150',
                      active && !disabled && 'bg-primary-50',
                      selected && 'bg-primary-100 text-primary-700',
                      disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
                    )
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="mt-1.5 text-sm text-coral-500 flex items-center gap-1 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
