import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';

export function useVoyageList() {
  const navigate = useNavigate();
  const voyages = useAppStore((state) => state.voyages);
  const boats = useAppStore((state) => state.boats);
  const getBoatById = useAppStore((state) => state.getBoatById);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBoat, setSelectedBoat] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVoyages = useMemo(() => {
    return voyages.filter((voyage) => {
      const matchesSearch = voyage.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voyage.startPoint.toLowerCase().includes(searchQuery.toLowerCase());
      
      const departureDate = new Date(voyage.departureTime);
      const matchesDateFrom = !dateFrom || departureDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || departureDate <= new Date(dateTo + 'T23:59:59');
      
      const matchesBoat = !selectedBoat || voyage.boatId === selectedBoat;

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesBoat;
    });
  }, [voyages, searchQuery, dateFrom, dateTo, selectedBoat]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSelectedBoat('');
  };

  const getBoatName = (boatId: string) => {
    return getBoatById(boatId)?.name || '未知船艇';
  };

  return {
    navigate,
    boats,
    filteredVoyages,
    searchQuery,
    dateFrom,
    dateTo,
    selectedBoat,
    showFilters,
    hasActiveFilters: !!(dateFrom || dateTo || selectedBoat),
    setSearchQuery,
    setDateFrom,
    setDateTo,
    setSelectedBoat,
    setShowFilters,
    clearFilters,
    getBoatName,
  };
}
