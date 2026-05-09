import React from 'react';
import { Card, Descriptions, Table, Tag, Typography, Space, Divider } from 'antd';

const { Title, Text } = Typography;

const AnalysisPanel = ({ crystalData, analysisResults }) => {
  if (!crystalData && !analysisResults) {
    return (
      <Card>
        <Text type="secondary">暂无数据，请先加载晶体结构</Text>
      </Card>
    );
  }

  const lattice = crystalData?.lattice;
  const atoms = crystalData?.atoms;
  const physical = analysisResults?.physical_properties;
  const symmetry = analysisResults?.symmetry;

  const atomColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60 },
    { title: '标签', dataIndex: 'label', key: 'label' },
    { title: '元素', dataIndex: 'element', key: 'element' },
    { 
      title: 'x', 
      dataIndex: 'x', 
      key: 'x', 
      render: (v) => v?.toFixed?.(4) || v 
    },
    { 
      title: 'y', 
      dataIndex: 'y', 
      key: 'y', 
      render: (v) => v?.toFixed?.(4) || v 
    },
    { 
      title: 'z', 
      dataIndex: 'z', 
      key: 'z', 
      render: (v) => v?.toFixed?.(4) || v 
    },
    { 
      title: '占有率', 
      dataIndex: 'occupancy', 
      key: 'occupancy', 
      render: (v) => (v ?? 1)?.toFixed?.(2) || '1.00'
    }
  ];

  const atomData = atoms?.map((atom, idx) => ({
    ...atom,
    index: idx + 1,
    key: idx
  })) || [];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {lattice && (
        <Card title="晶胞参数" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="a (Å)">
              {lattice.a?.toFixed(4)}
            </Descriptions.Item>
            <Descriptions.Item label="b (Å)">
              {lattice.b?.toFixed(4)}
            </Descriptions.Item>
            <Descriptions.Item label="c (Å)">
              {lattice.c?.toFixed(4)}
            </Descriptions.Item>
            <Descriptions.Item label="α (°)">
              {lattice.alpha?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="β (°)">
              {lattice.beta?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="γ (°)">
              {lattice.gamma?.toFixed(2)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {physical && (
        <Card title="物理性质" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="化学式">
              {physical.formula?.formula || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="化学式量">
              {physical.formula?.mass?.toFixed(2)} g/mol
            </Descriptions.Item>
            <Descriptions.Item label="体积">
              {physical.volume?.toFixed(4)} Å³
            </Descriptions.Item>
            <Descriptions.Item label="密度">
              {physical.density?.toFixed(4)} g/cm³
            </Descriptions.Item>
            <Descriptions.Item label="堆积密度">
              {physical.packing_density?.toFixed(4)}
            </Descriptions.Item>
            <Descriptions.Item label="晶系">
              <Tag color="blue">{physical.anisotropy?.crystal_system}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="各向异性指数">
              {physical.anisotropy?.anisotropy_index?.toFixed(4)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {symmetry && (
        <Card title="对称性分析" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="点群">
              <Tag color="purple">{symmetry.point_group}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="空间群">
              {symmetry.space_group?.international_table || '-'}
              {symmetry.space_group?.number && ` (#${symmetry.space_group.number})`}
            </Descriptions.Item>
            <Descriptions.Item label="Hall符号">
              {symmetry.space_group?.hall_symbol || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="对称操作">
              {symmetry.symmetry_operations?.length || 0} 个
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {crystalData?.space_group && !symmetry && (
        <Card title="空间群信息" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="空间群">
              {crystalData.space_group.name}
              {crystalData.space_group.number && ` (#${crystalData.space_group.number})`}
            </Descriptions.Item>
            <Descriptions.Item label="Hall符号">
              {crystalData.space_group.hall_symbol || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {atomData.length > 0 && (
        <Card title="原子列表" size="small">
          <Table 
            dataSource={atomData} 
            columns={atomColumns}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </Card>
      )}
    </Space>
  );
};

export default AnalysisPanel;
