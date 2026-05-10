export const PLATFORMS = {
  bilibili: { label: 'B站', color: '#00a1d6', icon: 'bilibili' },
  douyin: { label: '抖音', color: '#000000', icon: 'douyin' },
  xiaohongshu: { label: '小红书', color: '#ff2442', icon: 'xiaohongshu' },
  wechat: { label: '微信公众号', color: '#07c160', icon: 'wechat' },
  youtube: { label: 'YouTube', color: '#ff0000', icon: 'youtube' }
}

export const CONTENT_TYPES = {
  video: { label: '长视频', icon: 'video-camera' },
  article: { label: '文章', icon: 'file-text' },
  short_video: { label: '短视频', icon: 'play-circle' },
  live: { label: '直播', icon: 'global' },
  audio: { label: '音频', icon: 'sound' }
}

export const CONTENT_STATUS = {
  idea: { label: '想法', color: 'default' },
  planning: { label: '规划中', color: 'processing' },
  production: { label: '制作中', color: 'warning' },
  published: { label: '已发布', color: 'success' },
  archived: { label: '已归档', color: 'default' }
}

export const REVENUE_TYPES = {
  ad: { label: '广告收益', color: 'blue' },
  cooperation: { label: '商业合作', color: 'purple' },
  paid_content: { label: '付费内容', color: 'gold' },
  tip: { label: '粉丝打赏', color: 'red' },
  commission: { label: '商品佣金', color: 'green' }
}

export const PLATFORM_LABEL_MAP = Object.entries(PLATFORMS).map(([key, val]) => ({
  value: key,
  label: val.label
}))

export const CONTENT_TYPE_LABEL_MAP = Object.entries(CONTENT_TYPES).map(([key, val]) => ({
  value: key,
  label: val.label
}))

export const CONTENT_STATUS_LABEL_MAP = Object.entries(CONTENT_STATUS).map(([key, val]) => ({
  value: key,
  label: val.label
}))

export const REVENUE_TYPE_LABEL_MAP = Object.entries(REVENUE_TYPES).map(([key, val]) => ({
  value: key,
  label: val.label
}))
