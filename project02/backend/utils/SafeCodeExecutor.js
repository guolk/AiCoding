const { NodeVM, VMScript } = require('vm2');
const path = require('path');

class SafeCodeExecutor {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.memoryLimitMB = options.memoryLimitMB || 100;
    this.allowedBuiltins = options.allowedBuiltins || [
      'console', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'Math', 'Date', 'JSON', 'RegExp',
      'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise'
    ];
  }

  execute(code) {
    const logs = [];
    const errors = [];
    const startTime = Date.now();
    
    const vm = new NodeVM({
      timeout: this.timeout,
      sandbox: {},
      eval: false,
      wasm: false,
      allowAsync: true,
      console: 'redirect',
      require: {
        external: false,
        builtin: [],
        root: [],
      },
    });

    vm.on('console.log', (...args) => {
      logs.push({ type: 'log', content: args.map(a => this.stringify(a)).join(' '), timestamp: new Date().toISOString() });
    });

    vm.on('console.info', (...args) => {
      logs.push({ type: 'info', content: args.map(a => this.stringify(a)).join(' '), timestamp: new Date().toISOString() });
    });

    vm.on('console.warn', (...args) => {
      logs.push({ type: 'warn', content: args.map(a => this.stringify(a)).join(' '), timestamp: new Date().toISOString() });
    });

    vm.on('console.error', (...args) => {
      logs.push({ type: 'error', content: args.map(a => this.stringify(a)).join(' '), timestamp: new Date().toISOString() });
    });

    try {
      const wrappedCode = this.wrapCode(code);
      const result = vm.run(wrappedCode);
      const endTime = Date.now();
      
      return {
        success: true,
        status: 'success',
        message: '代码执行成功',
        logs,
        result: this.stringify(result),
        executionTime: endTime - startTime,
        startTime,
        endTime
      };
    } catch (error) {
      const endTime = Date.now();
      errors.push({
        type: 'runtime_error',
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        status: 'error',
        message: '代码执行失败',
        errorType: 'RuntimeError',
        logs,
        errors,
        executionTime: endTime - startTime,
        startTime,
        endTime
      };
    }
  }

  wrapCode(code) {
    return `
      ${code}
    `;
  }

  stringify(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    try {
      if (typeof value === 'function') {
        return value.toString();
      }
      return JSON.stringify(value, (key, val) => {
        if (typeof val === 'function') {
          return val.toString();
        }
        if (val instanceof Error) {
          return { message: val.message, stack: val.stack };
        }
        return val;
      }, 2);
    } catch (e) {
      return String(value);
    }
  }

  sanitizeCode(code) {
    const dangerousPatterns = [
      /process\s*\./g,
      /require\s*\(/g,
      /global\s*\./g,
      /module\s*\./g,
      /__dirname/g,
      /__filename/g,
      /eval\s*\(/g,
      /new\s+Function/g,
      /Function\s*\(/g,
      /setTimeout\s*\(/g,
      /setInterval\s*\(/g,
      /setImmediate\s*\(/g,
      /child_process/g,
      /fs\s*\./g,
      /http\s*\./g,
      /https\s*\./g,
      /net\s*\./g,
      /os\s*\./g,
      /path\s*\./g,
      /vm\s*\./g,
      /worker_threads/g,
    ];

    let sanitized = code;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error(`Code contains potentially dangerous patterns. Please avoid using process, require, file system operations, or network operations.`);
      }
    }

    return sanitized;
  }
}

module.exports = SafeCodeExecutor;
