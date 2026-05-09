import React, { useState } from 'react';
import { 
  Card, Input, Button, Table, Typography, Space, Tag, Spin, message,
  Descriptions, Modal, Divider, Tabs, InputNumber, AutoComplete
} from 'antd';
import { SearchOutlined, DownloadOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import { searchCOD, downloadFromCOD } from '../utils/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CODSearch = ({ onLoadStructure }) => {
  const [searchType, setSearchType] = useState('query');
  const [query, setQuery] = useState('');
  const [formula, setFormula] = useState('');
  const [elements, setElements] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const commonElements = [
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
    'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe',
    'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
    'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Ru', 'Rh', 'Pd', 'Ag',
    'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
    'Cs', 'Ba', 'La', 'Ce', 'Nd', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy',
    'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os',
    'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Th', 'U'
  ].map(e => ({ value: e }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      let params = { max_results: 50 };
      
      if (searchType === 'query' && query) {
        params.query = query;
      } else if (searchType === 'formula' && formula) {
        params.formula = formula;
      } else if (searchType === 'elements' && elements) {
        params.elements = elements.split(',').map(e => e.trim()).filter(e => e);
      }

      const response = await searchCOD(params);
      if (response.data.success) {
        setResults(response.data.data);
        message.success(`找到 ${response.data.data.length} 条结果`);
      }
    } catch (error) {
      message.error('搜索失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (codId) => {
    setDownloadingId(codId);
    try {
      const response = await downloadFromCOD(codId);
      if (response.data.success && onLoadStructure) {
        onLoadStructure({
          structure: response.data.data.structure
        });
        message.success('晶体结构下载成功');
        setSelectedResult(null);
      }
    } catch (error) {
      message.error('下载失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      title: 'COD ID',
      dataIndex: 'cod_id',
      key: 'cod_id',
      width: 100,
      render: (text) => <Tag color="blue">#{text}</Tag>
    },
    {
      title: '化学式',
      dataIndex: 'formula',
      key: 'formula',
      width: 150,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '空间群',
      dataIndex: 'space_group',
      key: 'space_group',
      width: 100
    },
    {
      title: '晶胞参数',
      key: 'cell',
      width: 180,
      render: (_, record) => (
        <Text type="secondary">
          {record.a?.toFixed(2)} × {record.b?.toFixed(2)} × {record.c?.toFixed(2)} Å
        </Text>
      )
    },
    {
      title: '文献',
      key: 'reference',
      ellipsis: true,
      render: (_, record) => (
        <Text type="secondary" ellipsis>
          {record.authors || record.journal ? (
            <>
            {record.authors?.split(',')[0]} et al. {record.year && `(${record.year})`}
            </>
          ) : '-'}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => setSelectedResult(record)}
          >
            详情
          </Button>
          <Button 
            size="small" 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.cod_id)}
            loading={downloadingId === record.cod_id}
          >
            加载
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Title level={3}>
          <DatabaseOutlined /> COD 晶体学数据库检索
        </Title>
        <Paragraph type="secondary">
          检索 Crystallography Open Database (COD) 中的晶体结构数据。支持关键词、化学式或元素搜索。
        </Paragraph>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={searchType} onChange={setSearchType}>
          <TabPane tab="关键词搜索" key="query">
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="输入关键词，如：NaCl, diamond, quartz..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 'calc(100% - 120px) }}
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                style={{ width: 120 }}
              >
                搜索
              </Button>
            </Space.Compact>
          </TabPane>
          
          <TabPane tab="化学式搜索" key="formula">
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="输入化学式，如：NaCl, CaTiO3, SiO2..."
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 'calc(100% - 120px)' }}
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                style={{ width: 120 }}
              >
                搜索
              </Button>
            </Space.Compact>
          </TabPane>
          
          <TabPane tab="元素搜索" key="elements">
            <Space direction="vertical" style={{ width: '100%' }}>
              <AutoComplete
                options={commonElements}
                placeholder="输入元素符号，多个元素用逗号分隔"
                value={elements}
                onChange={setElements}
                style={{ width: '100%' }}
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                搜索
              </Button>
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      <Card style={{ marginTop: 16 }} title={`搜索结果 (${results.length})`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>正在搜索 COD 数据库...</Paragraph>
          </div>
        ) : results.length > 0 ? (
          <Table 
            dataSource={results} 
            columns={columns}
            rowKey="cod_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <DatabaseOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              暂无搜索结果，请尝试其他搜索条件
            </Paragraph>
          </div>
        )}
      </Card>

      <Modal
        title="晶体详情"
        open={!!selectedResult}
        onCancel={() => setSelectedResult(null)}
        footer={[
          <Button key="back" onClick={() => setSelectedResult(null)}>
            关闭
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(selectedResult?.cod_id)}
            loading={downloadingId === selectedResult?.cod_id}
          >
            加载结构
          </Button>,
        ]}
        width={700}
      >
        {selectedResult && (
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="COD ID" span={1}>
              <Tag color="blue">#{selectedResult.cod_id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="化学式" span={1}>
              {selectedResult.formula}
            </Descriptions.Item>
            
            <Descriptions.Item label="名称" span={2}>
              {selectedResult.title || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="空间群" span={2}>
              {selectedResult.space_group || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="a" span={1}>
              {selectedResult.a?.toFixed(4)} Å
            </Descriptions.Item>
            <Descriptions.Item label="b" span={1}>
              {selectedResult.b?.toFixed(4)} Å
            </Descriptions.Item>
            <Descriptions.Item label="c" span={1}>
              {selectedResult.c?.toFixed(4)} Å
            </Descriptions.Item>
            <Descriptions.Item label="α/β/γ" span={1}>
              {selectedResult.alpha?.toFixed(2)}° / {selectedResult.beta?.toFixed(2)}° / {selectedResult.gamma?.toFixed(2)}°
            </Descriptions.Item>
            
            <Divider />
            
            <Descriptions.Item label="作者" span={2}>
              {selectedResult.authors || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="期刊" span={1}>
              {selectedResult.journal || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="年份" span={1}>
              {selectedResult.year || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="卷/页" span={2}>
              {selectedResult.volume && `Vol. ${selectedResult.volume}`}
              {selectedResult.page && `, p. ${selectedResult.page}`}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CODSearch;
