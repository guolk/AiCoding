import { useState, useMemo } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { CustomerFormModal } from './CustomerFormModal';
import { customers as mockCustomers } from '../../data/customers';
import { services } from '../../data/services';
import type { Customer } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CustomerWithStats extends Customer {
  serviceCount: number;
  lastServiceDate?: string;
}

export function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState<string[]>([]);
  const [selectedAllergyFilter, setSelectedAllergyFilter] = useState<string[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  const dietaryOptions = ['素食', '纯素', '无麸质', '低盐', '低糖', '低脂', '清真', '糖尿病饮食', '有机', '生食'];
  const allergyOptions = ['花生', '海鲜', '虾', '蟹', '小麦', '牛奶', '蛋类', '大豆', '坚果', '芒果'];

  const customersWithStats: CustomerWithStats[] = useMemo(() => {
    return customers.map(customer => {
      const customerServices = services.filter(s => s.customerId === customer.id);
      const lastService = customerServices.sort((a, b) => 
        new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
      )[0];
      return {
        ...customer,
        serviceCount: customerServices.length,
        lastServiceDate: lastService?.serviceDate,
      };
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customersWithStats.filter(customer => {
      const matchesSearch = customer.name.includes(searchTerm) || 
                           customer.phone.includes(searchTerm) ||
                           customer.email.includes(searchTerm);
      
      const matchesDietary = selectedDietaryFilter.length === 0 ||
        selectedDietaryFilter.every(filter => customer.dietaryRestrictions.includes(filter));
      
      const matchesAllergy = selectedAllergyFilter.length === 0 ||
        selectedAllergyFilter.some(filter => customer.allergies.includes(filter));
      
      return matchesSearch && matchesDietary && matchesAllergy;
    });
  }, [customersWithStats, searchTerm, selectedDietaryFilter, selectedAllergyFilter]);

  const handleAddCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleEditCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCustomer) return;
    setCustomers(prev => prev.map(c => 
      c.id === editingCustomer.id 
        ? { ...c, ...data, updatedAt: new Date().toISOString() }
        : c
    ));
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = () => {
    if (!deletingCustomerId) return;
    setCustomers(prev => prev.filter(c => c.id !== deletingCustomerId));
    setShowDeleteModal(false);
    setDeletingCustomerId(null);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowFormModal(true);
  };

  const openDeleteModal = (customerId: string) => {
    setDeletingCustomerId(customerId);
    setShowDeleteModal(true);
  };

  const toggleFilter = (type: 'dietary' | 'allergy', value: string) => {
    if (type === 'dietary') {
      setSelectedDietaryFilter(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else {
      setSelectedAllergyFilter(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  const clearFilters = () => {
    setSelectedDietaryFilter([]);
    setSelectedAllergyFilter([]);
  };

  const activeFilterCount = selectedDietaryFilter.length + selectedAllergyFilter.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-700">客户管理</h1>
          <p className="text-gray-500 mt-1">管理客户档案、饮食偏好和服务记录</p>
        </div>
        <Button onClick={() => setShowFormModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增客户
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="搜索客户姓名、电话或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                suffix={searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-primary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              />
            </div>
            <div className="relative">
              <Button 
                variant={activeFilterCount > 0 ? 'primary' : 'outline'}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
                {activeFilterCount > 0 && (
                  <Badge variant="gold" size="sm" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-primary-700">筛选条件</span>
                    {activeFilterCount > 0 && (
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-coral-500 hover:text-coral-600"
                      >
                        清除全部
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium text-primary-600 mb-2">按饮食限制</div>
                    <div className="flex flex-wrap gap-1.5">
                      {dietaryOptions.map(option => (
                        <Badge
                          key={option}
                          variant={selectedDietaryFilter.includes(option) ? 'primary' : 'outline'}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => toggleFilter('dietary', option)}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-primary-600 mb-2">按过敏史</div>
                    <div className="flex flex-wrap gap-1.5">
                      {allergyOptions.map(option => (
                        <Badge
                          key={option}
                          variant={selectedAllergyFilter.includes(option) ? 'danger' : 'outline'}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => toggleFilter('allergy', option)}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">已选筛选：</span>
              {selectedDietaryFilter.map(filter => (
                <Badge
                  key={`dietary-${filter}`}
                  variant="primary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => toggleFilter('dietary', filter)}
                >
                  {filter} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {selectedAllergyFilter.map(filter => (
                <Badge
                  key={`allergy-${filter}`}
                  variant="danger"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => toggleFilter('allergy', filter)}
                >
                  {filter} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">客户</TableHead>
                <TableHead className="hidden md:table-cell">联系电话</TableHead>
                <TableHead className="hidden lg:table-cell">邮箱</TableHead>
                <TableHead className="hidden xl:table-cell">饮食标签</TableHead>
                <TableHead className="w-[100px] text-center">服务次数</TableHead>
                <TableHead className="hidden md:table-cell">上次服务</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    暂无匹配的客户数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={customer.avatar} name={customer.name} size="md" />
                        <div>
                          <div className="font-medium text-charcoal">{customer.name}</div>
                          {customer.allergies.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {customer.allergies.slice(0, 2).map(allergy => (
                                <Badge key={allergy} variant="danger" size="sm">
                                  {allergy}
                                </Badge>
                              ))}
                              {customer.allergies.length > 2 && (
                                <Badge variant="danger" size="sm">
                                  +{customer.allergies.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-600">
                      {customer.email}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {customer.dietaryRestrictions.slice(0, 3).map(item => (
                          <Badge key={item} variant="primary" size="sm">
                            {item}
                          </Badge>
                        ))}
                        {customer.dietaryRestrictions.length > 3 && (
                          <Badge variant="primary" size="sm">
                            +{customer.dietaryRestrictions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-primary-600">
                        {customer.serviceCount}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600">
                      {customer.lastServiceDate 
                        ? format(new Date(customer.lastServiceDate), 'yyyy-MM-dd', { locale: zhCN })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-coral-500 hover:text-coral-600 hover:bg-coral-50"
                          onClick={() => openDeleteModal(customer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
        customer={editingCustomer}
      />

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCustomerId(null);
        }}
        title="确认删除"
        description="删除客户档案将同时移除相关的服务记录，此操作不可撤销。"
        size="sm"
      >
        <div className="py-4">
          <p className="text-gray-600">
            确定要删除该客户吗？
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingCustomerId(null);
            }}
          >
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteCustomer}>
            确认删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
