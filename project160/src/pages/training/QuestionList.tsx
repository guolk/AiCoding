import { useState } from 'react';
import { useFireStore } from '@/store/useFireStore';
import type { Question } from '@/types';
import { questionTypeMap, difficultyMap } from '@/utils/constants';
import { Plus, Trash2, X, XCircle, Search } from 'lucide-react';

type FormType = Pick<Question, 'type' | 'difficulty' | 'category' | 'content' | 'options' | 'answer' | 'explanation'>;
const emptyForm: FormType = { type: 'single', difficulty: 'easy', category: '', content: '', options: [''], answer: '', explanation: '' };

export default function QuestionList() {
  const { questions, addQuestion, deleteQuestion } = useFireStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormType>(emptyForm);
  const [filterType, setFilterType] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = questions.filter(q => {
    if (filterType && q.type !== filterType) return false;
    if (filterDiff && q.difficulty !== filterDiff) return false;
    if (filterCat && !q.category.includes(filterCat)) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!form.content || !form.category || form.options.filter(Boolean).length === 0) return;
    const q: Question = { id: Date.now().toString(), ...form, options: form.options.filter(Boolean) };
    addQuestion(q);
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  const addOption = () => setForm({ ...form, options: [...form.options, ''] });
  const removeOption = (i: number) => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  const updateOption = (i: number, v: string) => {
    const opts = [...form.options]; opts[i] = v; setForm({ ...form, options: opts });
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif-title font-bold text-gray-900">题库管理</h1>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>
          <Plus size={16} />新增
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl shadow-sm bg-white p-4 border border-gray-100">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">全部题型</option>
          {Object.entries(questionTypeMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">全部难度</option>
          {Object.entries(difficultyMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filterCat} onChange={e => setFilterCat(e.target.value)} placeholder="搜索分类…" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(q => (
          <div key={q.id} className="rounded-xl shadow-sm bg-white p-5 border border-gray-100 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${questionTypeMap[q.type]?.color ?? 'bg-gray-100 text-gray-600'}`}>{questionTypeMap[q.type]?.label ?? q.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyMap[q.difficulty]?.color ?? 'bg-gray-100 text-gray-600'}`}>{difficultyMap[q.difficulty]?.label ?? q.difficulty}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{q.category}</span>
              <button onClick={() => deleteQuestion(q.id)} className="ml-auto text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
            </div>
            <p className="text-sm font-medium text-gray-900">{q.content}</p>
            <div className="space-y-1">
              {q.options.map((opt, i) => (
                <div key={i} className={`text-sm ${Array.isArray(q.answer) ? q.answer.includes(opt) : q.answer === opt ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                  <span className="inline-block w-5 text-gray-400 font-medium">{letters[i]}.</span>{opt}
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600">答案：{Array.isArray(q.answer) ? q.answer.join('、') : q.answer}</p>
            {q.explanation && <p className="text-xs text-gray-400 italic">{q.explanation}</p>}
          </div>
        ))}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-serif-title font-bold">新增题目</h2>
              <button onClick={() => setDrawerOpen(false)}><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">题型</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Question['type'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{Object.entries(questionTypeMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">难度</label><select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as Question['difficulty'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{Object.entries(difficultyMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">选项</label>
                  <button onClick={addOption} className="text-xs flex items-center gap-0.5" style={{ color: '#C41E3A' }}><Plus size={12} />添加选项</button>
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium w-4">{letters[i]}</span>
                      <input value={opt} onChange={e => updateOption(i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                      {form.options.length > 1 && <button onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">答案</label><input value={Array.isArray(form.answer) ? form.answer.join(',') : form.answer} onChange={e => { const v = e.target.value; setForm({ ...form, answer: form.type === 'multiple' ? v.split(',').map(s => s.trim()).filter(Boolean) : v }); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={form.type === 'multiple' ? '多个答案用逗号分隔' : '输入答案'} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">解析</label><textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm">取消</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#C41E3A' }}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
