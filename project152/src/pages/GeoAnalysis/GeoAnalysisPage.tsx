import { useState, useMemo } from 'react';
import { Globe, Award, Copyright, Briefcase, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/Table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { Patent, Trademark as TrademarkType, Copyright as CopyrightType } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface RegionData {
  name: string;
  code: string;
  patentCount: number;
  trademarkCount: number;
  copyrightCount: number;
  total: number;
  patents: Patent[];
  trademarks: TrademarkType[];
  copyrights: CopyrightType[];
}

interface CountryPath {
  code: string;
  name: string;
  d: string;
}

const WORLD_MAP_COUNTRIES: CountryPath[] = [
  { code: 'CN', name: '中国', d: 'M620,180 L700,160 L750,200 L730,280 L650,300 L580,260 Z' },
  { code: 'US', name: '美国', d: 'M100,200 L180,190 L200,220 L180,270 L120,280 L80,250 Z' },
  { code: 'EP', name: '欧盟', d: 'M420,160 L480,150 L500,180 L490,220 L440,230 L410,200 Z' },
  { code: 'JP', name: '日本', d: 'M760,200 L780,195 L790,210 L780,230 L765,225 Z' },
  { code: 'KR', name: '韩国', d: 'M740,190 L755,188 L760,200 L750,210 L738,205 Z' },
  { code: 'GB', name: '英国', d: 'M400,140 L420,138 L425,155 L410,165 L398,155 Z' },
  { code: 'DE', name: '德国', d: 'M430,155 L455,153 L460,170 L445,180 L428,172 Z' },
  { code: 'FR', name: '法国', d: 'M415,170 L435,168 L440,185 L425,195 L410,188 Z' },
  { code: 'CA', name: '加拿大', d: 'M120,120 L220,110 L250,150 L200,180 L110,170 Z' },
  { code: 'AU', name: '澳大利亚', d: 'M680,380 L780,370 L800,420 L750,450 L670,430 Z' },
  { code: 'SG', name: '新加坡', d: 'M620,320 L635,318 L640,330 L630,338 L618,332 Z' },
  { code: 'HK', name: '中国香港', d: 'M640,290 L650,288 L655,298 L645,305 L638,298 Z' },
  { code: 'TW', name: '中国台湾', d: 'M660,285 L672,283 L676,295 L666,302 L658,295 Z' },
];

const REGION_NAME_MAP: Record<string, string> = {
  CN: '中国',
  US: '美国',
  EP: '欧盟',
  JP: '日本',
  KR: '韩国',
  GB: '英国',
  DE: '德国',
  FR: '法国',
  CA: '加拿大',
  AU: '澳大利亚',
  SG: '新加坡',
  HK: '中国香港',
  TW: '中国台湾',
};

const FILTER_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'patent', label: '专利' },
  { value: 'trademark', label: '商标' },
  { value: 'copyright', label: '版权' },
];

