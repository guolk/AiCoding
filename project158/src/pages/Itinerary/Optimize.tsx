import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Space, List, Tag, message, Select, Modal, Row, Col } from 'antd';
import { ArrowLeft, MapPin, Route, RefreshCw, Plus, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cities } from '@/services/mock/cities';
import { optimizeRoute, calculateDistance, type City, type RouteResult } from '@/utils/routeOptimizer';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Itinerary } from '@/types/itinerary';

const { Option } = Select;

interface RouteSegment {
  from: City;
  to: City;
  distance: number;
  time: string;
}

export default function ItineraryOptimize() {
  const navigate = useNavigate();
  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);
  const updateItinerary = useItineraryStore(state => state.updateItinerary);

  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [startCity, setStartCity] = useState<string | undefined>();
  const [newCity, setNewCity] = useState<string | undefined>();
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | undefined>();

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const availableCities = useMemo(() => {
    const selectedNames = selectedCities.map(c => c.name);
    return cities.filter(c => !selectedNames.includes(c.name));
  }, [selectedCities]);

  const handleAddCity = () => {
    if (!newCity) return;
    const cityInfo = cities.find(c => c.name === newCity);
    if (cityInfo) {
      setSelectedCities([...selectedCities, cityInfo]);
      setNewCity(undefined);
    }
  };

  const handleRemoveCity = (index: number) => {
    const removedCity = selectedCities[index];
    setSelectedCities(selectedCities.filter((_, i) => i !== index));
    if (startCity === removedCity.name) {
      setStartCity(undefined);
    }
  };

  const handleOptimize = async () => {
    if (selectedCities.length < 2) {
      message.warning('至少需要2个城市才能进行路线优化');
      return;
    }

    const startCityObj = startCity
      ? selectedCities.find(c => c.name === startCity)
      : selectedCities[0];

    setOptimizing(true);
    try {
      const optimized = await new Promise<RouteResult>(resolve => {
        setTimeout(() => {
          resolve(optimizeRoute(selectedCities, startCityObj));
        }, 800);
      });
      setResult(optimized);
      message.success('路线优化完成');
    } catch (error) {
      message.error('优化失败，请重试');
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = async () => {
    if (!result || !selectedItineraryId) {
      message.warning('请选择要应用的行程');
      return;
    }

    try {
      const destinations = result.optimizedRoute.map((city, index) => ({
        id: Date.now().toString() + index,
        itineraryId: selectedItineraryId,
        city: city.name,
        sequence: index,
        arriveDate: '',
        leaveDate: '',
      }));

      await updateItinerary(selectedItineraryId, { destinations });
      message.success('已成功应用到行程');
      setApplyModalVisible(false);
      setSelectedItineraryId(undefined);
      navigate('/itinerary');
    } catch (error) {
      message.error('应用失败，请重试');
    }
  };

  const calculateSegments = (route: City[]): RouteSegment[] => {
    const segments: RouteSegment[] = [];
    for (let i = 0; i < route.length - 1; i++) {
      const distance = calculateDistance(route[i], route[i + 1]);
      const hours = Math.floor(distance / 80);
      const minutes = Math.round((distance % 80) / 80 * 60);
      let time = '';
      if (hours > 0) time += `${hours}小时`;
      if (minutes > 0) time += `${minutes}分钟`;
      if (time === '') time = '0小时';

      segments.push({
        from: route[i],
        to: route[i + 1],
        distance: Math.round(distance * 100) / 100,
        time,
      });
    }
    return segments;
  };

  const renderRouteMap = (route: City[], isOptimized: boolean) => {
    if (route.length === 0) return null;

    const padding = 40;
    const width = 600;
    const height = 300;

    const lats = route.map(c => c.lat || 0);
    const lngs = route.map(c => c.lng || 0);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const scaleX = (width - padding * 2) / (maxLng - minLng || 1);
    const scaleY = (height - padding * 2) / (maxLat - minLat || 1);
    const scale = Math.min(scaleX, scaleY);

    const points = route.map(city => ({
      x: padding + ((city.lng || 0) - minLng) * scale,
      y: height - padding - ((city.lat || 0) - minLat) * scale,
      name: city.name,
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-h-64">
        <path
          d={pathD}
          fill="none"
          stroke={isOptimized ? '#52c41a' : '#1890ff'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isOptimized ? '0' : '5,5'}
        />
        {points.map((p, index) => (
          <g key={p.name}>
            <circle
              cx={p.x}
              cy={p.y}
              r="16"
              fill={isOptimized ? '#52c41a' : '#1890ff'}
              stroke="white"
              strokeWidth="3"
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {index + 1}
            </text>
            <text
              x={p.x}
              y={p.y - 24}
              textAnchor="middle"
              fill="#333"
              fontSize="12"
              fontWeight="500"
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderSegmentsList = (segments: RouteSegment[]) => (
    <List
      dataSource={segments}
      renderItem={(segment, index) => (
        <List.Item className="flex flex-col md:flex-row md:items-center gap-2 p-3 bg-gray-50 rounded-lg mb-2">
          <div className="flex items-center gap-2 flex-1">
            <MapPin size={16} className="text-blue-500" />
            <span className="font-medium">{segment.from.name}</span>
            <span className="text-gray-400">→</span>
            <MapPin size={16} className="text-green-500" />
            <span className="font-medium">{segment.to.name}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Tag color="blue">{segment.distance} km</Tag>
            <Tag color="orange">{segment.time}</Tag>
          </div>
        </List.Item>
      )}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/itinerary')}>
          返回
        </Button>
        <h2 className="text-2xl font-bold m-0">路线优化</h2>
      </div>

      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">选择城市</h3>
          <Space>
            <Select
              placeholder="设置出发城市"
              value={startCity}
              onChange={setStartCity}
              className="w-40"
              allowClear
            >
              {selectedCities.map(city => (
                <Option key={city.name} value={city.name}>
                  {city.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="添加城市"
              value={newCity}
              onChange={setNewCity}
              className="w-40"
              showSearch
              optionFilterProp="children"
            >
              {availableCities.map(city => (
                <Option key={city.name} value={city.name}>
                  {city.name}
                </Option>
              ))}
            </Select>
            <Button
              icon={<Plus size={16} />}
              onClick={handleAddCity}
              disabled={!newCity}
            >
              添加
            </Button>
          </Space>
        </div>

        {selectedCities.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 5 }}
            dataSource={selectedCities}
            renderItem={(city, index) => (
              <List.Item>
                <Card className="text-center h-full relative group">
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={14} />}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveCity(index)}
                  />
                  <MapPin size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">{city.name}</p>
                  <Tag color={startCity === city.name ? 'green' : 'blue'}>
                    {startCity === city.name ? '出发' : `第 ${index + 1} 站`}
                  </Tag>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">请添加要优化的城市</p>
            <p className="text-sm mt-1">从上方选择器中添加城市</p>
          </div>
        )}

        {selectedCities.length >= 2 && (
          <div className="mt-4 text-center">
            <Button
              type="primary"
              size="large"
              icon={<Route size={18} />}
              onClick={handleOptimize}
              loading={optimizing}
            >
              开始优化路线
            </Button>
          </div>
        )}
      </Card>

      {result && (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center gap-2">
                    <Route size={18} className="text-blue-500" />
                    原始路线
                  </span>
                }
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <Tag color="orange">总距离: {result.originalDistance.toFixed(2)} km</Tag>
                </div>
                <div className="mb-4">
                  {renderRouteMap(result.route, false)}
                </div>
                {renderSegmentsList(calculateSegments(result.route))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    优化后路线
                  </span>
                }
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <Space>
                    <Tag color="green">总距离: {result.totalDistance.toFixed(2)} km</Tag>
                    <Tag color="orange">预计节省: {(result.improvement * 100).toFixed(1)}%</Tag>
                    <Tag color="purple">预计时间: {result.estimatedTime}</Tag>
                  </Space>
                </div>
                <div className="mb-4">
                  {renderRouteMap(result.optimizedRoute, true)}
                </div>
                {renderSegmentsList(calculateSegments(result.optimizedRoute))}
              </Card>
            </Col>
          </Row>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold m-0">优化后城市顺序</h3>
              <Space>
                <Button icon={<RefreshCw size={16} />} onClick={handleOptimize} loading={optimizing}>
                  重新优化
                </Button>
                <Button
                  type="primary"
                  onClick={() => setApplyModalVisible(true)}
                >
                  应用到行程
                </Button>
              </Space>
            </div>
            <List
              dataSource={result.optimizedRoute}
              renderItem={(city, index) => (
                <List.Item className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <MapPin size={20} className="text-green-500" />
                  <span className="font-medium text-lg">{city.name}</span>
                  {index < result.optimizedRoute.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </>
      )}

      <Modal
        title="应用到行程"
        open={applyModalVisible}
        onOk={handleApply}
        onCancel={() => setApplyModalVisible(false)}
        okText="确认应用"
        cancelText="取消"
        okButtonProps={{ type: 'primary' }}
      >
        <p className="mb-3">选择要应用优化后路线的行程：</p>
        <Select
          placeholder="请选择行程"
          value={selectedItineraryId}
          onChange={setSelectedItineraryId}
          className="w-full"
          showSearch
          optionFilterProp="children"
        >
          {itineraries.map((itinerary: Itinerary) => (
            <Option key={itinerary.id} value={itinerary.id}>
              {itinerary.title}
            </Option>
          ))}
        </Select>
        {selectedItineraryId && (
          <p className="mt-3 text-sm text-orange-600">
            注意：此操作将覆盖行程的目的地城市列表
          </p>
        )}
      </Modal>
    </div>
  );
}
