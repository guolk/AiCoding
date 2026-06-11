import { useTreeStore } from '@/store/treeStore';
import { BarChart3, TreePine, Calendar, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SPECIES_COLORS = ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC', '#D4A373', '#B8860B'];

export default function Analysis() {
  const { trees } = useTreeStore();

  const speciesCount: Record<string, number> = {};
  trees.forEach((t) => {
    speciesCount[t.species] = (speciesCount[t.species] || 0) + 1;
  });
  const speciesData = Object.entries(speciesCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const ageRanges = [
    { range: '100-200年', min: 100, max: 200 },
    { range: '200-500年', min: 200, max: 500 },
    { range: '500-800年', min: 500, max: 800 },
    { range: '800-1000年', min: 800, max: 1000 },
    { range: '1000年以上', min: 1000, max: Infinity },
  ];

  const ageData = ageRanges.map(({ range, min, max }) => ({
    range,
    count: trees.filter((t) => t.estimatedAge >= min && t.estimatedAge < max).length,
  }));

  const healthData = [
    { name: '优', value: trees.filter((t) => t.healthStatus === 'excellent').length, color: '#52B788' },
    { name: '良', value: trees.filter((t) => t.healthStatus === 'good').length, color: '#74C69D' },
    { name: '中', value: trees.filter((t) => t.healthStatus === 'fair').length, color: '#D4A373' },
    { name: '差', value: trees.filter((t) => t.healthStatus === 'poor').length, color: '#E76F51' },
    { name: '危', value: trees.filter((t) => t.healthStatus === 'critical').length, color: '#E63946' },
  ];

  const oldestTrees = [...trees].sort((a, b) => b.estimatedAge - a.estimatedAge).slice(0, 5);

  const locationCount: Record<string, number> = {};
  trees.forEach((t) => {
    const province = t.location.match(/^[^省]+省|^[^市]+市|^[^区]+区/)?.[0] || t.location;
    locationCount[province] = (locationCount[province] || 0) + 1;
  });
  const locationData = Object.entries(locationCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-forest-600 flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          数据分析
        </h1>
        <p className="text-brown-700/70 mt-1">树种分布统计、树龄分布分析、区域密度排名</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            树种分布统计
          </h2>
          <div className="flex items-center">
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={speciesData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
                    {speciesData.map((_, i) => (
                      <Cell key={i} fill={SPECIES_COLORS[i % SPECIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #95D5B2' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {speciesData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SPECIES_COLORS[i % SPECIES_COLORS.length] }} />
                    <span className="text-brown-700/70">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-forest-600">{item.value}</span>
                    <span className="text-brown-700/40">({Math.round((item.value / trees.length) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            树龄分布分析
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8F3DC" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#5C4033' }} />
                <YAxis tick={{ fontSize: 12, fill: '#5C4033' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #95D5B2' }} />
                <Bar dataKey="count" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="古树数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            健康状况分布
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                  {healthData.filter((d) => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #95D5B2' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            最古老古树排名
          </h2>
          <div className="space-y-3">
            {oldestTrees.map((tree, i) => (
              <div key={tree.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-amber-300' : i === 2 ? 'bg-amber-200 text-amber-800' : 'bg-forest-200 text-forest-700'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brown-700 truncate">{tree.species}</p>
                  <p className="text-xs text-brown-700/50 truncate">{tree.location}</p>
                </div>
                <span className="text-sm font-bold text-forest-600">{tree.estimatedAge}年</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            区域密度排名
          </h2>
          <div className="space-y-3">
            {locationData.slice(0, 6).map((item, i) => {
              const maxCount = locationData[0]?.count || 1;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-brown-700/70 truncate">{item.name}</span>
                    <span className="font-medium text-forest-600">{item.count} 棵</span>
                  </div>
                  <div className="w-full h-2 bg-forest-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                        backgroundColor: i === 0 ? '#1B4332' : i === 1 ? '#2D6A4F' : '#52B788',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
