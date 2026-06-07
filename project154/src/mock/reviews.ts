import type { Review } from '@/types/review';
import { mockUsers } from './users';

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    routeId: 'route-1',
    userId: 'user-2',
    user: mockUsers[1],
    overallRating: 4.5,
    surfaceScore: {
      pothole: 4,
      bikeLane: 5,
      traffic: 4,
    },
    safetyScore: {
      intersection: 4,
      lighting: 5,
    },
    experienceScore: {
      scenery: 5,
      challenge: 3,
      enjoyment: 5,
    },
    segmentRatings: [
      {
        segmentIndex: 0,
        segmentName: '国贸-建国门段',
        potholeScore: 4,
        bikeLaneScore: 5,
        trafficScore: 5,
        intersectionScore: 4,
        lightingScore: 5,
      },
      {
        segmentIndex: 1,
        segmentName: '建国门-天安门段',
        potholeScore: 5,
        bikeLaneScore: 5,
        trafficScore: 3,
        intersectionScore: 4,
        lightingScore: 5,
      },
      {
        segmentIndex: 2,
        segmentName: '天安门-西单段',
        potholeScore: 4,
        bikeLaneScore: 4,
        trafficScore: 4,
        intersectionScore: 4,
        lightingScore: 5,
      },
    ],
    comment: '非常棒的通勤路线！路况很好，大部分路段都有专用自行车道。早晚高峰车有点堵车注意安全。沿途经过天安门，风景没得说！',
    likes: 23,
    isLiked: false,
    createdAt: '2024-05-10T08:30:00Z',
  },
  {
    id: 'review-2',
    routeId: 'route-1',
    userId: 'user-4',
    user: mockUsers[3],
    overallRating: 4.0,
    surfaceScore: {
      pothole: 5,
      bikeLane: 4,
      traffic: 3,
    },
    safetyScore: {
      intersection: 4,
      lighting: 5,
    },
    experienceScore: {
      scenery: 4,
      challenge: 2,
      enjoyment: 4,
    },
    segmentRatings: [
      {
        segmentIndex: 0,
        segmentName: '国贸-建国门段',
        potholeScore: 5,
        bikeLaneScore: 4,
        trafficScore: 3,
        intersectionScore: 4,
        lightingScore: 5,
      },
      {
        segmentIndex: 1,
        segmentName: '建国门-西单段',
        potholeScore: 5,
        bikeLaneScore: 4,
        trafficScore: 3,
        intersectionScore: 4,
        lightingScore: 5,
      },
    ],
    comment: '每天通勤都走这条线，整体不错。就是早晚高峰人有点多，电动车也多，需要小心。建议可以早点出门避开高峰。',
    likes: 15,
    isLiked: true,
    createdAt: '2024-05-15T18:45:00Z',
  },
  {
    id: 'review-3',
    routeId: 'route-2',
    userId: 'user-1',
    user: mockUsers[0],
    overallRating: 5.0,
    surfaceScore: {
      pothole: 5,
      bikeLane: 5,
      traffic: 5,
    },
    safetyScore: {
      intersection: 5,
      lighting: 4,
    },
    experienceScore: {
      scenery: 5,
      challenge: 4,
      enjoyment: 5,
    },
    segmentRatings: [
      {
        segmentIndex: 0,
        segmentName: '南园东门-仰山段',
        potholeScore: 5,
        bikeLaneScore: 5,
        trafficScore: 5,
        intersectionScore: 5,
        lightingScore: 4,
      },
      {
        segmentIndex: 1,
        segmentName: '仰山-奥海段',
        potholeScore: 5,
        bikeLaneScore: 5,
        trafficScore: 5,
        intersectionScore: 5,
        lightingScore: 4,
      },
    ],
    comment: '奥森真的是北京骑行的天堂！全程没有机动车，太爽了！周末早上来骑几圈，呼吸新鲜空气，心情大好！绿树成荫，风景优美。就是周末人比较多，建议工作日或者早上来。',
    likes: 45,
    isLiked: false,
    createdAt: '2024-06-05T09:20:00Z',
  },
  {
    id: 'review-4',
    routeId: 'route-3',
    userId: 'user-3',
    user: mockUsers[2],
    overallRating: 4.2,
    surfaceScore: {
      pothole: 4,
      bikeLane: 3,
      traffic: 4,
    },
    safetyScore: {
      intersection: 4,
      lighting: 3,
    },
    experienceScore: {
      scenery: 5,
      challenge: 5,
      enjoyment: 4,
    },
    segmentRatings: [
      {
        segmentIndex: 0,
        segmentName: '山脚-十八盘段',
        potholeScore: 4,
        bikeLaneScore: 3,
        trafficScore: 4,
        intersectionScore: 4,
        lightingScore: 3,
        },
      {
        segmentIndex: 1,
        segmentName: '十八盘-山顶段',
        potholeScore: 4,
        bikeLaneScore: 3,
        trafficScore: 4,
        intersectionScore: 4,
        lightingScore: 3,
      },
    ],
    comment: '妙峰山果然名不虚传，确实够劲！骑了1小时45分钟登顶，很爽！山顶风景很好，可以俯瞰整个北京城。下山一定要注意安全，弯道很多！',
    likes: 67,
    isLiked: false,
    createdAt: '2024-05-28T14:10:00Z',
  },
  {
    id: 'review-5',
    routeId: 'route-2',
    userId: 'user-5',
    user: mockUsers[4],
    overallRating: 4.8,
    surfaceScore: {
      pothole: 5,
      bikeLane: 5,
      traffic: 5,
    },
    safetyScore: {
      intersection: 5,
      lighting: 5,
    },
    experienceScore: {
      scenery: 5,
      challenge: 3,
      enjoyment: 5,
    },
    segmentRatings: [],
    comment: '奥森的风景太美了，秋天来拍了好多照片。跑道很平整，安全有专用道。周末人多但秩序很好。推荐大家来！',
    likes: 32,
    isLiked: true,
    createdAt: '2024-06-12T07:00:00Z',
  },
  {
    id: 'review-6',
    routeId: 'route-6',
    userId: 'user-2',
    user: mockUsers[1],
    overallRating: 4.6,
    surfaceScore: {
      pothole: 4,
      bikeLane: 4,
      traffic: 5,
    },
    safetyScore: {
      intersection: 4,
      lighting: 4,
    },
    experienceScore: {
      scenery: 5,
      challenge: 4,
      enjoyment: 5,
    },
    segmentRatings: [],
    comment: '十三陵水库的风景真的绝了，沿途经过皇陵，很有历史感。路况不错，就是有些坡有点挑战。推荐秋天来，红叶太美了！',
    likes: 28,
    isLiked: false,
    createdAt: '2024-06-08T10:30:00Z',
  },
];

export const getReviewsByRouteId = (routeId: string): Review[] => {
  return mockReviews.filter(review => review.routeId === routeId);
};

export const getReviewsByUserId = (userId: string): Review[] => {
  return mockReviews.filter(review => review.userId === userId);
};
