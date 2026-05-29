import { SetStatus, ProjectStatus } from '../../types';
import { STATUS_LABELS, STATUS_COLORS, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../../utils/constants';

interface StatusBadgeProps {
  status: SetStatus | ProjectStatus;
  type?: 'set' | 'project';
}

export default function StatusBadge({ status, type = 'set' }: StatusBadgeProps) {
  const labels = type === 'set' ? STATUS_LABELS : PROJECT_STATUS_LABELS;
  const colors = type === 'set' ? STATUS_COLORS : PROJECT_STATUS_COLORS;

  return (
    <span className={`status-badge ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}
