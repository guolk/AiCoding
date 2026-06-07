export interface City {
  name: string
  lat: number
  lng: number
}

export const cities: City[] = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '广州', lat: 23.1291, lng: 113.2644 },
  { name: '深圳', lat: 22.5431, lng: 114.0579 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '成都', lat: 30.5728, lng: 104.0668 },
  { name: '武汉', lat: 30.5928, lng: 114.3055 },
  { name: '西安', lat: 34.3416, lng: 108.9398 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
  { name: '重庆', lat: 29.4316, lng: 106.9123 },
  { name: '天津', lat: 39.0842, lng: 117.2009 },
  { name: '苏州', lat: 31.2989, lng: 120.5853 },
  { name: '青岛', lat: 36.0671, lng: 120.3826 },
  { name: '厦门', lat: 24.4798, lng: 118.0894 },
  { name: '长沙', lat: 28.2282, lng: 112.9388 },
  { name: '郑州', lat: 34.7466, lng: 113.6254 },
  { name: '济南', lat: 36.6512, lng: 117.1201 },
  { name: '大连', lat: 38.9140, lng: 121.6147 },
  { name: '沈阳', lat: 41.8045, lng: 123.4313 },
  { name: '哈尔滨', lat: 45.8038, lng: 126.5350 },
]

export const getCityByName = (name: string): City | undefined => {
  return cities.find(city => city.name === name)
}

export const getRandomCities = (count: number): City[] => {
  const shuffled = [...cities].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
