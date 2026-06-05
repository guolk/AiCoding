import { useAppStore } from '../../store/useAppStore';
import { Radio, Podcast, Music, Headphones, Cloud, Settings, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/helpers';

const iconMap: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  'radio': Radio,
  'podcast': Podcast,
  'music': Music,
  'headphones': Headphones,
  'cloud': Cloud,
};

export default function PlatformManagement() {
  const { platforms, publications, episodes, updatePlatform, updatePublication, addPublication } = useAppStore();

  const getPlatformStats = (platformId: string) => {
    const pubs = publications.filter(p => p.platformId === platformId);
    return {
      total: pubs.length,
      published: pubs.filter(p => p.status === 'published').length,
      scheduled: pubs.filter(p => p.status === 'scheduled').length,
      draft: pubs.filter(p => p.status === 'draft').length,
    };
  };

  const getEpisodeTitle = (episodeId: string) => {
    return episodes.find(e => e.id === episodeId)?.title || '未知节目';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {platforms.map(platform => {
          const Icon = iconMap[platform.icon] || Radio;
          const stats = getPlatformStats(platform.id);
          return (
            <div
              key={platform.id}
              className={cn(
                'bg-white rounded-xl border p-5 transition-all',
                platform.enabled ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  platform.enabled ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'
                )}>
                  <Icon size={24} />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platform.enabled}
                    onChange={() => updatePlatform(platform.id, { enabled: !platform.enabled })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                </label>
              </div>
              <h3 className="font-semibold text-slate-800 mb-3">{platform.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-800">{stats.published}</p>
                  <p className="text-xs text-slate-500">已发布</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-800">{stats.scheduled}</p>
                  <p className="text-xs text-slate-500">待发布</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Settings className="text-accent-500" size={20} />
            发布状态总览
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">节目</th>
                {platforms.filter(p => p.enabled).map(platform => {
                  const Icon = iconMap[platform.icon] || Radio;
                  return (
                    <th key={platform.id} className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon size={14} />
                        {platform.name}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {episodes.map(episode => (
                <tr key={episode.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{episode.title}</p>
                      <p className="text-sm text-slate-500">
                        {episode.status === 'published' ? '已发布' :
                         episode.status === 'editing' ? '剪辑中' :
                         episode.status === 'scheduled' ? '已预约' : '策划中'}
                      </p>
                    </div>
                  </td>
                  {platforms.filter(p => p.enabled).map(platform => {
                    const pub = publications.find(p => p.episodeId === episode.id && p.platformId === platform.id);
                    return (
                      <td key={platform.id} className="px-5 py-4">
                        {pub ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium',
                              pub.status === 'published' ? 'bg-green-100 text-green-700' :
                              pub.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              pub.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            )}>
                              {pub.status === 'published' ? '已发布' :
                               pub.status === 'scheduled' ? '已排期' :
                               pub.status === 'failed' ? '发布失败' : '草稿'}
                            </span>
                            {pub.url && (
                              <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                                查看 <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => addPublication({
                              episodeId: episode.id,
                              platformId: platform.id,
                              status: 'draft',
                            })}
                            className="w-full px-3 py-1.5 text-xs border border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-accent-500 hover:text-accent-500 transition-colors"
                          >
                            + 新建发布
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">发布配置提示</h3>
          <div className="space-y-3">
            {platforms.filter(p => p.enabled).map(platform => {
              const Icon = iconMap[platform.icon] || Radio;
              return (
                <div key={platform.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{platform.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      请确保已在平台配置好RSS feed或API密钥
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-950 to-primary-800 rounded-xl p-5 text-white">
          <h3 className="font-display text-lg font-semibold mb-4">发布最佳实践</h3>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-accent-400 mt-0.5">✓</span>
              建议在固定时间发布，培养听众收听习惯
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-400 mt-0.5">✓</span>
              多平台发布时注意各平台的格式要求
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-400 mt-0.5">✓</span>
              发布后24小时内密切关注数据反馈
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-400 mt-0.5">✓</span>
              及时回复听众评论，提升互动率
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-400 mt-0.5">✓</span>
              建立发布清单，避免遗漏关键步骤
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
