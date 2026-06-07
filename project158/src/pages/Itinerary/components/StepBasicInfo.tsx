import { Controller, Control, FieldValues } from 'react-hook-form';
import { Input, InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';

interface FormData extends FieldValues {
  title: string;
  purpose: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  budget: number;
}

interface StepBasicInfoProps {
  control: Control<FormData>;
  errors: Record<string, any>;
}

export default function StepBasicInfo({ control, errors }: StepBasicInfoProps) {
  return (
    <div className="space-y-4">
      <Controller
        name="title"
        control={control}
        rules={{ required: '请输入行程标题' }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              行程标题 <span className="text-red-500">*</span>
            </label>
            <Input
              {...field}
              placeholder="请输入行程标题"
              status={errors.title ? 'error' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="purpose"
        control={control}
        rules={{ required: '请输入出行目的' }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出行目的 <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              {...field}
              rows={3}
              placeholder="请输入出行目的"
              status={errors.purpose ? 'error' : ''}
            />
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
            )}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          rules={{ required: '请选择开始日期' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <DatePicker
                {...field}
                className="w-full"
                status={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="endDate"
          control={control}
          rules={{ required: '请选择结束日期' }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <DatePicker
                {...field}
                className="w-full"
                status={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <Controller
        name="budget"
        control={control}
        rules={{
          required: '请输入预算金额',
          min: { value: 0, message: '预算不能为负数' },
        }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              预算金额 <span className="text-red-500">*</span>
            </label>
            <InputNumber<number>
              {...field}
              className="w-full"
              min={0}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value?.replace(/\¥\s?|(,*)/g, '') || 0)}
              placeholder="请输入预算金额"
              status={errors.budget ? 'error' : ''}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}
