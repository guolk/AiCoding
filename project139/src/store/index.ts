import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FirstAidItem, EmergencySupply, Medicine, UsageRecord, PurchaseRecord, KnowledgeItem, FamilyConfig, InventoryCheck, ShoppingItem } from '@/types';
import { generateId } from '@/utils/helpers';

interface AppState {
  firstAidItems: FirstAidItem[];
  emergencySupplies: EmergencySupply[];
  medicines: Medicine[];
  usageRecords: UsageRecord[];
  purchaseRecords: PurchaseRecord[];
  knowledgeItems: KnowledgeItem[];
  familyConfig: FamilyConfig;
  inventoryChecks: InventoryCheck[];
  shoppingList: ShoppingItem[];

  addFirstAidItem: (item: Omit<FirstAidItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFirstAidItem: (id: string, item: Partial<FirstAidItem>) => void;
  deleteFirstAidItem: (id: string) => void;

  addEmergencySupply: (item: Omit<EmergencySupply, 'id' | 'createdAt'>) => void;
  updateEmergencySupply: (id: string, item: Partial<EmergencySupply>) => void;
  deleteEmergencySupply: (id: string) => void;
  rotateSupply: (id: string) => void;

  addMedicine: (item: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, item: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;

  addUsageRecord: (record: Omit<UsageRecord, 'id'>) => void;
  addPurchaseRecord: (record: Omit<PurchaseRecord, 'id'>) => void;

  updateFamilyConfig: (config: Partial<FamilyConfig>) => void;

  addInventoryCheck: (check: Omit<InventoryCheck, 'id'>) => void;
  updateInventoryCheck: (id: string, check: Partial<InventoryCheck>) => void;

  addToShoppingList: (item: ShoppingItem) => void;
  removeFromShoppingList: (itemId: string) => void;
  clearShoppingList: () => void;
}

const defaultFamilyConfig: FamilyConfig = {
  memberCount: 4,
  childrenCount: 1,
  elderlyCount: 1,
  supplyDays: 3,
};

const now = new Date();
const pastDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString().split('T')[0];
const futureDate = (daysFromNow: number) => new Date(now.getTime() + daysFromNow * 86400000).toISOString().split('T')[0];

const defaultFirstAidItems: FirstAidItem[] = [
  { id: 'fa1', name: '无菌纱布绷带', quantity: 5, specification: '8cm×600cm', expiryDate: futureDate(365), purpose: '包扎伤口、止血', category: 'bandage', location: '主急救箱', safeQuantity: 3, createdAt: pastDate(90), updatedAt: pastDate(90) },
  { id: 'fa2', name: '医用碘伏棉签', quantity: 20, specification: '独立包装', expiryDate: futureDate(10), purpose: '皮肤消毒', category: 'antiseptic', location: '主急救箱', safeQuantity: 10, createdAt: pastDate(180), updatedAt: pastDate(30) },
  { id: 'fa3', name: '创可贴', quantity: 30, specification: '防水型', expiryDate: futureDate(200), purpose: '小伤口覆盖', category: 'bandage', location: '主急救箱', safeQuantity: 20, createdAt: pastDate(60), updatedAt: pastDate(60) },
  { id: 'fa4', name: '三角巾', quantity: 2, specification: '96cm×96cm×136cm', expiryDate: futureDate(730), purpose: '固定肢体、悬吊', category: 'bandage', location: '主急救箱', safeQuantity: 1, createdAt: pastDate(120), updatedAt: pastDate(120) },
  { id: 'fa5', name: '一次性医用手套', quantity: 10, specification: 'M号', expiryDate: futureDate(45), purpose: '防止交叉感染', category: 'tool', location: '主急救箱', safeQuantity: 6, createdAt: pastDate(200), updatedAt: pastDate(45) },
  { id: 'fa6', name: '医用剪刀', quantity: 1, specification: '14cm', expiryDate: futureDate(1825), purpose: '剪绷带、衣物', category: 'tool', location: '主急救箱', safeQuantity: 1, createdAt: pastDate(365), updatedAt: pastDate(365) },
  { id: 'fa7', name: '酒精消毒片', quantity: 15, specification: '独立包装', expiryDate: futureDate(25), purpose: '物品表面消毒', category: 'antiseptic', location: '车载急救箱', safeQuantity: 10, createdAt: pastDate(150), updatedAt: pastDate(60) },
  { id: 'fa8', name: '止血带', quantity: 1, specification: '可调节型', expiryDate: futureDate(1095), purpose: '紧急止血', category: 'tool', location: '主急救箱', safeQuantity: 1, createdAt: pastDate(200), updatedAt: pastDate(200) },
];

const defaultEmergencySupplies: EmergencySupply[] = [
  { id: 'es1', name: '瓶装饮用水', category: 'water', quantity: 24, unit: '瓶(500ml)', expiryDate: futureDate(180), rotationDays: 180, lastRotated: pastDate(150), createdAt: pastDate(200) },
  { id: 'es2', name: '压缩饼干', category: 'food', quantity: 12, unit: '包', expiryDate: futureDate(270), rotationDays: 270, lastRotated: pastDate(100), createdAt: pastDate(180) },
  { id: 'es3', name: '5号电池', category: 'battery', quantity: 16, unit: '节', expiryDate: futureDate(730), rotationDays: 730, lastRotated: pastDate(60), createdAt: pastDate(150) },
  { id: 'es4', name: 'LED手电筒', category: 'flashlight', quantity: 2, unit: '个', expiryDate: futureDate(1825), rotationDays: 365, lastRotated: pastDate(90), createdAt: pastDate(300) },
  { id: 'es5', name: '家庭急救包', category: 'firstaid', quantity: 1, unit: '套', expiryDate: futureDate(365), rotationDays: 365, lastRotated: pastDate(30), createdAt: pastDate(120) },
  { id: 'es6', name: '自热米饭', category: 'food', quantity: 6, unit: '盒', expiryDate: futureDate(45), rotationDays: 180, lastRotated: pastDate(120), createdAt: pastDate(160) },
];

const defaultMedicines: Medicine[] = [
  { id: 'md1', name: '布洛芬缓释胶囊', type: 'otc', isChildren: false, dosage: '每次1粒，每日2次', expiryDate: futureDate(200), location: '主急救箱', locationDetail: '第一层-药品区', purpose: '退烧、止痛', quantity: 2, safeQuantity: 1 },
  { id: 'md2', name: '阿莫西林胶囊', type: 'prescription', isChildren: false, dosage: '每次2粒，每日3次', expiryDate: futureDate(30), location: '主急救箱', locationDetail: '第一层-药品区', purpose: '抗菌消炎', quantity: 1, safeQuantity: 2 },
  { id: 'md3', name: '儿童退烧糖浆', type: 'otc', isChildren: true, dosage: '按体重5-10ml', expiryDate: futureDate(90), location: '主急救箱', locationDetail: '第二层-儿童药品区', purpose: '儿童退热', quantity: 1, safeQuantity: 1 },
  { id: 'md4', name: '蒙脱石散', type: 'otc', isChildren: true, dosage: '每次1袋，每日3次', expiryDate: futureDate(150), location: '主急救箱', locationDetail: '第二层-儿童药品区', purpose: '止泻', quantity: 3, safeQuantity: 2 },
  { id: 'md5', name: '氯雷他定片', type: 'otc', isChildren: false, dosage: '每日1片', expiryDate: futureDate(300), location: '卧室抽屉', locationDetail: '药品收纳盒', purpose: '抗过敏', quantity: 1, safeQuantity: 1 },
  { id: 'md6', name: '速效救心丸', type: 'prescription', isChildren: false, dosage: '每次10-15粒', expiryDate: futureDate(15), location: '老人床头柜', locationDetail: '急救药品盒', purpose: '冠心病心绞痛急救', quantity: 1, safeQuantity: 2 },
  { id: 'md7', name: '创口消毒喷雾', type: 'otc', isChildren: false, dosage: '按需喷涂', expiryDate: futureDate(120), location: '主急救箱', locationDetail: '第一层-消毒区', purpose: '伤口消毒', quantity: 2, safeQuantity: 1 },
];

const defaultKnowledgeItems: KnowledgeItem[] = [
  {
    id: 'kn1', title: '心肺复苏(CPR)操作指南', category: '急救操作',
    content: '当发现有人突然倒地、无反应且无正常呼吸时，应立即开始CPR。按压位置在胸骨中下1/3交界处，按压深度5-6cm，频率100-120次/分钟，按压与吹气比30:2。',
    relatedItemIds: ['fa5'],
    steps: ['确认现场安全', '判断意识：拍双肩、喊名字', '呼救：拨打120', '开放气道：仰头抬颏法', '检查呼吸（5-10秒）', '胸外按压30次', '人工呼吸2次', '持续30:2循环'],
  },
  {
    id: 'kn2', title: 'AED自动体外除颤器使用', category: '急救操作',
    content: 'AED是可自动分析心律并给予电击除颤的设备，操作简单，开机后按语音提示操作即可。每延迟1分钟除颤，生存率下降7-10%。',
    relatedItemIds: ['fa5'],
    steps: ['打开AED电源', '按提示贴电极片', 'AED分析心律时勿触碰患者', '如提示需除颤，确保无人触碰患者后按电击键', '电击后立即继续CPR'],
  },
  {
    id: 'kn3', title: '外伤止血包扎方法', category: '创伤处理',
    content: '对于活动性出血，应先用无菌纱布直接压迫止血，再用绷带加压包扎。如出血不止，可在伤口近心端使用止血带，但需记录时间。',
    relatedItemIds: ['fa1', 'fa4', 'fa8'],
    steps: ['暴露伤口，评估出血情况', '用无菌纱布覆盖伤口', '直接压迫止血5-10分钟', '用绷带加压包扎', '如出血不止，使用止血带', '记录止血带使用时间', '每40-50分钟松开1-2分钟'],
  },
  {
    id: 'kn4', title: '布洛芬正确使用方法', category: '药品知识',
    content: '布洛芬是非甾体抗炎药，具有退热、镇痛、消炎作用。饭后服用可减少胃肠刺激。不宜与阿司匹林同服。',
    relatedItemIds: ['md1'],
    steps: ['确认无药物过敏史', '饭后30分钟服用', '成人每次1粒(0.3g)', '间隔不少于6小时', '24小时不超过4次', '连续使用不超过5天'],
  },
  {
    id: 'kn5', title: '烧伤烫伤急救处理', category: '创伤处理',
    content: '烫伤后应立即用流动冷水冲洗至少20分钟，降低皮肤表面温度。不要使用冰块直接冷敷，不要挑破水泡，不要涂抹牙膏酱油等偏方。',
    relatedItemIds: ['fa1', 'fa2'],
    steps: ['立即脱离热源', '流动冷水冲洗20分钟以上', '小心脱去伤处衣物及饰品', '使用无菌纱布覆盖', '不要涂抹任何药膏或偏方', '严重烧伤立即就医'],
  },
  {
    id: 'kn6', title: '儿童退热用药指南', category: '药品知识',
    content: '儿童发热超过38.5℃时可使用退烧药，推荐使用对乙酰氨基酚或布洛芬儿童制剂。禁止给儿童使用阿司匹林。用药前确认剂量按体重计算。',
    relatedItemIds: ['md3'],
    steps: ['测量体温确认≥38.5℃', '按体重计算用药剂量', '选择对应年龄的剂型', '用药后30分钟复测体温', '两次用药间隔≥4小时', '24小时不超过4次', '持续发热超过3天需就医'],
  },
  {
    id: 'kn7', title: '过敏反应应急处理', category: '急救操作',
    content: '严重过敏反应可在数分钟内危及生命。常见触发因素包括食物、药物、昆虫叮咬等。如出现呼吸困难、面部肿胀、血压下降，需立即使用肾上腺素并就医。',
    relatedItemIds: ['md5'],
    steps: ['识别过敏症状', '立即脱离过敏原', '如备有肾上腺素自动注射器，按说明使用', '拨打120', '保持患者平卧，抬高双腿', '如呕吐，侧卧位防误吸', '如呼吸停止，开始CPR'],
  },
  {
    id: 'kn8', title: '骨折临时固定方法', category: '创伤处理',
    content: '怀疑骨折时不要试图复位，应就地固定。使用夹板或硬物固定骨折部位上下两个关节，固定后检查远端血运。',
    relatedItemIds: ['fa4', 'fa1'],
    steps: ['评估伤情，确认可疑骨折', '不要移动受伤部位', '选择适当长度夹板', '夹板超过骨折上下两个关节', '用绷带或布条固定', '检查远端血运（脉搏、颜色、温度）', '冰敷减轻肿胀', '尽快送医'],
  },
];

const defaultUsageRecords: UsageRecord[] = [
  { id: 'ur1', itemId: 'fa3', itemType: 'firstaid', itemName: '创可贴', quantityUsed: 3, remainingQuantity: 30, usedAt: pastDate(5), reason: '手指切伤' },
  { id: 'ur2', itemId: 'fa2', itemType: 'firstaid', itemName: '医用碘伏棉签', quantityUsed: 5, remainingQuantity: 20, usedAt: pastDate(12), reason: '擦伤消毒' },
  { id: 'ur3', itemId: 'md1', itemType: 'medicine', itemName: '布洛芬缓释胶囊', quantityUsed: 1, remainingQuantity: 2, usedAt: pastDate(20), reason: '头痛发热' },
  { id: 'ur4', itemId: 'md3', itemType: 'medicine', itemName: '儿童退烧糖浆', quantityUsed: 1, remainingQuantity: 1, usedAt: pastDate(35), reason: '小孩发烧38.6℃' },
];

const defaultPurchaseRecords: PurchaseRecord[] = [
  { id: 'pr1', itemId: 'fa3', itemName: '创可贴', quantity: 30, price: 15.9, source: '京东', quality: 5, purchasedAt: pastDate(60) },
  { id: 'pr2', itemId: 'md1', itemName: '布洛芬缓释胶囊', quantity: 2, price: 28.5, source: '社区药店', quality: 5, purchasedAt: pastDate(90) },
  { id: 'pr3', itemId: 'es3', itemName: '5号电池', quantity: 16, price: 32, source: '淘宝', quality: 4, purchasedAt: pastDate(150) },
  { id: 'pr4', itemId: 'es1', itemName: '瓶装饮用水', quantity: 24, price: 36, source: '超市', quality: 5, purchasedAt: pastDate(200) },
];

const defaultInventoryChecks: InventoryCheck[] = [
  { id: 'ic1', date: pastDate(60), nextDate: futureDate(30), status: 'completed', checkedItems: [{ itemId: 'fa1', status: 'ok' }, { itemId: 'fa2', status: 'ok' }, { itemId: 'fa3', status: 'ok' }] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      firstAidItems: defaultFirstAidItems,
      emergencySupplies: defaultEmergencySupplies,
      medicines: defaultMedicines,
      usageRecords: defaultUsageRecords,
      purchaseRecords: defaultPurchaseRecords,
      knowledgeItems: defaultKnowledgeItems,
      familyConfig: defaultFamilyConfig,
      inventoryChecks: defaultInventoryChecks,
      shoppingList: [],

      addFirstAidItem: (item) => set((state) => ({
        firstAidItems: [...state.firstAidItems, { ...item, id: generateId(), createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] }],
      })),
      updateFirstAidItem: (id, item) => set((state) => ({
        firstAidItems: state.firstAidItems.map(i => i.id === id ? { ...i, ...item, updatedAt: new Date().toISOString().split('T')[0] } : i),
      })),
      deleteFirstAidItem: (id) => set((state) => ({
        firstAidItems: state.firstAidItems.filter(i => i.id !== id),
      })),

      addEmergencySupply: (item) => set((state) => ({
        emergencySupplies: [...state.emergencySupplies, { ...item, id: generateId(), createdAt: new Date().toISOString().split('T')[0] }],
      })),
      updateEmergencySupply: (id, item) => set((state) => ({
        emergencySupplies: state.emergencySupplies.map(i => i.id === id ? { ...i, ...item } : i),
      })),
      deleteEmergencySupply: (id) => set((state) => ({
        emergencySupplies: state.emergencySupplies.filter(i => i.id !== id),
      })),
      rotateSupply: (id) => set((state) => ({
        emergencySupplies: state.emergencySupplies.map(i => i.id === id ? { ...i, lastRotated: new Date().toISOString().split('T')[0] } : i),
      })),

      addMedicine: (item) => set((state) => ({
        medicines: [...state.medicines, { ...item, id: generateId() }],
      })),
      updateMedicine: (id, item) => set((state) => ({
        medicines: state.medicines.map(i => i.id === id ? { ...i, ...item } : i),
      })),
      deleteMedicine: (id) => set((state) => ({
        medicines: state.medicines.filter(i => i.id !== id),
      })),

      addUsageRecord: (record) => set((state) => {
        const newRecord = { ...record, id: generateId() };
        let updatedItems = state.firstAidItems;
        let updatedSupplies = state.emergencySupplies;
        let updatedMedicines = state.medicines;
        let updatedShoppingList = [...state.shoppingList];

        if (record.itemType === 'firstaid') {
          updatedItems = state.firstAidItems.map(i => i.id === record.itemId ? { ...i, quantity: Math.max(0, i.quantity - record.quantityUsed) } : i);
          const item = updatedItems.find(i => i.id === record.itemId);
          if (item && item.quantity < item.safeQuantity) {
            if (!updatedShoppingList.some(si => si.itemId === item.id)) {
              updatedShoppingList.push({ itemId: item.id, itemName: item.name, quantity: item.safeQuantity - item.quantity, type: 'firstaid' });
            }
          }
        } else if (record.itemType === 'emergency') {
          updatedSupplies = state.emergencySupplies.map(i => i.id === record.itemId ? { ...i, quantity: Math.max(0, i.quantity - record.quantityUsed) } : i);
        } else if (record.itemType === 'medicine') {
          updatedMedicines = state.medicines.map(i => i.id === record.itemId ? { ...i, quantity: Math.max(0, i.quantity - record.quantityUsed) } : i);
          const item = updatedMedicines.find(i => i.id === record.itemId);
          if (item && item.quantity < item.safeQuantity) {
            if (!updatedShoppingList.some(si => si.itemId === item.id)) {
              updatedShoppingList.push({ itemId: item.id, itemName: item.name, quantity: item.safeQuantity - item.quantity, type: 'medicine' });
            }
          }
        }

        return {
          usageRecords: [newRecord, ...state.usageRecords],
          firstAidItems: updatedItems,
          emergencySupplies: updatedSupplies,
          medicines: updatedMedicines,
          shoppingList: updatedShoppingList,
        };
      }),

      addPurchaseRecord: (record) => set((state) => ({
        purchaseRecords: [{ ...record, id: generateId() }, ...state.purchaseRecords],
      })),

      updateFamilyConfig: (config) => set((state) => ({
        familyConfig: { ...state.familyConfig, ...config },
      })),

      addInventoryCheck: (check) => set((state) => ({
        inventoryChecks: [...state.inventoryChecks, { ...check, id: generateId() }],
      })),
      updateInventoryCheck: (id, check) => set((state) => ({
        inventoryChecks: state.inventoryChecks.map(i => i.id === id ? { ...i, ...check } : i),
      })),

      addToShoppingList: (item) => set((state) => {
        const existing = state.shoppingList.find(si => si.itemId === item.itemId);
        if (existing) {
          return {
            shoppingList: state.shoppingList.map(si => si.itemId === item.itemId ? { ...si, quantity: si.quantity + item.quantity } : si),
          };
        }
        return { shoppingList: [...state.shoppingList, item] };
      }),
      removeFromShoppingList: (itemId) => set((state) => ({
        shoppingList: state.shoppingList.filter(si => si.itemId !== itemId),
      })),
      clearShoppingList: () => set({ shoppingList: [] }),
    }),
    {
      name: 'firstaid-app-storage',
    }
  )
);
