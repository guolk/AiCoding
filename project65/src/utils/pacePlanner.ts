import { PaceSegment } from '../types';

export const generatePacePlan = (
  targetTime: number,
  distance: number,
  courseProfile: 'flat' | 'hilly' | 'rolling' = 'flat'
): PaceSegment[] => {
  const avgPace = targetTime / 60 / distance;
  const segments: PaceSegment[] = [];
  
  let cumulativeTime = 0;
  
  for (let km = 1; km <= Math.floor(distance); km++) {
    let paceMultiplier = 1;
    
    if (courseProfile === 'flat') {
      if (km <= 5) {
        paceMultiplier = 1.03;
      } else if (km > distance - 5) {
        paceMultiplier = 0.97;
      }
    } else if (courseProfile === 'hilly') {
      if (km <= 10) {
        paceMultiplier = 1.05;
      } else if (km > 10 && km <= distance - 10) {
        paceMultiplier = 1.0;
      } else {
        paceMultiplier = 0.95;
      }
    } else if (courseProfile === 'rolling') {
      const wave = Math.sin(km * 0.3);
      paceMultiplier = 1 + wave * 0.03;
    }
    
    const pace = avgPace * paceMultiplier;
    cumulativeTime += pace * 60;
    
    segments.push({
      km,
      pace,
      cumulativeTime
    });
  }
  
  if (distance > Math.floor(distance)) {
    const lastKm = Math.floor(distance) + 1;
    const remainingDistance = distance - Math.floor(distance);
    const pace = avgPace * 0.95;
    cumulativeTime += pace * 60 * remainingDistance;
    
    segments.push({
      km: distance,
      pace,
      cumulativeTime
    });
  }
  
  return segments;
};

export const formatPacePlan = (segments: PaceSegment[]): string[] => {
  return segments.map(seg => {
    const paceMin = Math.floor(seg.pace);
    const paceSec = Math.round((seg.pace - paceMin) * 60);
    const totalMin = Math.floor(seg.cumulativeTime / 60);
    const totalSec = Math.round(seg.cumulativeTime % 60);
    
    return `第${seg.km}公里: ${paceMin}'${paceSec.toString().padStart(2, '0')}" / 累计 ${totalMin}:${totalSec.toString().padStart(2, '0')}`;
  });
};
