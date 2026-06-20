import { useState, useMemo } from 'react';
import {
  FileText, Clock, User, Eye, RotateCcw, GitCompare, CheckCircle,
  X, AlertCircle, ArrowRight, Check,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type { PlanVersion } from '@/types';

type VersionStatus = 'draft' | 'review' | 'approved' | 'archived';

const statusConfig: Record<VersionStatus, { variant: 'success' | 'warning' | 'accent' | 'gray'; text: string }> = {
  draft: { variant: 'gray', text: '草稿' },
  review: { variant: 'warning', text: '审核中' },
  approved: { variant: 'success', text: '已批准' },
  archived: { variant: 'accent', text: '已归档' },
};

const getStatusConfig = (status: string) => {
  return statusConfig[status as VersionStatus] || statusConfig.draft;
};

const computeDiff = (oldText: string, newText: string): { oldLines: string[]; newLines: string[]; diffMap: Map<number, 'added' | 'removed' | 'unchanged'> } => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diffMap = new Map<number, 'added' | 'removed' | 'unchanged'>();

  const maxLen = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (i >= oldLines.length) {
      diffMap.set(i, 'added');
    } else if (i >= newLines.length) {
      diffMap.set(i, 'removed');
    } else if (oldLines[i] !== newLines[i]) {
      diffMap.set(i, 'removed');
      diffMap.set(i + 0.5, 'added');
    } else {
      diffMap.set(i, 'unchanged');
    }
  }

  return { oldLines, newLines, diffMap };
};

