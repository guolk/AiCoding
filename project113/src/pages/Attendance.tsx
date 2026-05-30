import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Hotel,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Card } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { ProgressBar } from '../components/Common/ProgressBar';
import { useStore } from '../store/useStore';
import {
  formatDate,
  getExpenseCategoryLabel,
  getTravelTypeLabel,
} from '../utils/dateUtils';
import {
  mockConferences,
  mockAttendancePlans,
  mockTravelItems,
  mockPresentations,
  mockExpenses,
  mockSubmissions,
} from '../utils/mockData';

export function Attendance() {
  const navigate = useNavigate();

  const {
    attendancePlans = [],
    travelItems = [],
    presentations = [],
    expenses = [],
    conferences = [],
    submissions = [],
  } = useStore();

  const actualPlans = attendancePlans.length > 0 ? attendancePlans : mockAttendancePlans;
  const actualTravel = travelItems.length > 0 ? travelItems : mockTravelItems;
  const actualPresentations = presentations.length > 0 ? presentations : mockPresentations;
  const actualExpenses = expenses.length > 0 ? expenses : mockExpenses;
  const actualConferences = conferences.length > 0 ? conferences : mockConferences;
  const actualSubmissions = submissions.length > 0 ? submissions : mockSubmissions;

  const totalBudget = useMemo(
    () => actualExpenses.reduce((sum, e) => sum + (e.budget || 0), 0),
    [actualExpenses]
  );
  const totalActual = useMemo(
    () => actualExpenses.reduce((sum, e) => sum + (e.actual || 0), 0),
    [actualExpenses]
  );

  return (
    <Layout title="参会准备">
      <div className="space-y-6">
        {actualPlans.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-12">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">暂无参会计划</p>
              <p className="text-sm text-gray-400">
                当您的论文被接受后，可以在这里创建参会计划
              </p>
            </Card.Body>
          </Card>
        ) : (
          actualPlans.map((plan) => {
            const conference = actualConferences.find(
              (c) => c.id === plan.conferenceId
            );
            const submission = actualSubmissions.find(
              (s) => s.id === plan.submissionId
            );
            const planTravelItems = actualTravel.filter(
              (t) => t.attendancePlanId === plan.id
            );
            const planPresentations = actualPresentations.filter(
              (p) => p.attendancePlanId === plan.id
            );
            const planExpenses = actualExpenses.filter(
              (e) => e.attendancePlanId === plan.id
            );
            const planBudget = planExpenses.reduce((sum, e) => sum + (e.budget || 0), 0);
            const planActual = planExpenses.reduce((sum, e) => sum + (e.actual || 0), 0);

            return (
              <div key={plan.id} className="space-y-6">
                <Card>
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {conference?.name || '未知会议'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(plan.conferenceStartDate)} -{' '}
                          {formatDate(plan.conferenceEndDate)}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">已接受</Badge>
                    </div>
                  </Card.Header>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <Card.Header>
                      <h3 className="text-lg font-semibold text-gray-900">行程安排</h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-4">
                        {planTravelItems.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            暂无行程安排
                          </p>
                        ) : (
                          planTravelItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                            >
                              <div
                                className={`p-2 rounded-lg ${
                                  item.confirmed
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {item.type === 'flight' ? (
                                  <Plane className="w-5 h-5" />
                                ) : item.type === 'hotel' ? (
                                  <Hotel className="w-5 h-5" />
                                ) : (
                                  <Calendar className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900">
                                    {getTravelTypeLabel(item.type)}
                                  </p>
                                  {item.confirmed ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      已确认
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      待确认
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mt-1">
                                  {item.description}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.date && formatDate(item.date)}
                                </p>
                                {item.details && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {item.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Header>
                      <h3 className="text-lg font-semibold text-gray-900">演讲/海报准备</h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-4">
                        {planPresentations.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            暂无演讲或海报
                          </p>
                        ) : (
                          planPresentations.map((pres) => (
                            <div
                              key={pres.id}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    pres.type === 'slides'
                                      ? 'bg-sky-100 text-sky-600'
                                      : 'bg-purple-100 text-purple-600'
                                  }`}
                                >
                                  {pres.type === 'slides' ? (
                                    <FileText className="w-5 h-5" />
                                  ) : (
                                    <MapPin className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {pres.type === 'slides' ? '演讲稿' : '海报'}
                                  </p>
                                  <p className="text-sm text-gray-500">{pres.title}</p>
                                </div>
                              </div>
                              <ProgressBar
                                progress={pres.progress}
                                showLabel
                                className="mb-2"
                              />
                              {pres.notes && (
                                <p className="text-sm text-gray-500">{pres.notes}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="lg:col-span-2">
                    <Card.Header>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">费用管理</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            预算：<span className="font-medium text-gray-900">¥{planBudget.toLocaleString()}</span>
                          </span>
                          <span className="text-gray-500">
                            已花费：<span className="font-medium text-sky-600">¥{planActual.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {planExpenses.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          暂无费用记录
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-sm text-gray-500">
                                <th className="pb-3 font-medium">类别</th>
                                <th className="pb-3 font-medium">描述</th>
                                <th className="pb-3 font-medium">预算</th>
                                <th className="pb-3 font-medium">实际</th>
                                <th className="pb-3 font-medium">状态</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {planExpenses.map((expense) => (
                                <tr key={expense.id}>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-gray-100 rounded">
                                        {expense.category === 'registration' ? (
                                          <CreditCard className="w-4 h-4 text-gray-600" />
                                        ) : expense.category === 'travel' ? (
                                          <Plane className="w-4 h-4 text-gray-600" />
                                        ) : expense.category === 'accommodation' ? (
                                          <Hotel className="w-4 h-4 text-gray-600" />
                                        ) : (
                                          <Receipt className="w-4 h-4 text-gray-600" />
                                        )}
                                      </div>
                                      <span className="text-gray-900">
                                        {getExpenseCategoryLabel(expense.category)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-gray-700">
                                    {expense.description}
                                  </td>
                                  <td className="py-3 text-gray-900">
                                    ¥{expense.budget.toLocaleString()}
                                  </td>
                                  <td className="py-3">
                                    {expense.actual > 0 ? (
                                      <span className="text-sky-600 font-medium">
                                        ¥{expense.actual.toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    {expense.reimbursed ? (
                                      <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        已报销
                                      </Badge>
                                    ) : expense.actual > 0 ? (
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        <Clock className="w-3 h-3 mr-1" />
                                        待报销
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-800">
                                        未支出
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
