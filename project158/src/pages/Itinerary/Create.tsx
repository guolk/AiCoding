import { useState } from 'react';
import { Card, Steps, Button, Space, message } from 'antd';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm, FieldValues } from 'react-hook-form';
import { useItineraryStore } from '@/store/useItineraryStore';
import dayjs from 'dayjs';
import type { Itinerary, Destination, Transportation, Accommodation, Visit } from '@/types/itinerary';
import StepBasicInfo from './components/StepBasicInfo';
import StepDestinations from './components/StepDestinations';
import StepTransportation from './components/StepTransportation';
import StepAccommodation from './components/StepAccommodation';
import StepVisits from './components/StepVisits';

const { Step } = Steps;

interface FormData extends FieldValues {
  title: string;
  purpose: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  budget: number;
  destinations: Destination[];
  transportations: Transportation[];
  accommodations: Accommodation[];
  visits: Visit[];
}

const steps = [
  { title: '基本信息' },
  { title: '目的地城市' },
  { title: '交通安排' },
  { title: '住宿安排' },
  { title: '客户拜访' },
];

export default function ItineraryCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const createItinerary = useItineraryStore(state => state.createItinerary);
  const loading = useItineraryStore(state => state.loading);

  const { control, handleSubmit, trigger, getValues, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      startDate: dayjs(),
      endDate: dayjs().add(3, 'day'),
      budget: 0,
      destinations: [],
      transportations: [],
      accommodations: [],
      visits: [],
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger(['title', 'purpose', 'startDate', 'endDate', 'budget']);
      case 1:
        return await trigger('destinations');
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      message.error('请填写完整的必填项');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFinish = async (values: FormData) => {
    try {
      const formatDate = (d: any) => d ? dayjs(d).format('YYYY-MM-DD') : '';
      const formatDateTime = (d: any) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '';

      const itineraryData: Partial<Itinerary> = {
        title: values.title,
        purpose: values.purpose,
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate),
        budget: values.budget,
        status: 'draft',
        destinations: values.destinations.map((d, index) => ({
          ...d,
          sequence: index,
          arriveDate: formatDate(d.arriveDate),
          leaveDate: formatDate(d.leaveDate),
        })),
        transportations: values.transportations.map(t => ({
          ...t,
          departTime: formatDateTime(t.departTime),
          arriveTime: formatDateTime(t.arriveTime),
        })),
        accommodations: values.accommodations.map(a => ({
          ...a,
          checkIn: formatDateTime(a.checkIn),
          checkOut: formatDateTime(a.checkOut),
        })),
        visits: values.visits.map(v => ({
          ...v,
          time: formatDateTime(v.time),
        })),
      };

      await createItinerary(itineraryData);
      message.success('行程创建成功');
      navigate('/itinerary');
    } catch (error) {
      message.error('创建失败，请重试');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepBasicInfo control={control as any} errors={errors} />;
      case 1:
        return <StepDestinations control={control as any} />;
      case 2:
        return <StepTransportation control={control as any} />;
      case 3:
        return <StepAccommodation control={control as any} />;
      case 4:
        return <StepVisits control={control as any} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/itinerary')}>
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">创建行程</h2>
      </div>

      <Card className="mb-6">
        <Steps current={currentStep} items={steps} />
      </Card>

      <Card className="mb-6">
        {renderStepContent()}
      </Card>

      <div className="flex justify-between">
        <Button
          disabled={currentStep === 0}
          onClick={handlePrev}
        >
          上一步
        </Button>
        <Space>
          <Button onClick={() => navigate('/itinerary')}>取消</Button>
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSubmit(onFinish)}
              loading={loading}
            >
              保存行程
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
