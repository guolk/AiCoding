import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

const router = Router();

router.get('/tasks', (req: Request, res: Response) => {
  const tasks = dataStore.getTasks();
  res.json({ success: true, data: tasks });
});

router.get('/tasks/:id', (req: Request, res: Response) => {
  const task = dataStore.getTask(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: '任务不存在' });
  }
  res.json({ success: true, data: task });
});

router.post('/tasks', (req: Request, res: Response) => {
  const task = dataStore.createTask(req.body);
  res.json({ success: true, data: task });
});

router.put('/tasks/:id', (req: Request, res: Response) => {
  const task = dataStore.updateTask(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ success: false, error: '任务不存在' });
  }
  res.json({ success: true, data: task });
});

router.put('/tasks/:id/assign', (req: Request, res: Response) => {
  const { memberName } = req.body;
  const task = dataStore.assignTask(req.params.id, memberName);
  if (!task) {
    return res.status(400).json({ success: false, error: '分配失败' });
  }
  res.json({ success: true, data: task });
});

router.put('/tasks/:id/unassign', (req: Request, res: Response) => {
  const { memberName } = req.body;
  const task = dataStore.unassignTask(req.params.id, memberName);
  if (!task) {
    return res.status(400).json({ success: false, error: '取消分配失败' });
  }
  res.json({ success: true, data: task });
});

router.get('/posts', (req: Request, res: Response) => {
  const posts = dataStore.getPosts();
  res.json({ success: true, data: posts });
});

router.get('/posts/:id', (req: Request, res: Response) => {
  const post = dataStore.getPost(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, error: '帖子不存在' });
  }
  res.json({ success: true, data: post });
});

router.post('/posts', (req: Request, res: Response) => {
  const post = dataStore.createPost(req.body);
  res.json({ success: true, data: post });
});

router.post('/posts/:id/comment', (req: Request, res: Response) => {
  const comment = dataStore.addComment(req.params.id, req.body);
  if (!comment) {
    return res.status(400).json({ success: false, error: '评论失败' });
  }
  res.json({ success: true, data: comment });
});

router.post('/posts/:id/like', (req: Request, res: Response) => {
  const post = dataStore.likePost(req.params.id);
  if (!post) {
    return res.status(400).json({ success: false, error: '点赞失败' });
  }
  res.json({ success: true, data: post });
});

router.get('/sharing', (req: Request, res: Response) => {
  const posts = dataStore.getSharingPosts();
  res.json({ success: true, data: posts });
});

router.post('/sharing', (req: Request, res: Response) => {
  const post = dataStore.createSharingPost(req.body);
  res.json({ success: true, data: post });
});

router.put('/sharing/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  const post = dataStore.updateSharingStatus(req.params.id, status);
  if (!post) {
    return res.status(404).json({ success: false, error: '公告不存在' });
  }
  res.json({ success: true, data: post });
});

export default router;