export default function GeoAnalysisPage() {
  const { patents, trademarks, copyrights } = useAppStore();
  const [filterType, setFilterType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const regionData = useMemo(() => {
    const regions: Record<string, RegionData> = {};

    Object.entries(REGION_NAME_MAP).forEach(([code, name]) => {
      regions[code] = {
        name,
        code,
        patentCount: 0,
        trademarkCount: 0,
        copyrightCount: 0,
        total: 0,
        patents: [],
        trademarks: [],
        copyrights: [],
      };
    });

    patents.forEach((patent) => {
      patent.regions.forEach((region) => {
        const code = region.toUpperCase();
        if (regions[code]) {
          regions[code].patentCount++;
          regions[code].total++;
          regions[code].patents.push(patent);
        }
      });
    });

    trademarks.forEach((trademark) => {
      trademark.regions.forEach((region) => {
        const code = region.toUpperCase();
        if (regions[code]) {
          regions[code].trademarkCount++;
          regions[code].total++;
          regions[code].trademarks.push(trademark);
        }
      });
    });

    copyrights.forEach((copyright) => {
      copyright.regions.forEach((region) => {
        const code = region.toUpperCase();
        if (regions[code]) {
          regions[code].copyrightCount++;
          regions[code].total++;
          regions[code].copyrights.push(copyright);
        }
      });
    });

    return Object.values(regions).filter((r) => r.total > 0);
  }, [patents, trademarks, copyrights]);

  const stats = useMemo(() => {
    const coveredRegions = regionData.filter((r) => r.total > 0).length;
    const totalPatents = patents.length;
    const totalTrademarks = trademarks.length;
    const totalCopyrights = copyrights.length;
    return { coveredRegions, totalPatents, totalTrademarks, totalCopyrights };
  }, [regionData, patents, trademarks, copyrights]);

  const filteredRegionData = useMemo(() => {
    if (filterType === 'all') return regionData;
    return regionData
      .map((r) => ({
        ...r,
        total:
          filterType === 'patent'
            ? r.patentCount
            : filterType === 'trademark'
            ? r.trademarkCount
            : r.copyrightCount,
      }))
      .filter((r) => r.total > 0);
  }, [regionData, filterType]);

  const maxTotal = useMemo(() => {
    return Math.max(...filteredRegionData.map((r) => r.total), 1);
  }, [filteredRegionData]);

  const getCountryColor = (code: string) => {
    const region = filteredRegionData.find((r) => r.code === code);
    if (!region || region.total === 0) return '#e2e8f0';

    const intensity = region.total / maxTotal;
    const baseColor = { r: 59, g: 130, b: 246 };
    const lightColor = { r: 219, g: 234, b: 254 };

    const r = Math.round(lightColor.r + (baseColor.r - lightColor.r) * intensity);
    const g = Math.round(lightColor.g + (baseColor.g - lightColor.g) * intensity);
    const b = Math.round(lightColor.b + (baseColor.b - lightColor.b) * intensity);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleCountryClick = (code: string) => {
    const region = regionData.find((r) => r.code === code);
    if (region) {
      setSelectedRegion(region);
      setDetailModalOpen(true);
    }
  };

  const getFilteredItems = () => {
    if (!selectedRegion) return { patents: [], trademarks: [], copyrights: [] };
    if (filterType === 'all') return selectedRegion;
    return {
      patents: filterType === 'patent' ? selectedRegion.patents : [],
      trademarks: filterType === 'trademark' ? selectedRegion.trademarks : [],
      copyrights: filterType === 'copyright' ? selectedRegion.copyrights : [],
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">地域覆盖分析</h1>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={FILTER_OPTIONS}
          className="w-40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="覆盖国家/地区"
          value={stats.coveredRegions}
          variant="primary"
          icon={<Globe className="h-6 w-6" />}
          suffix="个"
        />
        <StatCard
          title="专利分布"
          value={stats.totalPatents}
          variant="accent"
          icon={<Briefcase className="h-6 w-6" />}
          suffix="项"
        />
        <StatCard
          title="商标分布"
          value={stats.totalTrademarks}
          variant="success"
          icon={<Award className="h-6 w-6" />}
          suffix="个"
        />
        <StatCard
          title="版权分布"
          value={stats.totalCopyrights}
          variant="danger"
          icon={<Copyright className="h-6 w-6" />}
          suffix="项"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全球覆盖地图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-slate-50 rounded-xl p-4">
            <svg viewBox="0 0 900 500" className="w-full h-auto">
              <defs>
                <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              <rect width="900" height="500" fill="url(#oceanGradient)" rx="10" />

              {WORLD_MAP_COUNTRIES.map((country) => {
                const hasData = filteredRegionData.some((r) => r.code === country.code);
                return (
                  <path
                    key={country.code}
                    d={country.d}
                    fill={getCountryColor(country.code)}
                    stroke={hasData ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={hasData ? 2 : 1}
                    className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:stroke-[3px]"
                    onClick={() => handleCountryClick(country.code)}
                  >
                    <title>
                      {country.name}:{' '}
                      {filteredRegionData.find((r) => r.code === country.code)?.total || 0} 项
                    </title>
                  </path>
                );
              })}

              {filteredRegionData.map((region) => {
                const country = WORLD_MAP_COUNTRIES.find((c) => c.code === region.code);
                if (!country) return null;
                const match = country.d.match(/M(\d+),(\d+)/);
                if (!match) return null;
                const x = parseInt(match[1]);
                const y = parseInt(match[2]);
                return (
                  <text
                    key={`label-${region.code}`}
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-slate-700 pointer-events-none"
                  >
                    {region.code}
                  </text>
                );
              })}
            </svg>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-200"></div>
                <span className="text-sm text-slate-600">无覆盖</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100"></div>
                <span className="text-sm text-slate-600">低覆盖</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-300"></div>
                <span className="text-sm text-slate-600">中覆盖</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-slate-600">高覆盖</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>国家/地区覆盖详情</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>国家/地区</TableHead>
                <TableHead>专利数量</TableHead>
                <TableHead>商标数量</TableHead>
                <TableHead>版权数量</TableHead>
                <TableHead>总覆盖数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegionData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegionData
                  .sort((a, b) => b.total - a.total)
                  .map((region) => (
                    <TableRow key={region.code}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCountryColor(region.code) }}
                          ></div>
                          {region.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="active">{region.patentCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{region.trademarkCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning">{region.copyrightCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary-700">{region.total}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRegion(region);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <ModalContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <ModalHeader>
            <ModalTitle>{selectedRegion?.name} - 知识产权详情</ModalTitle>
          </ModalHeader>
          <ModalBody className="flex-1 overflow-auto">
            {selectedRegion && (
              <div className="space-y-6">
                {getFilteredItems().patents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-accent-600" />
                      专利列表 ({getFilteredItems().patents.length})
                    </h3>
                    <div className="space-y-2">
                      {getFilteredItems().patents.map((patent) => (
                        <Card key={patent.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900">{patent.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {patent.applicationNumber} · {formatDate(patent.applicationDate)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="active">{patent.patentType === 'INVENTION' ? '发明' : patent.patentType === 'UTILITY_MODEL' ? '实用新型' : '外观设计'}</Badge>
                                <Badge variant="success">{patent.status}</Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {getFilteredItems().trademarks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-success-600" />
                      商标列表 ({getFilteredItems().trademarks.length})
                    </h3>
                    <div className="space-y-2">
                      {getFilteredItems().trademarks.map((trademark) => (
                        <Card key={trademark.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900">{trademark.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {trademark.registrationNumber} · {formatDate(trademark.applicationDate)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {trademark.categories.map((cat, idx) => (
                                  <Badge key={idx} variant="active">{cat}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {getFilteredItems().copyrights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Copyright className="h-5 w-5 text-danger-600" />
                      版权列表 ({getFilteredItems().copyrights.length})
                    </h3>
                    <div className="space-y-2">
                      {getFilteredItems().copyrights.map((copyright) => (
                        <Card key={copyright.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900">{copyright.workName}</h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {copyright.registrationNumber || '未登记'} · {formatDate(copyright.completionDate)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="warning">{copyright.workType}</Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose>关闭</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
