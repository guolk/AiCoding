import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PieChart, PieChartDataItem } from '@/components/charts/PieChart';
import { BarChart, BarChartDataItem } from '@/components/charts/BarChart';
import { useBudgetStore } from '@/store/useBudgetStore';
import { BUDGET_CATEGORY_COLORS } from '@/components/charts/PieChart';
import { AlertTriangle, TrendingDown, CheckCircle, Lightbulb } from 'lucide-react';

const PROJECT_ID = 'proj-001';

export default function BudgetManagement() {
  const [activeTab, setActiveTab] = useState('breakdown');
  const { budgetCategories, expenses, updateBudgetCategory } = useBudgetStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const projectBudgets = budgetCategories.filter(bc => bc.projectId === PROJECT_ID);
  const projectExpenses = expenses.filter(e => e.projectId === PROJECT_ID);

  const pieData: PieChartDataItem[] = projectBudgets.map(bc => ({
    name: bc.name,
    value: bc.allocatedAmount,
    color: BUDGET_CATEGORY_COLORS[bc.name] || '#6B7280',
  }));

  const barData: BarChartDataItem[] = projectBudgets.map(bc => ({
    name: bc.name,
    budget: bc.allocatedAmount,
    actual: bc.spentAmount,
  }));

  const overBudgetItems = projectBudgets.filter(bc => bc.spentAmount > bc.allocatedAmount);
  const atRiskItems = projectBudgets.filter(bc => {
    const ratio = bc.spentAmount / bc.allocatedAmount;
    return ratio >= 0.8 && ratio <= 1.0;
  });

  const totalBudget = projectBudgets.reduce((sum, bc) => sum + bc.allocatedAmount, 0);
  const totalSpent = projectBudgets.reduce((sum, bc) => sum + bc.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleEditStart = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditValue(currentAmount.toString());
  };

  const handleEditSave = (id: string) => {
    const newAmount = parseFloat(editValue);
    if (!isNaN(newAmount) && newAmount > 0) {
      updateBudgetCategory(id, { allocatedAmount: newAmount });
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getOverBudgetPercentage = (spent: number, allocated: number): string => {
    if (allocated === 0) return '0';
    return ((spent - allocated) / allocated * 100).toFixed(1);
  };

  const getUsagePercentage = (spent: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min((spent / allocated * 100), 100);
  };

  const getSuggestions = (item: typeof projectBudgets[0]) => {
    const suggestions: string[] = [];
    const overPercent = parseFloat(getOverBudgetPercentage(item.spentAmount, item.allocatedAmount));
    
    if (overPercent > 20) {
      suggestions.push('立即启动预算评审，分析超支根本原因');
      suggestions.push('与供应商重新谈判，争取更优惠的价格');
      suggestions.push('考虑调整其他分类预算进行填补');
    } else if (overPercent > 10) {
      suggestions.push('优化采购计划，合并订单争取批量折扣');
      suggestions.push('评估是否可简化部分非必要项目');
      suggestions.push('建立更严格的支出审批流程');
    } else {
      suggestions.push('密切监控后续支出，避免进一步超支');
      suggestions.push('提前规划剩余预算的使用');
    }
    
    return suggestions;
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">预算管理</h1>
            <p className="text-gray-500 mt-1">全面掌控项目预算执行情况</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">总预算</p>
              <p className="text-xl font-bold text-gray-900">¥{totalBudget.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">已支出</p>
              <p className="text-xl font-bold text-blue-600">¥{totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">剩余</p>
              <p className={`text-xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{totalRemaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="breakdown">预算分解</TabsTrigger>
            <TabsTrigger value="tracking">支出追踪</TabsTrigger>
            <TabsTrigger value="warning">
              超支预警
              {(overBudgetItems.length > 0 || atRiskItems.length > 0) && (
                <Badge variant="danger" className="ml-2">
                  {overBudgetItems.length + atRiskItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>预算分配</CardTitle>
                  <CardDescription>各分类预算占比分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={pieData}
                    width={400}
                    height={350}
                    innerRadius={70}
                    outerRadius={110}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>预算执行概览</CardTitle>
                  <CardDescription>各分类预算与实际支出对比</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectBudgets.map(bc => {
                    const usagePercent = getUsagePercentage(bc.spentAmount, bc.allocatedAmount);
                    const isOver = bc.spentAmount > bc.allocatedAmount;
                    return (
                      <div key={bc.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: BUDGET_CATEGORY_COLORS[bc.name] || '#6B7280' }}
                            />
                            <span className="text-sm font-medium text-gray-700">{bc.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className={isOver ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              ¥{bc.spentAmount.toLocaleString()}
                            </span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-500">¥{bc.allocatedAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-500' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                          {isOver && (
                            <div
                              className="absolute top-0 h-full bg-red-400 opacity-50"
                              style={{ left: '100%', width: `${parseFloat(getOverBudgetPercentage(bc.spentAmount, bc.allocatedAmount))}%` }}
                            />
                          )}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className={usagePercent >= 80 ? 'text-yellow-600' : 'text-gray-500'}>
                            已使用 {usagePercent.toFixed(1)}%
                          </span>
                          {isOver && (
                            <span className="text-red-500 font-medium">
                              超支 {getOverBudgetPercentage(bc.spentAmount, bc.allocatedAmount)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>预算设置</CardTitle>
                <CardDescription>可编辑各分类的预算金额</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>分类</TableHead>
                      <TableHead>预算金额</TableHead>
                      <TableHead>已支出</TableHead>
                      <TableHead>剩余</TableHead>
                      <TableHead>使用率</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectBudgets.map(bc => {
                      const remaining = bc.allocatedAmount - bc.spentAmount;
                      const usagePercent = (bc.spentAmount / bc.allocatedAmount * 100).toFixed(1);
                      return (
                        <TableRow key={bc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: BUDGET_CATEGORY_COLORS[bc.name] || '#6B7280' }}
                              />
                              {bc.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {editingId === bc.id ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-32"
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => handleEditSave(bc.id)}>保存</Button>
                                <Button size="sm" variant="ghost" onClick={handleEditCancel}>取消</Button>
                              </div>
                            ) : (
                              <span>¥{bc.allocatedAmount.toLocaleString()}</span>
                            )}
                          </TableCell>
                          <TableCell className={bc.spentAmount > bc.allocatedAmount ? 'text-red-600 font-medium' : ''}>
                            ¥{bc.spentAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className={remaining < 0 ? 'text-red-600 font-medium' : remaining < bc.allocatedAmount * 0.2 ? 'text-yellow-600' : ''}>
                            ¥{remaining.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(usagePercent) >= 100 ? 'danger' : parseFloat(usagePercent) >= 80 ? 'warning' : 'success'}>
                              {usagePercent}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {editingId !== bc.id && (
                              <Button size="sm" variant="outline" onClick={() => handleEditStart(bc.id, bc.allocatedAmount)}>
                                编辑
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>预算vs实际支出对比</CardTitle>
                <CardDescription>各分类的预算执行情况</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={barData}
                  width={800}
                  height={400}
                  yAxisLabel="金额（元）"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>支出记录</CardTitle>
                <CardDescription>共 {projectExpenses.length} 条支出记录</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>支出项目</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>收款方</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(expense => {
                        const category = budgetCategories.find(bc => bc.id === expense.categoryId);
                        return (
                          <TableRow key={expense.id}>
                            <TableCell className="text-gray-600">{expense.date}</TableCell>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                {category && (
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: BUDGET_CATEGORY_COLORS[category.name] || '#6B7280' }}
                                  />
                                )}
                                {category?.name || '未分类'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">¥{expense.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-gray-600">{expense.supplier}</TableCell>
                            <TableCell className="text-gray-500 text-sm max-w-xs truncate" title={expense.notes}>
                              {expense.notes || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warning" className="space-y-6">
            {overBudgetItems.length === 0 && atRiskItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">预算状况良好</h3>
                  <p className="text-gray-500">所有分类均在预算范围内，继续保持！</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {overBudgetItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h2 className="text-lg font-semibold text-gray-900">已超支项目</h2>
                      <Badge variant="danger">{overBudgetItems.length} 项</Badge>
                    </div>
                    {overBudgetItems.map(item => {
                      const overPercent = getOverBudgetPercentage(item.spentAmount, item.allocatedAmount);
                      const suggestions = getSuggestions(item);
                      return (
                        <Card key={item.id} className="border-red-200 bg-red-50">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: BUDGET_CATEGORY_COLORS[item.name] || '#6B7280' }}
                                  />
                                  {item.name}
                                </CardTitle>
                                <CardDescription className="text-red-600">
                                  超支 ¥{(item.spentAmount - item.allocatedAmount).toLocaleString()} ({overPercent}%)
                                </CardDescription>
                              </div>
                              <Badge variant="danger" className="text-base px-3 py-1">
                                超支
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-sm text-gray-500">预算金额</p>
                                <p className="text-lg font-semibold text-gray-900">¥{item.allocatedAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-sm text-gray-500">已支出</p>
                                <p className="text-lg font-semibold text-red-600">¥{item.spentAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-sm text-gray-500">使用率</p>
                                <p className="text-lg font-semibold text-red-600">
                                  {(item.spentAmount / item.allocatedAmount * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-start gap-2 mb-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <h4 className="font-medium text-gray-900">应对方案建议</h4>
                              </div>
                              <ul className="space-y-2 ml-7">
                                {suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {atRiskItems.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold text-gray-900">预警项目</h2>
                      <Badge variant="warning">{atRiskItems.length} 项</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {atRiskItems.map(item => {
                        const usagePercent = (item.spentAmount / item.allocatedAmount * 100).toFixed(1);
                        return (
                          <Card key={item.id} className="border-yellow-200 bg-yellow-50">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2 text-yellow-700 text-base">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: BUDGET_CATEGORY_COLORS[item.name] || '#6B7280' }}
                                    />
                                    {item.name}
                                  </CardTitle>
                                  <CardDescription className="text-yellow-600 text-sm">
                                    已使用 {usagePercent}%，即将超支
                                  </CardDescription>
                                </div>
                                <Badge variant="warning">预警</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="text-sm">
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">剩余预算</span>
                                <span className="font-medium">¥{(item.allocatedAmount - item.spentAmount).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">建议</span>
                                <span className="text-yellow-700">控制后续支出，避免超支</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
