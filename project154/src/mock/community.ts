import type { Share, RouteUpdate, Comment } from '@/types/community';
import { mockUsers } from './users';
import { mockRoutes } from './routes';

export const mockShares: Share[] = [
  {
    id: 'share-1',
    routeId: 'route-2',
    route: mockRoutes[1],
    userId: 'user-1',
    user: mockUsers[0],
    content: '周末早起奥森晨骑，空气清新，鸟语花香！推荐大家都来感受一下，奥森的专用道真的是骑行者的天堂！全程10公里一圈，骑个两三圈刚刚好。周末早上人少景美！',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=morning%20cycling%20in%20olympic%20forest%20park%20sunrise%20green%20trees%20peaceful&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cycling%20path%20with%20lake%20in%20park%20reflection%20morning%20light&image_size=square',
    ],
    shareLink: '/community/share/route-2',
    likes: 56,
    comments: [
      {
        id: 'comment-1',
        targetId: 'share-1',
        targetType: 'share',
        userId: 'user-2',
        user: mockUsers[1],
        content: '确实很美，下次一起骑！',
        likes: 8,
        createdAt: '2024-06-09T08:30:00Z',
      },
      {
        id: 'comment-2',
        targetId: 'share-1',
        targetType: 'share',
        userId: 'user-3',
        user: mockUsers[2],
        content: '我周末也去了，确实很棒！',
        likes: 5,
        createdAt: '2024-06-09T10:15:00Z',
      },
    ],
    isLiked: true,
    createdAt: '2024-06-08T07:30:00Z',
  },
  {
    id: 'share-2',
    routeId: 'route-3',
    route: mockRoutes[2],
    userId: 'user-3',
    user: mockUsers[2],
    content: '终于征服妙峰山！用时1小时42分，个人最好成绩！山顶风景绝美，一切辛苦都是值得的！给大家一个小建议：一定要早出发，不然太阳出来太热了。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20top%20view%20cycling%20summit%20victory%20panoramic&image_size=square',
    ],
    shareLink: '/community/share/route-3',
    likes: 128,
    comments: [
      {
        id: 'comment-3',
        targetId: 'share-2',
        targetType: 'share',
        userId: 'user-4',
        user: mockUsers[3],
        content: '太厉害了！向你学习！',
        likes: 12,
        createdAt: '2024-05-28T15:30:00Z',
      },
    ],
    isLiked: false,
    createdAt: '2024-05-25T14:00:00Z',
  },
  {
    id: 'share-3',
    routeId: 'route-4',
    route: mockRoutes[3],
    userId: 'user-5',
    user: mockUsers[4],
    content: '温榆河绿道真的是宝藏路线！沿着河边骑了35公里，一路风景如画。看到了好多水鸟，还有油菜花，太美了！强烈推荐给喜欢自然风光的骑友们！',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=riverside%20cycling%20path%20summer%20wild%20flowers%20peaceful%20river&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wetland%20birds%20sunset%20cycling%20path&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yellow%20flowers%20riverside%20spring%20scenery&image_size=square',
    ],
    shareLink: '/community/share/route-4',
    likes: 89,
    comments: [],
    isLiked: true,
    createdAt: '2024-06-02T16:30:00Z',
  },
  {
    id: 'share-4',
    routeId: 'route-6',
    route: mockRoutes[5],
    userId: 'user-2',
    user: mockUsers[1],
    content: '秋天的十三陵水库太美了！红叶满山，湖水清澈。沿着水库骑行，仿佛穿越回古代。推荐大家10月底来，绝对不虚此行！',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=autumn%20red%20leaves%20mountain%20lake%20scenic%20cycling&image_size=square',
    ],
    shareLink: '/community/share/route-6',
    likes: 72,
    comments: [
      {
        id: 'comment-4',
        targetId: 'share-4',
        targetType: 'share',
        userId: 'user-1',
        user: mockUsers[0],
        content: '收藏了，这周末就去！',
        likes: 3,
        createdAt: '2024-06-07T09:00:00Z',
      },
    ],
    isLiked: false,
    createdAt: '2024-06-01T11:00:00Z',
  },
];

export const mockUpdates: RouteUpdate[] = [
  {
    id: 'update-1',
    routeId: 'route-1',
    reporterId: 'user-4',
    reporter: mockUsers[3],
    type: 'construction',
    description: '建国门桥下方自行车道正在施工，需要绕行辅路。大概持续到本周末。',
    location: '建国门桥下',
    status: 'confirmed',
    createdAt: '2024-06-14T08:00:00Z',
    expiresAt: '2024-06-20T18:00:00Z',
  },
  {
    id: 'update-2',
    routeId: 'route-5',
    reporterId: 'user-2',
    reporter: mockUsers[1],
    type: 'detour',
    description: '中关村大街正在进行道路拓宽工程，自行车道临时改到人行道，注意避让行人。',
    location: '中关村大街',
    status: 'confirmed',
    createdAt: '2024-06-10T10:00:00Z',
    expiresAt: '2024-07-15T18:00:00Z',
  },
  {
    id: 'update-3',
    routeId: 'route-2',
    reporterId: 'user-1',
    reporter: mockUsers[0],
    type: 'other',
    description: '奥森南园南门入口处正在进行绿化施工，建议从东门进入。',
    location: '奥森南园南门',
    status: 'resolved',
    createdAt: '2024-06-05T09:00:00Z',
    expiresAt: '2024-06-08T18:00:00Z',
  },
  {
    id: 'update-4',
    routeId: 'route-3',
    reporterId: 'user-5',
    reporter: mockUsers[4],
    type: 'accident',
    description: '妙峰山半山腰处发生小型山体落石，请路过的骑友注意安全，减速慢行。',
    location: '妙峰山K12公里处',
    status: 'pending',
    createdAt: '2024-06-13T12:00:00Z',
    expiresAt: '2024-06-27T18:00:00Z',
  },
];

export const getSharesByRouteId = (routeId: string): Share[] => {
  return mockShares.filter(share => share.routeId === routeId);
};

export const getUpdatesByRouteId = (routeId: string): RouteUpdate[] => {
  return mockUpdates.filter(update => update.routeId === routeId);
};

export const getShareById = (id: string): Share | undefined => {
  return mockShares.find(share => share.id === id);
};
