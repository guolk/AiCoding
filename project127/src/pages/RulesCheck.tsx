
import { useWorldStore } from '@/store/useWorldStore';
import { checkWorldConsistency } from '@/utils/rulesChecker';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  RefreshCw,
  Gavel,
  Sparkles,
  Cpu,
  Users,
  Shield
} from 'lucide-react';

const RulesCheck = () => {
  const {
    worldSetting,
    characters,
    factions,
    factionRelations
  } = useWorldStore();

  const results = checkWorldConsistency(
    worldSetting,
    characters,
    factions,
    factionRelations
  );

  const errors = results.filter(r => r.type === 'error');
  const warnings = results.filter(r => r.type === 'warning');
  const infos = results.filter(r => r.type === 'info');

  const overallStatus = errors.length > 0 ? 'error' : 
                        warnings.length > 0 ? 'warning' : 
                        infos.length > 0 ? 'info' : 'success';

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Gavel className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            规则一致性检查
          </h1>
          <p className="text-gray-400">自动检测世界观设定中的矛盾和潜在问题</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="整体状态"
          value={overallStatus === 'success' ? '良好' : overallStatus === 'warning' ? '需要关注' : overallStatus === 'error' ? '有问题' : '待完善'}
          status={overallStatus}
          icon={overallStatus === 'success' ? <CheckCircle className="w-6 h-6" /> : 
                overallStatus === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                overallStatus === 'error' ? <XCircle className="w-6 h-6" /> :
                <Info className="w-6 h-6" />}
        />
        <StatusCard title="错误" value={errors.length} status={errors.length > 0 ? 'error' : 'success'} icon={<XCircle className="w-6 h-6" />} />
        <StatusCard title="警告" value={warnings.length} status={warnings.length > 0 ? 'warning' : 'success'} icon={<AlertTriangle className="w-6 h-6" />} />
        <StatusCard title="建议" value={infos.length} status="info" icon={<Info className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="魔法系统检查" icon={<Sparkles className="w-5 h-5 text-magic-cyan" />}>
          <div className="space-y-4">
            {worldSetting.magicSystem ? (
              <>
                <div className="p-4 bg-dark-bg/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{worldSetting.magicSystem.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">规则数量</p>
                      <p className="text-white">{worldSetting.magicSystem.rules.length} 条</p>
                    </div>
                    <div>
                      <p className="text-gray-400">限制条件</p>
                      <p className="text-white">{worldSetting.magicSystem.limitations.length} 条</p>
                    </div>
                    <div>
                      <p className="text-gray-400">魔力来源</p>
                      <p className="text-white">{worldSetting.magicSystem.sources.length} 种</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {worldSetting.magicSystem.rules.length > 0 && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-4 h-4" /> 已定义规则
                    </span>
                  )}
                  {worldSetting.magicSystem.limitations.length > 0 && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-4 h-4" /> 已定义限制
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>尚未定义魔法系统</p>
                <p className="text-xs mt-1">如果是纯科技世界，可以忽略此项</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="科技系统检查" icon={<Cpu className="w-5 h-5 text-tech-purple" />}>
          <div className="space-y-4">
            {worldSetting.techSystem ? (
              <>
                <div className="p-4 bg-dark-bg/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{worldSetting.techSystem.level}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">关键发明</p>
                      <p className="text-white">{worldSetting.techSystem.keyInventions.length} 项</p>
                    </div>
                    <div>
                      <p className="text-gray-400">技术限制</p>
                      <p className="text-white">{worldSetting.techSystem.limitations.length} 条</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {worldSetting.techSystem.keyInventions.slice(0, 5).map((inv, idx) => (
                    <span key={idx} className="px-3 py-1 bg-tech-purple/20 text-tech-purple text-sm rounded-full">
                      {inv}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cpu className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>尚未定义科技系统</p>
                <p className="text-xs mt-1">如果是纯魔法世界，可以忽略此项</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="人物与阵营" icon={<Users className="w-5 h-5 text-gold" />}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">人物数量</span>
              <span className="text-white font-medium">{characters.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">阵营数量</span>
              <span className="text-white font-medium">{factions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">阵营关系</span>
              <span className="text-white font-medium">{factionRelations.length}</span>
            </div>
          </div>
        </Card>

        <Card title="阵营关系健康度" icon={<Shield className="w-5 h-5 text-magic-cyan" />}>
          <div className="space-y-4">
            {factions.length > 0 ? (
              <>
                <div className="flex items-center gap-6">
                  <RelationStat label="盟友" count={factionRelations.filter(r => r.type === 'ally').length} color="text-green-400" />
                  <RelationStat label="敌对" count={factionRelations.filter(r => r.type === 'enemy').length} color="text-red-400" />
                  <RelationStat label="中立" count={factionRelations.filter(r => r.type === 'neutral').length} color="text-gray-400" />
                  <RelationStat label="附属" count={factionRelations.filter(r => r.type === 'vassal').length} color="text-tech-purple" />
                </div>
                {factions.length > 1 && factionRelations.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    建议为多个阵营之间建立关系
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>暂无阵营定义</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {results.length > 0 && (
        <Card title="检查结果详情">
          <div className="space-y-4">
            {errors.length > 0 && (
              <ResultSection
                title="错误"
                results={errors}
                icon={<XCircle className="w-5 h-5" />}
                headerColor="bg-red-500/10 border-red-500/30"
                iconColor="text-red-400"
              />
            )}
            {warnings.length > 0 && (
              <ResultSection
                title="警告"
                results={warnings}
                icon={<AlertTriangle className="w-5 h-5" />}
                headerColor="bg-amber-500/10 border-amber-500/30"
                iconColor="text-amber-400"
              />
            )}
            {infos.length > 0 && (
              <ResultSection
                title="建议"
                results={infos}
                icon={<Info className="w-5 h-5" />}
                headerColor="bg-blue-500/10 border-blue-500/30"
                iconColor="text-blue-400"
              />
            )}
          </div>
        </Card>
      )}

      {results.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="font-display text-xl font-bold text-white mb-2">
              所有检查通过！
            </h3>
            <p className="text-gray-400">
              你的世界观设定看起来很完整，继续保持！
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

const StatusCard = ({
  title,
  value,
  status,
  icon
}: {
  title: string;
  value: string | number;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}) => {
  const colors = {
    success: 'from-green-500 to-emerald-500',
    warning: 'from-amber-500 to-orange-500',
    error: 'from-red-500 to-rose-500',
    info: 'from-blue-500 to-cyan-500'
  };

  const textColors = {
    success: 'text-green-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`font-display text-2xl font-bold ${textColors[status]}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[status]}`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
};

const RelationStat = ({
  label,
  count,
  color
}: {
  label: string;
  count: number;
  color: string;
}) => (
  <div className="text-center">
    <p className={`text-2xl font-bold ${color}`}>{count}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

const ResultSection = ({
  title,
  results,
  icon,
  headerColor,
  iconColor
}: {
  title: string;
  results: Array<{ message: string; details: string }>;
  icon: React.ReactNode;
  headerColor: string;
  iconColor: string;
}) => (
  <div className="border border-dark-border rounded-lg overflow-hidden">
    <div className={`px-4 py-3 border-b border-dark-border ${headerColor}`}>
      <h4 className={`font-medium flex items-center gap-2 ${iconColor}`}>
        {icon}
        {title} ({results.length})
      </h4>
    </div>
    <div className="divide-y divide-dark-border">
      {results.map((result, idx) => (
        <div key={idx} className="p-4">
          <p className="text-white font-medium mb-1">{result.message}</p>
          <p className="text-gray-400 text-sm">{result.details}</p>
        </div>
      ))}
    </div>
  </div>
);

export default RulesCheck;
