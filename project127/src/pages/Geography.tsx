
import { useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import type { Continent, Country, City, Race } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import {
  Globe,
  Map,
  Users,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Building2,
  Flag,
  Mountain
} from 'lucide-react';

type TabType = 'continents' | 'races';

const Geography = () => {
  const [activeTab, setActiveTab] = useState<TabType>('continents');
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const {
    worldSetting,
    continents,
    countries,
    cities,
    races,
    addContinent,
    updateContinent,
    deleteContinent,
    addCountry,
    updateCountry,
    deleteCountry,
    addCity,
    updateCity,
    deleteCity,
    addRace,
    updateRace,
    deleteRace
  } = useWorldStore();

  const [showContinentModal, setShowContinentModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);

  const [editingContinent, setEditingContinent] = useState<Continent | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingRace, setEditingRace] = useState<Race | null>(null);

  if (!worldSetting) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            尚未创建世界
          </h2>
          <p className="text-gray-400">请先在仪表盘创建一个新世界</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'continents', label: '地理层级', icon: <Map className="w-5 h-5" /> },
    { key: 'races', label: '种族管理', icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          地理与文明
        </h1>
        <p className="text-gray-400">管理大陆、国家、城市和种族</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-gray-400 hover:text-gray-200 bg-dark-card border border-dark-border'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'continents' && (
        <GeographyHierarchy
          continents={continents}
          countries={countries}
          cities={cities}
          selectedContinent={selectedContinent}
          selectedCountry={selectedCountry}
          onSelectContinent={setSelectedContinent}
          onSelectCountry={setSelectedCountry}
          onAddContinent={() => {
            setEditingContinent(null);
            setShowContinentModal(true);
          }}
          onEditContinent={(c) => {
            setEditingContinent(c);
            setShowContinentModal(true);
          }}
          onDeleteContinent={deleteContinent}
          onAddCountry={() => {
            setEditingCountry(null);
            setShowCountryModal(true);
          }}
          onEditCountry={(c) => {
            setEditingCountry(c);
            setShowCountryModal(true);
          }}
          onDeleteCountry={deleteCountry}
          onAddCity={() => {
            setEditingCity(null);
            setShowCityModal(true);
          }}
          onEditCity={(c) => {
            setEditingCity(c);
            setShowCityModal(true);
          }}
          onDeleteCity={deleteCity}
        />
      )}

      {activeTab === 'races' && (
        <RaceList
          races={races}
          onAdd={() => {
            setEditingRace(null);
            setShowRaceModal(true);
          }}
          onEdit={(r) => {
            setEditingRace(r);
            setShowRaceModal(true);
          }}
          onDelete={deleteRace}
        />
      )}

      <ContinentModal
        isOpen={showContinentModal}
        onClose={() => {
          setShowContinentModal(false);
          setEditingContinent(null);
        }}
        continent={editingContinent}
        onSave={(data) => {
          if (editingContinent) {
            updateContinent(editingContinent.id, data);
          } else {
            addContinent(data);
          }
          setShowContinentModal(false);
          setEditingContinent(null);
        }}
      />

      <CountryModal
        isOpen={showCountryModal}
        onClose={() => {
          setShowCountryModal(false);
          setEditingCountry(null);
        }}
        country={editingCountry}
        continents={continents}
        selectedContinentId={selectedContinent?.id}
        onSave={(data) => {
          if (editingCountry) {
            updateCountry(editingCountry.id, data);
          } else {
            addCountry(data);
          }
          setShowCountryModal(false);
          setEditingCountry(null);
        }}
      />

      <CityModal
        isOpen={showCityModal}
        onClose={() => {
          setShowCityModal(false);
          setEditingCity(null);
        }}
        city={editingCity}
        countries={countries}
        selectedCountryId={selectedCountry?.id}
        onSave={(data) => {
          if (editingCity) {
            updateCity(editingCity.id, data);
          } else {
            addCity(data);
          }
          setShowCityModal(false);
          setEditingCity(null);
        }}
      />

      <RaceModal
        isOpen={showRaceModal}
        onClose={() => {
          setShowRaceModal(false);
          setEditingRace(null);
        }}
        race={editingRace}
        onSave={(data) => {
          if (editingRace) {
            updateRace(editingRace.id, data);
          } else {
            addRace(data);
          }
          setShowRaceModal(false);
          setEditingRace(null);
        }}
      />
    </div>
  );
};

