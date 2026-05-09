import React, { useState, useEffect } from 'react';
import { 
  Card, Collapse, InputNumber, Button, Space, Typography,
  Select, Input, Table, Tag, message, Divider, Descriptions, List, Tabs,
  Switch, Slider, Row, Col
} from 'antd';
import { 
  RulerOutlined, 
  BarChartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  DotChartOutlined
} from '@ant-design/icons';
import AnalysisPanel from './AnalysisPanel';
import { latticeToMatrix, fractionalToCartesian, getMillerPlanePoints } from '../utils/crystalUtils';
import { calculateMillerSpacing } from '../utils/api';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const ToolPanel = ({ crystalData, analysisResults, onLoadStructure }) => {
  const [h, setH] = useState(1);
  const [k, setK] = useState(1);
  const [l, setL] = useState(1);
  const [millerSpacing, setMillerSpacing] = useState(null);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [bondLengths, setBondLengths] = useState([]);
  const [bondAngles, setBondAngles] = useState([]);
  const [measurementMode, setMeasurementMode] = useState(null);

  const calculateMiller = async () => {
    if (!crystalData?.lattice) {
      message.warning('请先加载晶体结构');
      return;
    }
    try {
      const response = await calculateMillerSpacing(crystalData.lattice, h, k, l);
      if (response.data.success) {
        setMillerSpacing(response.data.data);
        message.success(`晶面间距: ${response.data.data.spacing.toFixed(4)} Å`);
      }
    } catch (error) {
      message.error('计算失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const calculateBondLengths = () => {
    if (!crystalData?.lattice || !crystalData?.atoms) return;
    
    const latticeMatrix = latticeToMatrix(crystalData.lattice);
    const lengths = [];
    const atoms = crystalData.atoms;
    
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const pos1 = fractionalToCartesian([atoms[i].x, atoms[i].y, atoms[i].z], latticeMatrix);
        const pos2 = fractionalToCartesian([atoms[j].x, atoms[j].y, atoms[j].z], latticeMatrix);
        
        const dist = Math.sqrt(
          Math.pow(pos1[0] - pos2[0], 2) +
          Math.pow(pos1[1] - pos2[1], 2) +
          Math.pow(pos1[2] - pos2[2], 2)
        );
        
        if (dist < 4.0 && dist > 0.1) {
          lengths.push({
            key: `${i}-${j}`,
            atom1: atoms[i].label || `${atoms[i].element}${i + 1}`,
            atom2: atoms[j].label || `${atoms[j].element}${j + 1}`,
            element1: atoms[i].element,
            element2: atoms[j].element,
            distance: dist
          });
        }
      }
    }
    
    lengths.sort((a, b) => a.distance - b.distance);
    setBondLengths(lengths.slice(0, 50));
  };

  const calculateBondAngles = () => {
    if (!crystalData?.lattice || !crystalData?.atoms) return;
    
    const latticeMatrix = latticeToMatrix(crystalData.lattice);
    const angles = [];
    const atoms = crystalData.atoms;
    
    const cartAtoms = atoms.map(atom => ({
      ...atom,
      cart: fractionalToCartesian([atom.x, atom.y, atom.z], latticeMatrix)
    }));
    
    for (let center = 0; center < cartAtoms.length; center++) {
      const neighbors = [];
      
      for (let i = 0; i < cartAtoms.length; i++) {
        if (i === center) continue;
        const dist = Math.sqrt(
          Math.pow(cartAtoms[center].cart[0] - cartAtoms[i].cart[0], 2) +
          Math.pow(cartAtoms[center].cart[1] - cartAtoms[i].cart[1], 2) +
          Math.pow(cartAtoms[center].cart[2] - cartAtoms[i].cart[2], 2)
        );
        if (dist < 3.0) {
          neighbors.push({ index: i, dist, atom: cartAtoms[i] });
        }
      }
      
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const v1 = [
            neighbors[i].atom.cart[0] - cartAtoms[center].cart[0],
            neighbors[i].atom.cart[1] - cartAtoms[center].cart[1],
            neighbors[i].atom.cart[2] - cartAtoms[center].cart[2]
          ];
          const v2 = [
            neighbors[j].atom.cart[0] - cartAtoms[center].cart[0],
            neighbors[j].atom.cart[1] - cartAtoms[center].cart[1],
            neighbors[j].atom.cart[2] - cartAtoms[center].cart[2]
          ];
          
          const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
          const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
          const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
          
          const cosAngle = dot / (mag1 * mag2);
          const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
          
          if (angle > 30 && angle < 180) {
            angles.push({
              key: `${center}-${neighbors[i].index}-${neighbors[j].index}`,
              center: cartAtoms[center].label || `${cartAtoms[center].element}${center + 1}`,
              atom1: neighbors[i].atom.label || `${neighbors[i].atom.element}${neighbors[i].index + 1}`,
              atom2: neighbors[j].atom.label || `${neighbors[j].atom.element}${neighbors[j].index + 1}`,
              angle: angle
            });
          }
        }
      }
    }
    
    angles.sort((a, b) => a.angle - b.angle);
    setBondAngles(angles.slice(0, 50));
  };

  const bondLengthColumns = [
    { title: '原子1', dataIndex: 'atom1', key: 'atom1' },
    { title: '原子2', dataIndex: 'atom2', key: 'atom2' },
    { 
      title: '键长 (Å)', 
      dataIndex: 'distance', 
      key: 'distance',
      render: (v) => v?.toFixed(3)
    }
  ];

  const bondAngleColumns = [
    { title: '中心原子', dataIndex: 'center', key: 'center' },
    { title: '原子1', dataIndex: 'atom1', key: 'atom1' },
    { title: '原子2', dataIndex: 'atom2', key: 'atom2' },
    { 
      title: '键角 (°)', 
      dataIndex: 'angle', 
      key: 'angle',
      render: (v) => v?.toFixed(2)
    }
  ];

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Tabs defaultActiveKey="1" size="small">
        <TabPane tab={<span><RulerOutlined /> 测量</span>} key="1">
          <Collapse defaultActiveKey={['1', '2']} ghost size="small">
            <Panel header="键长分析" key="1">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  block
                  onClick={calculateBondLengths}
                  disabled={!crystalData}
                >
                  计算键长
                </Button>
                {bondLengths.length > 0 && (
                  <Table 
                    dataSource={bondLengths} 
                    columns={bondLengthColumns}
                    size="small"
                    pagination={{ pageSize: 5 }}
                    scroll={{ y: 150 }}
                  />
                )}
              </Space>
            </Panel>
            
            <Panel header="键角分析" key="2">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  block
                  onClick={calculateBondAngles}
                  disabled={!crystalData}
                >
                  计算键角
                </Button>
                {bondAngles.length > 0 && (
                  <Table 
                    dataSource={bondAngles} 
                    columns={bondAngleColumns}
                    size="small"
                    pagination={{ pageSize: 5 }}
                    scroll={{ y: 150 }}
                  />
                )}
              </Space>
            </Panel>
            
            <Panel header="晶面间距 (Miller指数)" key="3">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <InputNumber 
                      min={-10} 
                      max={10}
                      value={h}
                      onChange={setH}
                      placeholder="h"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <InputNumber 
                      min={-10} 
                      max={10}
                      value={k}
                      onChange={setK}
                      placeholder="k"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <InputNumber 
                      min={-10} 
                      max={10}
                      value={l}
                      onChange={setL}
                      placeholder="l"
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
                <Button 
                  type="primary" 
                  block
                  onClick={calculateMiller}
                  disabled={!crystalData}
                >
                  计算 ({h}, {k}, {l})
                </Button>
                {millerSpacing && (
                  <Descriptions size="small" bordered column={1}>
                    <Descriptions.Item label="晶面间距">
                      {millerSpacing.spacing?.toFixed(4)} Å
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Space>
            </Panel>
          </Collapse>
        </TabPane>
        
        <TabPane tab={<span><BarChartOutlined /> 结构信息</span>} key="2">
          <AnalysisPanel 
            crystalData={crystalData}
            analysisResults={analysisResults}
          />
        </TabPane>
        
        <TabPane tab={<span><ExperimentOutlined /> 对称元素</span>} key="3">
          {analysisResults?.symmetry?.symmetry_operations ? (
            <div>
              <Descriptions size="small" bordered column={1}>
                <Descriptions.Item label="点群">
                  <Tag color="purple">{analysisResults.symmetry.point_group}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="空间群">
                  {analysisResults.symmetry.space_group?.international_table}
                </Descriptions.Item>
                <Descriptions.Item label="对称操作数">
                  {analysisResults.symmetry.symmetry_operations.length}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Text strong>Wyckoff位置:</Text>
              <List
                size="small"
                dataSource={analysisResults.symmetry.wyckoff_positions?.slice(0, 10)}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color="blue">{item.wyckoff_letter}</Tag>
                    <Text> 位点 {item.site_index + 1}</Text>
                  </List.Item>
                )}
              />
            </div>
          ) : (
              <Paragraph type="secondary">
                点击顶部"分析结构"按钮进行对称性分析
              </Paragraph>
            )}
        </TabPane>
      </Tabs>
    </Space>
  );
};

export default ToolPanel;
