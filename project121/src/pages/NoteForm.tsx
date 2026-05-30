import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { workApi, versionApi } from '../services/api';
import type {
  Work,
  Version,
  MovementNote,
  HighlightMoment
} from '../../shared/types';

export function NoteForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { works, addNote } = useAppStore();
  
  const [selectedWorkId, setSelectedWorkId] = useState(searchParams.get('workId') || '');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  
  const [formData, setFormData] = useState({
    listenDate: new Date().toISOString().split('T')[0],
    movementNotes: [] as MovementNote[],
    emotionalJourney: '',
    highlightMoments: [] as HighlightMoment[],
    structureAnalysis: '',
    historicalNotes: '',
    overallImpression: ''
  });

  useEffect(() => {
    if (selectedWorkId) {
      loadVersions(selectedWorkId);
      initializeMovementNotes(selectedWorkId);
    }
  }, [selectedWorkId]);

  const loadVersions = async (workId: string) => {
    const workVersions = await workApi.getVersions(workId);
    setVersions(workVersions);
  };

  const initializeMovementNotes = async (workId: string) => {
    const work = await workApi.getById(workId);
    if (work?.movements && work.movements.length > 0) {
      setFormData((prev) => ({
        ...prev,
        movementNotes: work.movements!.map((m) => ({
          movementNumber: m.number,
          title: m.title,
          impression: '',
          structureNotes: ''
        }))
      }));
    }
  };

  const handleAddHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlightMoments: [
        ...prev.highlightMoments,
        { timestamp: '', description: '' }
      ]
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlightMoments: prev.highlightMoments.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateMovementNote = (
    index: number,
    field: keyof MovementNote,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      movementNotes: prev.movementNotes.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleUpdateHighlight = (
    index: number,
    field: keyof HighlightMoment,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      highlightMoments: prev.highlightMoments.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkId) return;

    await addNote({
      workId: selectedWorkId,
      versionId: selectedVersionId || undefined,
      listenDate: formData.listenDate,
      movementNotes: formData.movementNotes,
      emotionalJourney: formData.emotionalJourney || undefined,
      highlightMoments: formData.highlightMoments.filter(
        (h) => h.timestamp || h.description
      ),
      structureAnalysis: formData.structureAnalysis || undefined,
      historicalNotes: formData.historicalNotes || undefined,
      overallImpression: formData.overallImpression || undefined
    });

    navigate('/notes');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/notes"
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-burgundy-800">
          新建欣赏笔记
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-lg font-medium">基本信息</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">选择作品 *</label>
                <select
                  value={selectedWorkId}
                  onChange={(e) => setSelectedWorkId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">请选择作品</option>
                  {works.map((work) => (
                    <option key={work.id} value={work.id}>
                      {work.composer}: {work.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">聆听日期</label>
                <input
                  type="date"
                  value={formData.listenDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      listenDate: e.target.value
                    }))
                  }
                  className="input-field"
                />
              </div>
            </div>
            {versions.length > 0 && (
              <div>
                <label className="label-field">使用版本（可选）</label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="input-field"
                >
                  <option value="">不指定版本</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.conductor} / {version.orchestra}
                      {version.recordingYear && ` (${version.recordingYear})`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {formData.movementNotes.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-lg font-medium">乐章笔记</h2>
            </div>
            <div className="p-6 space-y-4">
              {formData.movementNotes.map((mNote, index) => (
                <div key={index} className="p-4 bg-parchment-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 bg-burgundy-100 text-burgundy-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {mNote.movementNumber}
                    </span>
                    <span className="font-medium text-burgundy-800">
                      {mNote.title}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        感受与印象
                      </label>
                      <textarea
                        value={mNote.impression || ''}
                        onChange={(e) =>
                          handleUpdateMovementNote(
                            index,
                            'impression',
                            e.target.value
                          )
                        }
                        className="input-field min-h-[60px]"
                        placeholder="记录这个乐章给您的感受..."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        结构分析（可选）
                      </label>
                      <textarea
                        value={mNote.structureNotes || ''}
                        onChange={(e) =>
                          handleUpdateMovementNote(
                            index,
                            'structureNotes',
                            e.target.value
                          )
                        }
                        className="input-field min-h-[60px]"
                        placeholder="奏鸣曲式、变奏曲式、赋格结构等..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-lg font-medium">情感旅程</h2>
          </div>
          <div className="p-6">
            <textarea
              value={formData.emotionalJourney}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emotionalJourney: e.target.value
                }))
              }
              className="input-field min-h-[100px]"
              placeholder="描述音乐如何引领您的情感变化：从平静到高潮，从光明到黑暗..."
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-lg font-medium">精彩时刻</h2>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="text-sm text-gold-200 hover:text-white flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加时刻
            </button>
          </div>
          <div className="p-6 space-y-3">
            {formData.highlightMoments.length === 0 ? (
              <p className="text-gray-500 text-sm">
                点击上方按钮添加精彩时刻的时间戳和描述
              </p>
            ) : (
              formData.highlightMoments.map((moment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-600" />
                    <input
                      type="text"
                      value={moment.timestamp}
                      onChange={(e) =>
                        handleUpdateHighlight(
                          index,
                          'timestamp',
                          e.target.value
                        )
                      }
                      className="input-field w-24 font-mono text-sm"
                      placeholder="如: 5:30"
                    />
                  </div>
                  <input
                    type="text"
                    value={moment.description}
                    onChange={(e) =>
                      handleUpdateHighlight(
                        index,
                        'description',
                        e.target.value
                      )
                    }
                    className="input-field flex-1"
                    placeholder="描述这个精彩时刻..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-lg font-medium">结构分析</h2>
            </div>
            <div className="p-6">
              <textarea
                value={formData.structureAnalysis}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    structureAnalysis: e.target.value
                  }))
                }
                className="input-field min-h-[120px]"
                placeholder="分析作品的音乐结构：奏鸣曲式、主题与变奏、赋格等..."
              />
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-lg font-medium">历史背景</h2>
            </div>
            <div className="p-6">
              <textarea
                value={formData.historicalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    historicalNotes: e.target.value
                  }))
                }
                className="input-field min-h-[120px]"
                placeholder="作品的创作背景、首演情况、历史意义..."
              />
            </div>
          </div>
        </div>

        <div className="card border-2 border-gold-200">
          <div className="card-header bg-gradient-to-r from-gold-500 to-gold-600">
            <h2 className="font-display text-lg font-medium">整体印象</h2>
          </div>
          <div className="p-6">
            <textarea
              value={formData.overallImpression}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  overallImpression: e.target.value
                }))
              }
              className="input-field min-h-[100px]"
              placeholder="对这次聆听体验的整体评价和感受..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/notes" className="btn-secondary">
            取消
          </Link>
          <button
            type="submit"
            disabled={!selectedWorkId}
            className="btn-primary"
          >
            保存笔记
          </button>
        </div>
      </form>
    </div>
  );
}
