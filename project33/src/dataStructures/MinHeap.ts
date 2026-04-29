import { AnimationStep, HeapNode } from '../types'
import { createAnimationStep, getParentIndex, getLeftChildIndex, getRightChildIndex } from '../utils/helpers'

export interface HeapInsertResult {
  heap: number[]
  steps: AnimationStep[]
}

export interface HeapExtractResult {
  value: number | null
  heap: number[]
  steps: AnimationStep[]
}

class MinHeap {
  heap: Array<number>

  constructor(initialValues: Array<number> = []) {
    this.heap = []
    for (const value of initialValues) {
      this.insert(value)
    }
  }

  insert(value: number): HeapInsertResult {
    const steps: AnimationStep[] = []
    const heapArray = this.heap as Array<number>

    steps.push(createAnimationStep(`插入值 ${value}`, {
      extras: { action: 'insert', value },
    }))

    heapArray.push(value)
    const insertIndex = heapArray.length - 1

    steps.push(createAnimationStep(`将 ${value} 放在数组末尾 (索引 ${insertIndex})`, {
      extras: { index: insertIndex, value, heapState: [...heapArray] },
    }))

    let currentIndex = insertIndex

    while (currentIndex > 0) {
      const parentIdx = getParentIndex(currentIndex)
      const currentValue = heapArray[currentIndex]
      const parentValue = heapArray[parentIdx]
      
      steps.push(createAnimationStep(`比较索引 ${currentIndex} (${currentValue}) 与父节点 ${parentIdx} (${parentValue})`, {
        extras: { 
          currentIndex, 
          currentValue,
          parentIndex: parentIdx,
          parentValue,
        },
      }))

      if (currentValue < parentValue) {
        steps.push(createAnimationStep(`${currentValue} < ${parentValue}，需要交换`, {
          extras: { 
            swap: true,
            index1: currentIndex,
            value1: currentValue,
            index2: parentIdx,
            value2: parentValue,
          },
        }))

        ;[heapArray[currentIndex], heapArray[parentIdx]] = 
        [heapArray[parentIdx], heapArray[currentIndex]]

        steps.push(createAnimationStep(`交换完成`, {
          extras: { 
            heapState: [...heapArray],
            swapped: true,
          },
        }))

        currentIndex = parentIdx
      } else {
        steps.push(createAnimationStep(`${currentValue} >= ${parentValue}，堆化完成`, {
          extras: { heapState: [...heapArray], done: true },
        }))
        break
      }
    }

    if (currentIndex === 0 && insertIndex !== 0) {
      steps.push(createAnimationStep(`已到达根节点，堆化完成`, {
        extras: { heapState: [...heapArray], done: true },
      }))
    }

    return { heap: [...heapArray], steps }
  }

  extractMin(): HeapExtractResult {
    const steps: AnimationStep[] = []
    const heapArray = this.heap as Array<number>

    if (heapArray.length === 0) {
      steps.push(createAnimationStep('堆为空，无法提取', {}))
      return { value: null, heap: [], steps }
    }

    const minValue = heapArray[0]
    steps.push(createAnimationStep(`提取最小值 ${minValue} (根节点)`, {
      extras: { minValue, heapState: [...heapArray] },
    }))

    if (heapArray.length === 1) {
      heapArray.pop()
      steps.push(createAnimationStep('堆已为空', {
        extras: { heapState: [], done: true },
      }))
      return { value: minValue, heap: [], steps }
    }

    const lastValue = heapArray[heapArray.length - 1]
    heapArray[0] = lastValue
    heapArray.pop()

    steps.push(createAnimationStep(`将最后一个元素 ${lastValue} 移到根节点`, {
      extras: { lastValue, heapState: [...heapArray] },
    }))

    let currentIndex = 0

    while (true) {
      const leftChildIdx = getLeftChildIndex(currentIndex)
      const rightChildIdx = getRightChildIndex(currentIndex)
      let smallestIdx = currentIndex
      const currentValue = heapArray[currentIndex]

      steps.push(createAnimationStep(`当前节点：索引 ${currentIndex} (${currentValue})`, {
        extras: { 
          currentIndex, 
          currentValue,
          leftChild: leftChildIdx < heapArray.length ? { index: leftChildIdx, value: heapArray[leftChildIdx] } : null,
          rightChild: rightChildIdx < heapArray.length ? { index: rightChildIdx, value: heapArray[rightChildIdx] } : null,
        },
      }))

      if (leftChildIdx < heapArray.length && heapArray[leftChildIdx] < heapArray[smallestIdx]) {
        smallestIdx = leftChildIdx
      }

      if (rightChildIdx < heapArray.length && heapArray[rightChildIdx] < heapArray[smallestIdx]) {
        smallestIdx = rightChildIdx
      }

      if (smallestIdx === currentIndex) {
        steps.push(createAnimationStep(`当前节点 ${currentValue} 已是最小，堆化完成`, {
          extras: { heapState: [...heapArray], done: true },
        }))
        break
      }

      const smallestValue = heapArray[smallestIdx]
      steps.push(createAnimationStep(`子节点 ${smallestValue} 更小，需要交换`, {
        extras: { 
          swap: true,
          index1: currentIndex,
          value1: currentValue,
          index2: smallestIdx,
          value2: smallestValue,
        },
      }))

      ;[heapArray[currentIndex], heapArray[smallestIdx]] = 
      [heapArray[smallestIdx], heapArray[currentIndex]]

      steps.push(createAnimationStep(`交换完成`, {
        extras: { 
          heapState: [...heapArray],
          swapped: true,
        },
      }))

      currentIndex = smallestIdx
    }

    return { value: minValue, heap: [...heapArray], steps }
  }

  getHeap(): number[] {
    return [...this.heap]
  }

  getVisualNodes(width: number, height: number): HeapNode[] {
    const nodes: HeapNode[] = []
    const levelHeight = height / 5
    const levels: number[][] = []

    for (let i = 0; i < this.heap.length; i++) {
      const level = Math.floor(Math.log2(i + 1))
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(this.heap[i])
    }

    for (let level = 0; level < levels.length; level++) {
      const levelNodes = levels[level]
      const levelWidth = width / (levelNodes.length + 1)
      
      for (let i = 0; i < levelNodes.length; i++) {
        const index = Math.pow(2, level) - 1 + i
        const x = levelWidth * (i + 1)
        const y = levelHeight * (level + 1)
        
        nodes.push({
          value: levelNodes[i],
          index,
          level,
          x,
          y,
          isHighlighted: false,
          isSwapping: false,
        })
      }
    }

    return nodes
  }
}

export default MinHeap
