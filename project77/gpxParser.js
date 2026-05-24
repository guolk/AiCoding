const xml2js = require('xml2js');

function parseGPX(gpxContent) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    parser.parseString(gpxContent, (err, result) => {
      if (err) return reject(err);
      
      const points = [];
      const trk = result.gpx?.trk;
      const trkSeg = trk?.trkseg;
      const trkpts = trkSeg?.trkpt;
      
      if (!trkpts) {
        return reject(new Error('无效的GPX文件格式'));
      }
      
      const pts = Array.isArray(trkpts) ? trkpts : [trkpts];
      
      let totalDistance = 0;
      let totalElevation = 0;
      let maxSpeed = 0;
      let prevPoint = null;
      let prevTime = null;
      
      const elevationData = [];
      const distanceData = [];
      
      pts.forEach((pt, index) => {
        const lat = parseFloat(pt.lat);
        const lon = parseFloat(pt.lon);
        const ele = pt.ele ? parseFloat(pt.ele) : 0;
        const time = pt.time ? new Date(pt.time) : null;
        
        points.push({ lat, lon, ele, time });
        elevationData.push({ index, ele, distance: totalDistance });
        
        if (prevPoint) {
          const dist = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
          totalDistance += dist;
          distanceData.push(dist);
          
          if (ele > prevPoint.ele) {
            totalElevation += (ele - prevPoint.ele);
          }
          
          if (time && prevTime) {
            const timeDiff = (time - prevTime) / 3600000;
            if (timeDiff > 0) {
              const speed = dist / timeDiff;
              if (speed > maxSpeed) maxSpeed = speed;
            }
          }
        }
        
        prevPoint = { lat, lon, ele };
        prevTime = time;
      });
      
      const slopeData = calculateSlopeProfile(points, distanceData);
      
      resolve({
        points,
        totalDistance,
        totalElevation,
        maxSpeed,
        elevationData,
        slopeData,
        bounds: calculateBounds(points)
      });
    });
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateBounds(points) {
  if (points.length === 0) return null;
  
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
  points.forEach(p => {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
  });
  
  return {
    north: maxLat,
    south: minLat,
    east: maxLon,
    west: minLon,
    center: {
      lat: (minLat + maxLat) / 2,
      lon: (minLon + maxLon) / 2
    }
  };
}

function calculateSlopeProfile(points, distances) {
  const slopeData = [];
  let cumulativeDist = 0;
  
  for (let i = 1; i < points.length; i++) {
    const dist = distances[i - 1] || 0;
    cumulativeDist += dist;
    const eleDiff = points[i].ele - points[i - 1].ele;
    const slope = dist > 0 ? (eleDiff / (dist * 1000)) * 100 : 0;
    
    slopeData.push({
      distance: cumulativeDist,
      slope: Math.min(Math.max(slope, -30), 30),
      elevation: points[i].ele
    });
  }
  
  return slopeData;
}

module.exports = { parseGPX, calculateDistance };
