import { Control, FieldValues, useFieldArray, Controller } from 'react-hook-form';
import { Input, InputNumber, DatePicker, Button, Select } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import type { TransportationType } from '@/types/itinerary';

const { Option } = Select;

interface TransportationItem {
  id: string;
  type: TransportationType;
  fromCity: string;
  toCity: string;
  departTime: any;
  arriveTime: any;
  transportNo: string;
  cost: number;
}

interface FormData extends FieldValues {
  transportations: TransportationItem[];
}

interface StepTransportationProps {
  control: Control<FormData>;
}

const typeOptions: { value: TransportationType; label: string }[] = [
  { value: 'flight', label: '飞机' },
  { value: 'train', label: '高铁/火车' },
  { value: 'car', label: '自驾' },
  { value: 'taxi', label: '出租车' },
  { value: 'other', label: '其他' },
];

export default function StepTransportation({ control }: StepTransportationProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'transportations',
  });

  const handleAdd = () => {
    append({
      id: Date.now().toString(),
      type: 'flight',
      fromCity: '',
      toCity: '',
      departTime: null,
      arriveTime: null,
      transportNo: '',
      cost: 0,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">交通安排</h3>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">交通 {index + 1}</span>
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => remove(index)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交通方式
              </label>
              <Select
                className="w-full"
                {...control.register(`transportations.${index}.type`)}
              >
                {typeOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                班次号
              </label>
              <Input
                placeholder="如：CA1234 / G101"
                {...control.register(`transportations.${index}.transportNo`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                费用 (元)
              </label>
              <Controller
                name={`transportations.${index}.cost`}
                control={control}
                rules={{ required: false, min: 0 }}
                render={({ field: controllerField }) => (
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="请输入费用"
                    value={controllerField.value}
                    onChange={(value) => controllerField.onChange(value)}
                    onBlur={controllerField.onBlur}
                  />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出发城市
              </label>
              <Input
                placeholder="出发城市"
                {...control.register(`transportations.${index}.fromCity`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到达城市
              </label>
              <Input
                placeholder="到达城市"
                {...control.register(`transportations.${index}.toCity`)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出发时间
              </label>
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
                {...control.register(`transportations.${index}.departTime`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到达时间
              </label>
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
                {...control.register(`transportations.${index}.arriveTime`)}
              />
            </div>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>暂无交通安排</p>
          <p className="text-sm mt-1">点击下方按钮添加交通信息</p>
        </div>
      )}

      <Button
        type="dashed"
        icon={<Plus size={16} />}
        onClick={handleAdd}
        className="w-full"
      >
        添加交通安排
      </Button>
    </div>
  );
}
