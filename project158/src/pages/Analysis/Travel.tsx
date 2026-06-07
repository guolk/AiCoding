import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Empty } from 'antd';
import { Plane, MapPin, Calendar, TrendingUp, Clock } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { useItineraryStore } from '@/store/useItineraryStore';
import type { Itinerary } from '@/types/itinerary';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AnalysisTravel() {
  const itineraries = useItineraryStore(state => state.itineraries);
  const fetchItineraries = useItineraryStore(state => state.fetchItineraries);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const completedItineraries = useMemo(() => {
    return itineraries.filter(i => i.status === 'completed' && dayjs(i.startDate).year() === selectedYear);
  }, [itineraries, selectedYear]);

  const stats = useMemo(() => {
    const totalTrips = completedItineraries.length;
    const totalDays = completedItineraries.reduce((sum, i) => {
      const days = dayjs(i.endDate).diff(dayjs(i.startDate), 'day') + 1;
      return sum + days;
    }, 0);
    const avgDays = totalTrips > 0 ? (totalDays / totalTrips).toFixed(1) : '0';

    const cityCount: Record<string, number> = {};
    completedItineraries.forEach(i => {
      i.destinations.forEach(d => {
        cityCount[d.city] = (cityCount[d.city] || 0) + 1;
      });
    });
    const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalTrips,
      totalDays,
      avgDays,
      topCity: topCity ? topCity[0] : '-',
    };
  }, [completedItineraries]);

  const monthlyTrendData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const tripCounts = new Array(12).fill(0);
    const dayCounts = new Array(12).fill(0);

    completedItineraries.forEach(i => {
      const month = dayjs(i.startDate).month();
      tripCounts[month] += 1;
      const days = dayjs(i.endDate).diff(dayjs(i.startDate), 'day') + 1;
      dayCounts[month] += days;
    });

    return { months, tripCounts, dayCounts };
  }, [completedItineraries]);

  const monthlyTrendOption = {
    title: {
      text: '年度出差趋势',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['出差次数', '出差天数'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: monthlyTrendData.months,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: 'value',
        name: '次数',
        position: 'left',
        axisLabel: { formatter: '{value}次' },
      },
      {
        type: 'value',
        name: '天数',
        position: 'right',
        axisLabel: { formatter: '{value}天' },
      },
    ],
    series: [
      {
        name: '出差次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        data: monthlyTrendData.tripCounts,
      },
      {
        name: '出差天数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#52c41a' },
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
        data: monthlyTrendData.dayCounts,
      },
    ],
  };

  const cityRankData = useMemo(() => {
    const cityCount: Record<string, number> = {};
    completedItineraries.forEach(i => {
      i.destinations.forEach(d => {
        cityCount[d.city] = (cityCount[d.city] || 0) + 1;
      });
    });
    const sorted = Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      cities: sorted.map(s => s[0]).reverse(),
      counts: sorted.map(s => s[1]).reverse(),
    };
  }, [completedItineraries]);

  const cityRankOption = {
    title: {
      text: '目的地城市排行 Top10',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c}次',
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}次' },
    },
    yAxis: {
      type: 'category',
      data: cityRankData.cities,
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        data: cityRankData.counts.map((value, index) => ({
          value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#1890ff' },
                { offset: 1, color: '#69c0ff' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}次',
        },
        barWidth: '60%',
      },
    ],
  };

  const heatmapData = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weeks = ['第1周', '第2周', '第3周', '第4周'];
    const data: [number, number, number][] = [];

    const monthWeekCount: Record<string, Record<number, number>> = {};
    completedItineraries.forEach(i => {
      const month = dayjs(i.startDate).month();
      const week = Math.min(3, Math.floor(dayjs(i.startDate).date() / 7));
      if (!monthWeekCount[month]) monthWeekCount[month] = {};
      monthWeekCount[month][week] = (monthWeekCount[month][week] || 0) + 1;
    });

    for (let m = 0; m < 12; m++) {
      for (let w = 0; w < 4; w++) {
        data.push([m, w, monthWeekCount[m]?.[w] || 0]);
      }
    }

    return { months, weeks, data };
  }, [completedItineraries]);

  const heatmapOption = {
    title: {
      text: '出差频率热力图',
      left: 'center',
      textStyle: { fontSize: 16 },
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${heatmapData.months[params.data[0]]} ${heatmapData.weeks[params.data[1]]}: ${params.data[2]}次出差`;
      },
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: heatmapData.months,
      splitArea: { show: true },
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'category',
      data: heatmapData.weeks,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.data.map(d => d[2]), 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#f0f5ff', '#91caff', '#1890ff', '#0050b3'],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData.data,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const years = [dayjs().year() - 2, dayjs().year() - 1, dayjs().year(), dayjs().year() + 1];

  if (itineraries.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">出行统计</h2>
        <Empty description="暂无出行数据" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold m-0">出行统计</h2>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120 }}
        >
          {years.map(year => (
            <Option key={year} value={year}>{year}年</Option>
          ))}
        </Select>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">总出差次数</p>
                  <p className="text-3xl font-bold text-white m-0">{stats.totalTrips}</p>
                  <p className="text-white text-opacity-70 text-xs mt-1">次</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Plane size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">总出差天数</p>
                  <p className="text-3xl font-bold text-white m-0">{stats.totalDays}</p>
                  <p className="text-white text-opacity-70 text-xs mt-1">天</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Calendar size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">平均每次出差</p>
                  <p className="text-3xl font-bold text-white m-0">{stats.avgDays}</p>
                  <p className="text-white text-opacity-70 text-xs mt-1">天</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Clock size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="overflow-hidden">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm mb-1">最常去城市</p>
                  <p className="text-2xl font-bold text-white m-0 truncate" style={{ maxWidth: '120px' }}>
                    {stats.topCity}
                  </p>
                  <p className="text-white text-opacity-70 text-xs mt-1">城市</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <MapPin size={32} className="text-white" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={14}>
          <Card>
            <ReactECharts option={monthlyTrendOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card>
            <ReactECharts option={cityRankOption} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <ReactECharts option={heatmapOption} style={{ height: '400px' }} />
      </Card>
    </div>
  );
}
