import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LearningNote, CodeExample, TechStack, RoadmapNode } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Code2, Play, Copy, Check, FileText, Calendar, Clock } from 'lucide-react';
import { generateId } from '../../utils/storage';

const NotesPage: React.FC = () => {
  const { state, updateTechStack } = useAppContext();
  const [selectedTechStack, setSelectedTechStack] = useState<TechStack | null>(state.techStacks[0] || null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [selectedNote, setSelectedNote] = useState<LearningNote | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LearningNote | null>(null);
  const [editingCodeExample, setEditingCodeExample] = useState<CodeExample | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runningCode, setRunningCode] = useState<{ example: CodeExample; output: string } | null>(null);

  const handleSaveNote = (noteData: Partial<LearningNote>) => {
    if (!selectedTechStack || !selectedNode) return;

    if (editingNote) {
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            notes: node.notes.map(n =>
              n.id === editingNote.id ? { ...n, ...noteData, updatedAt: new Date().toISOString().split('T')[0] } as LearningNote : n
            )
          };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      const updatedNode = updatedRoadmap.find(n => n.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
      const updatedNote = updatedNode?.notes.find(n => n.id === editingNote.id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    } else {
      const now = new Date().toISOString().split('T')[0];
      const newNote: LearningNote = {
        id: generateId(),
        title: noteData.title || '',
        content: noteData.content || '',
        codeExamples: [],
        createdAt: now,
        updatedAt: now,
      };
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return { ...node, notes: [...node.notes, newNote] };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
    }
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedTechStack || !selectedNode) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node => {
      if (node.id === selectedNode.id) {
        return { ...node, notes: node.notes.filter(n => n.id !== noteId) };
      }
      return node;
    });
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleSaveCodeExample = (codeData: Partial<CodeExample>) => {
    if (!selectedTechStack || !selectedNode || !selectedNote) return;

    if (editingCodeExample) {
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            notes: node.notes.map(n => {
              if (n.id === selectedNote.id) {
                return {
                  ...n,
                  updatedAt: new Date().toISOString().split('T')[0],
                  codeExamples: n.codeExamples.map(ce =>
                    ce.id === editingCodeExample.id ? { ...ce, ...codeData } as CodeExample : ce
                  )
                };
              }
              return n;
            })
          };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      const updatedNode = updatedRoadmap.find(n => n.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
      const updatedNote = updatedNode?.notes.find(n => n.id === selectedNote.id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    } else {
      const newCodeExample: CodeExample = {
        id: generateId(),
        title: codeData.title || '',
        language: codeData.language || 'javascript',
        code: codeData.code || '',
        description: codeData.description || '',
      };
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            notes: node.notes.map(n => {
              if (n.id === selectedNote.id) {
                return {
                  ...n,
                  updatedAt: new Date().toISOString().split('T')[0],
                  codeExamples: [...n.codeExamples, newCodeExample]
                };
              }
              return n;
            })
          };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      const updatedNode = updatedRoadmap.find(n => n.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
      const updatedNote = updatedNode?.notes.find(n => n.id === selectedNote.id);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    }
    setIsCodeModalOpen(false);
    setEditingCodeExample(null);
  };

  const handleDeleteCodeExample = (codeId: string) => {
    if (!selectedTechStack || !selectedNode || !selectedNote) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          notes: node.notes.map(n => {
            if (n.id === selectedNote.id) {
              return {
                ...n,
                codeExamples: n.codeExamples.filter(ce => ce.id !== codeId)
              };
            }
            return n;
          })
        };
      }
      return node;
    });
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    const updatedNode = updatedRoadmap.find(n => n.id === selectedNode.id);
    setSelectedNode(updatedNode || null);
    const updatedNote = updatedNode?.notes.find(n => n.id === selectedNote.id);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  const handleCopyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunCode = (example: CodeExample) => {
    if (example.language === 'javascript') {
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };
        
        const result = eval(example.code);
        console.log = originalLog;
        
        const output = logs.length > 0 
          ? logs.join('\n') 
          : (result !== undefined ? `返回值: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}` : '代码执行成功，无输出');
        
        setRunningCode({ example, output });
      } catch (error) {
        setRunningCode({ example, output: `错误: ${error instanceof Error ? error.message : String(error)}` });
      }
    } else {
      setRunningCode({ example, output: `当前仅支持 JavaScript 代码的在线运行预览。\n\n${example.language} 代码:\n${example.code}` });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">学习笔记整理</h1>
          <p className="text-slate-500 mt-1">记录学习心得，管理代码示例</p>
        </div>
        {selectedNode && (
          <Button onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            新建笔记
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>技术栈</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {state.techStacks.map(techStack => (
                  <button
                    key={techStack.id}
                    onClick={() => {
                      setSelectedTechStack(techStack);
                      setSelectedNode(null);
                      setSelectedNote(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedTechStack?.id === techStack.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{techStack.icon}</span>
                    <span className="font-medium">{techStack.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTechStack && (
            <Card>
              <CardHeader>
                <CardTitle>知识点</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {selectedTechStack.roadmap.map(node => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setSelectedNode(node);
                        setSelectedNote(null);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedNode?.id === node.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{node.name}</span>
                        <Badge variant="primary" className="text-xs">
                          {node.notes.length}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>笔记列表</CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100vh-220px)] overflow-y-auto">
              {selectedNode ? (
                selectedNode.notes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无笔记</p>
                    <p className="text-sm mt-1">点击右上角创建第一篇笔记</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedNode.notes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNote(note)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedNote?.id === note.id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <h3 className="font-medium text-slate-800">{note.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{note.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {note.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3" />
                            {note.codeExamples.length} 个示例
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>请选择一个知识点</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6">
          {selectedNote ? (
            <Card className="h-full">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedNote.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      创建于 {selectedNote.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      更新于 {selectedNote.updatedAt}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingCodeExample(null);
                      setIsCodeModalOpen(true);
                    }}
                  >
                    <Code2 className="w-4 h-4" />
                    添加代码
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingNote(selectedNote);
                      setIsNoteModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm('确定要删除这篇笔记吗？')) {
                        handleDeleteNote(selectedNote.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100vh-260px)] overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedNote.content}</p>
                </div>

                {selectedNote.codeExamples.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-primary-600" />
                      代码示例
                    </h3>
                    {selectedNote.codeExamples.map(example => (
                      <div key={example.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{example.title}</h4>
                            {example.description && (
                              <p className="text-slate-400 text-sm mt-0.5">{example.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">{example.language}</Badge>
                            <button
                              onClick={() => handleCopyCode(example.code, example.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="复制代码"
                            >
                              {copiedId === example.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRunCode(example)}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded transition-colors"
                              title="运行代码"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCodeExample(example);
                                setIsCodeModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这个代码示例吗？')) {
                                  handleDeleteCodeExample(example.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <pre className="code-preview bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择或创建一篇笔记</p>
                  <p className="text-sm mt-2">在左侧点击笔记卡片查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? '编辑笔记' : '新建笔记'}
        size="xl"
      >
        <NoteForm
          initialData={editingNote}
          onSave={handleSaveNote}
          onCancel={() => setIsNoteModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title={editingCodeExample ? '编辑代码示例' : '添加代码示例'}
        size="xl"
      >
        <CodeExampleForm
          initialData={editingCodeExample}
          onSave={handleSaveCodeExample}
          onCancel={() => setIsCodeModalOpen(false)}
        />
      </Modal>

      {runningCode && (
        <Modal
          isOpen={!!runningCode}
          onClose={() => setRunningCode(null)}
          title="代码运行结果"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">执行代码</p>
              <pre className="code-preview bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{runningCode.example.code}</code>
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">输出结果</p>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono text-slate-800">
                {runningCode.output}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setRunningCode(null)}>关闭</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const NoteForm: React.FC<{
  initialData: LearningNote | null;
  onSave: (data: Partial<LearningNote>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">笔记标题</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">笔记内容</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={12}
          placeholder="记录你的学习心得、重点知识..."
        />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

const CodeExampleForm: React.FC<{
  initialData: CodeExample | null;
  onSave: (data: Partial<CodeExample>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    language: initialData?.language || 'javascript',
    code: initialData?.code || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'css', 'html', 'sql'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">示例标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">编程语言</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">代码描述</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="简要描述这段代码的作用..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">代码内容</label>
        <textarea
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="code-preview w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-900 text-slate-100"
          rows={12}
          placeholder="// 在这里输入你的代码..."
        />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default NotesPage;
