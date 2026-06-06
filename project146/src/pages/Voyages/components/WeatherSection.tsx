const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

interface WeatherSectionProps {
  weatherConditions: string;
  windSpeed: string;
  windDirection: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function WeatherSection({ weatherConditions, windSpeed, windDirection, errors, onChange }: WeatherSectionProps) {
  return (
    <div className="card p-6">
      <h2 className="section-title">天气信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">天气条件 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={weatherConditions}
            onChange={(e) => onChange('weatherConditions', e.target.value)}
            placeholder="如：晴朗，海面有轻浪"
            className={`input-field ${errors.weatherConditions ? 'border-red-500' : ''}`}
          />
          {errors.weatherConditions && <p className="text-red-500 text-sm mt-1">{errors.weatherConditions}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">风速（节）</label>
          <input
            type="number"
            value={windSpeed}
            onChange={(e) => onChange('windSpeed', e.target.value)}
            placeholder="12"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">风向</label>
          <select
            value={windDirection}
            onChange={(e) => onChange('windDirection', e.target.value)}
            className="input-field"
          >
            {windDirections.map(dir => (
              <option key={dir} value={dir}>{dir}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
