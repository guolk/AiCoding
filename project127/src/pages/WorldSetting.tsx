
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Globe,
  Sparkles,
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Save,
  X
} from 'lucide-react';

const WorldSetting = () => {
  const { worldSetting, setWorldSetting } = useWorldStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(worldSetting || {
    name: '',
    description: '',
    cosmicOrigin: '',
    physicsRules: '',
    magicSystem: null,
    techSystem: null
  });

  const [showMagicModal, setShowMagicModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400 mb-6">
            请先在仪表盘创建一个新世界
          </p>
          <a href="/" className="inline-block">
            <Button>前往仪表盘</Button>
          </a>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setWorldSetting(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(worldSetting);
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            世界基础设定
          </h1>
          <p className="text-gray-400">定义世界的核心规则和基本设定</p>
        </div>
        {!isEditing ? (
          <Button icon={<Edit2 className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
            编辑设定
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              保存
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="基本信息" icon={<Globe className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">世界名称</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                />
              ) : (
                <p className="text-xl font-semibold text-white">{worldSetting.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">描述</label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
                  placeholder="简要描述这个世界..."
                />
              ) : (
                <p className="text-gray-300">
                  {worldSetting.description || '暂无描述'}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="宇宙起源" icon={<Sparkles className="w-5 h-5" />}>
          {isEditing ? (
            <textarea
              value={editData.cosmicOrigin}
              onChange={(e) => setEditData({ ...editData, cosmicOrigin: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
              placeholder="描述世界是如何诞生的..."
            />
          ) : (
            <div className="prose prose-invert">
              {worldSetting.cosmicOrigin ? (
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {worldSetting.cosmicOrigin}
                </p>
              ) : (
                <p className="text-gray-500">点击"编辑设定"来描述世界的起源...</p>
              )}
            </div>
          )}
        </Card>

        <Card title="物理规则" icon={<Globe className="w-5 h-5" />}>
          {isEditing ? (
            <textarea
              value={editData.physicsRules}
              onChange={(e) => setEditData({ ...editData, physicsRules: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
              placeholder="描述这个世界的物理规则..."
            />
          ) : (
            <div className="prose prose-invert">
              {worldSetting.physicsRules ? (
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {worldSetting.physicsRules}
                </p>
              ) : (
                <p className="text-gray-500">点击"编辑设定"来定义物理规则...</p>
              )}
            </div>
          )}
        </Card>

        <Card
          title="魔法体系"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-magic-cyan" />
                <h3 className="font-display text-lg font-semibold text-gold">魔法体系</h3>
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  {editData.magicSystem ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditData({ ...editData, magicSystem: null })}
                      icon={<Trash2 className="w-3 h-3" />}
                    >
                      移除
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => setShowMagicModal(true)}
                    icon={<Edit2 className="w-3 h-3" />}
                  >
                    {editData.magicSystem ? '编辑' : '添加'}
                  </Button>
                </div>
              )}
            </div>
          }
        >
          {worldSetting.magicSystem || editData.magicSystem ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">体系名称</p>
                <p className="text-white font-medium">
                  {(editData.magicSystem || worldSetting.magicSystem)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">核心规则</p>
                <ul className="space-y-1">
                  {(editData.magicSystem || worldSetting.magicSystem)?.rules.map((rule, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                      <span className="text-magic-cyan mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">限制条件</p>
                <ul className="space-y-1">
                  {(editData.magicSystem || worldSetting.magicSystem)?.limitations.map((lim, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {isEditing ? '点击上方按钮添加魔法体系' : '尚未定义魔法体系'}
            </p>
          )}
        </Card>

        <Card
          title="科技体系"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-tech-purple" />
                <h3 className="font-display text-lg font-semibold text-gold">科技体系</h3>
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  {editData.techSystem ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditData({ ...editData, techSystem: null })}
                      icon={<Trash2 className="w-3 h-3" />}
                    >
                      移除
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => setShowTechModal(true)}
                    icon={<Edit2 className="w-3 h-3" />}
                  >
                    {editData.techSystem ? '编辑' : '添加'}
                  </Button>
                </div>
              )}
            </div>
          }
        >
          {worldSetting.techSystem || editData.techSystem ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">科技水平</p>
                <p className="text-white font-medium">
                  {(editData.techSystem || worldSetting.techSystem)?.level}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">关键发明</p>
                <ul className="space-y-1">
                  {(editData.techSystem || worldSetting.techSystem)?.keyInventions.map((inv, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                      <span className="text-tech-purple mt-1">•</span>
                      {inv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {isEditing ? '点击上方按钮添加科技体系' : '尚未定义科技体系'}
            </p>
          )}
        </Card>
      </div>

      <MagicSystemModal
        isOpen={showMagicModal}
        onClose={() => setShowMagicModal(false)}
        currentSystem={editData.magicSystem}
        onSave={(system) => {
          setEditData({ ...editData, magicSystem: system });
          setShowMagicModal(false);
        }}
      />

      <TechSystemModal
        isOpen={showTechModal}
        onClose={() => setShowTechModal(false)}
        currentSystem={editData.techSystem}
        onSave={(system) => {
          setEditData({ ...editData, techSystem: system });
          setShowTechModal(false);
        }}
      />
    </div>
  );
};

const MagicSystemModal = ({
  isOpen,
  onClose,
  currentSystem,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  currentSystem: { name: string; rules: string[]; limitations: string[]; sources: string[] } | null;
  onSave: (system: { name: string; rules: string[]; limitations: string[]; sources: string[] }) => void;
}) => {
  const [name, setName] = useState(currentSystem?.name || '');
  const [rulesText, setRulesText] = useState(currentSystem?.rules.join('\n') || '');
  const [limitationsText, setLimitationsText] = useState(currentSystem?.limitations.join('\n') || '');
  const [sourcesText, setSourcesText] = useState(currentSystem?.sources.join('\n') || '');

  const handleSave = () => {
    onSave({
      name,
      rules: rulesText.split('\n').filter(r => r.trim()),
      limitations: limitationsText.split('\n').filter(l => l.trim()),
      sources: sourcesText.split('\n').filter(s => s.trim())
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="魔法体系设置"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>保存</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">体系名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：元素魔法、奥术、灵能..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">核心规则（每行一条）</label>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;需要魔杖才能施法&#10;魔法效果取决于施法者的意志"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">限制条件（每行一条）</label>
          <textarea
            value={limitationsText}
            onChange={(e) => setLimitationsText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;过度使用会导致精神崩溃&#10;魔法在特定区域无效"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">魔力来源（每行一条）</label>
          <textarea
            value={sourcesText}
            onChange={(e) => setSourcesText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;星界能量&#10;大地精气"
          />
        </div>
      </div>
    </Modal>
  );
};

const TechSystemModal = ({
  isOpen,
  onClose,
  currentSystem,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  currentSystem: { level: string; keyInventions: string[]; limitations: string[] } | null;
  onSave: (system: { level: string; keyInventions: string[]; limitations: string[] }) => void;
}) => {
  const [level, setLevel] = useState(currentSystem?.level || '');
  const [inventionsText, setInventionsText] = useState(currentSystem?.keyInventions.join('\n') || '');
  const [limitationsText, setLimitationsText] = useState(currentSystem?.limitations.join('\n') || '');

  const handleSave = () => {
    onSave({
      level,
      keyInventions: inventionsText.split('\n').filter(i => i.trim()),
      limitations: limitationsText.split('\n').filter(l => l.trim())
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="科技体系设置"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} disabled={!level.trim()}>保存</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">科技水平</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">选择科技水平...</option>
            <option value="石器时代">石器时代</option>
            <option value="青铜时代">青铜时代</option>
            <option value="铁器时代">铁器时代</option>
            <option value="中世纪">中世纪</option>
            <option value="文艺复兴">文艺复兴</option>
            <option value="工业革命">工业革命</option>
            <option value="电力时代">电力时代</option>
            <option value="原子能时代">原子能时代</option>
            <option value="信息时代">信息时代</option>
            <option value="太空时代">太空时代</option>
            <option value="赛博朋克">赛博朋克</option>
            <option value="后人类">后人类</option>
            <option value="自定义">自定义</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">关键发明（每行一条）</label>
          <textarea
            value={inventionsText}
            onChange={(e) => setInventionsText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;蒸汽机&#10;电报&#10;火药"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">技术限制（每行一条）</label>
          <textarea
            value={limitationsText}
            onChange={(e) => setLimitationsText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;无法进行超光速旅行&#10;人工智能尚未出现"
          />
        </div>
      </div>
    </Modal>
  );
};

export default WorldSetting;