const GeographyHierarchy = ({
  continents,
  countries,
  cities,
  selectedContinent,
  selectedCountry,
  onSelectContinent,
  onSelectCountry,
  onAddContinent,
  onEditContinent,
  onDeleteContinent,
  onAddCountry,
  onEditCountry,
  onDeleteCountry,
  onAddCity,
  onEditCity,
  onDeleteCity
}: {
  continents: Continent[];
  countries: Country[];
  cities: City[];
  selectedContinent: Continent | null;
  selectedCountry: Country | null;
  onSelectContinent: (c: Continent | null) => void;
  onSelectCountry: (c: Country | null) => void;
  onAddContinent: () => void;
  onEditContinent: (c: Continent) => void;
  onDeleteContinent: (id: string) => void;
  onAddCountry: () => void;
  onEditCountry: (c: Country) => void;
  onDeleteCountry: (id: string) => void;
  onAddCity: () => void;
  onEditCity: (c: City) => void;
  onDeleteCity: (id: string) => void;
}) => {
  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      <div className="col-span-3 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-gold flex items-center gap-2">
            <Mountain className="w-5 h-5" />
            大陆
          </h3>
          <Button size="sm" onClick={onAddContinent} icon={<Plus className="w-4 h-4" />}>
            添加
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {continents.length > 0 ? (
            continents.map((continent) => {
              const continentCountries = countries.filter(c => c.continentId === continent.id);
              return (
                <div key={continent.id}>
                  <button
                    onClick={() => {
                      onSelectContinent(continent);
                      onSelectCountry(null);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-dark-bg/50 transition-colors ${
                      selectedContinent?.id === continent.id
                        ? 'bg-gold/10 border-r-2 border-gold'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{continent.name}</p>
                      <p className="text-xs text-gray-500">{continentCountries.length} 个国家</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditContinent(continent);
                        }}
                        className="p-1 text-gray-400 hover:text-gold"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContinent(continent.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                  {selectedContinent?.id === continent.id && continentCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => onSelectCountry(country)}
                      className={`w-full text-left pl-8 pr-4 py-2 flex items-center justify-between hover:bg-dark-bg/50 transition-colors ${
                        selectedCountry?.id === country.id
                          ? 'bg-magic-cyan/10'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-300 text-sm">{country.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCountry(country);
                          }}
                          className="p-1 text-gray-400 hover:text-gold"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCountry(country.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Mountain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无大陆</p>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-9 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-gold">
            {selectedCountry ? (
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {selectedCountry.name} - 城市
              </span>
            ) : selectedContinent ? (
              <span className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                {selectedContinent.name} - 国家
              </span>
            ) : (
              '详情'
            )}
          </h3>
          {selectedCountry && (
            <Button size="sm" onClick={onAddCity} icon={<Plus className="w-4 h-4" />}>
              添加城市
            </Button>
          )}
          {selectedContinent && !selectedCountry && (
            <Button size="sm" onClick={onAddCountry} icon={<Plus className="w-4 h-4" />}>
              添加国家
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCountry ? (
            <CityList
              cities={cities.filter(c => c.countryId === selectedCountry.id)}
              onEdit={onEditCity}
              onDelete={onDeleteCity}
            />
          ) : selectedContinent ? (
            <CountryList
              countries={countries.filter(c => c.continentId === selectedContinent.id)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>选择一个大陆或国家查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CountryList = ({ countries }: { countries: Country[] }) => {
  if (countries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>这个大陆还没有国家</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {countries.map((country) => (
        <Card key={country.id}>
          <h4 className="font-display text-lg font-semibold text-white mb-3">{country.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">首都</span>
              <span className="text-white">{country.capital || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">政体</span>
              <span className="text-white">{country.government || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">人口</span>
              <span className="text-white">{country.population || '-'}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const CityList = ({
  cities,
  onEdit,
  onDelete
}: {
  cities: City[];
  onEdit: (c: City) => void;
  onDelete: (id: string) => void;
}) => {
  if (cities.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>这个国家还没有城市</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {cities.map((city) => (
        <Card key={city.id}>
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-display text-lg font-semibold text-white">{city.name}</h4>
            <div className="flex gap-1">
              <button onClick={() => onEdit(city)} className="p-1 text-gray-400 hover:text-gold">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(city.id)} className="p-1 text-gray-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-3">{city.description}</p>
          {city.notableLocations.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">重要地点</p>
              <div className="flex flex-wrap gap-1">
                {city.notableLocations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-dark-bg text-gold text-xs rounded"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

const RaceList = ({
  races,
  onAdd,
  onEdit,
  onDelete
}: {
  races: Race[];
  onAdd: () => void;
  onEdit: (r: Race) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={onAdd} icon={<Plus className="w-4 h-4" />}>
          添加种族
        </Button>
      </div>
      {races.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map((race) => (
            <Card key={race.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-magic-cyan to-tech-purple flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-white">{race.name}</h4>
                    <p className="text-xs text-gray-500">寿命: {race.lifespan || '未知'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(race)} className="p-1 text-gray-400 hover:text-gold">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(race.id)} className="p-1 text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">身体特征</p>
                  <p className="text-sm text-gray-300">{race.physicalTraits}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">文化特征</p>
                  <p className="text-sm text-gray-300">{race.culturalTraits}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="mb-4">暂无种族定义</p>
          <Button onClick={onAdd} icon={<Plus className="w-4 h-4" />}>
            创建第一个种族
          </Button>
        </div>
      )}
    </div>
  );
};

const ContinentModal = ({
  isOpen,
  onClose,
  continent,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  continent: Continent | null;
  onSave: (data: Omit<Continent, 'id'>) => void;
}) => {
  const [name, setName] = useState(continent?.name || '');
  const [description, setDescription] = useState(continent?.description || '');
  const [geography, setGeography] = useState(continent?.geography || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={continent ? '编辑大陆' : '添加大陆'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => onSave({ name, description, geography })} disabled={!name.trim()}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">大陆名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：艾泽拉斯大陆"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个大陆的整体特点..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">地理特征</label>
          <textarea
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述山脉、河流、气候等地理特征..."
          />
        </div>
      </div>
    </Modal>
  );
};

const CountryModal = ({
  isOpen,
  onClose,
  country,
  continents,
  selectedContinentId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  continents: Continent[];
  selectedContinentId?: string;
  onSave: (data: Omit<Country, 'id'>) => void;
}) => {
  const [continentId, setContinentId] = useState(country?.continentId || selectedContinentId || '');
  const [name, setName] = useState(country?.name || '');
  const [capital, setCapital] = useState(country?.capital || '');
  const [government, setGovernment] = useState(country?.government || '');
  const [population, setPopulation] = useState(country?.population || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={country ? '编辑国家' : '添加国家'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ continentId, name, capital, government, population })}
            disabled={!name.trim() || !continentId}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">所属大陆</label>
          <select
            value={continentId}
            onChange={(e) => setContinentId(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">选择大陆...</option>
            {continents.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">国家名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：暴风王国"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">首都</label>
            <input
              type="text"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="首都名称"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">政体</label>
            <input
              type="text"
              value={government}
              onChange={(e) => setGovernment(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
              placeholder="例如：君主立宪制"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">人口</label>
          <input
            type="text"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：约500万"
          />
        </div>
      </div>
    </Modal>
  );
};

const CityModal = ({
  isOpen,
  onClose,
  city,
  countries,
  selectedCountryId,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
  countries: Country[];
  selectedCountryId?: string;
  onSave: (data: Omit<City, 'id'>) => void;
}) => {
  const [countryId, setCountryId] = useState(city?.countryId || selectedCountryId || '');
  const [name, setName] = useState(city?.name || '');
  const [description, setDescription] = useState(city?.description || '');
  const [locationsText, setLocationsText] = useState(city?.notableLocations.join('\n') || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={city ? '编辑城市' : '添加城市'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({
              countryId,
              name,
              description,
              notableLocations: locationsText.split('\n').filter(l => l.trim())
            })}
            disabled={!name.trim() || !countryId}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">所属国家</label>
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">选择国家...</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">城市名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：暴风城"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述这个城市的特点..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">重要地点（每行一个）</label>
          <textarea
            value={locationsText}
            onChange={(e) => setLocationsText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="例如：&#10;国王城堡&#10;暴风要塞"
          />
        </div>
      </div>
    </Modal>
  );
};

const RaceModal = ({
  isOpen,
  onClose,
  race,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  race: Race | null;
  onSave: (data: Omit<Race, 'id'>) => void;
}) => {
  const [name, setName] = useState(race?.name || '');
  const [physicalTraits, setPhysicalTraits] = useState(race?.physicalTraits || '');
  const [culturalTraits, setCulturalTraits] = useState(race?.culturalTraits || '');
  const [lifespan, setLifespan] = useState(race?.lifespan || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={race ? '编辑种族' : '添加种族'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSave({ name, physicalTraits, culturalTraits, lifespan })}
            disabled={!name.trim()}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">种族名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：精灵族、人族、矮人"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">平均寿命</label>
          <input
            type="text"
            value={lifespan}
            onChange={(e) => setLifespan(e.target.value)}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
            placeholder="例如：80-100岁、永生"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">身体特征</label>
          <textarea
            value={physicalTraits}
            onChange={(e) => setPhysicalTraits(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述外貌、体型、特殊生理特征..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">文化特征</label>
          <textarea
            value={culturalTraits}
            onChange={(e) => setCulturalTraits(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold resize-none"
            placeholder="描述价值观、社会结构、传统..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default Geography;
