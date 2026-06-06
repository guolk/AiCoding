import { Link } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useVoyageForm } from './hooks/useVoyageForm';
import BasicInfoSection from './components/BasicInfoSection';
import WeatherSection from './components/WeatherSection';
import GpsUploadSection from './components/GpsUploadSection';
import EventsSection from './components/EventsSection';
import NotesSection from './components/NotesSection';

export default function VoyageForm() {
  const {
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
  } = useVoyageForm();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/voyages')} className="w-10 h-10 rounded-lg border border-ocean-200 flex items-center justify-center hover:bg-ocean-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-ocean-600" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="flex items-center gap-1 hover:text-ocean-600"><Home className="w-4 h-4" />首页</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/voyages" className="hover:text-ocean-600">航行日志</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-ocean-700 font-medium">{isEdit ? '编辑航行' : '新增航行'}</span>
        </div>
      </div>

      <h1 className="font-display text-4xl font-bold text-ocean-800">
        {isEdit ? '编辑航行日志' : '新增航行日志'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection formData={formData} errors={errors} boats={boats} onChange={handleChange} />
        <WeatherSection weatherConditions={formData.weatherConditions} windSpeed={formData.windSpeed} windDirection={formData.windDirection} errors={errors} onChange={handleChange} />
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">GPS轨迹</h2>
            {hasGpsData && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                已导入GPS数据
              </div>
            )}
          </div>
          <GpsUploadSection hasGpsData={hasGpsData} onUpload={handleGpsUpload} onClear={() => setHasGpsData(false)} />
        </div>

        <EventsSection events={events} onAdd={addEvent} onUpdate={updateEvent} onDelete={deleteEvent} />
        <NotesSection notes={formData.notes} onChange={handleChange} />

        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate('/voyages')} className="btn-secondary">取消</button>
          <button type="submit" className="btn-primary">{isEdit ? '保存修改' : '创建航行日志'}</button>
        </div>
      </form>
    </div>
  );
}
