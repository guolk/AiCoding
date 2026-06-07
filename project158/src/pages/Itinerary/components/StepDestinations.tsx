import { useState } from 'react';
import { Control, FieldValues, useFieldArray } from 'react-hook-form';
import { Input, DatePicker, Button, Select, message } from 'antd';
import { Plus, Trash2, GripVertical, Route } from 'lucide-react';
import { cities } from '@/services/mock/cities';
import { optimizeRoute, type City } from '@/utils/routeOptimizer';

interface DestinationItem {
  id: string;
  city: string;
  arriveDate: any;
  leaveDate: any;
  sequence: number;
}

interface FormData extends FieldValues {
  destinations: DestinationItem[];
}

interface StepDestinationsProps {
  control: Control<FormData>;
}

const { Option } = Select;

export default function StepDestinations({ control }: StepDestinationsProps) {
  const [optimizing, setOptimizing] = useState(false);
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'destinations',
  });

  const handleAddDestination = () => {
    append({
      id: Date.now().toString(),
      city: '',
      arriveDate: null,
      leaveDate: null,
      sequence: fields.length,
    });
  };

  const handleOptimizeRoute = async () => {
    if (fields.length < 2) {
      message.warning('至少需要2个城市才能进行路线优化');
      return;
    }

    const validCities = fields.filter(f => f.city);
    if (validCities.length < 2) {
      message.warning('请先填写完整的城市信息');
      return;
    }

    setOptimizing(true);
    try {
      const cityData: City[] = validCities.map(f => {
        const cityInfo = cities.find(c => c.name === f.city);
        return {
          name: f.city,
          lat: cityInfo?.lat,
          lng: cityInfo?.lng,
        };
      });

      const result = optimizeRoute(cityData, cityData[0]);
      const optimizedNames = result.optimizedRoute.map(c => c.name);

      const sortedFields = [...fields].sort((a, b) => {
        const indexA = optimizedNames.indexOf(a.city);
        const indexB = optimizedNames.indexOf(b.city);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      sortedFields.forEach((field, index) => {
        const originalIndex = fields.findIndex(f => f.id === field.id);
        if (originalIndex !== index) {
          move(originalIndex, index);
        }
      });

      message.success(`路线优化完成，预计节省 ${(result.improvement * 100).toFixed(1)}% 路程`);
    } catch (error) {
      message.error('优化失败，请重试');
    } finally {
      setOptimizing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex !== targetIndex) {
      move(sourceIndex, targetIndex);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">目的地城市（可拖拽排序）</h3>
        <Button
          icon={<Route size={16} />}
          onClick={handleOptimizeRoute}
          loading={optimizing}
        >
          优化路线
        </Button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, index)}
          className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 transition-colors"
        >
          <div className="mt-10 text-gray-400">
            <GripVertical size={20} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                城市 <span className="text-red-500">*</span>
              </label>
              <Select
                showSearch
                placeholder="选择城市"
                optionFilterProp="children"
                className="w-full"
                {...control.register(`destinations.${index}.city`, {
                  required: '请选择城市',
                })}
              >
                {cities.map(city => (
                  <Option key={city.name} value={city.name}>
                    {city.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到达日期 <span className="text-red-500">*</span>
              </label>
              <DatePicker
                className="w-full"
                {...control.register(`destinations.${index}.arriveDate`, {
                  required: '请选择到达日期',
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                离开日期 <span className="text-red-500">*</span>
              </label>
              <DatePicker
                className="w-full"
                {...control.register(`destinations.${index}.leaveDate`, {
                  required: '请选择离开日期',
                })}
              />
            </div>
          </div>
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => remove(index)}
            className="mt-8"
          />
        </div>
      ))}

      {fields.length === 0 && (
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>暂无目的地城市</p>
          <p className="text-sm mt-1">点击下方按钮添加目的地</p>
        </div>
      )}

      <Button
        type="dashed"
        icon={<Plus size={16} />}
        onClick={handleAddDestination}
        className="w-full"
      >
        添加目的地城市
      </Button>
    </div>
  );
}
