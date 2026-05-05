import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { languageExchangeApi } from '@/services/languageExchangeService';
import type {
  ChatMessage,
  MessageAnnotation,
  AnnotationType,
} from '@/types';
import { LANGUAGES } from '@/constants/languages';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

type AnnotationColor = 'red' | 'green' | 'blue' | 'yellow';

function AnnotationPopup({
  onClose,
  onSubmit,
  selectedText,
}: {
  onClose: () => void;
  onSubmit: (type: AnnotationType, comment?: string) => void;
  selectedText: string;
}) {
  const [selectedType, setSelectedType] = useState<AnnotationType | null>(null);
  const [comment, setComment] = useState('');

  const annotationTypes: { type: AnnotationType; label: string; icon: string; color: AnnotationColor }[] = [
    { type: 'grammar_error', label: '语法错误', icon: '❌', color: 'red' },
    { type: 'natural_expression', label: '地道表达', icon: '✅', color: 'green' },
    { type: 'question', label: '有疑问', icon: '❓', color: 'blue' },
    { type: 'suggestion', label: '改进建议', icon: '💡', color: 'yellow' },
  ];

  const colorClasses: Record<AnnotationColor, string> = {
    red: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
    green: 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100',
    blue: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100',
    yellow: 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  };

  const selectedColorClasses: Record<AnnotationColor, string> = {
    red: 'border-red-500 bg-red-100 ring-2 ring-red-500',
    green: 'border-green-500 bg-green-100 ring-2 ring-green-500',
    blue: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500',
    yellow: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-500',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            给这段文字添加标注
          </h3>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 italic">"{selectedText}"</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择标注类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {annotationTypes.map((anno) => (
                <button
                  key={anno.type}
                  type="button"
                  onClick={() => setSelectedType(anno.type)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedType === anno.type
                      ? selectedColorClasses[anno.color]
                      : colorClasses[anno.color]
                  }`}
                >
                  <div className="text-xl mb-1">{anno.icon}</div>
                  <div className="text-sm font-medium">{anno.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              添加评论（可选）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="输入您的评论或解释..."
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            type="button"
            onClick={() => selectedType && onSubmit(selectedType, comment || undefined)}
            disabled={!selectedType}
            className="flex-1"
          >
            确认标注
          </Button>
        </div>
      </div>
    </div>
  );
}

function CorrectionPopup({
  onClose,
  onSubmit,
  originalText,
}: {
  onClose: () => void;
  onSubmit: (correctedText: string, explanation?: string) => void;
  originalText: string;
}) {
  const [correctedText, setCorrectedText] = useState(originalText);
  const [explanation, setExplanation] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            提出语法修改建议
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原句
              </label>
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 line-through">{originalText}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修改后的句子
              </label>
              <textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="输入修改后的句子..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解释说明（可选）
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="解释为什么这样修改，涉及什么语法点..."
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            type="button"
            onClick={() =>
              correctedText.trim() && onSubmit(correctedText, explanation || undefined)
            }
            disabled={!correctedText.trim()}
            className="flex-1"
          >
            发送修改建议
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatMessageBubble({
  message,
  isOwnMessage,
  onSelectText,
}: {
  message: ChatMessage;
  isOwnMessage: boolean;
  onSelectText: (messageId: string, text: string, startIndex: number, endIndex: number) => void;
}) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [showAnnotationPopup, setShowAnnotationPopup] = useState(false);
  const [showCorrectionPopup, setShowCorrectionPopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  const handleMouseUp = () => {
    if (isOwnMessage) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);

      setSelectedText(text);
      setSelectedRange({ start: 0, end: text.length });
    }
  };

  const getAnnotationColor = (type: AnnotationType) => {
    switch (type) {
      case 'grammar_error':
        return 'bg-red-100 text-red-800';
      case 'natural_expression':
        return 'bg-green-100 text-green-800';
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'suggestion':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnnotationLabel = (type: AnnotationType) => {
    switch (type) {
      case 'grammar_error':
        return '语法错误';
      case 'natural_expression':
        return '地道表达';
      case 'question':
        return '有疑问';
      case 'suggestion':
        return '改进建议';
      default:
        return '标注';
    }
  };

  const getCorrectionStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getCorrectionStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return '已接受';
      case 'rejected':
        return '已拒绝';
      default:
        return '待处理';
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] ${
          isOwnMessage
            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm'
        }`}
      >
        <div
          ref={messageRef}
          className="p-3"
          onMouseUp={handleMouseUp}
          onSelect={handleMouseUp}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {message.annotations.length > 0 && (
          <div className={`px-3 pb-3 ${isOwnMessage ? '' : 'border-t border-gray-100'}`}>
            {message.annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`mt-2 p-2 rounded-lg ${getAnnotationColor(annotation.type)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {getAnnotationLabel(annotation.type)}
                  </span>
                  <span className="text-xs opacity-70">"{annotation.text}"</span>
                </div>
                {annotation.comment && (
                  <p className="text-xs">{annotation.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {message.corrections.length > 0 && (
          <div className={`px-3 pb-3 ${isOwnMessage ? '' : 'border-t border-gray-100'}`}>
            {message.corrections.map((correction) => (
              <div
                key={correction.id}
                className={`mt-2 p-3 rounded-lg border ${getCorrectionStatusColor(correction.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">
                    语法修改建议
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/80">
                    {getCorrectionStatusLabel(correction.status)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs line-through ${isOwnMessage ? 'text-white/70' : 'text-red-600'}`}>
                    原: {correction.originalText}
                  </p>
                  <p className={`text-xs font-medium ${isOwnMessage ? 'text-white' : 'text-green-700'}`}>
                    改: {correction.correctedText}
                  </p>
                  {correction.explanation && (
                    <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                      说明: {correction.explanation}
                    </p>
                  )}
                </div>
                {isOwnMessage && correction.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-xs px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                      onClick={() => {}}
                    >
                      接受
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                      onClick={() => {}}
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isOwnMessage && selectedText && (
          <div className="px-3 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnnotationPopup(true)}
                className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                📝 标注
              </button>
              <button
                onClick={() => setShowCorrectionPopup(true)}
                className="text-xs px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
              >
                ✏️ 改语法
              </button>
              <button
                onClick={() => {
                  setSelectedText('');
                  setSelectedRange(null);
                }}
                className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                ✕ 取消
              </button>
            </div>
          </div>
        )}

        <div className={`px-3 pb-2 text-xs ${
          isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.language && (
            <span className="ml-2 opacity-70">
              {LANGUAGES[message.language]?.nativeName || message.language}
            </span>
          )}
        </div>
      </div>

      {showAnnotationPopup && selectedRange && (
        <AnnotationPopup
          selectedText={selectedText}
          onClose={() => {
            setShowAnnotationPopup(false);
            setSelectedText('');
            setSelectedRange(null);
          }}
          onSubmit={(type, comment) => {
            onSelectText(message.id, selectedText, selectedRange.start, selectedRange.end);
            setShowAnnotationPopup(false);
            setSelectedText('');
            setSelectedRange(null);
          }}
        />
      )}

      {showCorrectionPopup && (
        <CorrectionPopup
          originalText={selectedText}
          onClose={() => {
            setShowCorrectionPopup(false);
            setSelectedText('');
            setSelectedRange(null);
          }}
          onSubmit={(correctedText, explanation) => {
            setShowCorrectionPopup(false);
            setSelectedText('');
            setSelectedRange(null);
          }}
        />
      )}
    </div>
  );
}

function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: rooms,
    isLoading: isLoadingRooms,
  } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => languageExchangeApi.getChatRooms(),
  });

  const {
    data: messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: () => {
      if (!roomId) return [];
      return languageExchangeApi.getChatMessages(roomId);
    },
    enabled: !!roomId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      if (!roomId) throw new Error('No room selected');
      return languageExchangeApi.sendChatMessage(
        roomId,
        content,
        selectedLanguage || undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
      setMessageInput('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '发送失败';
      showError(message);
    },
  });

  const addAnnotationMutation = useMutation({
    mutationFn: ({
      messageId,
      annotation,
    }: {
      messageId: string;
      annotation: Omit<MessageAnnotation, 'id' | 'messageId' | 'createdAt'>;
    }) => languageExchangeApi.addMessageAnnotation(messageId, annotation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
      showSuccess('标注已添加');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '添加标注失败';
      showError(message);
    },
  });

  const suggestCorrectionMutation = useMutation({
    mutationFn: ({
      messageId,
      originalText,
      correctedText,
      explanation,
    }: {
      messageId: string;
      originalText: string;
      correctedText: string;
      explanation?: string;
    }) =>
      languageExchangeApi.suggestGrammarCorrection(
        messageId,
        originalText,
        correctedText,
        explanation
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
      showSuccess('修改建议已发送');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '发送修改建议失败';
      showError(message);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleSelectText = (
    messageId: string,
    text: string,
    startIndex: number,
    endIndex: number
  ) => {
  };

  const currentRoom = rooms?.find((r) => r.id === roomId);

  const languageOptions = Object.values(LANGUAGES).map((lang) => ({
    value: lang.code,
    label: `${lang.nativeName} (${lang.name})`,
  }));

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-10 px-2 py-1.5 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">返回</span>
              </Link>
              <div className="w-px h-6 bg-white bg-opacity-30" />
              <h1 className="text-lg font-bold text-white">聊天</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/matching"
                className="text-white text-opacity-80 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                匹配中心
              </Link>
              <Link
                to="/vocabulary"
                className="text-white text-opacity-80 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                生词本
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">聊天会话</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
          <Loading isLoading={isLoadingRooms}>
            {rooms && rooms.length > 0 ? (
              <div className="p-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/chat/${room.id}`)}
                    className={`w-full p-3 rounded-lg mb-1 text-left transition-colors ${
                      room.id === roomId
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        聊天会话 {room.id.slice(0, 8)}...
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          room.lastMessageAt &&
                          new Date().getTime() - new Date(room.lastMessageAt).getTime() <
                            5 * 60 * 1000
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    {room.lastMessageAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        最后消息: {new Date(room.lastMessageAt).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-500">暂无聊天会话</p>
                <p className="text-sm text-gray-400 mt-1">
                  接受匹配后会自动创建聊天会话
                </p>
              </div>
            )}
          </Loading>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div>
                <h3 className="font-medium text-gray-800">
                  聊天会话 {currentRoom.id.slice(0, 8)}...
                </h3>
                <p className="text-xs text-gray-500">
                  类型: {currentRoom.type === 'text' ? '文字聊天' : currentRoom.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm">
                  📞 语音通话
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <Loading isLoading={isLoadingMessages}>
                {messages && messages.length > 0 ? (
                  <div className="max-w-3xl mx-auto">
                    {messages.map((message) => (
                      <ChatMessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderId === 1}
                        onSelectText={handleSelectText}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="text-6xl mb-4">👋</div>
                    <p className="text-lg">开始你们的第一次对话吧！</p>
                    <p className="text-sm mt-1">
                      选中对方的消息可以添加标注或提出语法修改建议
                    </p>
                  </div>
                )}
              </Loading>
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3">
                  <div className="w-40">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">不指定语言</option>
                      {languageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="输入消息... (选中对方的消息可以添加标注)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (messageInput.trim()) {
                            sendMessageMutation.mutate(messageInput.trim());
                          }
                        }
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!messageInput.trim()}
                    isLoading={sendMessageMutation.isPending}
                  >
                    发送
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>💡 提示:</span>
                  <span>• 选中对方的消息可以添加标注</span>
                  <span>• 可以提出语法修改建议</span>
                  <span>• 按 Enter 发送消息，Shift+Enter 换行</span>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">选择一个聊天会话开始对话</p>
            <p className="text-sm mt-1">
              或前往匹配中心寻找新的语言伙伴
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => navigate('/matching')}
            >
              前往匹配中心
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
