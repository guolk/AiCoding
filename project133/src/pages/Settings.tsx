import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input, Select, TextArea } from '@/components/ui/Input.js';
import {
  User,
  GraduationCap,
  Users,
  Settings as SettingsIcon,
  Mail,
  Phone,
  Building2,
  Plus,
  Edit3,
  Trash2,
  Save,
  Search
} from 'lucide-react';

const TABS = [
  { key: 'profile', label: '个人信息', icon: User },
  { key: 'classes', label: '班级管理', icon: GraduationCap },
  { key: 'students', label: '学生账号', icon: Users }
];

interface ClassInfo {
  id: number;
  name: string;
  studentCount: number;
  major: string;
  grade: string;
}

interface StudentInfo {
  id: number;
  name: string;
  studentNo: string;
  className: string;
  email: string;
  phone: string;
}

const mockClasses: ClassInfo[] = [
  { id: 1, name: '物理1班', studentCount: 35, major: '物理学', grade: '2024级' },
  { id: 2, name: '物理2班', studentCount: 34, major: '物理学', grade: '2024级' },
  { id: 3, name: '化学1班', studentCount: 32, major: '应用化学', grade: '2024级' },
  { id: 4, name: '电子1班', studentCount: 30, major: '电子信息', grade: '2024级' }
];

const mockStudents: StudentInfo[] = [
  { id: 1, name: '张明', studentNo: '202401001', className: '物理1班', email: 'zhangming@edu.cn', phone: '138****1001' },
  { id: 2, name: '李华', studentNo: '202401002', className: '物理1班', email: 'lihua@edu.cn', phone: '138****1002' },
  { id: 3, name: '王芳', studentNo: '202401003', className: '物理1班', email: 'wangfang@edu.cn', phone: '138****1003' },
  { id: 4, name: '刘伟', studentNo: '202401004', className: '物理1班', email: 'liuwei@edu.cn', phone: '138****1004' },
  { id: 5, name: '陈静', studentNo: '202401005', className: '物理2班', email: 'chenjing@edu.cn', phone: '138****1005' },
  { id: 6, name: '杨帆', studentNo: '202401006', className: '物理2班', email: 'yangfan@edu.cn', phone: '138****1006' },
  { id: 7, name: '赵雪', studentNo: '202402001', className: '化学1班', email: 'zhaoxue@edu.cn', phone: '138****2001' },
  { id: 8, name: '孙磊', studentNo: '202402002', className: '化学1班', email: 'sunlei@edu.cn', phone: '138****2002' },
  { id: 9, name: '周婷', studentNo: '202403001', className: '电子1班', email: 'zhouting@edu.cn', phone: '138****3001' },
  { id: 10, name: '吴强', studentNo: '202403002', className: '电子1班', email: 'wuqiang@edu.cn', phone: '138****3002' }
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [classes, setClasses] = useState<ClassInfo[]>(mockClasses);
  const [students, setStudents] = useState<StudentInfo[]>(mockStudents);
  const [classSearch, setClassSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', major: '', grade: '' });
  const [profile, setProfile] = useState({
    name: '李教授',
    title: '副教授',
    department: '物理系',
    email: 'professor@university.edu.cn',
    phone: '138****8888',
    office: '理科楼A座302室',
    bio: '主要从事大学物理实验教学与研究工作，有丰富的实验教学经验。'
  });

  const filteredClasses = classes.filter(c =>
    c.name.includes(classSearch) || c.major.includes(classSearch)
  );

  const filteredStudents = students.filter(s =>
    s.name.includes(studentSearch) || s.studentNo.includes(studentSearch) || s.className.includes(studentSearch)
  );

  const handleAddClass = () => {
    if (newClass.name && newClass.major && newClass.grade) {
      const newClassItem: ClassInfo = {
        id: Date.now(),
        ...newClass,
        studentCount: 0
      };
      setClasses([...classes, newClassItem]);
      setNewClass({ name: '', major: '', grade: '' });
      setShowAddClass(false);
    }
  };

  const handleDeleteClass = (id: number) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const handleSaveProfile = () => {
    alert('个人信息已保存');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">系统设置</h1>
          <p className="text-sm text-slate-500 mt-1">管理个人信息、班级和学生账号</p>
        </div>
      </div>

      <div className="flex bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{profile.name}</h3>
                  <p className="text-slate-500">{profile.title}</p>
                  <p className="text-sm text-slate-400">{profile.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">姓名</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">职称</label>
                  <Input
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">所属院系</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">办公地点</label>
                  <Input
                    value={profile.office}
                    onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">个人简介</label>
                <TextArea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  保存修改
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">当前版本</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">数据存储</span>
                <Badge variant="outline">本地 JSON</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">管理班级</span>
                <span className="font-medium text-slate-900">{classes.length} 个</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">学生总数</span>
                <span className="font-medium text-slate-900">
                  {classes.reduce((sum, c) => sum + c.studentCount, 0)} 人
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">实验模板</span>
                <span className="font-medium text-slate-900">3 个</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'classes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>班级管理</CardTitle>
              <Button onClick={() => setShowAddClass(!showAddClass)}>
                <Plus className="w-4 h-4 mr-2" />
                添加班级
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showAddClass && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 animate-fade-in-up">
                <h4 className="font-medium text-slate-900 mb-4">添加新班级</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">班级名称</label>
                    <Input
                      placeholder="例如：物理1班"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">专业</label>
                    <Input
                      placeholder="例如：物理学"
                      value={newClass.major}
                      onChange={(e) => setNewClass({ ...newClass, major: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
                    <Select
                      value={newClass.grade}
                      onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                    >
                      <option value="">选择年级</option>
                      <option value="2024级">2024级</option>
                      <option value="2023级">2023级</option>
                      <option value="2022级">2022级</option>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setShowAddClass(false)}>取消</Button>
                  <Button onClick={handleAddClass}>确认添加</Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="搜索班级..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">班级名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">专业</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">年级</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">学生人数</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((cls, index) => (
                    <tr
                      key={cls.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-3 px-4">
                        {editingClass?.id === cls.id ? (
                          <Input
                            value={editingClass.name}
                            onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                            className="w-32"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{cls.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cls.major}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{cls.grade}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cls.studentCount} 人</td>
                      <td className="py-3 px-4 text-right">
                        {editingClass?.id === cls.id ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setClasses(classes.map(c => c.id === cls.id ? editingClass : c));
                                setEditingClass(null);
                              }}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingClass(null)}
                            >
                              取消
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingClass(cls)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClass(cls.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">暂无班级信息</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>学生账号管理</CardTitle>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加学生
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="搜索学生姓名、学号或班级..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">学号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">姓名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">班级</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">邮箱</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">联系电话</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-3 px-4 font-mono text-sm text-slate-600">{student.studentNo}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-xs">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{student.className}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{student.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{student.phone}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">暂无学生信息</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
