import React, { useState, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useDesignStore } from '@/store/useDesignStore';
import { useSpaceStore } from '@/store/useSpaceStore';
import type { DesignVersion, MoodBoardImage, DesignElement } from '@/types';
import { cn } from '@/lib/utils';

const VERSION_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  review: '审核中',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  final: '最终版',
};

const VERSION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  final: 'bg-blue-100 text-blue-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  furniture: '家具',
  'soft-decor': '软装',
  'soft_decor': '软装',
  lighting: '灯具',
  decoration: '装饰品',
  appliance: '家电',
  textile: '布艺',
};

const CATEGORY_COLORS: Record<string, string> = {
  furniture: 'bg-amber-100 text-amber-700',
  'soft-decor': 'bg-purple-100 text-purple-700',
  'soft_decor': 'bg-purple-100 text-purple-700',
  lighting: 'bg-blue-100 text-blue-700',
  decoration: 'bg-pink-100 text-pink-700',
  appliance: 'bg-cyan-100 text-cyan-700',
  textile: 'bg-violet-100 text-violet-700',
};

const ELEMENT_STATUS_LABELS: Record<string, string> = {
  pending: '待确认',
  ordered: '已下单',
  delivered: '已到货',
  installed: '已安装',
};

const ELEMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  ordered: 'bg-blue-100 text-blue-700',
  delivered: 'bg-yellow-100 text-yellow-700',
  installed: 'bg-green-100 text-green-700',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function DesignManagement() {
  const { designVersions, moodBoardImages, designElements } = useDesignStore();
  const { rooms } = useSpaceStore();
  const [activeTab, setActiveTab] = useState('versions');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  const selectedVersion = useMemo(() => {
    return designVersions.find((v) => v.id === selectedVersionId) || designVersions[0];
  }, [designVersions, selectedVersionId]);

  const compareVersion = useMemo(() => {
    return designVersions.find((v) => v.id === compareVersionId);
  }, [designVersions, compareVersionId]);

  const filteredMoodBoardImages = useMemo(() => {
    let images = selectedVersion?.moodBoardImages || moodBoardImages;
    if (roomFilter !== 'all') {
      images = images.filter((img) => (img as any).roomId === roomFilter);
    }
    return images;
  }, [selectedVersion, moodBoardImages, roomFilter]);

  const filteredElements = useMemo(() => {
    let elements = selectedVersion?.elements || designElements;
    if (categoryFilter !== 'all') {
      elements = elements.filter((el) => el.category === categoryFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      elements = elements.filter(
        (el) =>
          el.name.toLowerCase().includes(query) ||
          (el.description && el.description.toLowerCase().includes(query))
      );
    }
    return elements;
  }, [selectedVersion, designElements, categoryFilter, searchQuery]);

  const elementsSummary = useMemo(() => {
    const elements = filteredElements;
    const totalQuantity = elements.reduce((sum, el) => sum + el.quantity, 0);
    const totalPrice = elements.reduce((sum, el) => sum + el.quantity * el.estimatedPrice, 0);
    const categoryCounts = elements.reduce((acc, el) => {
      acc[el.category] = (acc[el.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalQuantity, totalPrice, categoryCounts };
  }, [filteredElements]);

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || '未指定';
  };

  const handleVersionCompare = (versionId: string) => {
    if (compareVersionId === versionId) {
      setCompareVersionId(null);
      setShowCompare(false);
    } else {
      setCompareVersionId(versionId);
      setShowCompare(true);
    }
  };

  const handleRollback = (version: DesignVersion) => {
    if (confirm(`确定要回滚到版本 ${version.versionNumber} 吗？`)) {
      alert(`已回滚到版本 ${version.versionNumber}`);
    }
  };

  return (
    <PageLayout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">设计方案管理</h1>
          <p className="text-gray-500">管理设计版本、灵感图板与设计元素清单</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="versions">版本管理</TabsTrigger>
            <TabsTrigger value="moodboard">风格图板</TabsTrigger>
            <TabsTrigger value="elements">元素清单</TabsTrigger>
          </TabsList>

          <TabsContent value="versions" className="flex-1 mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-gray-900">设计版本列表</h3>
                  <Badge variant="outline">{designVersions.length} 个版本</Badge>
                </div>
                <Button>+ 新建版本</Button>
              </div>

              {showCompare && compareVersion && selectedVersion && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">版本对比</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCompare(false);
                          setCompareVersionId(null);
                        }}
                      >
                        关闭对比
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{selectedVersion.name}</h4>
                            <p className="text-sm text-gray-500">{selectedVersion.versionNumber}</p>
                          </div>
                          <Badge className={VERSION_STATUS_COLORS[selectedVersion.status]}>
                            {VERSION_STATUS_LABELS[selectedVersion.status]}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">设计元素</span>
                            <span className="font-medium">{selectedVersion.elements?.length || 0} 个</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">灵感图片</span>
                            <span className="font-medium">{selectedVersion.moodBoardImages?.length || 0} 张</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">创建时间</span>
                            <span className="font-medium">{formatDate(selectedVersion.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">预估总价</span>
                            <span className="font-medium text-blue-600">
                              {formatPrice(
                                (selectedVersion.elements || []).reduce(
                                  (sum, el) => sum + el.quantity * el.estimatedPrice,
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{compareVersion.name}</h4>
                            <p className="text-sm text-gray-500">{compareVersion.versionNumber}</p>
                          </div>
                          <Badge className={VERSION_STATUS_COLORS[compareVersion.status]}>
                            {VERSION_STATUS_LABELS[compareVersion.status]}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">设计元素</span>
                            <span className="font-medium">{compareVersion.elements?.length || 0} 个</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">灵感图片</span>
                            <span className="font-medium">{compareVersion.moodBoardImages?.length || 0} 张</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">创建时间</span>
                            <span className="font-medium">{formatDate(compareVersion.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">预估总价</span>
                            <span className="font-medium text-blue-600">
                              {formatPrice(
                                (compareVersion.elements || []).reduce(
                                  (sum, el) => sum + el.quantity * el.estimatedPrice,
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designVersions.map((version) => {
                  const isSelected = selectedVersion?.id === version.id;
                  const isCompare = compareVersionId === version.id;
                  const totalPrice = (version.elements || []).reduce(
                    (sum, el) => sum + el.quantity * el.estimatedPrice,
                    0
                  );

                  return (
                    <Card
                      key={version.id}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected && 'ring-2 ring-blue-500 border-blue-200',
                        isCompare && 'ring-2 ring-orange-500 border-orange-200'
                      )}
                      onClick={() => {
                        if (showCompare) {
                          handleVersionCompare(version.id);
                        } else {
                          setSelectedVersionId(version.id);
                        }
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{version.name}</CardTitle>
                              <Badge variant="outline">{version.versionNumber}</Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {version.description}
                            </CardDescription>
                          </div>
                          <Badge className={VERSION_STATUS_COLORS[version.status]}>
                            {VERSION_STATUS_LABELS[version.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-900">
                              {version.elements?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">设计元素</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-900">
                              {version.moodBoardImages?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">灵感图片</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              ¥{(totalPrice / 10000).toFixed(1)}万
                            </div>
                            <div className="text-xs text-gray-500">预估</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>创建于 {formatDate(version.createdAt)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        {!showCompare ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCompare(true);
                                setCompareVersionId(version.id);
                              }}
                            >
                              对比
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRollback(version);
                              }}
                            >
                              回滚
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              查看
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant={isCompare ? 'primary' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVersionCompare(version.id);
                            }}
                          >
                            {isCompare ? '取消对比' : '选择对比'}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moodboard" className="flex-1 mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium text-gray-900">风格图板</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">按房间筛选:</span>
                    <select
                      value={roomFilter}
                      onChange={(e) => setRoomFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">全部房间</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{filteredMoodBoardImages.length} 张图片</Badge>
                  <Button size="sm">+ 上传图片</Button>
                </div>
              </div>

              {selectedVersion && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">当前版本:</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedVersion.versionNumber}
                  </Badge>
                  <span className="font-medium text-gray-900">{selectedVersion.name}</span>
                </div>
              )}

              <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {filteredMoodBoardImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="break-inside-avoid group relative rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                    style={{
                      height: `${200 + (index % 3) * 80}px`,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-medium mb-1">{image.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                            {getRoomName((image as any).roomId)}
                          </Badge>
                          {image.description && (
                            <p className="text-white/80 text-sm line-clamp-1">
                              {image.description}
                            </p>
                          )}
                        </div>
                        {(image as any).tags && Array.isArray((image as any).tags) && (
                          <div className="flex flex-wrap gap-1">
                            {(image as any).tags.map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-white/90 h-8 px-3">
                          查看
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMoodBoardImages.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-4">🖼️</p>
                  <p className="text-lg mb-2">暂无灵感图片</p>
                  <p className="text-sm">点击右上角上传按钮添加灵感图片</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="elements" className="flex-1 mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium text-gray-900">元素清单</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">分类筛选:</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={categoryFilter === 'all' ? 'primary' : 'outline'}
                        onClick={() => setCategoryFilter('all')}
                      >
                        全部
                      </Button>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={categoryFilter === key ? 'primary' : 'outline'}
                          onClick={() => setCategoryFilter(key)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="搜索元素名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-60"
                  />
                  <Button>+ 添加元素</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {filteredElements.length}
                      </div>
                      <div className="text-sm text-gray-500">元素种类</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {elementsSummary.totalQuantity}
                      </div>
                      <div className="text-sm text-gray-500">总数量</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        ¥{(elementsSummary.totalPrice / 10000).toFixed(1)}万
                      </div>
                      <div className="text-sm text-gray-500">预估总价</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {Object.keys(elementsSummary.categoryCounts).length}
                      </div>
                      <div className="text-sm text-gray-500">涉及分类</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">
                          <input type="checkbox" className="rounded" />
                        </TableHead>
                        <TableHead>元素名称</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>所属房间</TableHead>
                        <TableHead className="text-center">数量</TableHead>
                        <TableHead className="text-right">单价</TableHead>
                        <TableHead className="text-right">总价</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredElements.map((element) => {
                        const totalPrice = element.quantity * element.estimatedPrice;
                        return (
                          <TableRow key={element.id}>
                            <TableCell>
                              <input type="checkbox" className="rounded" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg overflow-hidden">
                                  {(element as any).imageUrl ? (
                                    <img
                                      src={(element as any).imageUrl}
                                      alt={element.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    '🛋️'
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{element.name}</div>
                                  {element.description && (
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {element.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={CATEGORY_COLORS[element.category] || 'bg-gray-100 text-gray-700'}>
                                {CATEGORY_LABELS[element.category] || element.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {getRoomName(element.roomId)}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {element.quantity}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {formatPrice(element.estimatedPrice)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {formatPrice(totalPrice)}
                            </TableCell>
                            <TableCell>
                              <Badge className={ELEMENT_STATUS_COLORS[element.status] || 'bg-gray-100 text-gray-700'}>
                                {ELEMENT_STATUS_LABELS[element.status] || element.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  编辑
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                                  删除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {filteredElements.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-5xl mb-4">📦</p>
                      <p className="text-lg mb-2">暂无设计元素</p>
                      <p className="text-sm">点击右上角添加按钮创建设计元素</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {filteredElements.length > 0 && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        共 {filteredElements.length} 个元素，{elementsSummary.totalQuantity} 件商品
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">预估总价</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(elementsSummary.totalPrice)}
                          </div>
                        </div>
                        <Button size="lg">导出台账</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
