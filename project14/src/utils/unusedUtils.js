export function unusedFunction1() {
  console.log('这是一个未使用的函数1');
  return '未使用的函数1';
}

export function unusedFunction2() {
  console.log('这是一个未使用的函数2');
  const data = [];
  for (let i = 0; i < 1000; i++) {
    data.push({
      id: i,
      name: `item${i}`,
      value: Math.random() * 100,
      timestamp: Date.now()
    });
  }
  return data;
}

export function unusedFunction3() {
  console.log('这是一个未使用的函数3');
  const result = {
    status: 'success',
    data: {
      users: [],
      products: [],
      orders: []
    },
    metadata: {
      total: 0,
      page: 1,
      perPage: 10
    }
  };
  
  for (let i = 0; i < 100; i++) {
    result.data.users.push({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      role: 'user',
      createdAt: new Date().toISOString()
    });
  }
  
  return result;
}

export function unusedFunction4() {
  console.log('这是一个未使用的函数4');
  class UnusedClass {
    constructor() {
      this.name = '未使用的类';
      this.data = [];
    }
    
    method1() {
      console.log('未使用的方法1');
      return 'method1';
    }
    
    method2() {
      console.log('未使用的方法2');
      return 'method2';
    }
    
    method3() {
      console.log('未使用的方法3');
      for (let i = 0; i < 100; i++) {
        this.data.push({
          index: i,
          value: Math.sin(i) * 100
        });
      }
      return this.data;
    }
  }
  
  const instance = new UnusedClass();
  return instance.method3();
}

export const unusedVariable = '这是一个未使用的变量';

export const unusedObject = {
  key1: 'value1',
  key2: 'value2',
  key3: {
    nestedKey1: 'nestedValue1',
    nestedKey2: 'nestedValue2'
  }
};

export function unusedComplexFunction(input) {
  console.log('这是一个未使用的复杂函数');
  
  const processData = (data) => {
    return data.map(item => ({
      ...item,
      processed: true,
      processedAt: Date.now()
    }));
  };
  
  const validateData = (data) => {
    return data.every(item => item.id && item.name);
  };
  
  const transformData = (data) => {
    return data.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  };
  
  const inputData = input || [];
  const processed = processData(inputData);
  const isValid = validateData(processed);
  const transformed = transformData(processed);
  
  return {
    isValid,
    processed,
    transformed,
    count: processed.length
  };
}
