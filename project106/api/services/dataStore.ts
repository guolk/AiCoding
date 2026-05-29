import { initialPlots, initialPlantingLogs, initialTasks, initialPosts, initialSharing, initialTools, initialInventory, initialExpenses } from '../data/mockData';
import { Plot, PlantingLog, VolunteerTask, ForumPost, SharingPost, Tool, InventoryItem, ExpenseRecord, RotationRecord, CareRecord, PhotoRecord, HarvestRecord, Comment, BorrowRecord, ShareItem } from '../../src/types';

class DataStore {
  private plots: Plot[] = [...initialPlots];
  private plantingLogs: PlantingLog[] = [...initialPlantingLogs];
  private tasks: VolunteerTask[] = [...initialTasks];
  private posts: ForumPost[] = [...initialPosts];
  private sharing: SharingPost[] = [...initialSharing];
  private tools: Tool[] = [...initialTools];
  private inventory: InventoryItem[] = [...initialInventory];
  private expenses: ExpenseRecord[] = [...initialExpenses];

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getPlots(): Plot[] {
    return this.plots;
  }

  getPlot(id: string): Plot | undefined {
    return this.plots.find(p => p.id === id);
  }

  updatePlot(id: string, updates: Partial<Plot>): Plot | undefined {
    const index = this.plots.findIndex(p => p.id === id);
    if (index !== -1) {
      this.plots[index] = { ...this.plots[index], ...updates };
      return this.plots[index];
    }
    return undefined;
  }

  adoptPlot(plotId: string, adopter: Plot['adopter']): Plot | undefined {
    return this.updatePlot(plotId, {
      status: 'pending',
      adopter
    });
  }

  approvePlot(plotId: string): Plot | undefined {
    return this.updatePlot(plotId, { status: 'adopted' });
  }

  releasePlot(plotId: string): Plot | undefined {
    return this.updatePlot(plotId, {
      status: 'available',
      adopter: undefined,
      currentCrop: undefined
    });
  }

  addRotationRecord(plotId: string, record: Omit<RotationRecord, 'id'>): RotationRecord | undefined {
    const plot = this.getPlot(plotId);
    if (plot) {
      const newRecord: RotationRecord = { ...record, id: this.generateId('rot') };
      plot.rotationHistory.push(newRecord);
      return newRecord;
    }
    return undefined;
  }

  getPlantingLogs(): PlantingLog[] {
    return this.plantingLogs;
  }

  getPlantingLog(id: string): PlantingLog | undefined {
    return this.plantingLogs.find(l => l.id === id);
  }

  createPlantingLog(log: Omit<PlantingLog, 'id' | 'careRecords' | 'photos' | 'harvests'>): PlantingLog {
    const newLog: PlantingLog = {
      ...log,
      id: this.generateId('log'),
      careRecords: [],
      photos: [],
      harvests: []
    };
    this.plantingLogs.push(newLog);
    return newLog;
  }

  addCareRecord(logId: string, record: Omit<CareRecord, 'id'>): CareRecord | undefined {
    const log = this.getPlantingLog(logId);
    if (log) {
      const newRecord: CareRecord = { ...record, id: this.generateId('care') };
      log.careRecords.push(newRecord);
      return newRecord;
    }
    return undefined;
  }

  addPhoto(logId: string, record: Omit<PhotoRecord, 'id'>): PhotoRecord | undefined {
    const log = this.getPlantingLog(logId);
    if (log) {
      const newRecord: PhotoRecord = { ...record, id: this.generateId('photo') };
      log.photos.push(newRecord);
      return newRecord;
    }
    return undefined;
  }

  addHarvest(logId: string, record: Omit<HarvestRecord, 'id'>): HarvestRecord | undefined {
    const log = this.getPlantingLog(logId);
    if (log) {
      const newRecord: HarvestRecord = { ...record, id: this.generateId('harvest') };
      log.harvests.push(newRecord);
      return newRecord;
    }
    return undefined;
  }

  getTasks(): VolunteerTask[] {
    return this.tasks;
  }

  getTask(id: string): VolunteerTask | undefined {
    return this.tasks.find(t => t.id === id);
  }

