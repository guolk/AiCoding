import React, { useState, useCallback } from 'react';
import { Equipment, BorrowRecord } from '../types';
import { calculateMagnification, getRecommendedMagnification, formatDate } from '../utils/astronomy';
import Toast from './Toast';

const EquipmentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'calculator' | 'borrow'>('inventory');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([
    {
      id: '1',
      type: 'telescope',
      name: '8寸牛顿反射望远镜',
      brand: '星达',
      model: 'Sky-Watcher 200/1000',
      purchaseDate: '2022-06-15',
      price: 3500,
      specifications: {
        aperture: 200,
        focalLength: 1000,
        focalRatio: 'f/5',
      },
      notes: '主镜，用于深空观测和行星观测',
      available: true,
    },
    {
      id: '2',
      type: 'eyepiece',
      name: '25mm 广角目镜',
      brand: 'Tele Vue',
      model: 'Panoptic 25mm',
      purchaseDate: '2022-08-20',
      price: 1200,
      specifications: {
        eyepieceFocalLength: 25,
        apparentFieldOfView: 68,
      },
      notes: '低倍观测首选，视野开阔',
      available: true,
    },
    {
      id: '3',
      type: 'eyepiece',
      name: '10mm 目镜',
      brand: 'Orion',
      model: 'Explorer 10mm',
      purchaseDate: '2023-01-10',
      price: 500,
      specifications: {
        eyepieceFocalLength: 10,
        apparentFieldOfView: 52,
      },
      notes: '中高倍，适合行星观测',
      available: true,
    },
    {
      id: '4',
      type: 'eyepiece',
      name: '5mm 行星目镜',
      brand: 'Celestron',
      model: 'X-Cel LX 5mm',
      purchaseDate: '2023-05-05',
      price: 800,
      specifications: {
        eyepieceFocalLength: 5,
        apparentFieldOfView: 60,
      },
      notes: '高倍行星观测专用',
      available: false,
    },
    {
      id: '5',
      type: 'mount',
      name: 'EQ3D 赤道仪',
      brand: '星达',
      model: 'EQ3-D',
      purchaseDate: '2022-06-15',
      price: 2000,
      specifications: {},
      notes: '手动赤道仪，带极轴镜',
      available: true,
    },
    {
      id: '6',
      type: 'filter',
      name: 'UHC 光污染滤镜',
      brand: 'Baader',
      model: 'UHC Filter',
      purchaseDate: '2023-03-20',
      price: 600,
      specifications: {},
      notes: '有效过滤城市光污染，提升星云对比度',
      available: true,
    },
  ]);

  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([
    {
      id: '1',
      equipmentId: '4',
      equipmentName: '5mm 行星目镜',
      borrowerName: '张三',
      borrowerContact: '138****1234',
      borrowDate: '2024-08-01',
      expectedReturnDate: '2024-08-15',
      actualReturnDate: undefined,
      notes: '拿去观测木星冲日',
      returned: false,
    },
  ]);

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    type: 'telescope',
    name: '',
    brand: '',
    model: '',
    specifications: {},
    notes: '',
    available: true,
  });

  const [selectedTelescope, setSelectedTelescope] = useState<string>('1');
  const [selectedEyepiece, setSelectedEyepiece] = useState<string>('2');
  const [barlowMultiplier, setBarlowMultiplier] = useState<number>(1);
  const [objectType, setObjectType] = useState<string>('galaxy');

  const [newBorrowRecord, setNewBorrowRecord] = useState<Partial<BorrowRecord>>({
    equipmentId: '',
    equipmentName: '',
    borrowerName: '',
    borrowerContact: '',
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: '',
    returned: false,
  });

  const handleAddEquipment = () => {
    if (newEquipment.name) {
      setEquipmentList([
        ...equipmentList,
        {
          id: Date.now().toString(),
          type: newEquipment.type || 'telescope',
          name: newEquipment.name,
          brand: newEquipment.brand || '',
          model: newEquipment.model || '',
          purchaseDate: newEquipment.purchaseDate,
          price: newEquipment.price,
          specifications: newEquipment.specifications || {},
          notes: newEquipment.notes || '',
          available: true,
        },
      ]);
      setShowEquipmentForm(false);
      setNewEquipment({
        type: 'telescope',
        name: '',
        brand: '',
        model: '',
        specifications: {},
        notes: '',
        available: true,
      });
      showToast('设备添加成功！', 'success');
    } else {
      showToast('请填写设备名称！', 'error');
    }
  };

  const handleAddBorrowRecord = () => {
    if (newBorrowRecord.equipmentId && newBorrowRecord.borrowerName) {
      setBorrowRecords([
        ...borrowRecords,
        {
          id: Date.now().toString(),
          equipmentId: newBorrowRecord.equipmentId,
          equipmentName: newBorrowRecord.equipmentName || '',
          borrowerName: newBorrowRecord.borrowerName,
          borrowerContact: newBorrowRecord.borrowerContact || '',
          borrowDate: newBorrowRecord.borrowDate || new Date().toISOString().split('T')[0],
          expectedReturnDate: newBorrowRecord.expectedReturnDate || '',
          notes: newBorrowRecord.notes || '',
          returned: false,
        },
      ]);
      setEquipmentList(prev =>
        prev.map(e =>
          e.id === newBorrowRecord.equipmentId ? { ...e, available: false } : e
        )
      );
      setShowBorrowForm(false);
      setNewBorrowRecord({
        equipmentId: '',
        equipmentName: '',
        borrowerName: '',
        borrowerContact: '',
        borrowDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: '',
        notes: '',
        returned: false,
      });
      showToast('借用记录添加成功！', 'success');
    } else {
      showToast('请选择设备并填写借用人信息！', 'error');
    }
  };

  const markAsReturned = (id: string, equipmentId: string) => {
    setBorrowRecords(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, returned: true, actualReturnDate: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    setEquipmentList(prev =>
      prev.map(e =>
        e.id === equipmentId ? { ...e, available: true } : e
      )
    );
  };

  const deleteEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter(e => e.id !== id));
  };

  const telescopes = equipmentList.filter(e => e.type === 'telescope');
  const eyepieces = equipmentList.filter(e => e.type === 'eyepiece');
  const availableEquipment = equipmentList.filter(e => e.available && e.type !== 'mount' && e.type !== 'accessory');

  const selectedTelescopeData = telescopes.find(t => t.id === selectedTelescope);
  const selectedEyepieceData = eyepieces.find(e => e.id === selectedEyepiece);

  const currentMagnification = selectedTelescopeData && selectedEyepieceData
    ? calculateMagnification(
        selectedTelescopeData.specifications.focalLength || 1000,
        selectedEyepieceData.specifications.eyepieceFocalLength || 25,
        barlowMultiplier
      )
    : 0;

  const recommendedMagnifications = selectedTelescopeData
    ? getRecommendedMagnification(objectType, selectedTelescopeData.specifications.aperture || 200)
    : [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telescope': return '🔭';
      case 'eyepiece': return '👁️';
      case 'filter': return '🔘';
      case 'mount': return '⚙️';
      case 'camera': return '📷';
      case 'accessory': return '🧰';
      default: return '📦';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'telescope': return '望远镜';
      case 'eyepiece': return '目镜';
      case 'filter': return '滤镜';
      case 'mount': return '赤道仪/支架';
      case 'camera': return '相机';
      case 'accessory': return '配件';
      default: return '其他';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-star-yellow mb-6">🧰 装备管理</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'inventory' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          📋 设备清单
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'calculator' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          📐 倍率计算
        </button>
        <button
          onClick={() => setActiveTab('borrow')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === 'borrow' ? 'bg-star-yellow text-space-900 font-bold' : 'bg-space-800 text-white hover:bg-space-700'}`}
        >
          🤝 借用记录
        </button>
      </div>

      <div className="bg-space-800/50 rounded-xl p-6 backdrop-blur-sm border border-space-700">
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">我的天文设备</h3>
              <button
                onClick={() => setShowEquipmentForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all font-semibold"
              >
                + 添加设备
              </button>
            </div>

            {showEquipmentForm && (
              <div className="bg-space-700/50 rounded-xl p-6 mb-6 border border-space-600">
                <h4 className="text-lg font-semibold mb-4">添加新设备</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">设备类型</label>
                    <select
                      value={newEquipment.type}
                      onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value as any })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value="telescope">望远镜</option>
                      <option value="eyepiece">目镜</option>
                      <option value="filter">滤镜</option>
                      <option value="mount">赤道仪/支架</option>
                      <option value="camera">相机</option>
                      <option value="accessory">配件</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">设备名称</label>
                    <input
                      type="text"
                      placeholder="如: 8寸牛顿反射望远镜"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">品牌</label>
                    <input
                      type="text"
                      placeholder="如: 星达"
                      value={newEquipment.brand}
                      onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">型号</label>
                    <input
                      type="text"
                      placeholder="如: Sky-Watcher 200/1000"
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">购买日期</label>
                    <input
                      type="date"
                      value={newEquipment.purchaseDate}
                      onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">价格 (元)</label>
                    <input
                      type="number"
                      placeholder="如: 3500"
                      value={newEquipment.price}
                      onChange={(e) => setNewEquipment({ ...newEquipment, price: Number(e.target.value) })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  {(newEquipment.type === 'telescope') && (
                    <>
                      <div>
                        <label className="block text-sm text-space-400 mb-1">口径 (mm)</label>
                        <input
                          type="number"
                          placeholder="如: 200"
                          value={newEquipment.specifications?.aperture}
                          onChange={(e) => setNewEquipment({ ...newEquipment, specifications: { ...newEquipment.specifications, aperture: Number(e.target.value) } })}
                          className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-space-400 mb-1">焦距 (mm)</label>
                        <input
                          type="number"
                          placeholder="如: 1000"
                          value={newEquipment.specifications?.focalLength}
                          onChange={(e) => setNewEquipment({ ...newEquipment, specifications: { ...newEquipment.specifications, focalLength: Number(e.target.value) } })}
                          className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-space-400 mb-1">焦比</label>
                        <input
                          type="text"
                          placeholder="如: f/5"
                          value={newEquipment.specifications?.focalRatio}
                          onChange={(e) => setNewEquipment({ ...newEquipment, specifications: { ...newEquipment.specifications, focalRatio: e.target.value } })}
                          className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                        />
                      </div>
                    </>
                  )}
                  {(newEquipment.type === 'eyepiece') && (
                    <>
                      <div>
                        <label className="block text-sm text-space-400 mb-1">目镜焦距 (mm)</label>
                        <input
                          type="number"
                          placeholder="如: 25"
                          value={newEquipment.specifications?.eyepieceFocalLength}
                          onChange={(e) => setNewEquipment({ ...newEquipment, specifications: { ...newEquipment.specifications, eyepieceFocalLength: Number(e.target.value) } })}
                          className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-space-400 mb-1">表观视场 (°)</label>
                        <input
                          type="number"
                          placeholder="如: 68"
                          value={newEquipment.specifications?.apparentFieldOfView}
                          onChange={(e) => setNewEquipment({ ...newEquipment, specifications: { ...newEquipment.specifications, apparentFieldOfView: Number(e.target.value) } })}
                          className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">备注</label>
                  <textarea
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddEquipment}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowEquipmentForm(false)}
                    className="px-4 py-2 bg-space-600 hover:bg-space-500 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentList.map((equipment) => (
                <div
                  key={equipment.id}
                  className={`bg-space-700/30 rounded-lg p-4 border ${
                    equipment.available ? 'border-space-600' : 'border-red-600 bg-red-900/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getTypeIcon(equipment.type)}</span>
                      <div>
                        <h4 className="font-bold">{equipment.name}</h4>
                        <p className="text-sm text-space-400">{getTypeText(equipment.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${equipment.available ? 'bg-green-600' : 'bg-red-600'}`}>
                        {equipment.available ? '可用' : '借出'}
                      </span>
                      <button
                        onClick={() => deleteEquipment(equipment.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  {equipment.brand && (
                    <p className="text-sm text-space-300 mb-1">🏷️ {equipment.brand} {equipment.model}</p>
                  )}
                  {equipment.type === 'telescope' && equipment.specifications.aperture && (
                    <p className="text-sm text-space-300 mb-1">
                      📐 {equipment.specifications.aperture}mm / {equipment.specifications.focalLength}mm ({equipment.specifications.focalRatio})
                    </p>
                  )}
                  {equipment.type === 'eyepiece' && equipment.specifications.eyepieceFocalLength && (
                    <p className="text-sm text-space-300 mb-1">
                      👁️ {equipment.specifications.eyepieceFocalLength}mm / {equipment.specifications.apparentFieldOfView}°
                    </p>
                  )}
                  {equipment.purchaseDate && (
                    <p className="text-sm text-space-400 mb-1">📅 购买于 {formatDate(new Date(equipment.purchaseDate))}</p>
                  )}
                  {equipment.price && (
                    <p className="text-sm text-space-400 mb-1">💰 ¥{equipment.price}</p>
                  )}
                  {equipment.notes && (
                    <p className="text-sm text-space-300 italic mt-2">{equipment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div>
            <h3 className="text-xl font-semibold text-star-blue mb-6">放大倍率计算器</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-space-700/30 rounded-lg p-6 border border-space-600">
                <h4 className="font-semibold mb-4">选择设备组合</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">🔭 望远镜</label>
                    <select
                      value={selectedTelescope}
                      onChange={(e) => setSelectedTelescope(e.target.value)}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      {telescopes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">👁️ 目镜</label>
                    <select
                      value={selectedEyepiece}
                      onChange={(e) => setSelectedEyepiece(e.target.value)}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      {eyepieces.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">🔍 巴洛镜倍率</label>
                    <select
                      value={barlowMultiplier}
                      onChange={(e) => setBarlowMultiplier(Number(e.target.value))}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value={1}>无巴洛镜 (1x)</option>
                      <option value={2}>2x 巴洛镜</option>
                      <option value={3}>3x 巴洛镜</option>
                      <option value={5}>5x 巴洛镜</option>
                    </select>
                  </div>
                </div>

                {selectedTelescopeData && selectedEyepieceData && (
                  <div className="mt-6 p-4 bg-space-800/50 rounded-lg text-center">
                    <p className="text-space-400 mb-2">当前放大倍率</p>
                    <p className="text-5xl font-bold text-star-yellow">{currentMagnification}x</p>
                    <div className="mt-4 text-sm text-space-300">
                      <p>望远镜焦距: {selectedTelescopeData.specifications.focalLength}mm</p>
                      <p>目镜焦距: {selectedEyepieceData.specifications.eyepieceFocalLength}mm</p>
                      {barlowMultiplier > 1 && <p>巴洛镜: {barlowMultiplier}x</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-space-700/30 rounded-lg p-6 border border-space-600">
                <h4 className="font-semibold mb-4">推荐放大倍率</h4>
                <div className="mb-4">
                  <label className="block text-sm text-space-400 mb-1">观测目标类型</label>
                  <select
                    value={objectType}
                    onChange={(e) => setObjectType(e.target.value)}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  >
                    <option value="galaxy">🌌 星系 / 星云</option>
                    <option value="cluster">✨ 星团</option>
                    <option value="planet">🪐 行星 / 月球</option>
                    <option value="star">⭐ 双星 / 多星</option>
                  </select>
                </div>

                {selectedTelescopeData && (
                  <div className="space-y-3">
                    <p className="text-sm text-space-400 mb-2">
                      基于 {selectedTelescopeData.specifications.aperture}mm 口径推荐:
                    </p>
                    {recommendedMagnifications.map((mag, index) => {
                      const matchingEyepiece = eyepieces.find(e => {
                        const m = calculateMagnification(
                          selectedTelescopeData.specifications.focalLength || 1000,
                          e.specifications.eyepieceFocalLength || 25
                        );
                        return Math.abs(m - mag) < 20;
                      });
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-space-800/50 rounded-lg">
                          <span className="text-xl font-bold text-star-blue">{mag}x</span>
                          {matchingEyepiece && (
                            <span className="text-sm text-green-400">
                              ✓ 使用 {matchingEyepiece.specifications.eyepieceFocalLength}mm 目镜可获得
                            </span>
                          )}
                          {!matchingEyepiece && (
                            <span className="text-sm text-yellow-400">
                              ⚠️ 建议 {Math.round((selectedTelescopeData.specifications.focalLength || 1000) / mag)}mm 目镜
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 p-4 bg-space-800/30 rounded-lg text-sm text-space-300">
                  <p className="font-semibold mb-2">💡 小贴士:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>最大实用倍率 ≈ 口径(mm) × 2</li>
                    <li>最佳观测倍率 ≈ 口径(mm) × 0.5 ~ 1</li>
                    <li>深空天体适合低倍率，行星适合高倍率</li>
                    <li>视宁度差时降低倍率可获得更稳定的像</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'borrow' && (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-semibold text-star-blue">设备借用记录</h3>
              <button
                onClick={() => setShowBorrowForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all font-semibold"
              >
                + 新建借用
              </button>
            </div>

            {showBorrowForm && (
              <div className="bg-space-700/50 rounded-xl p-6 mb-6 border border-space-600">
                <h4 className="text-lg font-semibold mb-4">登记设备借用</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-space-400 mb-1">借用设备</label>
                    <select
                      value={newBorrowRecord.equipmentId}
                      onChange={(e) => {
                        const eq = equipmentList.find(equip => equip.id === e.target.value);
                        setNewBorrowRecord({
                          ...newBorrowRecord,
                          equipmentId: e.target.value,
                          equipmentName: eq?.name || '',
                        });
                      }}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    >
                      <option value="">选择设备</option>
                      {availableEquipment.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">借用人</label>
                    <input
                      type="text"
                      placeholder="姓名"
                      value={newBorrowRecord.borrowerName}
                      onChange={(e) => setNewBorrowRecord({ ...newBorrowRecord, borrowerName: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">联系方式</label>
                    <input
                      type="text"
                      placeholder="电话/微信"
                      value={newBorrowRecord.borrowerContact}
                      onChange={(e) => setNewBorrowRecord({ ...newBorrowRecord, borrowerContact: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">借出日期</label>
                    <input
                      type="date"
                      value={newBorrowRecord.borrowDate}
                      onChange={(e) => setNewBorrowRecord({ ...newBorrowRecord, borrowDate: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-space-400 mb-1">预计归还日期</label>
                    <input
                      type="date"
                      value={newBorrowRecord.expectedReturnDate}
                      onChange={(e) => setNewBorrowRecord({ ...newBorrowRecord, expectedReturnDate: e.target.value })}
                      className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-space-400 mb-1">备注</label>
                  <textarea
                    value={newBorrowRecord.notes}
                    onChange={(e) => setNewBorrowRecord({ ...newBorrowRecord, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 focus:outline-none focus:border-star-yellow"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddBorrowRecord}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowBorrowForm(false)}
                    className="px-4 py-2 bg-space-600 hover:bg-space-500 rounded-lg transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {borrowRecords.map((record) => (
                <div
                  key={record.id}
                  className={`bg-space-700/30 rounded-lg p-4 border ${
                    record.returned ? 'border-green-600 bg-green-900/10' : 'border-yellow-600 bg-yellow-900/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{record.equipmentName}</h4>
                      <p className="text-sm text-space-400">🤝 借用人: {record.borrowerName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${record.returned ? 'bg-green-600' : 'bg-yellow-600'}`}>
                        {record.returned ? '已归还' : '借出中'}
                      </span>
                      {!record.returned && (
                        <button
                          onClick={() => markAsReturned(record.id, record.equipmentId)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-all"
                        >
                          标记归还
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-space-400">📅 借出日期</p>
                      <p className="font-semibold">{formatDate(new Date(record.borrowDate))}</p>
                    </div>
                    <div>
                      <p className="text-space-400">📅 预计归还</p>
                      <p className="font-semibold">{record.expectedReturnDate ? formatDate(new Date(record.expectedReturnDate)) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-space-400">📅 实际归还</p>
                      <p className="font-semibold">{record.actualReturnDate ? formatDate(new Date(record.actualReturnDate)) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-space-400">📞 联系方式</p>
                      <p className="font-semibold">{record.borrowerContact || '-'}</p>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="text-sm text-space-300 italic mt-3">📝 {record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
};

export default EquipmentManager;