export default function PlanVersions() {
  const {
    planVersions, currentEventId, restorePlanVersion, updatePlanVersion,
  } = useAppStore();

  const [detailModal, setDetailModal] = useState<PlanVersion | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string>('');
  const [compareVersion2, setCompareVersion2] = useState<string>('');
  const [showRollbackConfirm, setShowRollbackConfirm] = useState<PlanVersion | null>(null);

  const versions = useMemo(() =>
    planVersions
      .filter(v => v.eventId === currentEventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [planVersions, currentEventId]
  );

  const versionOptions = useMemo(() =>
    versions.map(v => ({ value: v.id, label: v.name })),
    [versions]
  );

  const handleRollback = (version: PlanVersion) => {
    restorePlanVersion(version.id);
    setShowRollbackConfirm(null);
  };

  const handleUpdateStatus = (id: string, status: VersionStatus) => {
    updatePlanVersion(id, { status });
  };

  const getDiffContent = () => {
    if (!compareVersion1 || !compareVersion2) return null;
    const v1 = versions.find(v => v.id === compareVersion1);
    const v2 = versions.find(v => v.id === compareVersion2);
    if (!v1 || !v2) return null;
    return computeDiff(v1.content, v2.content);
  };

  const diffResult = getDiffContent();

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-500">
            版本管理
          </h2>
          <p className="text-warmGray-500 mt-1">
            追踪策划方案的历史版本
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowCompareModal(true)}
          leftIcon={<GitCompare className="w-4 h-4" />}
          disabled={versions.length < 2}
        >
          版本对比
        </Button>
      </div>

      {versions.length === 0 ? (
        <Card className="text-center py-12 animate-slide-up">
          <FileText className="w-12 h-12 text-warmGray-300 mx-auto mb-4" />
          <p className="text-warmGray-500">暂无版本记录</p>
          <p className="text-sm text-warmGray-400 mt-2">在策划文档页面保存版本后，版本将显示在这里</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.map((version, index) => {
            const statusConf = getStatusConfig(version.status);
            return (
              <Card
                key={version.id}
                hoverable
                className="animate-slide-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warmGray-800">
                        {version.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-warmGray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(version.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusConf.variant}>
                    {statusConf.text}
                  </Badge>
                </div>

                {version.notes && (
                  <p className="text-sm text-warmGray-600 mb-4 line-clamp-2">
                    {version.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-warmGray-500 mb-4">
                  <User className="w-3 h-3" />
                  <span>{version.createdBy}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDetailModal(version)}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    查看
                  </Button>
                  {version.status !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowRollbackConfirm(version)}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      回滚
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.name}
        size="lg"
        footer={
          detailModal && (
            <>
              <div className="flex-1">
                <span className="text-sm text-warmGray-500">状态：</span>
                <Select
                  value={detailModal.status}
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'review', label: '审核中' },
                    { value: 'approved', label: '已批准' },
                    { value: 'archived', label: '已归档' },
                  ]}
                  onChange={(e) => handleUpdateStatus(detailModal.id, e.target.value as VersionStatus)}
                  className="w-32 inline-block"
                />
              </div>
              <Button variant="ghost" onClick={() => setDetailModal(null)}>
                关闭
              </Button>
            </>
          )
        }
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-warmGray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{detailModal.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDateTime(detailModal.createdAt)}</span>
              </div>
            </div>
            {detailModal.notes && (
              <div className="p-4 rounded-xl bg-warmGray-50">
                <div className="text-xs text-warmGray-500 mb-1">版本说明</div>
                <p className="text-warmGray-700">{detailModal.notes}</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-ivory border border-warmGray-100">
              <div className="text-xs text-warmGray-500 mb-2">版本内容</div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-warmGray-700">
                {detailModal.content}
              </pre>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        title="版本对比"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCompareModal(false)}>关闭</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="基准版本"
              value={compareVersion1}
              options={versionOptions}
              placeholder="选择版本"
              onChange={(e) => setCompareVersion1(e.target.value)}
            />
            <Select
              label="对比版本"
              value={compareVersion2}
              options={versionOptions}
              placeholder="选择版本"
              onChange={(e) => setCompareVersion2(e.target.value)}
            />
          </div>

          {diffResult && (
            <div className="rounded-xl overflow-hidden border border-warmGray-100">
              <div className="grid grid-cols-2 bg-warmGray-50 text-xs font-semibold text-warmGray-500">
                <div className="px-4 py-2 border-r border-warmGray-100">
                  {versions.find(v => v.id === compareVersion1)?.name}
                </div>
                <div className="px-4 py-2">
                  {versions.find(v => v.id === compareVersion2)?.name}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {Array.from(diffResult.diffMap.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([key, type]) => {
                    const idx = Math.floor(key);
                    const isAdded = type === 'added';
                    const isRemoved = type === 'removed';
                    const line = isAdded
                      ? diffResult.newLines[idx] || ''
                      : diffResult.oldLines[idx] || '';
                    const bgColor = isAdded
                      ? 'bg-green-50'
                      : isRemoved
                      ? 'bg-red-50'
                      : 'bg-white';
                    const textColor = isAdded
                      ? 'text-green-700'
                      : isRemoved
                      ? 'text-red-700'
                      : 'text-warmGray-700';
                    const prefix = isAdded ? '+' : isRemoved ? '-' : ' ';

                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-2 ${bgColor} border-b border-warmGray-50`}
                      >
                        {!isAdded && (
                          <div className={`px-4 py-1 font-mono text-sm ${textColor} border-r border-warmGray-100`}>
                          <span className="mr-2 text-warmGray-400">{prefix}</span>
                          {line}
                        </div>
                        )}
                        {isAdded && <div className="px-4 py-1 border-r border-warmGray-100" />}
                        {isRemoved && <div className="px-4 py-1" />}
                        {!isRemoved && (
                          <div className={`px-4 py-1 font-mono text-sm ${textColor}`}>
                            <span className="mr-2 text-warmGray-400">{prefix}</span>
                            {line}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {!diffResult && (compareVersion1 || !compareVersion2) && (
            <div className="text-center py-8 text-warmGray-400">
              请选择两个版本进行对比
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!showRollbackConfirm}
        onClose={() => setShowRollbackConfirm(null)}
        title="确认回滚"
        description="此操作将当前策划文档回滚到此版本的内容，确定要继续吗？"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRollbackConfirm(null)}>取消</Button>
            <Button
              variant="accent"
              onClick={() => showRollbackConfirm && handleRollback(showRollbackConfirm)}
              leftIcon={<Check className="w-4 h-4" />}
            >
              确认回滚
            </Button>
          </>
        }
      >
        {showRollbackConfirm && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <div className="font-medium text-amber-800">
                即将回滚到版本：{showRollbackConfirm.name}
              </div>
              <div className="text-sm text-amber-700 mt-1">
                创建时间：{formatDateTime(showRollbackConfirm.createdAt)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
