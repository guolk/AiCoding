import { Control, FieldValues, useFieldArray, Controller } from 'react-hook-form';
import { Input, InputNumber, DatePicker, Button } from 'antd';
import { Plus, Trash2 } from 'lucide-react';

interface AccommodationItem {
  id: string;
  hotelName: string;
  address: string;
  checkIn: any;
  checkOut: any;
  cost: number;
}

interface FormData extends FieldValues {
  accommodations: AccommodationItem[];
}

interface StepAccommodationProps {
  control: Control<FormData>;
}

export default function StepAccommodation({ control }: StepAccommodationProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accommodations',
  });

  const handleAdd = () => {
    append({
      id: Date.now().toString(),
      hotelName: '',
      address: '',
      checkIn: null,
      checkOut: null,
      cost: 0,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">住宿安排</h3>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">酒店 {index + 1}</span>
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
                酒店名称
              </label>
              <Input
                placeholder="请输入酒店名称"
                {...control.register(`accommodations.${index}.hotelName`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                费用 (元)
              </label>
              <Controller
                name={`accommodations.${index}.cost`}
                control={control}
                rules={{ required: false, min: 0 }}
                render={({ field: controllerField }) => (
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="请输入住宿费用"
                    value={controllerField.value}
                    onChange={(value) => controllerField.onChange(value)}
                    onBlur={controllerField.onBlur}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              酒店地址
            </label>
            <Input
              placeholder="请输入酒店地址"
              {...control.register(`accommodations.${index}.address`)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入住时间
              </label>
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
                {...control.register(`accommodations.${index}.checkIn`)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                退房时间
              </label>
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD HH:mm"
                showTime
                {...control.register(`accommodations.${index}.checkOut`)}
              />
            </div>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>暂无住宿安排</p>
          <p className="text-sm mt-1">点击下方按钮添加酒店信息</p>
        </div>
      )}

      <Button
        type="dashed"
        icon={<Plus size={16} />}
        onClick={handleAdd}
        className="w-full"
      >
        添加住宿安排
      </Button>
    </div>
  );
}
