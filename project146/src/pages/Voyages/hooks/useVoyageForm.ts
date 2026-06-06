import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { generateId } from '../../../utils';
import type { Event, Voyage } from '../../../types';

export interface EventFormData {
  id: string;
  type: Event['type'];
  description: string;
  timestamp: string;
  latitude: string;
  longitude: string;
}

export interface FormData {
  boatId: string;
  departureTime: string;
  arrivalTime: string;
  destination: string;
  startPoint: string;
  distance: string;
  duration: string;
  weatherConditions: string;
  windSpeed: string;
  windDirection: string;
  notes: string;
}

export function useVoyageForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getVoyageById = useAppStore((state) => state.getVoyageById);
  const addVoyage = useAppStore((state) => state.addVoyage);
  const updateVoyage = useAppStore((state) => state.updateVoyage);
  const boats = useAppStore((state) => state.boats);

  const isEdit = id && id !== 'new';
  const existingVoyage = isEdit ? getVoyageById(id!) : undefined;

  const [formData, setFormData] = useState<FormData>({
    boatId: '',
    departureTime: '',
    arrivalTime: '',
    destination: '',
    startPoint: '',
    distance: '',
    duration: '',
    weatherConditions: '',
    windSpeed: '',
    windDirection: 'SE',
    notes: '',
  });

  const [events, setEvents] = useState<EventFormData[]>([]);
  const [hasGpsData, setHasGpsData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingVoyage) {
      setFormData({
        boatId: existingVoyage.boatId,
        departureTime: existingVoyage.departureTime.slice(0, 16),
        arrivalTime: existingVoyage.arrivalTime?.slice(0, 16) || '',
        destination: existingVoyage.destination,
        startPoint: existingVoyage.startPoint,
        distance: existingVoyage.distance.toString(),
        duration: existingVoyage.duration.toString(),
        weatherConditions: existingVoyage.weatherConditions,
        windSpeed: existingVoyage.windSpeed.toString(),
        windDirection: existingVoyage.windDirection,
        notes: existingVoyage.notes,
      });
      setEvents((existingVoyage.events || []).map(e => ({
        id: e.id,
        type: e.type,
        description: e.description,
        timestamp: e.timestamp.slice(0, 16),
        latitude: e.latitude.toString(),
        longitude: e.longitude.toString(),
      })));
      setHasGpsData(!!existingVoyage.gpsPoints && existingVoyage.gpsPoints.length > 0);
    } else {
      setFormData(prev => ({ ...prev, boatId: boats[0]?.id || '' }));
    }
  }, [existingVoyage, boats]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.boatId) newErrors.boatId = '请选择船艇';
    if (!formData.departureTime) newErrors.departureTime = '请选择出发时间';
    if (!formData.destination) newErrors.destination = '请输入目的地';
    if (!formData.startPoint) newErrors.startPoint = '请输入起点';
    if (!formData.distance || parseFloat(formData.distance) <= 0) newErrors.distance = '请输入有效距离';
    if (!formData.duration || parseFloat(formData.duration) <= 0) newErrors.duration = '请输入有效时长';
    if (!formData.weatherConditions) newErrors.weatherConditions = '请输入天气条件';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const voyageData: Omit<Voyage, 'id' | 'createdAt'> = {
      boatId: formData.boatId,
      departureTime: new Date(formData.departureTime).toISOString(),
      arrivalTime: formData.arrivalTime ? new Date(formData.arrivalTime).toISOString() : undefined,
      destination: formData.destination,
      startPoint: formData.startPoint,
      distance: parseFloat(formData.distance),
      duration: parseFloat(formData.duration),
      weatherConditions: formData.weatherConditions,
      windSpeed: parseFloat(formData.windSpeed) || 0,
      windDirection: formData.windDirection,
      notes: formData.notes,
      events: events.map(e => ({
        id: e.id,
        voyageId: '',
        type: e.type,
        description: e.description,
        timestamp: new Date(e.timestamp).toISOString(),
        latitude: parseFloat(e.latitude) || 0,
        longitude: parseFloat(e.longitude) || 0,
      })),
      gpsPoints: hasGpsData ? existingVoyage?.gpsPoints || [] : [],
    };

    if (isEdit) {
      updateVoyage(id!, voyageData);
    } else {
      addVoyage(voyageData);
    }
    navigate('/voyages');
  };

  const addEvent = () => {
    const newEvent: EventFormData = {
      id: generateId(),
      type: 'other',
      description: '',
      timestamp: new Date().toISOString().slice(0, 16),
      latitude: '',
      longitude: '',
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, field: keyof EventFormData, value: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleGpsUpload = () => {
    setHasGpsData(true);
    alert('GPS数据导入成功（演示模式）');
  };

  return {
    isEdit,
    formData,
    events,
    hasGpsData,
    errors,
    boats,
    navigate,
    handleChange,
    handleSubmit,
    addEvent,
    updateEvent,
    deleteEvent,
    handleGpsUpload,
    setHasGpsData,
  };
}
