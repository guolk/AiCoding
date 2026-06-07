import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  StarHalf,
  Search,
  Phone,
  User,
  Tag,
  FileText,
  Building2,
  ThumbsUp,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { suppliers as mockSuppliers } from '@/data/mockData';
import type { Supplier, Quotation } from '@/data/mockData';

interface PriceComparisonItem {
  itemName: string;
  specifications: string;
  quotations: {
    supplier: Supplier;
    quotation: Quotation;
  }[];
  bestPrice: number;
  recommendedSupplierId: string;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
      <span className="ml-1.5 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const statusColors = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning',
  } as const;

  const statusLabels = {
    active: '合作中',
    inactive: '已暂停',
    pending: '待审核',
  } as const;

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">{supplier.name}</CardTitle>
              <Badge variant={statusColors[supplier.cooperationStatus]} className="mt-1">
                {statusLabels[supplier.cooperationStatus]}
              </Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          <span>联系人：</span>
          <span className="font-medium text-gray-900">{supplier.contactPerson}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>电话：</span>
          <span className="font-medium text-gray-900">{supplier.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4 text-gray-400" />
          <span>类别：</span>
          <span className="font-medium text-gray-900">{supplier.category}</span>
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-gray-400" />
              <span>评分：</span>
            </div>
            <StarRating rating={supplier.rating} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>报价数量</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {supplier.quotations.length} 条
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {suppliers.map((supplier) => (
        <SupplierCard key={supplier.id} supplier={supplier} />
      ))}
    </div>
  );
}

function PriceComparison({ suppliers, projectId }: { suppliers: Supplier[]; projectId: string }) {
  const [searchTerm, setSearchTerm] = useState('');

  const priceComparisons = useMemo(() => {
    const itemMap = new Map<string, PriceComparisonItem>();

    suppliers.forEach((supplier) => {
      supplier.quotations
        .filter(q => q.projectId === projectId)
        .forEach((quotation) => {
        const key = quotation.itemName;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            itemName: quotation.itemName,
            specifications: quotation.specifications,
            quotations: [],
            bestPrice: Infinity,
            recommendedSupplierId: '',
          });
        }
        const item = itemMap.get(key)!;
        item.quotations.push({ supplier, quotation });
        if (quotation.unitPrice < item.bestPrice) {
          item.bestPrice = quotation.unitPrice;
          item.recommendedSupplierId = supplier.id;
        }
      });
    });

    return Array.from(itemMap.values());
  }, [suppliers, projectId]);

  const filteredComparisons = useMemo(() => {
    if (!searchTerm.trim()) return priceComparisons;
    return priceComparisons.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [priceComparisons, searchTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索产品名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span>共 {filteredComparisons.length} 个产品比价</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[200px]">产品名称</TableHead>
              <TableHead className="w-[250px]">规格参数</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead className="text-right">单价</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">总价</TableHead>
              <TableHead className="text-center">报价日期</TableHead>
              <TableHead className="text-center w-[100px]">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComparisons.map((item, index) => (
              <>
                {item.quotations.map(({ supplier, quotation }, qIndex) => {
                  const isBestPrice = quotation.unitPrice === item.bestPrice;
                  const isRecommended = supplier.id === item.recommendedSupplierId;
                  const isFirstRow = qIndex === 0;
                  const rowSpan = item.quotations.length;

                  return (
                    <TableRow
                      key={`${item.itemName}-${supplier.id}`}
                      className={
                        isBestPrice
                          ? 'bg-green-50/50 hover:bg-green-50'
                          : undefined
                      }
                    >
                      {isFirstRow && (
                        <>
                          <TableCell rowSpan={rowSpan} className="font-medium text-gray-900 align-top">
                            <div className="flex items-center gap-2">
                              {item.itemName}
                              {isRecommended && (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  推荐
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell rowSpan={rowSpan} className="text-sm text-gray-600 align-top">
                            {item.specifications}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="font-medium">{supplier.name}</span>
                          {isRecommended && qIndex === 0 && (
                            <Badge variant="success" className="ml-1">
                              推荐供应商
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <div
                          className={
                            isBestPrice
                              ? 'text-lg font-bold text-green-600'
                              : 'font-medium text-gray-900'
                          }
                        >
                          {formatPrice(quotation.unitPrice)}
                          {isBestPrice && (
                            <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              最优价
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top text-gray-700">
                        {quotation.quantity}
                      </TableCell>
                      <TableCell className="text-right align-top font-semibold text-gray-900">
                        {formatPrice(quotation.totalPrice)}
                      </TableCell>
                      <TableCell className="text-center align-top text-gray-600">
                        {quotation.quoteDate}
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <Badge
                          variant={
                            quotation.status === 'accepted'
                              ? 'success'
                              : quotation.status === 'rejected'
                              ? 'danger'
                              : quotation.status === 'expired'
                              ? 'warning'
                              : 'outline'
                          }
                        >
                          {quotation.status === 'accepted'
                            ? '已采纳'
                            : quotation.status === 'rejected'
                            ? '已拒绝'
                            : quotation.status === 'expired'
                            ? '已过期'
                            : '待确认'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {index < filteredComparisons.length - 1 && (
                  <TableRow className="bg-gray-50/50">
                    <TableCell colSpan={8} className="p-0 h-px"></TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function SupplierManagement() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('suppliers');

  const projectId = id || '';
  const projectSuppliers = useMemo(() => {
    return mockSuppliers.filter((supplier) =>
      supplier.quotations.some((q) => q.projectId === projectId)
    );
  }, [projectId]);

  if (!id) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">缺少项目ID</h2>
            <p className="text-gray-500">请从项目列表中选择一个项目</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">供应商管理</h1>
            <p className="text-gray-500 mt-1">管理供应商信息，对比产品报价</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              共 {projectSuppliers.length} 家供应商
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="suppliers">供应商列表</TabsTrigger>
            <TabsTrigger value="comparison">比价记录</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers">
            <SupplierList suppliers={projectSuppliers} />
          </TabsContent>
          <TabsContent value="comparison">
            <PriceComparison suppliers={projectSuppliers} projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
