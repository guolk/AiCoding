import { AlertTriangle, Fish, CloudLightning, Flag } from 'lucide-react';
import { formatDateTime, getEventType } from '../../../utils';
import type { Event } from '../../../types';

interface EventTimelineProps {
  events: Event[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudLightning className="w-4 h-4" />;
      case 'equipment': return <AlertTriangle className="w-4 h-4" />;
      case 'wildlife': return <Fish className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>暂无特殊事件记录</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-ocean-200" />
      <div className="space-y-6">
        {sortedEvents.map((event) => {
          const eventType = getEventType(event.type);
          return (
            <div key={event.id} className="relative flex gap-4">
              <div className={`w-10 h-10 rounded-full ${eventType.color} text-white flex items-center justify-center flex-shrink-0 z-10`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 bg-ocean-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${eventType.color} text-white`}>
                    {eventType.label}
                  </span>
                  <span className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</span>
                </div>
                <p className="text-gray-700">{event.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  坐标: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