  createTask(task: Omit<VolunteerTask, 'id'>): VolunteerTask {
    const newTask: VolunteerTask = { ...task, id: this.generateId('task') };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<VolunteerTask>): VolunteerTask | undefined {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      return this.tasks[index];
    }
    return undefined;
  }

  assignTask(taskId: string, memberName: string): VolunteerTask | undefined {
    const task = this.getTask(taskId);
    if (task && !task.assignedTo.includes(memberName)) {
      return this.updateTask(taskId, { assignedTo: [...task.assignedTo, memberName] });
    }
    return task;
  }

  unassignTask(taskId: string, memberName: string): VolunteerTask | undefined {
    const task = this.getTask(taskId);
    if (task) {
      return this.updateTask(taskId, { assignedTo: task.assignedTo.filter(n => n !== memberName) });
    }
    return undefined;
  }

  getPosts(): ForumPost[] {
    return this.posts;
  }

  getPost(id: string): ForumPost | undefined {
    return this.posts.find(p => p.id === id);
  }

  createPost(post: Omit<ForumPost, 'id' | 'likes' | 'comments' | 'createdAt'>): ForumPost {
    const newPost: ForumPost = {
      ...post,
      id: this.generateId('post'),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Comment | undefined {
    const post = this.getPost(postId);
    if (post) {
      const newComment: Comment = {
        ...comment,
        id: this.generateId('comment'),
        createdAt: new Date().toISOString()
      };
      post.comments.push(newComment);
      return newComment;
    }
    return undefined;
  }

  likePost(postId: string): ForumPost | undefined {
    const post = this.getPost(postId);
    if (post) {
      post.likes += 1;
      return post;
    }
    return undefined;
  }

  getSharingPosts(): SharingPost[] {
    return this.sharing;
  }

  createSharingPost(post: Omit<SharingPost, 'id' | 'status' | 'createdAt'>): SharingPost {
    const newPost: SharingPost = {
      ...post,
      id: this.generateId('share'),
      status: 'available',
      createdAt: new Date().toISOString()
    };
    this.sharing.unshift(newPost);
    return newPost;
  }

  updateSharingStatus(id: string, status: SharingPost['status']): SharingPost | undefined {
    const index = this.sharing.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sharing[index] = { ...this.sharing[index], status };
      return this.sharing[index];
    }
    return undefined;
  }

  getTools(): Tool[] {
    return this.tools;
  }

  getTool(id: string): Tool | undefined {
    return this.tools.find(t => t.id === id);
  }

  borrowTool(toolId: string, record: Omit<BorrowRecord, 'id' | 'returnDate'>): Tool | undefined {
    const tool = this.getTool(toolId);
    if (tool && tool.status === 'available') {
      const newRecord: BorrowRecord = { ...record, id: this.generateId('borrow') };
      tool.currentBorrower = newRecord;
      tool.borrowHistory.push(newRecord);
      tool.status = 'borrowed';
      return tool;
    }
    return undefined;
  }

  returnTool(toolId: string): Tool | undefined {
    const tool = this.getTool(toolId);
    if (tool && tool.currentBorrower) {
      const historyRecord = tool.borrowHistory.find(r => r.id === tool.currentBorrower!.id);
      if (historyRecord) {
        historyRecord.returnDate = new Date().toISOString().split('T')[0];
      }
      tool.currentBorrower = undefined;
      tool.status = 'available';
      return tool;
    }
    return undefined;
  }

  getInventory(): InventoryItem[] {
    return this.inventory;
  }

  getInventoryItem(id: string): InventoryItem | undefined {
    return this.inventory.find(i => i.id === id);
  }

  createInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: this.generateId('inv'),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.inventory.push(newItem);
    return newItem;
  }

  updateInventory(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      this.inventory[index] = {
        ...this.inventory[index],
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      return this.inventory[index];
    }
    return undefined;
  }

  getExpenses(): ExpenseRecord[] {
    return this.expenses;
  }

  createExpense(expense: Omit<ExpenseRecord, 'id' | 'status' | 'createdAt'>): ExpenseRecord {
    const newExpense: ExpenseRecord = {
      ...expense,
      id: this.generateId('exp'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.expenses.unshift(newExpense);
    return newExpense;
  }

  payShare(expenseId: string, userId: string): ExpenseRecord | undefined {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) {
      const share = expense.individualShares.find(s => s.userId === userId);
      if (share) {
        share.paid = true;
        const allPaid = expense.individualShares.every(s => s.paid);
        const somePaid = expense.individualShares.some(s => s.paid);
        expense.status = allPaid ? 'paid' : (somePaid ? 'partial' : 'pending');
      }
      return expense;
    }
    return undefined;
  }
}

export const dataStore = new DataStore();
