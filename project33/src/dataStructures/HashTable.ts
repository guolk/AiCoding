import { HashTableEntry, AnimationStep } from '../types'
import { createAnimationStep, hashFunction } from '../utils/helpers'

export type HashMethod = 'linear' | 'chaining'

export interface HashTableInsertResult {
  table: HashTableEntry[]
  steps: AnimationStep[]
  success: boolean
  method: HashMethod
}

export interface HashTableSearchResult {
  found: boolean
  index: number
  steps: AnimationStep[]
  value: number | null
}

export interface HashTableDeleteResult {
  table: HashTableEntry[]
  steps: AnimationStep[]
  success: boolean
}

class HashTable {
  table: HashTableEntry[]
  size: number
  method: HashMethod
  count: number

  constructor(size: number = 10, method: HashMethod = 'linear') {
    this.size = size
    this.method = method
    this.count = 0
    this.table = Array.from({ length: size }, (_, i) => ({
      key: -1,
      value: -1,
      index: i,
      status: 'empty',
      chain: method === 'chaining' ? [] : undefined,
    }))
  }

  private linearProbe(key: number): number {
    const initialIndex = hashFunction(key, this.size)
    let index = initialIndex
    let i = 1

    while (
      this.table[index].status === 'occupied' &&
      this.table[index].key !== key
    ) {
      index = (initialIndex + i) % this.size
      i++
    }

    return index
  }

  insert(key: number, value: number = key): HashTableInsertResult {
    const steps: AnimationStep[] = []

    if (this.count >= this.size && this.method === 'linear') {
      steps.push(createAnimationStep('哈希表已满，无法插入', {}))
      return { table: [...this.table], steps, success: false, method: this.method }
    }

    const initialIndex = hashFunction(key, this.size)
    steps.push(createAnimationStep(`计算哈希值：h(${key}) = ${key} % ${this.size} = ${initialIndex}`, {
      extras: { hashValue: initialIndex, key },
    }))

    if (this.method === 'linear') {
      const index = this.linearProbe(key)

      if (this.table[index].status === 'occupied' && this.table[index].key === key) {
        steps.push(createAnimationStep(`键 ${key} 已存在于索引 ${index}`, {
          extras: { index, collision: false },
        }))
        return { table: [...this.table], steps, success: false, method: this.method }
      }

      let probeCount = 0
      let currentIndex = initialIndex

      while (currentIndex !== index) {
        probeCount++
        steps.push(createAnimationStep(`索引 ${currentIndex} 已被占用，探测下一个位置`, {
          extras: { index: currentIndex, probe: probeCount, collision: true },
        }))
        currentIndex = (initialIndex + probeCount) % this.size
      }

      if (probeCount > 0) {
        steps.push(createAnimationStep(`发生冲突！探测 ${probeCount} 次后找到空闲位置 ${index}`, {
          extras: { index, collision: true, probeCount },
        }))
      }

      this.table[index] = {
        key,
        value,
        index,
        status: 'occupied',
      }

      steps.push(createAnimationStep(`将 ${key} 插入到索引 ${index}`, {
        extras: { index, key, value },
      }))

      this.count++
    } else {
      const index = initialIndex
      const entry = this.table[index]

      if (entry.status === 'empty') {
        this.table[index] = {
          key,
          value,
          index,
          status: 'occupied',
          chain: [],
        }
        steps.push(createAnimationStep(`将 ${key} 插入到索引 ${index}`, {
          extras: { index, key, value },
        }))
      } else {
        if (entry.key === key) {
          steps.push(createAnimationStep(`键 ${key} 已存在于索引 ${index}`, {
            extras: { index },
          }))
          return { table: [...this.table], steps, success: false, method: this.method }
        }

        steps.push(createAnimationStep(`索引 ${index} 已被 ${entry.key} 占用，发生冲突！`, {
          extras: { index, collision: true, existingKey: entry.key },
        }))

        if (!entry.chain) {
          entry.chain = []
        }

        const chainIndex = entry.chain.length
        entry.chain.push({
          key,
          value,
          index,
          status: 'occupied',
        })

        steps.push(createAnimationStep(`将 ${key} 链接到索引 ${index} 的链表第 ${chainIndex + 1} 位`, {
          extras: { index, chainIndex, key, value },
        }))
      }

      this.count++
    }

    return { table: [...this.table], steps, success: true, method: this.method }
  }

