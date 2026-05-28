import React, { useState } from 'react';
import { Card, List, Button, Tag, Progress, Statistic, Space, Modal, Radio, Result } from 'antd';
import { BookOutlined, PlayCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { useAppContext } from '../context/AppContext';
import { TrainingCourse, Question, Certificate } from '../types';
import dayjs from 'dayjs';

const Assessments: React.FC = () => {
  const { courses, questions, user, setUser } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<Question[]>([]);

  const handleStart = (course: TrainingCourse) => {
    setSelectedCourse(course);
    const courseQuestions = questions.filter(q => course.questions.includes(q.id) && q.isActive);
    setAssessmentQuestions(courseQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsFinished(false);
    setIsModalOpen(true);
  };

  const handleAnswer = (questionIndex: number, answer: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    
    let correctCount = 0;
    assessmentQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswers[0]) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / assessmentQuestions.length) * 100);
    setScore(finalScore);
    
    const isPassed = finalScore >= (selectedCourse?.passScore || 60);
    setPassed(isPassed);

    if (isPassed && selectedCourse) {
      const newCertificate: Certificate = {
        id: Date.now().toString(),
        title: `${selectedCourse.title}认证`,
        issuedTo: user.name,
        issuedDate: dayjs().format('YYYY-MM-DD'),
        validUntil: dayjs().add(1, 'year').format('YYYY-MM-DD'),
        certificateNumber: `CERT-${Date.now()}`,
        score: finalScore
      };

      setUser(prev => ({
        ...prev,
        certificates: [...(prev.certificates || []), newCertificate]
      }));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="评估测试">
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
          dataSource={courses}
          renderItem={(course) => {
            const hasCertificate = user.certificates?.some(c => c.title.includes(course.title));
            return (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    !hasCertificate && (
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleStart(course)}
                      >
                        开始测试
                      </Button>
                    )
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                    title={
                      <Space>
                        {course.title}
                        {hasCertificate && <Tag color="green"><CheckCircleOutlined /> 已通过</Tag>}
                      </Space>
                    }
                    description={
                      <>
                        <p style={{ marginBottom: 8 }}>{course.description}</p>
                        <Space wrap>
                          <Tag color="blue">时长：{course.duration}</Tag>
                          <Tag color="orange">及格线：{course.passScore}分</Tag>
                          <Tag color="purple">题目：{course.questions.length}道</Tag>
                        </Space>
                      </>
                    }
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title={selectedCourse?.title}
        open={isModalOpen}
        footer={null}
        width={800}
        onCancel={() => setIsModalOpen(false)}
      >
        {!isFinished ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <Progress 
                  percent={Math.round(((currentQuestionIndex + 1) / assessmentQuestions.length) * 100)} 
                  style={{ width: 300 }}
                />
              </div>
              <Statistic title="及格线" value={selectedCourse?.passScore || 60} suffix="分" />
            </div>

            <Card style={{ marginBottom: 24 }}>
              <h3>第 {currentQuestionIndex + 1} 题</h3>
              <p style={{ fontSize: 16, marginBottom: 24 }}>{assessmentQuestions[currentQuestionIndex]?.content}</p>
              
              <Radio.Group
                value={selectedAnswers[currentQuestionIndex]}
                onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {assessmentQuestions[currentQuestionIndex]?.options.map((option, idx) => (
                    <Radio.Button key={idx} value={idx} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                      {String.fromCharCode(65 + idx)}. {option}
                    </Radio.Button>
                  ))}
                </Space>
              </Radio.Group>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
              >
                上一题
              </Button>
              
              {currentQuestionIndex < assessmentQuestions.length - 1 ? (
                <Button 
                  type="primary" 
                  icon={<ArrowRightOutlined />} 
                  onClick={handleNext}
                >
                  下一题
                </Button>
              ) : (
                <Button type="primary" onClick={handleFinish}>
                  提交
                </Button>
              )}
            </div>
          </>
        ) : (
          <Result
            status={passed ? 'success' : 'error'}
            title={passed ? '恭喜通过！' : '未能通过'}
            subTitle={`您的得分：${score}分${!passed ? `，及格线为${selectedCourse?.passScore}分，请重新学习后再试。` : ''}`}
            extra={[
              <Button key="close" onClick={() => setIsModalOpen(false)}>
                关闭
              </Button>
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Assessments;