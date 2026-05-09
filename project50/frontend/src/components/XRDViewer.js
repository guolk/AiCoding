import React, { useRef, useEffect, useState } from 'react';
import { Card, Typography, Space, Table, Slider, InputNumber, Button, Descriptions, Tag } from 'antd';

const { Title, Text } = Typography;

const XRDViewer = ({ xrdData, crystalData }) => {
  const canvasRef = useRef(null);
  const [range, setRange] = useState([0, 90]);
  const [smoothing, setSmoothing] = useState(0);

  useEffect(() => {
    if (!xrdData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const angles = xrdData.angles;
    const intensities = xrdData.intensities;

    if (!angles || angles.length === 0) return;

    const filteredIndices = angles.map((a, i) => a >= range[0] && a <= range[1] ? i : -1).filter(i => i >= 0);
    if (filteredIndices.length === 0) return;

    const filteredAngles = filteredIndices.map(i => angles[i]);
    const filteredIntensities = filteredIndices.map(i => intensities[i]);

    const maxIntensity = Math.max(...filteredIntensities);
    const minAngle = Math.min(...filteredAngles);
    const maxAngle = Math.max(...filteredAngles);

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const y = padding + (height - 2 * padding) * (1 - i / 10);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((i * 100).toFixed(0) + '%', padding - 10, y + 4);
    }

    for (let i = 0; i <= 5; i++) {
      const x = padding + (width - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      const angle = minAngle + (maxAngle - minAngle) * (i / 5);
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(angle.toFixed(0) + '°', x, height - padding + 20);
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);

    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    filteredAngles.forEach((angle, i) => {
      const x = padding + (width - 2 * padding) * ((angle - minAngle) / (maxAngle - minAngle));
      const y = padding + (height - 2 * padding) * (1 - filteredIntensities[i] / maxIntensity);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    if (xrdData.peaks && xrdData.peaks.length > 0) {
      const visiblePeaks = xrdData.peaks.filter(p => p.angle >= range[0] && p.angle <= range[1]);
      visiblePeaks.forEach(peak => {
        const x = padding + (width - 2 * padding) * ((peak.angle - minAngle) / (maxAngle - minAngle));
        const y = padding + (height - 2 * padding) * (1 - peak.intensity / maxIntensity);
        
        ctx.fillStyle = '#ff4d4f';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#52c41a';
        ctx.beginPath();
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, height - padding - 10);
        ctx.stroke();
      });
    }

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2θ (°)', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('相对强度', 0, 0);
    ctx.restore();

  }, [xrdData, range, smoothing]);

  const peakColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 70 },
    { 
      title: '2θ (°)', 
      dataIndex: 'angle', 
      key: 'angle',
      render: (v) => v?.toFixed(2)
    },
    { 
      title: '相对强度', 
      dataIndex: 'intensity', 
      key: 'intensity',
      render: (v) => v?.toFixed(4)
    }
  ];

  const peakData = xrdData?.peaks?.map((peak, idx) => ({
    ...peak,
    index: idx + 1,
    key: idx
  })) || [];

  if (!xrdData) {
    return (
      <Card>
        <Text type="secondary">暂无XRD数据，请先运行XRD模拟</Text>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card 
        title="X射线衍射图谱" 
        size="small"
        extra={
          <Tag color="blue">Cu Kα (λ = 1.5406 Å)</Tag>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space align="center">
            <span>2θ 范围:</span>
            <Slider 
              range 
              min={0} 
              max={90} 
              value={range}
              onChange={setRange}
              style={{ width: 300 }}
            />
            <span>{range[0].toFixed(0)}° - {range[1].toFixed(0)}°</span>
          </Space>

          <canvas 
            ref={canvasRef} 
            width={900} 
            height={350}
            style={{ 
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              width: '100%',
              maxWidth: 900
            }}
          />

          <Descriptions size="small" column={3}>
            <Descriptions.Item label="数据点数">
              {xrdData.angles?.length}
            </Descriptions.Item>
            <Descriptions.Item label="检测峰数">
              {xrdData.peaks?.length}
            </Descriptions.Item>
            <Descriptions.Item label="角步长">
              0.10°
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {peakData.length > 0 && (
        <Card title="衍射峰列表" size="small">
          <Table 
            dataSource={peakData} 
            columns={peakColumns}
            size="small"
            pagination={{ pageSize: 15 }}
            scroll={{ y: 300 }}
          />
        </Card>
      )}
    </Space>
  );
};

export default XRDViewer;
