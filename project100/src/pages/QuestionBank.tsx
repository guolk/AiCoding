import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Radio, message, Popconfirm, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { Question, QuestionCategory, DifficultyLevel, QuestionType } from '../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, QUESTION_TYPE_LABELS, CATEGORY_COLORS } from '../utils/constants';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const QuestionBank: React.FC = () => {
  const { questions, setQuestions } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns = [
    {
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: QuestionCategory) => (
        <Tag color={CATEGORY_COLORS[category]}>{CATEGORY_LABELS[category]}</Tag>
      )
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: DifficultyLevel) => DIFFICULTY_LABELS[difficulty]
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      render: (type: QuestionType) => QUESTION_TYPE_LABELS[type]
    },
    {
      title: '正确率',
      key: 'accuracy',
      render: (_: any, record: Question) => {
        const rate = record.stats.totalAttempts > 0 
          ? Math.round((record.stats.correctAttempts / record.stats.totalAttempts) * 100) 
          : 0;
        return `${rate}%`;
      }
    },
    {
      title: '有效期',
      key: 'validity',
      render: (_: any, record: Question) => (
        <span>{record.validityStart} ~ {record.validityEnd}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? '启用' : '作废'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这道题目吗？此操作不可恢复！"
            onConfirm={() => handleDelete(record.id)}
            okText="确定删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      ...question,
      validity: [dayjs(question.validityStart), dayjs(question.validityEnd)]
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    message.success('题目删除成功');
  };

  const handleBatchDelete = () => {
    setQuestions(prev => prev.filter(q => !selectedRowKeys.includes(q.id)));
    setSelectedRowKeys([]);
    message.success('批量删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newQuestion: Question = {
        id: editingQuestion ? editingQuestion.id : Date.now().toString(),
        category: values.category,
        difficulty: values.difficulty,
        type: values.type,
        content: values.content,
        options: values.options.split('\n').filter((o: string) => o.trim()),
        correctAnswers: values.type === 'judgment' 
          ? [values.correctAnswer]
          : values.type === 'single'
            ? [values.correctAnswer]
            : values.correctAnswers,
        validityStart: values.validity[0].format('YYYY-MM-DD'),
        validityEnd: values.validity[1].format('YYYY-MM-DD'),
        isActive: true,
        stats: editingQuestion ? editingQuestion.stats : { totalAttempts: 0, correctAttempts: 0 }
      };

      if (editingQuestion) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? newQuestion : q));
        message.success('题目更新成功');
      } else {
        setQuestions(prev => [...prev, newQuestion]);
        message.success('题目添加成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title="题库管理"
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 道题目吗？此操作不可恢复！`}
                onConfirm={handleBatchDelete}
                okText="确定删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger>
                  批量删除
                </Button>
              </Popconfirm>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加题目
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={questions}
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title={editingQuestion ? '编辑题目' : '添加题目'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <TextArea rows={3} placeholder="请输入题目内容" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select placeholder="请选择难度">
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="题型"
            rules={[{ required: true, message: '请选择题型' }]}
          >
            <Radio.Group>
              <Radio value="single">单选题</Radio>
              <Radio value="multiple">多选题</Radio>
              <Radio value="judgment">判断题</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'judgment') {
                return (
                  <Form.Item
                    name="correctAnswer"
                    label="正确答案"
                    rules={[{ required: true, message: '请选择正确答案' }]}
                  >
                    <Radio.Group>
                      <Radio value={0}>正确</Radio>
                      <Radio value={1}>错误</Radio>
                    </Radio.Group>
                  </Form.Item>
                );
              }
              return (
                <>
                  <Form.Item
                    name="options"
                    label="选项（每行一个）"
                    rules={[{ required: true, message: '请输入选项' }]}
                  >
                    <TextArea rows={4} placeholder="请输入选项，每行一个" />
                  </Form.Item>
                  <Form.Item
                    name={type === 'single' ? 'correctAnswer' : 'correctAnswers'}
                    label="正确答案"
                    rules={[{ required: true, message: '请选择正确答案' }]}
                  >
                    {type === 'single' ? (
                      <Radio.Group>
                        <Radio value={0}>A</Radio>
                        <Radio value={1}>B</Radio>
                        <Radio value={2}>C</Radio>
                        <Radio value={3}>D</Radio>
                      </Radio.Group>
                    ) : (
                      <Checkbox.Group>
                        <Space direction="vertical">
                          <Checkbox value={0}>A</Checkbox>
                          <Checkbox value={1}>B</Checkbox>
                          <Checkbox value={2}>C</Checkbox>
                          <Checkbox value={3}>D</Checkbox>
                        </Space>
                      </Checkbox.Group>
                    )}
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item
            name="validity"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
