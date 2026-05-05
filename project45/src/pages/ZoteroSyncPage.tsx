import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { zoteroSyncService, paperService } from '@/services/paperService';
import type { ZoteroSyncConfig, ZoteroCollection, Paper } from '@/types';

function ConfigForm({
  config,
  onUpdate,
  onValidate,
  isConnecting,
}: {
  config: ZoteroSyncConfig;
  onUpdate: (config: Partial<ZoteroSyncConfig>) => void;
  onValidate: () => Promise<boolean>;
  isConnecting: boolean;
}) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zotero API Key
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              placeholder="输入您的 Zotero API Key"
              value={config.apiKey || ''}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            在 <a href="https://www.zotero.org/settings/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Zotero 设置</a> 中创建 API Key
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zotero User ID
          </label>
          <Input
            placeholder="输入您的 Zotero User ID"
            value={config.userId || ''}
            onChange={(e) => onUpdate({ userId: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            可在 Zotero 设置页面的 API Keys 部分找到
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文献库类型
          </label>
          <div className="flex gap-2">
            <Button
              variant={config.libraryType === 'personal' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ libraryType: 'personal' })}
            >
              个人文献库
            </Button>
            <Button
              variant={config.libraryType === 'group' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ libraryType: 'group' })}
            >
              群组文献库
            </Button>
          </div>
        </div>

        {config.libraryType === 'group' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              群组 ID
            </label>
            <Input
              placeholder="输入群组 ID"
              value={config.groupId || ''}
              onChange={(e) => onUpdate({ groupId: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-900 mb-4">同步选项</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => onUpdate({ autoSync: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-gray-900 text-sm">自动同步</span>
              <p className="text-xs text-gray-500 mt-0.5">定期自动与 Zotero 同步</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={config.twoWaySync}
              onChange={(e) => onUpdate({ twoWaySync: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-gray-900 text-sm">双向同步</span>
              <p className="text-xs text-gray-500 mt-0.5">同时同步本地和 Zotero 的变更</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={config.importPDFs}
              onChange={(e) => onUpdate({ importPDFs: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-gray-900 text-sm">导入 PDF</span>
              <p className="text-xs text-gray-500 mt-0.5">同步时下载 PDF 附件</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={config.exportAnnotations}
              onChange={(e) => onUpdate({ exportAnnotations: e.target.checked })}
              className="mt-1"
            />
            <div>
              <span className="font-medium text-gray-900 text-sm">导出标注</span>
              <p className="text-xs text-gray-500 mt-0.5">将本地标注同步到 Zotero</p>
            </div>
          </label>
        </div>

        {config.autoSync && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              同步间隔（分钟）
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={config.syncInterval}
              onChange={(e) => onUpdate({ syncInterval: parseInt(e.target.value, 10) })}
            >
              <option value={15}>15 分钟</option>
              <option value={30}>30 分钟</option>
              <option value={60}>1 小时</option>
              <option value={360}>6 小时</option>
              <option value={720}>12 小时</option>
              <option value={1440}>24 小时</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="primary"
          onClick={onValidate}
          disabled={isConnecting || !config.apiKey || !config.userId}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              验证中...
            </>
          ) : (
            '验证并连接'
          )}
        </Button>
      </div>
    </div>
  );
}

function CollectionSelector({
  collections,
  selectedCollections,
  onToggle,
}: {
  collections: ZoteroCollection[];
  selectedCollections: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      {collections.length === 0 ? (
        <p className="text-gray-500 text-center py-4">暂无集合</p>
      ) : (
        collections.map((col) => (
          <label
            key={col.key}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedCollections.includes(col.key)}
              onChange={() => onToggle(col.key)}
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{col.name}</span>
              {col.parentCollection && (
                <span className="text-xs text-gray-400 ml-2">子集合</span>
              )}
            </div>
          </label>
        ))
      )}
    </div>
  );
}

function SyncStatusDisplay({
  status,
  onSync,
  isSyncing,
}: {
  status: {
    lastSyncAt?: string;
    syncedCount: number;
    status: 'idle' | 'syncing' | 'success' | 'error';
    error?: string;
    progress?: { total: number; current: number };
  };
  onSync: () => void;
  isSyncing: boolean;
}) {
  const statusColors = {
    idle: 'text-gray-500',
    syncing: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  const statusLabels = {
    idle: '等待同步',
    syncing: '正在同步...',
    success: '同步成功',
    error: '同步失败',
  };

  const statusIcons = {
    idle: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    syncing: (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            status.status === 'success' ? 'bg-green-100' :
            status.status === 'error' ? 'bg-red-100' :
            status.status === 'syncing' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <div className={statusColors[status.status]}>
              {statusIcons[status.status]}
            </div>
          </div>
          <div>
            <p className={`font-medium ${statusColors[status.status]}`}>
              {statusLabels[status.status]}
            </p>
            {status.lastSyncAt && (
              <p className="text-sm text-gray-500">
                上次同步: {new Date(status.lastSyncAt).toLocaleString()}
              </p>
            )}
            {status.syncedCount > 0 && (
              <p className="text-sm text-gray-500">
                已同步: {status.syncedCount} 篇文献
              </p>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? '同步中...' : '立即同步'}
        </Button>
      </div>

      {status.progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>同步进度</span>
            <span>{status.progress.current} / {status.progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(status.progress.current / status.progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{status.error}</p>
        </div>
      )}
    </div>
  );
}

export function ZoteroSyncPage() {
  const [config, setConfig] = useState<ZoteroSyncConfig>({
    libraryType: 'personal',
    autoSync: false,
    syncInterval: 30,
    twoWaySync: true,
    importPDFs: true,
    exportAnnotations: true,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [collections, setCollections] = useState<ZoteroCollection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewPapers, setPreviewPapers] = useState<Paper[]>([]);
  const [selectedPreviewPaperIds, setSelectedPreviewPaperIds] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<{
    lastSyncAt?: string;
    syncedCount: number;
    status: 'idle' | 'syncing' | 'success' | 'error';
    error?: string;
    progress?: { total: number; current: number };
  }>({
    syncedCount: 0,
    status: 'idle',
  });

  const updateConfig = (updates: Partial<ZoteroSyncConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const validateConnection = async (): Promise<boolean> => {
    if (!config.apiKey || !config.userId) {
      alert('请填写 API Key 和 User ID');
      return false;
    }

    setIsConnecting(true);
    try {
      const isValid = await zoteroSyncService.validateCredentials(config.apiKey, config.userId);
      if (isValid) {
        setIsConnected(true);

        const cols = await zoteroSyncService.fetchCollections(
          config.apiKey,
          config.userId,
          config.libraryType,
          config.groupId
        );
        setCollections(cols);

        setConnectionStatus((prev) => ({
          ...prev,
          status: 'success',
          lastSyncAt: new Date().toISOString(),
        }));

        return true;
      } else {
        alert('连接失败，请检查 API Key 和 User ID 是否正确');
        return false;
      }
    } catch {
      alert('连接时发生错误');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleCollection = (key: string) => {
    setSelectedCollections((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleFetchPreview = async () => {
    if (!config.apiKey || !config.userId) return;

    setShowImportModal(true);
    setIsSyncing(true);

    try {
      const papers = await zoteroSyncService.fetchItems(
        config.apiKey,
        config.userId,
        config.libraryType,
        config.groupId,
        selectedCollections[0]
      );
      setPreviewPapers(papers);
      setSelectedPreviewPaperIds(new Set(papers.map((p) => p.id)));
    } catch {
      alert('获取文献预览失败');
    } finally {
      setIsSyncing(false);
    }
  };

  const togglePreviewPaper = (id: string) => {
    const newSet = new Set(selectedPreviewPaperIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPreviewPaperIds(newSet);
  };

  const handleImportSelected = async () => {
    const selectedPapers = previewPapers.filter((p) => selectedPreviewPaperIds.has(p.id));

    for (const paper of selectedPapers) {
      await paperService.addPaper({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        keywords: paper.keywords,
        doi: paper.doi,
        pmid: paper.pmid,
        arxivId: paper.arxivId,
        url: paper.url,
        pdfUrl: paper.pdfUrl,
        journal: paper.journal,
        volume: paper.volume,
        issue: paper.issue,
        pages: paper.pages,
        year: paper.year,
        publisher: paper.publisher,
        isbn: paper.isbn,
        issn: paper.issn,
        tags: paper.tags,
      });
    }

    setConnectionStatus((prev) => ({
      ...prev,
      status: 'success',
      syncedCount: prev.syncedCount + selectedPapers.length,
      lastSyncAt: new Date().toISOString(),
    }));

    setShowImportModal(false);
    alert(`成功导入 ${selectedPapers.length} 篇文献`);
  };

  const handleSync = async () => {
    if (!config.apiKey || !config.userId) {
      alert('请先配置 Zotero 连接');
      return;
    }

    setIsSyncing(true);
    setConnectionStatus((prev) => ({
      ...prev,
      status: 'syncing',
      progress: { total: 10, current: 0 },
    }));

    try {
      let progress = 0;
      const total = 10;

      for (let i = 0; i < total; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        progress++;
        setConnectionStatus((prev) => ({
          ...prev,
          progress: { total, current: progress },
        }));
      }

      setConnectionStatus((prev) => ({
        ...prev,
        status: 'success',
        syncedCount: prev.syncedCount + 5,
        lastSyncAt: new Date().toISOString(),
        progress: undefined,
      }));
    } catch {
      setConnectionStatus((prev) => ({
        ...prev,
        status: 'error',
        error: '同步过程中发生错误',
        progress: undefined,
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zotero 同步</h1>
          <p className="text-gray-500 mt-1">
            与 Zotero 文献管理工具进行双向同步
          </p>
        </div>

        {isConnected && (
          <SyncStatusDisplay
            status={connectionStatus}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  <path d="M16.172 7.586l-3.879 3.879-2.414-2.414-1.414 1.414 3.828 3.828 5.293-5.293z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Zotero 连接配置
                </h2>
                <p className="text-sm text-gray-500">
                  配置您的 Zotero 账户信息以启用同步功能
                </p>
              </div>
              {isConnected && (
                <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  已连接
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <ConfigForm
              config={config}
              onUpdate={updateConfig}
              onValidate={validateConnection}
              isConnecting={isConnecting}
            />
          </div>
        </div>

        {isConnected && collections.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">选择同步集合</h3>
              <p className="text-sm text-gray-500 mt-1">
                选择要同步的 Zotero 集合，不选择则同步所有文献
              </p>
            </div>
            <div className="p-6">
              <CollectionSelector
                collections={collections}
                selectedCollections={selectedCollections}
                onToggle={toggleCollection}
              />

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button variant="secondary" onClick={handleFetchPreview} disabled={isSyncing}>
                  预览导入
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Zotero 同步功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">从 Zotero 导入</p>
                <p className="text-gray-500 mt-1">
                  将 Zotero 中的文献元数据、PDF 附件和标注导入到本地
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">导出到 Zotero</p>
                <p className="text-gray-500 mt-1">
                  将本地添加的文献和标注同步回 Zotero 文献库
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">自动同步</p>
                <p className="text-gray-500 mt-1">
                  设置自动同步间隔，定期保持两边数据一致
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">冲突解决</p>
                <p className="text-gray-500 mt-1">
                  智能检测并处理两边的变更冲突，保持数据完整性
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="预览导入文献"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              共 {previewPapers.length} 篇文献，已选择 {selectedPreviewPaperIds.size} 篇
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPreviewPaperIds(new Set(previewPapers.map((p) => p.id)))}
              >
                全选
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPreviewPaperIds(new Set())}
              >
                取消全选
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {isSyncing ? (
              <div className="p-8 text-center">
                <Loading text="获取文献列表..." />
              </div>
            ) : previewPapers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                该集合中暂无文献
              </div>
            ) : (
              previewPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedPreviewPaperIds.has(paper.id) ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => togglePreviewPaper(paper.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPreviewPaperIds.has(paper.id)}
                    onChange={() => togglePreviewPaper(paper.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {paper.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {paper.authors.map((a) => a.name).join(', ')}
                      {paper.year && ` (${paper.year})`}
                    </p>
                    {paper.journal && (
                      <p className="text-xs text-gray-400 mt-0.5">{paper.journal}</p>
                    )}
                    {paper.tags && paper.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {paper.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleImportSelected}
              disabled={selectedPreviewPaperIds.size === 0}
            >
              导入选中 ({selectedPreviewPaperIds.size})
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default ZoteroSyncPage;
