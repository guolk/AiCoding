import { useEffect, useState, useMemo } from 'react';
import {
  Card, Form, Input, InputNumber, DatePicker, Select, Button, Space,
  Upload, message, Modal, Alert, Progress, Tag, Row, Col
} from 'antd';
import {
  ArrowLeft, Save, Upload as UploadIcon, X, Eye,
  Car, Hotel, Coffee, Users, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { ExpenseCategory } from '@/types/expense';
import type { InvoiceImage } from '@/types/common';

const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  itineraryId?: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: Dayjs;
  merchant?: string;
  description: string;
}

const categoryOptions: { value: ExpenseCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'transport', label: '交通', icon: <Car size={20} />, color: '#1890ff' },
  { value: 'accommodation', label: '住宿', icon: <Hotel size={20} />, color: '#722ed1' },
  { value: 'food', label: '餐饮', icon: <Coffee size={20} />, color: '#fa8c16' },
  { value: 'entertainment', label: '招待', icon: <Users size={20} />, color: '#eb2f96' },
  { value: 'other', label: '其他', icon: <MoreHorizontal size={20} />, color: '#8c8c8c' },
];

export default function ExpenseCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const createExpense = useExpenseStore(state => state.createExpense);
  const uploadInvoices = useExpenseStore(state => state.uploadInvoices);
  const removeInvoice = useExpenseStore(state => state.removeInvoice);
  const loading = useExpenseStore(state => state.loading);
  const budgetComparison = useExpenseStore(state => state.budgetComparison);
  const calculateBudgetComparison = useExpenseStore(state => state.calculateBudgetComparison);

  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('transport');
  const [selectedItinerary, setSelectedItinerary] = useState<string | undefined>();
  const [uploadedImages, setUploadedImages] = useState<InvoiceImage[]>([]);
  const [previewImage, setPreviewImage] = useState<InvoiceImage | null>(null);
  const [saveSuccessModal, setSaveSuccessModal] = useState(false);
  const [createdExpenseId, setCreatedExpenseId] = useState<string>('');

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  useEffect(() => {
    if (selectedItinerary) {
      calculateBudgetComparison(selectedItinerary);
    }
  }, [selectedItinerary, calculateBudgetComparison]);

  const selectedItineraryData = useMemo(() => {
    if (!selectedItinerary) return null;
    return itineraries.find(i => i.id === selectedItinerary);
  }, [selectedItinerary, itineraries]);

  const budgetRemaining = useMemo(() => {
    if (!budgetComparison) return null;
    const currentAmount = form.getFieldValue('amount') || 0;
    const remaining = budgetComparison.budget - budgetComparison.actual - currentAmount;
    return {
      remaining,
      percentage: budgetComparison.budget > 0
        ? Math.round(((budgetComparison.actual + currentAmount) / budgetComparison.budget) * 100)
        : 0
    };
  }, [budgetComparison, form]);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过10MB!');
      return false;
    }
    return true;
  };

  const handleUploadChange = (info: any) => {
    if (info.fileList) {
      const newFiles = info.fileList
        .filter((f: any) => f.originFileObj)
        .map((f: any) => f.originFileObj as File);
      if (newFiles.length > 0) {
        const tempImages: InvoiceImage[] = newFiles.map((file: File) => ({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          expenseId: '',
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          uploadTime: new Date().toISOString(),
          _file: file
        }));
        setUploadedImages(prev => [...prev, ...tempImages]);
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    if (createdExpenseId) {
      removeInvoice(createdExpenseId, imageId);
    }
  };

  const saveAndContinue = async (values: FormValues) => {
    await handleSave(values, true);
  };

  const saveAndBack = async (values: FormValues) => {
    await handleSave(values, false);
  };

  const handleSave = async (values: FormValues, continueAdding: boolean) => {
    try {
      const expenseData = {
        ...values,
        expenseDate: values.expenseDate.format('YYYY-MM-DD'),
        itineraryId: values.itineraryId,
        images: [],
      };

      const newExpense = await createExpense(expenseData);
      setCreatedExpenseId(newExpense.id);

      const filesToUpload = uploadedImages
        .filter(img => (img as any)._file)
        .map(img => (img as any)._file as File);

      if (filesToUpload.length > 0) {
        await uploadInvoices(newExpense.id, filesToUpload);
      }

      message.success('费用录入成功');

      if (continueAdding) {
        form.resetFields();
        form.setFieldsValue({
          expenseDate: dayjs(),
          category: selectedCategory,
        });
        setUploadedImages([]);
        setSaveSuccessModal(false);
      } else {
        navigate('/expense');
      }
    } catch (error) {
      message.error('录入失败，请重试');
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center">
      <UploadIcon size={24} className="text-gray-400 mb-2" />
      <div className="text-gray-500">点击或拖拽上传发票</div>
      <div className="text-gray-400 text-xs mt-1">支持多图上传，单张不超过10MB</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/expense')}>
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">费用录入</h2>
      </div>

      {selectedItinerary && budgetRemaining && (
        <Alert
          className="mb-6"
          message={
            <div className="flex items-center justify-between">
              <span>
                关联行程: <Tag color="blue">{selectedItineraryData?.title}</Tag>
              </span>
              <Space>
                <span>总预算: ¥{budgetComparison?.budget.toLocaleString()}</span>
                <span>已使用: ¥{budgetComparison?.actual.toLocaleString()}</span>
                <span className={budgetRemaining.remaining >= 0 ? 'text-green-500' : 'text-red-500'}>
                  剩余: ¥{budgetRemaining.remaining.toLocaleString()}
                </span>
              </Space>
            </div>
          }
          description={
            <Progress
              percent={budgetRemaining.percentage}
              status={budgetRemaining.percentage > 100 ? 'exception' : 'active'}
              size="small"
              strokeColor={{
                '0%': '#108ee9',
                '100%': budgetRemaining.percentage > 100 ? '#ff4d4f' : '#52c41a',
              }}
            />
          }
          type={budgetRemaining.remaining >= 0 ? 'info' : 'warning'}
          showIcon
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            expenseDate: dayjs(),
            category: 'transport',
          }}
        >
          <Form.Item
            name="itineraryId"
            label="关联行程"
          >
            <Select
              placeholder="请选择关联行程（可选）"
              allowClear
              onChange={(value) => setSelectedItinerary(value)}
            >
              {itineraries.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.title} (预算: ¥{item.budget.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="费用类别"
            rules={[{ required: true, message: '请选择费用类别' }]}
          >
            <Select
              placeholder="请选择费用类别"
              onChange={(value) => setSelectedCategory(value)}
              optionLabelProp="label"
            >
              {categoryOptions.map(item => (
                <Option key={item.value} value={item.value} label={item.label}>
                  <Space>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="amount"
              label="金额"
              rules={[
                { required: true, message: '请输入金额' },
                { type: 'number', min: 0.01, message: '金额必须大于0' },
              ]}
            >
              <InputNumber<number>
                className="w-full"
                min={0}
                step={0.01}
                precision={2}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => Number(value?.replace(/\¥\s?|(,*)/g, '') || 0)}
                placeholder="请输入金额"
                onChange={() => {
                  form.validateFields(['amount']);
                }}
              />
            </Form.Item>

            <Form.Item
              name="expenseDate"
              label="消费日期"
              rules={[{ required: true, message: '请选择消费日期' }]}
            >
              <DatePicker
                className="w-full"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="merchant"
            label="商家"
            rules={[
              { max: 50, message: '商家名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入商家名称（可选）" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label="费用说明"
            rules={[
              { required: true, message: '请输入费用说明' },
              { min: 2, message: '费用说明至少2个字符' },
              { max: 200, message: '费用说明不能超过200个字符' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入费用说明，详细描述费用用途"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label="发票上传">
            <div>
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                onRemove={() => false}
                showUploadList={false}
                accept="image/*"
              >
                {uploadButton}
              </Upload>
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {uploadedImages.map(image => (
                    <div key={image.id} className="relative group">
                      <div
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                        onClick={() => setPreviewImage(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            shape="circle"
                            icon={<Eye size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(image);
                            }}
                          />
                          <Button
                            danger
                            size="small"
                            shape="circle"
                            icon={<X size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(image.id);
                            }}
                          />
                        </Space>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {image.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {uploadedImages.length === 0 && (
                <div className="mt-2 text-sm text-orange-500">
                  提示：建议上传发票以便快速审核
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Space className="w-full" style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate('/expense')}>取消</Button>
              <Button
                icon={<Save size={16} />}
                loading={loading}
                onClick={() => form.validateFields().then(saveAndContinue)}
              >
                保存并继续录入
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                loading={loading}
                onClick={() => form.validateFields().then(saveAndBack)}
              >
                保存并返回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="图片预览"
        open={previewImage !== null}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={800}
      >
        {previewImage && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <span className="font-medium">{previewImage.fileName}</span>
              <span className="text-gray-500 text-sm">
                {(previewImage.fileSize / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.fileName}
                style={{ maxHeight: '70vh', maxWidth: '100%' }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="保存成功"
        open={saveSuccessModal}
        onCancel={() => setSaveSuccessModal(false)}
        footer={[
          <Button key="continue" type="primary" onClick={() => {
            setSaveSuccessModal(false);
            form.resetFields();
            form.setFieldsValue({
              expenseDate: dayjs(),
              category: selectedCategory,
            });
            setUploadedImages([]);
          }}>
            继续录入
          </Button>,
          <Button key="back" onClick={() => navigate('/expense')}>
            返回列表
          </Button>,
        ]}
      >
        <p className="text-lg text-center py-4">
          ✅ 费用记录已成功保存！
        </p>
      </Modal>
    </div>
  );
}