  search(key: number): HashTableSearchResult {
    const steps: AnimationStep[] = []
    const initialIndex = hashFunction(key, this.size)

    steps.push(createAnimationStep(`搜索键 ${key}，计算哈希值 ${initialIndex}`, {
      extras: { hashValue: initialIndex, key },
    }))

    if (this.method === 'linear') {
      let index = initialIndex
      let i = 1

      while (i <= this.size) {
        const entry = this.table[index]

        if (entry.status === 'empty') {
          steps.push(createAnimationStep(`索引 ${index} 为空，搜索失败`, {
            extras: { index, found: false },
          }))
          return { found: false, index: -1, steps, value: null }
        }

        if (entry.key === key && entry.status === 'occupied') {
          steps.push(createAnimationStep(`在索引 ${index} 找到键 ${key}`, {
            extras: { index, key, value: entry.value, found: true },
          }))
          return { found: true, index, steps, value: entry.value }
        }

        steps.push(createAnimationStep(`索引 ${index} 为 ${entry.key}，继续探测`, {
          extras: { index, currentKey: entry.key },
        }))

        index = (initialIndex + i) % this.size
        i++
      }

      steps.push(createAnimationStep(`未找到键 ${key}`, {
        extras: { found: false },
      }))
      return { found: false, index: -1, steps, value: null }
    } else {
      const entry = this.table[initialIndex]

      if (entry.status === 'empty') {
        steps.push(createAnimationStep(`索引 ${initialIndex} 为空，搜索失败`, {
          extras: { index: initialIndex, found: false },
        }))
        return { found: false, index: -1, steps, value: null }
      }

      if (entry.key === key) {
        steps.push(createAnimationStep(`在索引 ${initialIndex} 找到键 ${key}`, {
          extras: { index: initialIndex, key, value: entry.value, found: true },
        }))
        return { found: true, index: initialIndex, steps, value: entry.value }
      }

      steps.push(createAnimationStep(`索引 ${initialIndex} 为 ${entry.key}，搜索链表`, {
        extras: { index: initialIndex, currentKey: entry.key },
      }))

      if (entry.chain) {
        for (let i = 0; i < entry.chain.length; i++) {
          const chainEntry = entry.chain[i]
          steps.push(createAnimationStep(`检查链表第 ${i + 1} 位：${chainEntry.key}`, {
            extras: { chainIndex: i, key: chainEntry.key },
          }))

          if (chainEntry.key === key) {
            steps.push(createAnimationStep(`在链表第 ${i + 1} 位找到键 ${key}`, {
              extras: { index: initialIndex, chainIndex: i, key, value: chainEntry.value, found: true },
            }))
            return { found: true, index: initialIndex, steps, value: chainEntry.value }
          }
        }
      }

      steps.push(createAnimationStep(`未找到键 ${key}`, {
        extras: { found: false },
      }))
      return { found: false, index: -1, steps, value: null }
    }
  }

  delete(key: number): HashTableDeleteResult {
    const steps: AnimationStep[] = []
    const initialIndex = hashFunction(key, this.size)

    steps.push(createAnimationStep(`删除键 ${key}，计算哈希值 ${initialIndex}`, {
      extras: { hashValue: initialIndex, key },
    }))

    if (this.method === 'linear') {
      let index = initialIndex
      let i = 1

      while (i <= this.size) {
        const entry = this.table[index]

        if (entry.status === 'empty') {
          steps.push(createAnimationStep(`索引 ${index} 为空，删除失败`, {
            extras: { index, success: false },
          }))
          return { table: [...this.table], steps, success: false }
        }

        if (entry.key === key && entry.status === 'occupied') {
          this.table[index].status = 'deleted'
          steps.push(createAnimationStep(`将索引 ${index} 标记为已删除`, {
            extras: { index, key, success: true },
          }))
          this.count--
          return { table: [...this.table], steps, success: true }
        }

        index = (initialIndex + i) % this.size
        i++
      }

      steps.push(createAnimationStep(`未找到键 ${key}，删除失败`, {
        extras: { success: false },
      }))
      return { table: [...this.table], steps, success: false }
    } else {
      const entry = this.table[initialIndex]

      if (entry.status === 'empty') {
        steps.push(createAnimationStep(`索引 ${initialIndex} 为空，删除失败`, {
          extras: { index: initialIndex, success: false },
        }))
        return { table: [...this.table], steps, success: false }
      }

      if (entry.key === key) {
        if (entry.chain && entry.chain.length > 0) {
          const firstChain = entry.chain.shift()!
          entry.key = firstChain.key
          entry.value = firstChain.value
          steps.push(createAnimationStep(`将链表首元素 ${firstChain.key} 移到主表`, {
            extras: { index: initialIndex, key: firstChain.key },
          }))
        } else {
          this.table[initialIndex] = {
            key: -1,
            value: -1,
            index: initialIndex,
            status: 'empty',
            chain: [],
          }
          steps.push(createAnimationStep(`删除索引 ${initialIndex} 的元素`, {
            extras: { index: initialIndex, success: true },
          }))
        }
        this.count--
        return { table: [...this.table], steps, success: true }
      }

      if (entry.chain) {
        for (let i = 0; i < entry.chain.length; i++) {
          if (entry.chain[i].key === key) {
            entry.chain.splice(i, 1)
            steps.push(createAnimationStep(`从链表第 ${i + 1} 位删除 ${key}`, {
              extras: { index: initialIndex, chainIndex: i, key, success: true },
            }))
            this.count--
            return { table: [...this.table], steps, success: true }
          }
        }
      }

      steps.push(createAnimationStep(`未找到键 ${key}，删除失败`, {
        extras: { success: false },
      }))
      return { table: [...this.table], steps, success: false }
    }
  }
}

export default HashTable
