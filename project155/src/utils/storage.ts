/**
 * 存储工具函数
 * 提供 LocalStorage 和 IndexedDB 的封装操作
 */

/**
 * 存储键名枚举
 */
export enum StorageKey {
  PROJECTS = 'projects',
  CURRENT_PROJECT_ID = 'currentProjectId',
  USER_SETTINGS = 'userSettings',
}

/**
 * 检查 LocalStorage 是否可用
 * @returns 是否可用
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 存储数据到 LocalStorage
 * @param key 存储键名
 * @param value 存储值
 * @returns 是否存储成功
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    console.error('LocalStorage 设置失败:', e);
    return false;
  }
}

/**
 * 从 LocalStorage 获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(serialized) as T;
  } catch (e) {
    console.error('LocalStorage 获取失败:', e);
    return defaultValue ?? null;
  }
}

/**
 * 从 LocalStorage 删除数据
 * @param key 存储键名
 * @returns 是否删除成功
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('LocalStorage 删除失败:', e);
    return false;
  }
}

/**
 * 清空 LocalStorage
 * @returns 是否清空成功
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (e) {
    console.error('LocalStorage 清空失败:', e);
    return false;
  }
}

/**
 * 检查 IndexedDB 是否可用
 * @returns 是否可用
 */
export function isIndexedDBAvailable(): boolean {
  return 'indexedDB' in window;
}

/**
 * IndexedDB 数据库配置
 */
interface DBConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

/**
 * 打开 IndexedDB 数据库
 * @param config 数据库配置
 * @returns 数据库实例 Promise
 */
export function openDatabase(config: DBConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB 不可用'));
      return;
    }

    const request = indexedDB.open(config.name, config.version);

    request.onerror = () => {
      reject(new Error('打开数据库失败'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      config.stores.forEach((storeConfig) => {
        if (!db.objectStoreNames.contains(storeConfig.name)) {
          const store = db.createObjectStore(storeConfig.name, {
            keyPath: storeConfig.keyPath,
          });

          storeConfig.indexes?.forEach((indexConfig) => {
            store.createIndex(indexConfig.name, indexConfig.keyPath, {
              unique: indexConfig.unique ?? false,
            });
          });
        }
      });
    };
  });
}

/**
 * 添加数据到 IndexedDB
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param data 数据
 * @returns 添加结果 Promise
 */
export function addToDB<T>(
  db: IDBDatabase,
  storeName: string,
  data: T
): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('添加数据失败'));
  });
}

/**
 * 更新 IndexedDB 中的数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param data 数据
 * @returns 更新结果 Promise
 */
export function updateInDB<T>(
  db: IDBDatabase,
  storeName: string,
  data: T
): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('更新数据失败'));
  });
}

/**
 * 从 IndexedDB 获取数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param key 主键值
 * @returns 数据 Promise
 */
export function getFromDB<T>(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(new Error('获取数据失败'));
  });
}

/**
 * 从 IndexedDB 获取所有数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @returns 数据数组 Promise
 */
export function getAllFromDB<T>(
  db: IDBDatabase,
  storeName: string
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(new Error('获取数据失败'));
  });
}

/**
 * 使用游标遍历 IndexedDB 数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param callback 每条数据的回调函数
 * @returns 完成 Promise
 */
export function iterateDB<T>(
  db: IDBDatabase,
  storeName: string,
  callback: (value: T, cursor: IDBCursorWithValue) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        callback(cursor.value as T, cursor);
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(new Error('遍历数据失败'));
  });
}

/**
 * 从 IndexedDB 删除数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param key 主键值
 * @returns 删除结果 Promise
 */
export function deleteFromDB(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('删除数据失败'));
  });
}

/**
 * 清空 IndexedDB 存储对象
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @returns 清空结果 Promise
 */
export function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('清空数据失败'));
  });
}

/**
 * 按索引查询 IndexedDB 数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param indexName 索引名称
 * @param value 索引值
 * @returns 匹配的数据数组 Promise
 */
export function queryByIndex<T>(
  db: IDBDatabase,
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(new Error('查询数据失败'));
  });
}

/**
 * 批量添加数据到 IndexedDB
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param dataList 数据数组
 * @returns 完成 Promise
 */
export function bulkAddToDB<T>(
  db: IDBDatabase,
  storeName: string,
  dataList: T[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    let completed = 0;
    let hasError = false;

    dataList.forEach((data) => {
      const request = store.add(data);
      request.onsuccess = () => {
        completed++;
        if (completed === dataList.length && !hasError) {
          resolve();
        }
      };
      request.onerror = () => {
        hasError = true;
        reject(new Error('批量添加数据失败'));
      };
    });

    transaction.oncomplete = () => {
      if (!hasError) resolve();
    };
  });
}

/**
 * 批量更新 IndexedDB 数据
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @param dataList 数据数组
 * @returns 完成 Promise
 */
export function bulkUpdateInDB<T>(
  db: IDBDatabase,
  storeName: string,
  dataList: T[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    let completed = 0;
    let hasError = false;

    dataList.forEach((data) => {
      const request = store.put(data);
      request.onsuccess = () => {
        completed++;
        if (completed === dataList.length && !hasError) {
          resolve();
        }
      };
      request.onerror = () => {
        hasError = true;
        reject(new Error('批量更新数据失败'));
      };
    });

    transaction.oncomplete = () => {
      if (!hasError) resolve();
    };
  });
}

/**
 * 计算 IndexedDB 存储对象中的记录数
 * @param db 数据库实例
 * @param storeName 存储对象名称
 * @returns 记录数 Promise
 */
export function countRecords(
  db: IDBDatabase,
  storeName: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('统计记录数失败'));
  });
}

/**
 * 关闭数据库连接
 * @param db 数据库实例
 */
export function closeDatabase(db: IDBDatabase): void {
  db.close();
}

/**
 * 删除数据库
 * @param dbName 数据库名称
 * @returns 删除结果 Promise
 */
export function deleteDatabase(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('删除数据库失败'));
    request.onblocked = () => reject(new Error('数据库被阻塞，无法删除'));
  });
}

/**
 * 带过期时间的 LocalStorage 存储
 * @param key 存储键名
 * @param value 存储值
 * @param expiresIn 过期时间（毫秒）
 * @returns 是否存储成功
 */
export function setLocalStorageWithExpiry<T>(
  key: string,
  value: T,
  expiresIn: number
): boolean {
  try {
    const item = {
      value,
      expiry: Date.now() + expiresIn,
    };
    return setLocalStorage(key, item);
  } catch (e) {
    console.error('设置带过期时间的存储失败:', e);
    return false;
  }
}

/**
 * 获取带过期时间的 LocalStorage 数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getLocalStorageWithExpiry<T>(
  key: string,
  defaultValue?: T
): T | null {
  try {
    const item = getLocalStorage<{ value: T; expiry: number }>(key);
    if (item === null) {
      return defaultValue ?? null;
    }

    if (Date.now() > item.expiry) {
      removeLocalStorage(key);
      return defaultValue ?? null;
    }

    return item.value;
  } catch (e) {
    console.error('获取带过期时间的存储失败:', e);
    return defaultValue ?? null;
  }
}
