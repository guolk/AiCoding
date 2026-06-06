import { Plus, Navigation } from 'lucide-react';
import { useVoyageList } from './hooks/useVoyageList';
import VoyageCard from './components/VoyageCard';
import VoyageFilter from './components/VoyageFilter';

export default function VoyageList() {
  const {
    navigate,
    boats,
    filteredVoyages,
    searchQuery,
    dateFrom,
    dateTo,
    selectedBoat,
    showFilters,
    hasActiveFilters,
    setSearchQuery,
    setDateFrom,
    setDateTo,
    setSelectedBoat,
    setShowFilters,
    clearFilters,
    getBoatName,
  } = useVoyageList();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ocean-800">航行日志</h1>
          <p className="text-gray-500 mt-1">记录每一次航海冒险</p>
        </div>
        <button
          onClick={() => navigate('/voyages/new')}
          className="btn-accent flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增航行
        </button>
      </div>

      <VoyageFilter
        searchQuery={searchQuery}
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedBoat={selectedBoat}
        showFilters={showFilters}
        boats={boats}
        onSearchChange={setSearchQuery}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onBoatChange={setSelectedBoat}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          共 <span className="font-semibold text-ocean-700">{filteredVoyages.length}</span> 条航行记录
        </p>
      </div>

      {filteredVoyages.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-ocean-100 rounded-full flex items-center justify-center">
            <Navigation className="w-10 h-10 text-ocean-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-ocean-800 mb-2">暂无航行记录</h3>
          <p className="text-gray-500 mb-6">点击右上角按钮开始记录您的第一次航行</p>
          <button
            onClick={() => navigate('/voyages/new')}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新增航行
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoyages.map((voyage) => (
            <VoyageCard
              key={voyage.id}
              voyage={voyage}
              boatName={getBoatName(voyage.boatId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
