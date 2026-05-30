import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Disc3,
  Award,
  Edit2,
  Trash2
} from 'lucide-react';
import { workApi, versionApi } from '../services/api';
import { formatDuration } from '../utils/formatters';
import { Modal } from '../components/Modal';
import type { Work, Version } from '../../shared/types';

export function VersionCompare() {
  const { workId } = useParams<{ workId: string }>();
  const [work, setWork] = useState<Work | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [newVersion, setNewVersion] = useState({
    conductor: '',
    orchestra: '',
    soloists: '',
    recordingYear: '',
    releaseYear: '',
    duration: '',
    characteristics: '',
    historicalContext: '',
    label: '',
    catalogNumber: '',
    format: ''
  });

  useEffect(() => {
    if (workId) {
      loadData();
    }
  }, [workId]);

  const loadData = async () => {
    if (!workId) return;
    const [workData, versionsData] = await Promise.all([
      workApi.getById(workId),
      workApi.getVersions(workId)
    ]);
    setWork(workData);
    setVersions(versionsData.sort((a, b) => (a.personalRank || 999) - (b.personalRank || 999)));
  };

  const handleAddVersion = async () => {
    if (!workId) return;
    
    const versionData = {
      workId,
      conductor: newVersion.conductor,
      orchestra: newVersion.orchestra,
      soloists: newVersion.soloists || undefined,
      recordingYear: newVersion.recordingYear ? parseInt(newVersion.recordingYear) : undefined,
      releaseYear: newVersion.releaseYear ? parseInt(newVersion.releaseYear) : undefined,
      duration: newVersion.duration ? parseInt(newVersion.duration) : undefined,
      characteristics: newVersion.characteristics || undefined,
      historicalContext: newVersion.historicalContext || undefined,
      label: newVersion.label || undefined,
      catalogNumber: newVersion.catalogNumber || undefined,
      format: newVersion.format || undefined,
      personalRank: versions.length + 1
    };

    await versionApi.create(versionData);
    setShowAddModal(false);
    setNewVersion({
      conductor: '',
      orchestra: '',
      soloists: '',
      recordingYear: '',
      releaseYear: '',
      duration: '',
      characteristics: '',
      historicalContext: '',
      label: '',
      catalogNumber: '',
      format: ''
    });
    loadData();
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (confirm('确定删除这个版本吗？')) {
      await versionApi.delete(versionId);
      loadData();
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId]
    );
  };

  const selectedVersionData = versions.filter((v) =>
    selectedVersions.includes(v.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={workId ? `/works/${workId}` : '/works'}
          className="p-2 hover:bg-parchment-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-burgundy-800">
            版本对比
          </h1>
          <p className="text-gray-600">
            {work?.composer}: {work?.title}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加版本
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="card p-12 text-center">
          <Disc3 className="w-16 h-16 text-burgundy-200 mx-auto mb-4" />
          <h3 className="font-display text-xl text-gray-600 mb-2">
            暂无版本记录
          </h3>
          <p className="text-gray-500 mb-6">
            为这部作品添加不同指挥或乐团的版本进行对比
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            添加第一个版本
          </button>
        </div>
      ) : (
        <>
          <div className="card p-4">
            <h3 className="font-medium text-gray-700 mb-4">
              选择要对比的版本 (点击选择):
            </h3>
            <div className="flex flex-wrap gap-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => toggleVersionSelection(version.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedVersions.includes(version.id)
                      ? 'border-burgundy-600 bg-burgundy-50 text-burgundy-800'
                      : 'border-parchment-200 bg-white hover:border-parchment-300'
                  }`}
                >
                  {version.conductor}
                  {version.recordingYear && ` (${version.recordingYear})`}
                </button>
              ))}
            </div>
          </div>

          {selectedVersionData.length >= 2 && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-display text-lg font-medium">
                  版本对比分析
                </h2>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-parchment-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">
                        对比项
                      </th>
                      {selectedVersionData.map((v) => (
                        <th key={v.id} className="text-left py-3 px-4">
                          <div className="font-display text-lg text-burgundy-800">
                            {v.conductor}
                          </div>
                          <div className="text-sm text-gray-500">
                            {v.orchestra}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-100">
                    <tr>
                      <td className="py-3 px-4 text-gray-600">个人排名</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.personalRank ? (
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-gold-500" />
                              #{v.personalRank}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">录制年份</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.recordingYear || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">发行年份</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.releaseYear || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">时长</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {formatDuration(v.duration)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">演奏家</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.soloists || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">唱片公司</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.label || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">演奏特点</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.characteristics || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-600">历史背景</td>
                      {selectedVersionData.map((v) => (
                        <td key={v.id} className="py-3 px-4">
                          {v.historicalContext || '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-lg font-medium">
                所有版本 ({versions.length})
              </h2>
            </div>
            <div className="divide-y divide-parchment-100">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-6 ${
                    selectedVersions.includes(version.id)
                      ? 'bg-burgundy-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {version.personalRank && (
                          <span className="w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            #{version.personalRank}
                          </span>
                        )}
                        <h3 className="font-display text-lg text-burgundy-800">
                          {version.conductor}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-2">{version.orchestra}</p>
                      {version.soloists && (
                        <p className="text-sm text-gray-500 mb-2">
                          独奏: {version.soloists}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        {version.recordingYear && (
                          <span>录制: {version.recordingYear}</span>
                        )}
                        {version.duration && (
                          <span>时长: {formatDuration(version.duration)}</span>
                        )}
                        {version.label && <span>公司: {version.label}</span>}
                      </div>
                      {version.characteristics && (
                        <p className="mt-3 text-sm text-gray-600 bg-parchment-50 p-3 rounded">
                          {version.characteristics}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加新版本"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">指挥 *</label>
              <input
                type="text"
                value={newVersion.conductor}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, conductor: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">乐团 *</label>
              <input
                type="text"
                value={newVersion.orchestra}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, orchestra: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">独奏/独唱</label>
              <input
                type="text"
                value={newVersion.soloists}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, soloists: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">录制年份</label>
              <input
                type="number"
                value={newVersion.recordingYear}
                onChange={(e) =>
                  setNewVersion((prev) => ({
                    ...prev,
                    recordingYear: e.target.value
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">发行年份</label>
              <input
                type="number"
                value={newVersion.releaseYear}
                onChange={(e) =>
                  setNewVersion((prev) => ({
                    ...prev,
                    releaseYear: e.target.value
                  }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">时长 (秒)</label>
              <input
                type="number"
                value={newVersion.duration}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, duration: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">唱片公司</label>
              <input
                type="text"
                value={newVersion.label}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, label: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">格式</label>
              <input
                type="text"
                value={newVersion.format}
                onChange={(e) =>
                  setNewVersion((prev) => ({ ...prev, format: e.target.value }))
                }
                className="input-field"
                placeholder="如: CD, Vinyl, Streaming"
              />
            </div>
          </div>
          <div>
            <label className="label-field">演奏特点</label>
            <textarea
              value={newVersion.characteristics}
              onChange={(e) =>
                setNewVersion((prev) => ({
                  ...prev,
                  characteristics: e.target.value
                }))
              }
              className="input-field min-h-[80px]"
              placeholder="描述这个版本的演奏特点..."
            />
          </div>
          <div>
            <label className="label-field">历史背景</label>
            <textarea
              value={newVersion.historicalContext}
              onChange={(e) =>
                setNewVersion((prev) => ({
                  ...prev,
                  historicalContext: e.target.value
                }))
              }
              className="input-field min-h-[80px]"
              placeholder="这个版本的历史意义..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleAddVersion}
            disabled={!newVersion.conductor || !newVersion.orchestra}
            className="btn-primary"
          >
            添加
          </button>
        </div>
      </Modal>
    </div>
  );
}
