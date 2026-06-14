export type SpecimenType = 'mineral' | 'meteorite';

export type CrystalSystem =
  | 'cubic'
  | 'tetragonal'
  | 'orthorhombic'
  | 'hexagonal'
  | 'trigonal'
  | 'monoclinic'
  | 'triclinic'
  | 'amorphous';

export type LusterType =
  | 'metallic'
  | 'vitreous'
  | 'adamantine'
  | 'resinous'
  | 'pearly'
  | 'greasy'
  | 'silky'
  | 'dull'
  | 'earthy';

export type MeteoriteClass =
  | 'chondrite'
  | 'achondrite'
  | 'iron'
  | 'stony-iron'
  | 'other';

export type FallType = 'fall' | 'find';

export type SourceType = 'purchase' | 'field-collection' | 'exchange' | 'gift' | 'auction';

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'extremely-rare';

export type MagneticProperty = 'none' | 'weak' | 'moderate' | 'strong';

export type FluorescenceType = 'none' | 'weak' | 'moderate' | 'strong';

export type LoanStatus = 'available' | 'on-loan' | 'returned';

export interface SpecimenPhoto {
  id: string;
  url: string;
  caption?: string;
  angle: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface BaseSpecimen {
  id: string;
  name: string;
  specimenNo: string;
  type: SpecimenType;
  chemicalFormula?: string;
  crystalSystem?: CrystalSystem;
  hardnessMin?: number;
  hardnessMax?: number;
  luster?: LusterType;
  color?: string;
  streak?: string;
  cleavage?: string;
  fracture?: string;
  locality?: string;
  collectionDate?: string;
  weightG?: number;
  dimensionsMm?: string;
  description?: string;
  photos: SpecimenPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface MineralSpecimen extends BaseSpecimen {
  type: 'mineral';
  variety?: string;
  transparency?: 'opaque' | 'translucent' | 'transparent';
}

export interface MeteoriteSpecimen extends BaseSpecimen {
  type: 'meteorite';
  meteoriteClass: MeteoriteClass;
  subClassification?: string;
  fallType: FallType;
  fallDate?: string;
  findDate?: string;
  parentBody?: string;
  shockStage?: string;
  weatheringGrade?: string;
  tkw?: number;
}

export type Specimen = MineralSpecimen | MeteoriteSpecimen;

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  reputation: number;
  notes?: string;
  createdAt: string;
}

export interface AcquisitionRecord {
  id: string;
  specimenId: string;
  sourceType: SourceType;
  sourceDate: string;
  purchasePrice?: number;
  currency?: string;
  currentValuation?: number;
  supplierId?: string;
  sellerName?: string;
  exchangeWithSpecimenId?: string;
  donorName?: string;
  auctionHouse?: string;
  lotNumber?: string;
  notes?: string;
  receiptFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScientificData {
  id: string;
  specimenId: string;
  densityGcm3?: number;
  refractiveIndexMin?: number;
  refractiveIndexMax?: number;
  birefringence?: number;
  pleochroism?: string;
  magneticProperty?: MagneticProperty;
  fluorescenceUV?: FluorescenceType;
  fluorescenceUVColor?: string;
  fluorescenceLW?: FluorescenceType;
  fluorescenceSW?: FluorescenceType;
  xrdAnalysis?: {
    analyzed: boolean;
    analysisDate?: string;
    labName?: string;
    reportFileId?: string;
    peaks?: string;
    mineralIdentified?: string;
    notes?: string;
  };
  spectroscopy?: {
    raman?: string;
    infrared?: string;
    notes?: string;
  };
  chemicalAnalysis?: {
    method?: string;
    results?: string;
    labName?: string;
    analysisDate?: string;
  };
  rarity: RarityLevel;
  rarityNotes?: string;
  testDate?: string;
  labName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisplayLocation {
  id: string;
  name: string;
  type: 'cabinet' | 'drawer' | 'storage-box' | 'shelf' | 'rack';
  locationCode: string;
  description?: string;
  capacity?: number;
  parentId?: string;
}

export interface DisplayPlacement {
  id: string;
  specimenId: string;
  locationId: string;
  positionIndex: number;
  displayOrder: number;
  categoryLabel?: string;
  onDisplay: boolean;
  arrangementNotes?: string;
  placedAt: string;
  updatedAt: string;
}

export interface LoanRecord {
  id: string;
  specimenIds: string[];
  borrowerType: 'museum' | 'exhibition' | 'research' | 'other';
  borrowerName: string;
  institution?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  loanDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: LoanStatus;
  purpose?: string;
  exhibitionName?: string;
  exhibitionLocation?: string;
  conditions?: string;
  insuranceAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  category: 'crystallography' | 'formation' | 'mineral-properties' | 'meteorite-science' | 'field-guide' | 'other';
  content: string;
  tags: string[];
  relatedSpecimenIds: string[];
  references?: string;
  createdAt: string;
  updatedAt: string;
}

export const SPECIMEN_TYPE_LABELS: Record<SpecimenType, string> = {
  mineral: '矿物标本',
  meteorite: '陨石标本',
};

export const SPECIMEN_TYPE_COLORS: Record<SpecimenType, string> = {
  mineral: 'bg-emerald-100 text-emerald-700',
  meteorite: 'bg-orange-100 text-orange-700',
};

export const CRYSTAL_SYSTEM_LABELS: Record<CrystalSystem, string> = {
  cubic: '等轴晶系',
  tetragonal: '四方晶系',
  orthorhombic: '斜方晶系',
  hexagonal: '六方晶系',
  trigonal: '三方晶系',
  monoclinic: '单斜晶系',
  triclinic: '三斜晶系',
  amorphous: '非晶质',
};

export const LUSTER_LABELS: Record<LusterType, string> = {
  metallic: '金属光泽',
  vitreous: '玻璃光泽',
  adamantine: '金刚光泽',
  resinous: '树脂光泽',
  pearly: '珍珠光泽',
  greasy: '油脂光泽',
  silky: '丝绢光泽',
  dull: '暗淡光泽',
  earthy: '土状光泽',
};

export const METEORITE_CLASS_LABELS: Record<MeteoriteClass, string> = {
  chondrite: '球粒陨石',
  achondrite: '无球粒陨石',
  iron: '铁陨石',
  'stony-iron': '石铁陨石',
  other: '其他',
};

export const FALL_TYPE_LABELS: Record<FallType, string> = {
  fall: '目击降落',
  find: '发现',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  purchase: '购买',
  'field-collection': '野外采集',
  exchange: '交换',
  gift: '赠送',
  auction: '拍卖',
};

export const SOURCE_TYPE_COLORS: Record<SourceType, string> = {
  purchase: 'bg-blue-100 text-blue-700',
  'field-collection': 'bg-green-100 text-green-700',
  exchange: 'bg-purple-100 text-purple-700',
  gift: 'bg-pink-100 text-pink-700',
  auction: 'bg-amber-100 text-amber-700',
};

export const RARITY_LABELS: Record<RarityLevel, string> = {
  common: '常见',
  uncommon: '不常见',
  rare: '稀有',
  'extremely-rare': '极稀有',
};

export const RARITY_COLORS: Record<RarityLevel, string> = {
  common: 'bg-gray-100 text-gray-700',
  uncommon: 'bg-blue-100 text-blue-700',
  rare: 'bg-purple-100 text-purple-700',
  'extremely-rare': 'bg-red-100 text-red-700',
};

export const MAGNETIC_LABELS: Record<MagneticProperty, string> = {
  none: '无磁性',
  weak: '弱磁性',
  moderate: '中等磁性',
  strong: '强磁性',
};

export const FLUORESCENCE_LABELS: Record<FluorescenceType, string> = {
  none: '无',
  weak: '弱',
  moderate: '中等',
  strong: '强',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  available: '可出借',
  'on-loan': '出借中',
  returned: '已归还',
};

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  available: 'bg-green-100 text-green-700',
  'on-loan': 'bg-amber-100 text-amber-700',
  returned: 'bg-gray-100 text-gray-700',
};

export const NOTE_CATEGORY_LABELS: Record<KnowledgeNote['category'], string> = {
  crystallography: '晶体结构',
  formation: '矿物生成',
  'mineral-properties': '矿物性质',
  'meteorite-science': '陨石科学',
  'field-guide': '野外考察',
  other: '其他',
};
