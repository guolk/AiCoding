import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { formatDateTime, formatDistance, formatDuration, getWindDirectionText, getWindDirectionArrow } from '../../../utils';
import type { Voyage } from '../../../types';

export function useVoyageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getVoyageById = useAppStore((state) => state.getVoyageById);
  const getBoatById = useAppStore((state) => state.getBoatById);

  const voyage = id ? getVoyageById(id) : undefined;
  const boat = voyage ? getBoatById(voyage.boatId) : undefined;

  const formatValue = (voyage: Voyage) => ({
    departureTime: formatDateTime(voyage.departureTime),
    arrivalTime: voyage.arrivalTime ? formatDateTime(voyage.arrivalTime) : '-',
    distance: formatDistance(voyage.distance),
    duration: formatDuration(voyage.duration),
    windDirectionText: getWindDirectionText(voyage.windDirection),
    windDirectionArrow: getWindDirectionArrow(voyage.windDirection),
  });

  return {
    id,
    voyage,
    boat,
    navigate,
    formatValue,
  };
}
