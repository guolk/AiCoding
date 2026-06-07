import { Control, FieldValues, useFieldArray } from 'react-hook-form';
import { Input, DatePicker, Button } from 'antd';
import { Plus, Trash2 } from 'lucide-react';

interface VisitItem {
  id: string;
  clientName: string;
  address: string;
  time: any;
  purpose: string;
  contact: string;
}

interface FormData extends FieldValues {
  visits: VisitItem[];
}

interface StepVisitsProps {
  control: Control<FormData>;
}

export default function StepVisits({ control }: StepVisitsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'visits',
  });

  const handleAdd = () => {
    append({
      id: Date.now().toString(),
      clientName: '',
      address: '',
      time: null,
      purpose: '',
      contact: '',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">客户拜访计划</h3>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">拜访 {index + 1}</span>
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => remove(index)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                客户名称
              </label>
              <Input
                placeholder="请输入客户名称"
                {...control.register(`visits.${index}.clientName`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系人
              </label>
              <Input
                placeholder="请输入联系人姓名"
                {...control.register(`visits.${index}.contact`)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              拜访地址
            </label>
            <Input
              placeholder="请输入拜访地址"
              {...control.register(`visits.${index}.address`)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                拜访时间
              </label>
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
                {...control.register(`visits.${index}.time`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                拜访目的
              </label>
              <Input
                placeholder="请输入拜访目的"
                {...control.register(`visits.${index}.purpose`)}
              />
            </div>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>暂无客户拜访计划</p>
          <p className="text-sm mt-1">点击下方按钮添加拜访计划</p>
        </div>
      )}

      <Button
        type="dashed"
        icon={<Plus size={16} />}
        onClick={handleAdd}
        className="w-full"
      >
        添加客户拜访
      </Button>
    </div>
  );
}
