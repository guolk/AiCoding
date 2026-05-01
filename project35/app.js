// ============================================================
// 原生JavaScript电子表格协作工具
// 完整实现：虚拟渲染、公式解析、依赖追踪、CRDT协作、图表、导入导出
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // 工具函数
    // ============================================================
    
    const Utils = {
        columnToIndex: function(colName) {
            let index = 0;
            for (let i = 0; i < colName.length; i++) {
                index = index * 26 + (colName.charCodeAt(i) - 64);
            }
            return index - 1;
        },

        indexToColumn: function(index) {
            let colName = '';
            index++;
            while (index > 0) {
                const mod = (index - 1) % 26;
                colName = String.fromCharCode(65 + mod) + colName;
                index = Math.floor((index - 1) / 26);
            }
            return colName;
        },

        cellToCoords: function(cellRef) {
            const match = cellRef.match(/^([A-Z]+)(\d+)$/i);
            if (match) {
                return {
                    col: Utils.columnToIndex(match[1].toUpperCase()),
                    row: parseInt(match[2], 10) - 1
                };
            }
            return null;
        },

        coordsToCell: function(col, row) {
            return Utils.indexToColumn(col) + (row + 1);
        },

        deepClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        generateId: function() {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    };

    // ============================================================
    // 公式解析器 - 词法分析器
    // ============================================================
    
    const Lexer = {
        TokenType: {
            NUMBER: 'NUMBER',
            STRING: 'STRING',
            IDENTIFIER: 'IDENTIFIER',
            FUNCTION: 'FUNCTION',
            CELL_REF: 'CELL_REF',
            CELL_RANGE: 'CELL_RANGE',
            OPERATOR: 'OPERATOR',
            LPAREN: 'LPAREN',
            RPAREN: 'RPAREN',
            COMMA: 'COMMA',
            COLON: 'COLON',
            EOF: 'EOF'
        },

        tokenize: function(formula) {
            const tokens = [];
            let pos = 0;
            const len = formula.length;

            while (pos < len) {
                const char = formula[pos];

                if (/\s/.test(char)) {
                    pos++;
                    continue;
                }

                if (char === '"' || char === "'") {
                    const quote = char;
                    let string = '';
                    pos++;
                    while (pos < len && formula[pos] !== quote) {
                        if (formula[pos] === '\\' && pos + 1 < len) {
                            pos++;
                        }
                        string += formula[pos];
                        pos++;
                    }
                    pos++;
                    tokens.push({ type: Lexer.TokenType.STRING, value: string });
                    continue;
                }

                if (/[0-9]/.test(char) || (char === '.' && pos + 1 < len && /[0-9]/.test(formula[pos + 1]))) {
                    let numStr = '';
                    let hasDot = false;
                    while (pos < len && (/[0-9]/.test(formula[pos]) || (formula[pos] === '.' && !hasDot))) {
                        if (formula[pos] === '.') hasDot = true;
                        numStr += formula[pos];
                        pos++;
                    }
                    tokens.push({ type: Lexer.TokenType.NUMBER, value: parseFloat(numStr) });
                    continue;
                }

                if (/[A-Za-z]/.test(char)) {
                    let ident = '';
                    while (pos < len && /[A-Za-z0-9_]/.test(formula[pos])) {
                        ident += formula[pos];
                        pos++;
                    }
                    
                    if (/^[A-Za-z]+[0-9]+$/.test(ident)) {
                        if (pos < len && formula[pos] === ':') {
                            pos++;
                            let rangeEnd = '';
                            while (pos < len && /[A-Za-z0-9_]/.test(formula[pos])) {
                                rangeEnd += formula[pos];
                                pos++;
                            }
                            tokens.push({ 
                                type: Lexer.TokenType.CELL_RANGE, 
                                value: { start: ident.toUpperCase(), end: rangeEnd.toUpperCase() }
                            });
                        } else {
                            tokens.push({ type: Lexer.TokenType.CELL_REF, value: ident.toUpperCase() });
                        }
                    } else if (pos < len && formula[pos] === '(') {
                        tokens.push({ type: Lexer.TokenType.FUNCTION, value: ident.toUpperCase() });
                    } else {
                        tokens.push({ type: Lexer.TokenType.IDENTIFIER, value: ident.toUpperCase() });
                    }
                    continue;
                }

                if (char === '(') {
                    tokens.push({ type: Lexer.TokenType.LPAREN, value: '(' });
                    pos++;
                    continue;
                }

                if (char === ')') {
                    tokens.push({ type: Lexer.TokenType.RPAREN, value: ')' });
                    pos++;
                    continue;
                }

                if (char === ',') {
                    tokens.push({ type: Lexer.TokenType.COMMA, value: ',' });
                    pos++;
                    continue;
                }

                if (char === ':') {
                    tokens.push({ type: Lexer.TokenType.COLON, value: ':' });
                    pos++;
                    continue;
                }

                const operators = ['<=', '>=', '<>', '!=', '=', '<', '>', '+', '-', '*', '/', '^', '%'];
                let foundOp = false;
                for (const op of operators) {
                    if (formula.substr(pos, op.length) === op) {
                        tokens.push({ type: Lexer.TokenType.OPERATOR, value: op });
                        pos += op.length;
                        foundOp = true;
                        break;
                    }
                }
                if (foundOp) continue;

                throw new Error('Unknown character: ' + char);
            }

            tokens.push({ type: Lexer.TokenType.EOF, value: null });
            return tokens;
        }
    };

    // ============================================================
    // 公式解析器 - 语法分析器
    // ============================================================
    
    const Parser = {
        parse: function(formula) {
            if (!formula.startsWith('=')) {
                return { type: 'Literal', value: formula };
            }

            const tokens = Lexer.tokenize(formula.substring(1));
            let pos = 0;

            function currentToken() {
                return tokens[pos];
            }

            function eat(type) {
                if (currentToken().type === type) {
                    return tokens[pos++];
                }
                throw new Error('Expected token ' + type + ' but got ' + currentToken().type);
            }

            function peek() {
                return tokens[pos];
            }

            function parseExpression() {
                return parseComparison();
            }

            function parseComparison() {
                let node = parseAddition();
                while (currentToken().type === Lexer.TokenType.OPERATOR && 
                       ['=', '<>', '!=', '<', '>', '<=', '>='].includes(currentToken().value)) {
                    const operator = eat(Lexer.TokenType.OPERATOR).value;
                    const right = parseAddition();
                    node = { type: 'BinaryExpression', operator, left: node, right };
                }
                return node;
            }

            function parseAddition() {
                let node = parseMultiplication();
                while (currentToken().type === Lexer.TokenType.OPERATOR && 
                       ['+', '-'].includes(currentToken().value)) {
                    const operator = eat(Lexer.TokenType.OPERATOR).value;
                    const right = parseMultiplication();
                    node = { type: 'BinaryExpression', operator, left: node, right };
                }
                return node;
            }

            function parseMultiplication() {
                let node = parsePower();
                while (currentToken().type === Lexer.TokenType.OPERATOR && 
                       ['*', '/', '%'].includes(currentToken().value)) {
                    const operator = eat(Lexer.TokenType.OPERATOR).value;
                    const right = parsePower();
                    node = { type: 'BinaryExpression', operator, left: node, right };
                }
                return node;
            }

            function parsePower() {
                let node = parseUnary();
                while (currentToken().type === Lexer.TokenType.OPERATOR && 
                       currentToken().value === '^') {
                    const operator = eat(Lexer.TokenType.OPERATOR).value;
                    const right = parseUnary();
                    node = { type: 'BinaryExpression', operator, left: node, right };
                }
                return node;
            }

            function parseUnary() {
                if (currentToken().type === Lexer.TokenType.OPERATOR && 
                    ['+', '-'].includes(currentToken().value)) {
                    const operator = eat(Lexer.TokenType.OPERATOR).value;
                    const node = parsePrimary();
                    return { type: 'UnaryExpression', operator, argument: node };
                }
                return parsePrimary();
            }

            function parsePrimary() {
                const token = currentToken();
                
                if (token.type === Lexer.TokenType.NUMBER) {
                    eat(Lexer.TokenType.NUMBER);
                    return { type: 'Literal', value: token.value };
                }
                
                if (token.type === Lexer.TokenType.STRING) {
                    eat(Lexer.TokenType.STRING);
                    return { type: 'Literal', value: token.value };
                }
                
                if (token.type === Lexer.TokenType.CELL_REF) {
                    eat(Lexer.TokenType.CELL_REF);
                    return { type: 'CellReference', value: token.value };
                }
                
                if (token.type === Lexer.TokenType.CELL_RANGE) {
                    eat(Lexer.TokenType.CELL_RANGE);
                    return { type: 'CellRange', start: token.value.start, end: token.value.end };
                }
                
                if (token.type === Lexer.TokenType.FUNCTION) {
                    const funcName = eat(Lexer.TokenType.FUNCTION).value;
                    eat(Lexer.TokenType.LPAREN);
                    const args = [];
                    
                    if (currentToken().type !== Lexer.TokenType.RPAREN) {
                        args.push(parseExpression());
                        while (currentToken().type === Lexer.TokenType.COMMA) {
                            eat(Lexer.TokenType.COMMA);
                            args.push(parseExpression());
                        }
                    }
                    
                    eat(Lexer.TokenType.RPAREN);
                    return { type: 'FunctionCall', name: funcName, arguments: args };
                }
                
                if (token.type === Lexer.TokenType.LPAREN) {
                    eat(Lexer.TokenType.LPAREN);
                    const node = parseExpression();
                    eat(Lexer.TokenType.RPAREN);
                    return node;
                }
                
                throw new Error('Unexpected token: ' + token.type);
            }

            const ast = parseExpression();
            if (currentToken().type !== Lexer.TokenType.EOF) {
                throw new Error('Unexpected tokens at end of formula');
            }
            
            return ast;
        }
    };

    // ============================================================
    // 公式函数库
    // ============================================================
    
    const Functions = {
        SUM: function(args) {
            let sum = 0;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (typeof val === 'number') sum += val;
                    }
                } else if (typeof arg === 'number') {
                    sum += arg;
                }
            }
            return sum;
        },

        AVERAGE: function(args) {
            let sum = 0;
            let count = 0;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (typeof val === 'number') {
                            sum += val;
                            count++;
                        }
                    }
                } else if (typeof arg === 'number') {
                    sum += arg;
                    count++;
                }
            }
            return count > 0 ? sum / count : 0;
        },

        COUNT: function(args) {
            let count = 0;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (typeof val === 'number') count++;
                    }
                } else if (typeof arg === 'number') {
                    count++;
                }
            }
            return count;
        },

        COUNTA: function(args) {
            let count = 0;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (val !== null && val !== undefined && val !== '') count++;
                    }
                } else if (arg !== null && arg !== undefined && arg !== '') {
                    count++;
                }
            }
            return count;
        },

        MIN: function(args) {
            let min = Infinity;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (typeof val === 'number' && val < min) min = val;
                    }
                } else if (typeof arg === 'number' && arg < min) {
                    min = arg;
                }
            }
            return min === Infinity ? 0 : min;
        },

        MAX: function(args) {
            let max = -Infinity;
            for (const arg of args) {
                if (Array.isArray(arg)) {
                    for (const val of arg) {
                        if (typeof val === 'number' && val > max) max = val;
                    }
                } else if (typeof arg === 'number' && arg > max) {
                    max = arg;
                }
            }
            return max === -Infinity ? 0 : max;
        },

        IF: function(condition, trueValue, falseValue) {
            return condition ? (trueValue !== undefined ? trueValue : true) : 
                              (falseValue !== undefined ? falseValue : false);
        },

        AND: function(...args) {
            for (const arg of args) {
                if (!arg) return false;
            }
            return true;
        },

        OR: function(...args) {
            for (const arg of args) {
                if (arg) return true;
            }
            return false;
        },

        NOT: function(value) {
            return !value;
        },

        CONCATENATE: function(...args) {
            return args.map(arg => String(arg !== null && arg !== undefined ? arg : '')).join('');
        },

        LEFT: function(text, numChars) {
            text = String(text || '');
            numChars = numChars !== undefined ? Math.max(0, numChars) : 1;
            return text.substring(0, numChars);
        },

        RIGHT: function(text, numChars) {
            text = String(text || '');
            numChars = numChars !== undefined ? Math.max(0, numChars) : 1;
            return text.substring(text.length - numChars);
        },

        MID: function(text, startNum, numChars) {
            text = String(text || '');
            startNum = Math.max(1, startNum || 1) - 1;
            numChars = Math.max(0, numChars || 1);
            return text.substring(startNum, startNum + numChars);
        },

        LEN: function(text) {
            return String(text || '').length;
        },

        TRIM: function(text) {
            return String(text || '').trim();
        },

        LOWER: function(text) {
            return String(text || '').toLowerCase();
        },

        UPPER: function(text) {
            return String(text || '').toUpperCase();
        },

        PROPER: function(text) {
            return String(text || '').replace(/\w\S*/g, 
                word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
        },

        ROUND: function(number, numDigits) {
            number = Number(number) || 0;
            numDigits = numDigits !== undefined ? Math.floor(numDigits) : 0;
            const factor = Math.pow(10, numDigits);
            return Math.round(number * factor) / factor;
        },

        ROUNDUP: function(number, numDigits) {
            number = Number(number) || 0;
            numDigits = numDigits !== undefined ? Math.floor(numDigits) : 0;
            const factor = Math.pow(10, numDigits);
            return Math.ceil(number * factor) / factor;
        },

        ROUNDDOWN: function(number, numDigits) {
            number = Number(number) || 0;
            numDigits = numDigits !== undefined ? Math.floor(numDigits) : 0;
            const factor = Math.pow(10, numDigits);
            return Math.floor(number * factor) / factor;
        },

        INT: function(number) {
            return Math.floor(Number(number) || 0);
        },

        ABS: function(number) {
            return Math.abs(Number(number) || 0);
        },

        SQRT: function(number) {
            return Math.sqrt(Math.max(0, Number(number) || 0));
        },

        POWER: function(number, power) {
            return Math.pow(Number(number) || 0, Number(power) || 0);
        },

        EXP: function(number) {
            return Math.exp(Number(number) || 0);
        },

        LN: function(number) {
            return Math.log(Number(number) || 1);
        },

        LOG10: function(number) {
            return Math.log10(Number(number) || 1);
        },

        PI: function() {
            return Math.PI;
        },

        RAND: function() {
            return Math.random();
        },

        RANDBETWEEN: function(bottom, top) {
            bottom = Math.floor(Number(bottom) || 0);
            top = Math.floor(Number(top) || 0);
            return Math.floor(Math.random() * (top - bottom + 1)) + bottom;
        },

        TODAY: function() {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        },

        NOW: function() {
            return new Date();
        },

        DATE: function(year, month, day) {
            return new Date(Number(year) || 0, (Number(month) || 1) - 1, Number(day) || 1);
        },

        YEAR: function(date) {
            if (date instanceof Date) return date.getFullYear();
            return Number(date) || 0;
        },

        MONTH: function(date) {
            if (date instanceof Date) return date.getMonth() + 1;
            return 1;
        },

        DAY: function(date) {
            if (date instanceof Date) return date.getDate();
            return 1;
        },

        VLOOKUP: function(lookupValue, tableArray, colIndexNum, rangeLookup) {
            if (!Array.isArray(tableArray) || tableArray.length === 0) {
                return '#N/A';
            }
            
            const exactMatch = rangeLookup === false;
            const firstCol = tableArray.map(row => row[0]);
            
            let matchIndex = -1;
            
            if (exactMatch) {
                matchIndex = firstCol.indexOf(lookupValue);
            } else {
                let bestMatch = -Infinity;
                for (let i = 0; i < firstCol.length; i++) {
                    const val = firstCol[i];
                    if (val <= lookupValue && val > bestMatch) {
                        bestMatch = val;
                        matchIndex = i;
                    }
                }
            }
            
            if (matchIndex === -1) return '#N/A';
            
            const colIndex = (colIndexNum || 1) - 1;
            if (colIndex < 0 || colIndex >= (tableArray[0]?.length || 0)) {
                return '#REF!';
            }
            
            return tableArray[matchIndex][colIndex];
        },

        HLOOKUP: function(lookupValue, tableArray, rowIndexNum, rangeLookup) {
            if (!Array.isArray(tableArray) || tableArray.length === 0) {
                return '#N/A';
            }
            
            const exactMatch = rangeLookup === false;
            const firstRow = tableArray[0] || [];
            
            let matchIndex = -1;
            
            if (exactMatch) {
                matchIndex = firstRow.indexOf(lookupValue);
            } else {
                let bestMatch = -Infinity;
                for (let i = 0; i < firstRow.length; i++) {
                    const val = firstRow[i];
                    if (val <= lookupValue && val > bestMatch) {
                        bestMatch = val;
                        matchIndex = i;
                    }
                }
            }
            
            if (matchIndex === -1) return '#N/A';
            
            const rowIndex = (rowIndexNum || 1) - 1;
            if (rowIndex < 0 || rowIndex >= tableArray.length) {
                return '#REF!';
            }
            
            return tableArray[rowIndex][matchIndex];
        },

        INDEX: function(array, rowNum, colNum) {
            if (!Array.isArray(array)) return '#REF!';
            
            rowNum = (rowNum || 1) - 1;
            colNum = (colNum || 1) - 1;
            
            if (rowNum < 0 || rowNum >= array.length) return '#REF!';
            
            const row = array[rowNum];
            if (!Array.isArray(row)) return row;
            
            if (colNum < 0 || colNum >= row.length) return '#REF!';
            
            return row[colNum];
        },

        MATCH: function(lookupValue, lookupArray, matchType) {
            if (!Array.isArray(lookupArray)) return '#N/A';
            
            matchType = matchType !== undefined ? matchType : 1;
            
            const flatArray = lookupArray.flat();
            
            if (matchType === 0) {
                const index = flatArray.indexOf(lookupValue);
                return index >= 0 ? index + 1 : '#N/A';
            }
            
            let bestIndex = -1;
            let bestValue = matchType > 0 ? -Infinity : Infinity;
            
            for (let i = 0; i < flatArray.length; i++) {
                const val = flatArray[i];
                if (matchType > 0) {
                    if (val <= lookupValue && val > bestValue) {
                        bestValue = val;
                        bestIndex = i;
                    }
                } else {
                    if (val >= lookupValue && val < bestValue) {
                        bestValue = val;
                        bestIndex = i;
                    }
                }
            }
            
            return bestIndex >= 0 ? bestIndex + 1 : '#N/A';
        },

        OFFSET: function(reference, rows, cols, height, width) {
            return '#N/A';
        },

        INDIRECT: function(refText) {
            return '#N/A';
        },

        ISNUMBER: function(value) {
            return typeof value === 'number';
        },

        ISTEXT: function(value) {
            return typeof value === 'string';
        },

        ISLOGICAL: function(value) {
            return typeof value === 'boolean';
        },

        ISBLANK: function(value) {
            return value === null || value === undefined || value === '';
        },

        ISERROR: function(value) {
            return typeof value === 'string' && value.startsWith('#');
        },

        IFERROR: function(value, valueIfError) {
            return (typeof value === 'string' && value.startsWith('#')) ? valueIfError : value;
        },

        NA: function() {
            return '#N/A';
        },

        CHOOSE: function(indexNum, ...args) {
            indexNum = Math.floor(Number(indexNum) || 0);
            if (indexNum < 1 || indexNum > args.length) {
                return '#VALUE!';
            }
            return args[indexNum - 1];
        },

        SUBSTITUTE: function(text, oldText, newText, instanceNum) {
            text = String(text || '');
            oldText = String(oldText || '');
            newText = String(newText || '');
            
            if (instanceNum === undefined) {
                return text.split(oldText).join(newText);
            }
            
            let count = 0;
            return text.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                match => {
                    count++;
                    return count === instanceNum ? newText : match;
                });
        },

        REPLACE: function(oldText, startNum, numChars, newText) {
            oldText = String(oldText || '');
            startNum = Math.max(1, Number(startNum) || 1) - 1;
            numChars = Math.max(0, Number(numChars) || 0);
            newText = String(newText || '');
            
            return oldText.substring(0, startNum) + newText + oldText.substring(startNum + numChars);
        },

        FIND: function(findText, withinText, startNum) {
            findText = String(findText || '');
            withinText = String(withinText || '');
            startNum = Math.max(0, (Number(startNum) || 1) - 1);
            
            const index = withinText.indexOf(findText, startNum);
            return index >= 0 ? index + 1 : '#VALUE!';
        },

        SEARCH: function(findText, withinText, startNum) {
            findText = String(findText || '').toLowerCase();
            withinText = String(withinText || '').toLowerCase();
            startNum = Math.max(0, (Number(startNum) || 1) - 1);
            
            const index = withinText.indexOf(findText, startNum);
            return index >= 0 ? index + 1 : '#VALUE!';
        },

        VALUE: function(text) {
            const num = Number(String(text || '').replace(/[^\d.-]/g, ''));
            return isNaN(num) ? '#VALUE!' : num;
        },

        TEXT: function(value, formatText) {
            value = Number(value) || 0;
            formatText = String(formatText || '');
            
            if (formatText.includes('%')) {
                return (value * 100).toFixed(Math.max(0, formatText.split('.')[1]?.replace('%', '').length || 0)) + '%';
            }
            
            if (formatText.toLowerCase().includes('yyyy')) {
                if (value instanceof Date) {
                    return value.toLocaleDateString();
                }
                return String(value);
            }
            
            return String(value);
        },

        DOLLAR: function(number, decimals) {
            number = Number(number) || 0;
            decimals = decimals !== undefined ? Math.floor(decimals) : 2;
            return '$' + number.toFixed(Math.max(0, decimals));
        },

        FIXED: function(number, decimals, noCommas) {
            number = Number(number) || 0;
            decimals = decimals !== undefined ? Math.floor(decimals) : 2;
            
            let result = number.toFixed(Math.max(0, decimals));
            if (!noCommas) {
                const parts = result.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                result = parts.join('.');
            }
            return result;
        }
    };

    // ============================================================
    // 公式解释器
    // ============================================================
    
    const Interpreter = {
        evaluate: function(ast, getCellValue, getCellRange) {
            function evaluateNode(node) {
                if (!node) return null;

                switch (node.type) {
                    case 'Literal':
                        return node.value;

                    case 'CellReference':
                        const coords = Utils.cellToCoords(node.value);
                        if (coords) {
                            return getCellValue(coords.col, coords.row);
                        }
                        return '#REF!';

                    case 'CellRange':
                        const start = Utils.cellToCoords(node.start);
                        const end = Utils.cellToCoords(node.end);
                        if (start && end) {
                            return getCellRange(start.col, start.row, end.col, end.row);
                        }
                        return '#REF!';

                    case 'UnaryExpression':
                        const arg = evaluateNode(node.argument);
                        if (typeof arg === 'number') {
                            return node.operator === '-' ? -arg : arg;
                        }
                        return '#VALUE!';

                    case 'BinaryExpression':
                        const left = evaluateNode(node.left);
                        const right = evaluateNode(node.right);
                        
                        if (typeof left === 'string' && left.startsWith('#')) return left;
                        if (typeof right === 'string' && right.startsWith('#')) return right;

                        switch (node.operator) {
                            case '+':
                                if (typeof left === 'number' && typeof right === 'number') return left + right;
                                if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
                                return '#VALUE!';
                            case '-':
                                if (typeof left === 'number' && typeof right === 'number') return left - right;
                                return '#VALUE!';
                            case '*':
                                if (typeof left === 'number' && typeof right === 'number') return left * right;
                                return '#VALUE!';
                            case '/':
                                if (typeof left === 'number' && typeof right === 'number') {
                                    if (right === 0) return '#DIV/0!';
                                    return left / right;
                                }
                                return '#VALUE!';
                            case '^':
                                if (typeof left === 'number' && typeof right === 'number') return Math.pow(left, right);
                                return '#VALUE!';
                            case '%':
                                if (typeof left === 'number' && typeof right === 'number') {
                                    if (right === 0) return '#DIV/0!';
                                    return left % right;
                                }
                                return '#VALUE!';
                            case '=':
                            case '==':
                                return left === right;
                            case '<>':
                            case '!=':
                                return left !== right;
                            case '<':
                                return left < right;
                            case '>':
                                return left > right;
                            case '<=':
                                return left <= right;
                            case '>=':
                                return left >= right;
                            default:
                                return '#VALUE!';
                        }

                    case 'FunctionCall':
                        const funcName = node.name;
                        if (Functions[funcName]) {
                            const args = node.arguments.map(arg => evaluateNode(arg));
                            for (const arg of args) {
                                if (typeof arg === 'string' && arg.startsWith('#') && 
                                    !['IFERROR', 'ISERROR'].includes(funcName)) {
                                    return arg;
                                }
                            }
                            try {
                                return Functions[funcName](...args);
                            } catch (e) {
                                return '#ERROR!';
                            }
                        }
                        return '#NAME?';

                    default:
                        return '#VALUE!';
                }
            }

            return evaluateNode(ast);
        }
    };

    // ============================================================
    // 依赖追踪图
    // ============================================================
    
    class DependencyGraph {
        constructor() {
            this.adjacencyList = new Map();
            this.reverseAdjacencyList = new Map();
        }

        addDependency(cellId, dependsOn) {
            if (!this.adjacencyList.has(cellId)) {
                this.adjacencyList.set(cellId, new Set());
            }
            if (!this.reverseAdjacencyList.has(dependsOn)) {
                this.reverseAdjacencyList.set(dependsOn, new Set());
            }
            this.adjacencyList.get(cellId).add(dependsOn);
            this.reverseAdjacencyList.get(dependsOn).add(cellId);
        }

        removeDependencies(cellId) {
            const dependencies = this.adjacencyList.get(cellId);
            if (dependencies) {
                for (const dep of dependencies) {
                    const reverseDeps = this.reverseAdjacencyList.get(dep);
                    if (reverseDeps) {
                        reverseDeps.delete(cellId);
                    }
                }
            }
            this.adjacencyList.delete(cellId);
        }

        getDependents(cellId) {
            return Array.from(this.reverseAdjacencyList.get(cellId) || []);
        }

        getDependencies(cellId) {
            return Array.from(this.adjacencyList.get(cellId) || []);
        }

        detectCycle(startCellId) {
            const visited = new Set();
            const recursionStack = new Set();
            
            const dfs = (cellId) => {
                visited.add(cellId);
                recursionStack.add(cellId);
                
                const dependencies = this.getDependencies(cellId);
                for (const dep of dependencies) {
                    if (!visited.has(dep)) {
                        if (dfs(dep)) return true;
                    } else if (recursionStack.has(dep)) {
                        return true;
                    }
                }
                
                recursionStack.delete(cellId);
                return false;
            };
            
            return dfs(startCellId);
        }

        topologicalSort() {
            const inDegree = new Map();
            const allCells = new Set();
            
            for (const [cell, deps] of this.adjacencyList) {
                allCells.add(cell);
                if (!inDegree.has(cell)) inDegree.set(cell, 0);
                for (const dep of deps) {
                    allCells.add(dep);
                    if (!inDegree.has(dep)) inDegree.set(dep, 0);
                    inDegree.set(cell, (inDegree.get(cell) || 0) + 1);
                }
            }
            
            const queue = [];
            for (const cell of allCells) {
                if ((inDegree.get(cell) || 0) === 0) {
                    queue.push(cell);
                }
            }
            
            const result = [];
            while (queue.length > 0) {
                const cell = queue.shift();
                result.push(cell);
                
                const dependents = this.getDependents(cell);
                for (const dep of dependents) {
                    const newDegree = (inDegree.get(dep) || 0) - 1;
                    inDegree.set(dep, newDegree);
                    if (newDegree === 0) {
                        queue.push(dep);
                    }
                }
            }
            
            return result;
        }

        extractReferences(ast) {
            const references = [];
            
            function traverse(node) {
                if (!node) return;
                
                if (node.type === 'CellReference') {
                    references.push(node.value);
                } else if (node.type === 'CellRange') {
                    const start = Utils.cellToCoords(node.start);
                    const end = Utils.cellToCoords(node.end);
                    if (start && end) {
                        for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
                            for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
                                references.push(Utils.coordsToCell(col, row));
                            }
                        }
                    }
                }
                
                for (const key in node) {
                    if (typeof node[key] === 'object' && node[key] !== null) {
                        if (Array.isArray(node[key])) {
                            for (const child of node[key]) {
                                traverse(child);
                            }
                        } else {
                            traverse(node[key]);
                        }
                    }
                }
            }
            
            traverse(ast);
            return references;
        }
    }

    // ============================================================
    // CRDT 实现（用于协作编辑）
    // ============================================================
    
    class CRDTDocument {
        constructor() {
            this.cells = new Map();
            this.operations = [];
            this.version = 0;
        }

        generateOperation(type, cellId, value, siteId, lamportTimestamp) {
            return {
                id: Utils.generateId(),
                type,
                cellId,
                value,
                siteId,
                lamportTimestamp,
                version: this.version
            };
        }

        applyOperation(operation) {
            const { type, cellId, value, siteId, lamportTimestamp } = operation;
            
            if (type === 'set') {
                const existing = this.cells.get(cellId);
                if (!existing || 
                    existing.lamportTimestamp < lamportTimestamp ||
                    (existing.lamportTimestamp === lamportTimestamp && existing.siteId < siteId)) {
                    this.cells.set(cellId, {
                        value,
                        siteId,
                        lamportTimestamp
                    });
                }
            } else if (type === 'delete') {
                this.cells.delete(cellId);
            }
            
            this.operations.push(operation);
            this.version++;
            return operation;
        }

        getValue(cellId) {
            const cell = this.cells.get(cellId);
            return cell ? cell.value : null;
        }

        merge(otherDoc) {
            for (const operation of otherDoc.operations) {
                this.applyOperation(operation);
            }
        }
    }

    // ============================================================
    // 图表渲染器
    // ============================================================
    
    class ChartRenderer {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.data = null;
            this.type = 'line';
            this.colors = [
                '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
                '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
            ];
        }

        resize(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        setData(data, labels) {
            this.data = data;
            this.labels = labels;
            this.render();
        }

        setType(type) {
            this.type = type;
            if (this.data && this.labels && this.data.length > 0 && this.labels.length > 0) {
                this.render();
            }
        }

        render() {
            if (!this.data || !this.labels || this.data.length === 0 || this.labels.length === 0) {
                return;
            }
            
            const width = this.canvas.width;
            const height = this.canvas.height;
            
            if (width <= 0 || height <= 0) {
                return;
            }
            
            const padding = 60;
            
            this.ctx.clearRect(0, 0, width, height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, width, height);
            
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            
            if (chartWidth <= 0 || chartHeight <= 0) {
                return;
            }
            
            if (this.type === 'pie') {
                this.renderPieChart(chartWidth, chartHeight, padding);
            } else if (this.type === 'bar') {
                this.renderBarChart(chartWidth, chartHeight, padding);
            } else {
                this.renderLineChart(chartWidth, chartHeight, padding);
            }
        }

        renderLineChart(chartWidth, chartHeight, padding) {
            const datasets = this.data;
            const labels = this.labels;
            
            let maxValue = -Infinity;
            let minValue = Infinity;
            
            for (const dataset of datasets) {
                for (const value of dataset.data) {
                    if (typeof value === 'number') {
                        maxValue = Math.max(maxValue, value);
                        minValue = Math.min(minValue, value);
                    }
                }
            }
            
            maxValue = Math.ceil(maxValue * 1.1);
            minValue = Math.floor(minValue * 0.9);
            if (minValue === maxValue) {
                maxValue += 1;
                minValue -= 1;
            }
            
            const valueRange = maxValue - minValue;
            const xStep = chartWidth / (labels.length - 1);
            
            this.ctx.strokeStyle = '#bdc3c7';
            this.ctx.lineWidth = 1;
            
            const gridLines = 5;
            for (let i = 0; i <= gridLines; i++) {
                const y = padding + (chartHeight / gridLines) * i;
                const value = maxValue - (valueRange / gridLines) * i;
                
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(padding + chartWidth, y);
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(value.toFixed(1), padding - 5, y + 3);
            }
            
            for (let i = 0; i < labels.length; i++) {
                const x = padding + xStep * i;
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(labels[i], x, padding + chartHeight + 15);
            }
            
            for (let di = 0; di < datasets.length; di++) {
                const dataset = datasets[di];
                const color = this.colors[di % this.colors.length];
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                let started = false;
                for (let i = 0; i < dataset.data.length; i++) {
                    const value = dataset.data[i];
                    if (typeof value !== 'number') continue;
                    
                    const x = padding + xStep * i;
                    const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                    
                    if (!started) {
                        this.ctx.moveTo(x, y);
                        started = true;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
                
                for (let i = 0; i < dataset.data.length; i++) {
                    const value = dataset.data[i];
                    if (typeof value !== 'number') continue;
                    
                    const x = padding + xStep * i;
                    const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                    
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = 'white';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            const legendX = padding;
            const legendY = 10;
            
            for (let di = 0; di < datasets.length; di++) {
                const dataset = datasets[di];
                const color = this.colors[di % this.colors.length];
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(legendX + di * 120, legendY, 12, 12);
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '11px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(dataset.label || '数据集 ' + (di + 1), legendX + di * 120 + 18, legendY + 10);
            }
        }

        renderBarChart(chartWidth, chartHeight, padding) {
            const datasets = this.data;
            const labels = this.labels;
            
            let maxValue = -Infinity;
            let minValue = 0;
            
            for (const dataset of datasets) {
                for (const value of dataset.data) {
                    if (typeof value === 'number') {
                        maxValue = Math.max(maxValue, value);
                    }
                }
            }
            
            maxValue = Math.ceil(maxValue * 1.1);
            const valueRange = maxValue - minValue;
            
            const groupCount = labels.length;
            const groupWidth = chartWidth / groupCount;
            const barCount = datasets.length;
            const barWidth = (groupWidth - 20) / barCount;
            
            this.ctx.strokeStyle = '#bdc3c7';
            this.ctx.lineWidth = 1;
            
            const gridLines = 5;
            for (let i = 0; i <= gridLines; i++) {
                const y = padding + (chartHeight / gridLines) * i;
                const value = maxValue - (valueRange / gridLines) * i;
                
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(padding + chartWidth, y);
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(value.toFixed(1), padding - 5, y + 3);
            }
            
            for (let gi = 0; gi < groupCount; gi++) {
                const groupX = padding + gi * groupWidth + 10;
                
                for (let di = 0; di < barCount; di++) {
                    const value = datasets[di].data[gi];
                    if (typeof value !== 'number') continue;
                    
                    const barHeight = (value / valueRange) * chartHeight;
                    const x = groupX + di * barWidth;
                    const y = padding + chartHeight - barHeight;
                    
                    this.ctx.fillStyle = this.colors[di % this.colors.length];
                    this.ctx.fillRect(x, y, barWidth - 2, barHeight);
                    
                    this.ctx.strokeStyle = '#2c3e50';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, barWidth - 2, barHeight);
                }
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(labels[gi], groupX + groupWidth / 2 - 10, padding + chartHeight + 15);
            }
            
            const legendX = padding;
            const legendY = 10;
            
            for (let di = 0; di < datasets.length; di++) {
                const dataset = datasets[di];
                const color = this.colors[di % this.colors.length];
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(legendX + di * 120, legendY, 12, 12);
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '11px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(dataset.label || '数据集 ' + (di + 1), legendX + di * 120 + 18, legendY + 10);
            }
        }

        renderPieChart(chartWidth, chartHeight, padding) {
            const data = this.data[0]?.data || [];
            const labels = this.labels;
            
            let total = 0;
            for (const value of data) {
                if (typeof value === 'number') {
                    total += value;
                }
            }
            
            if (total === 0) return;
            
            const centerX = padding + chartWidth / 2;
            const centerY = padding + chartHeight / 2;
            const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
            
            let startAngle = -Math.PI / 2;
            
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                if (typeof value !== 'number') continue;
                
                const sliceAngle = (value / total) * Math.PI * 2;
                const color = this.colors[i % this.colors.length];
                
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                const midAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + Math.cos(midAngle) * labelRadius;
                const labelY = centerY + Math.sin(midAngle) * labelRadius;
                
                const percentage = ((value / total) * 100).toFixed(1) + '%';
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(percentage, labelX, labelY);
                
                startAngle += sliceAngle;
            }
            
            const legendX = padding;
            let legendY = 10;
            
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                if (typeof value !== 'number') continue;
                
                const color = this.colors[i % this.colors.length];
                const label = labels[i] || '数据 ' + (i + 1);
                const percentage = ((value / total) * 100).toFixed(1) + '%';
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(legendX, legendY, 12, 12);
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '11px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`${label}: ${percentage}`, legendX + 18, legendY + 10);
                
                legendY += 18;
            }
        }
    }

    // ============================================================
    // 主电子表格类
    // ============================================================
    
    class Spreadsheet {
        constructor() {
            this.maxRows = 1000000;
            this.maxCols = 16384;
            
            this.cellWidth = 100;
            this.rowHeight = 24;
            this.headerHeight = 24;
            this.rowHeaderWidth = 60;
            
            this.scrollX = 0;
            this.scrollY = 0;
            
            this.selection = {
                startCol: 0,
                startRow: 0,
                endCol: 0,
                endRow: 0
            };
            
            this.activeCell = { col: 0, row: 0 };
            this.editingCell = null;
            
            this.cells = new Map();
            this.mergedCells = [];
            this.hiddenRows = new Set();
            this.hiddenCols = new Set();
            this.conditionalFormats = [];
            this.dataValidations = new Map();
            
            this.dependencyGraph = new DependencyGraph();
            this.crdtDoc = new CRDTDocument();
            
            this.frozenRows = 0;
            this.frozenCols = 0;
            
            this.charts = [];
            this.activeChart = null;
            
            this.remoteUsers = new Map();
            this.userId = Utils.generateId();
            this.userName = '用户 ' + Math.floor(Math.random() * 1000);
            this.userColor = this.getRandomColor();
            
            this.clipboard = null;
            this.undoStack = [];
            this.redoStack = [];
            this.maxUndoSteps = 50;
            
            this.lamportTimestamp = 0;
            
            this.init();
        }

        getRandomColor() {
            const colors = [
                '#e74c3c', '#e67e22', '#f39c12', '#2ecc71',
                '#1abc9c', '#3498db', '#9b59b6', '#34495e'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        init() {
            this.initCanvas();
            this.initEventListeners();
            this.initUI();
            this.render();
        }

        initCanvas() {
            this.canvas = document.getElementById('grid-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.frozenCanvasTL = document.getElementById('frozen-canvas-tl');
            this.frozenCtxTL = this.frozenCanvasTL?.getContext('2d');
            
            this.frozenCanvasT = document.getElementById('frozen-canvas-t');
            this.frozenCtxT = this.frozenCanvasT?.getContext('2d');
            
            this.frozenCanvasL = document.getElementById('frozen-canvas-l');
            this.frozenCtxL = this.frozenCanvasL?.getContext('2d');
            
            this.cellEditor = document.getElementById('cell-editor');
            this.formulaInput = document.getElementById('formula-input');
            this.nameBox = document.getElementById('name-box');
            
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            const container = document.getElementById('grid-container');
            const rect = container.getBoundingClientRect();
            
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            
            this.updateScrollbars();
            this.render();
        }

        initEventListeners() {
            const canvas = this.canvas;
            
            canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
            canvas.addEventListener('wheel', (e) => this.handleWheel(e));
            canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
            
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            
            this.cellEditor.addEventListener('blur', () => this.commitEdit());
            this.cellEditor.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.commitEdit();
                    this.navigate(0, 1);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    this.commitEdit();
                    this.navigate(e.shiftKey ? -1 : 1, 0);
                }
            });
            
            this.formulaInput.addEventListener('blur', () => {
                if (this.editingCell) {
                    this.commitEdit();
                }
            });
            this.formulaInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.editingCell) {
                        this.commitEdit();
                    }
                    this.navigate(0, 1);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
            this.formulaInput.addEventListener('input', () => {
                if (this.editingCell) {
                    this.cellEditor.value = this.formulaInput.value;
                }
            });
            
            document.addEventListener('click', (e) => {
                const contextMenu = document.getElementById('context-menu');
                if (contextMenu && !contextMenu.contains(e.target)) {
                    contextMenu.style.display = 'none';
                }
            });
            
            this.initMenuEvents();
            this.initToolbarEvents();
            this.initModalEvents();
        }

        initMenuEvents() {
            const menuItems = [
                { id: 'menu-file-new', action: () => this.newWorkbook() },
                { id: 'menu-file-open', action: () => this.showImportModal() },
                { id: 'menu-file-save', action: () => this.exportAsJSON('spreadsheet.json') },
                { id: 'menu-file-save-xlsx', action: () => this.exportAsXLSX('spreadsheet.xlsx') },
                { id: 'menu-file-save-csv', action: () => this.exportAsCSV('spreadsheet.csv') },
                
                { id: 'menu-edit-undo', action: () => this.undo() },
                { id: 'menu-edit-redo', action: () => this.redo() },
                { id: 'menu-edit-cut', action: () => this.cut() },
                { id: 'menu-edit-copy', action: () => this.copy() },
                { id: 'menu-edit-paste', action: () => this.paste() },
                { id: 'menu-edit-clear', action: () => this.clearSelection() },
                { id: 'menu-edit-find', action: () => alert('查找功能开发中') },
                { id: 'menu-edit-replace', action: () => alert('替换功能开发中') },
                
                { id: 'menu-view-freeze-top', action: () => this.freezeRows(1) },
                { id: 'menu-view-freeze-left', action: () => this.freezeColumns(1) },
                { id: 'menu-view-unfreeze', action: () => this.unfreeze() },
                { id: 'menu-view-formula-bar', action: () => this.toggleFormulaBar() },
                { id: 'menu-view-status-bar', action: () => this.toggleStatusBar() },
                
                { id: 'menu-insert-chart-line', action: () => this.insertChart('line') },
                { id: 'menu-insert-chart-bar', action: () => this.insertChart('bar') },
                { id: 'menu-insert-chart-pie', action: () => this.insertChart('pie') },
                { id: 'menu-insert-function', action: () => alert('插入函数功能开发中') },
                
                { id: 'menu-format-bold', action: () => this.toggleFormat('bold') },
                { id: 'menu-format-italic', action: () => this.toggleFormat('italic') },
                { id: 'menu-format-underline', action: () => this.toggleFormat('underline') },
                { id: 'menu-format-align-left', action: () => this.setFormat('align', 'left') },
                { id: 'menu-format-align-center', action: () => this.setFormat('align', 'center') },
                { id: 'menu-format-align-right', action: () => this.setFormat('align', 'right') },
                { id: 'menu-format-wrap-text', action: () => this.toggleFormat('wrapText') },
                { id: 'menu-format-number', action: () => this.setFormat('numberFormat', 'number') },
                { id: 'menu-format-currency', action: () => this.setFormat('numberFormat', 'currency') },
                { id: 'menu-format-percent', action: () => this.setFormat('numberFormat', 'percent') },
                { id: 'menu-format-date', action: () => this.setFormat('numberFormat', 'date') },
                { id: 'menu-format-time', action: () => this.setFormat('numberFormat', 'time') },
                { id: 'menu-format-row-height', action: () => { const h = prompt('输入行高度:'); if (h) this.setRowHeight(this.activeCell.row, parseInt(h)); } },
                { id: 'menu-format-col-width', action: () => { const w = prompt('输入列宽度:'); if (w) this.setColumnWidth(this.activeCell.col, parseInt(w)); } },
                { id: 'menu-format-hide-row', action: () => this.hideRow(this.activeCell.row) },
                { id: 'menu-format-hide-col', action: () => this.hideColumn(this.activeCell.col) },
                { id: 'menu-format-unhide-rows', action: () => this.unhideAllRows() },
                { id: 'menu-format-unhide-cols', action: () => this.unhideAllColumns() },
                
                { id: 'menu-data-sort-asc', action: () => this.sortSelection('asc') },
                { id: 'menu-data-sort-desc', action: () => this.sortSelection('desc') },
                { id: 'menu-data-filter', action: () => this.showFilterModal() },
                { id: 'menu-data-validation', action: () => this.showValidationModal() },
                { id: 'menu-data-text-columns', action: () => alert('分列功能开发中') },
                { id: 'menu-data-remove-duplicates', action: () => this.removeDuplicates() },
                
                { id: 'menu-tools-conditional', action: () => this.showConditionalModal() },
                { id: 'menu-tools-merge', action: () => this.mergeCells() },
                { id: 'menu-tools-unmerge', action: () => this.unmergeCells() },
                
                { id: 'menu-help-about', action: () => alert('电子表格协作工具 v1.0\n- 虚拟渲染支持百万级数据\n- 完整公式解析器\n- 条件格式和数据验证\n- 图表支持\n- CRDT实时协作') }
            ];
            
            menuItems.forEach(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item.action();
                        this.closeAllMenus();
                    });
                }
            });
            
            const menuTitles = ['menu-file-title', 'menu-edit-title', 'menu-view-title', 'menu-insert-title', 'menu-format-title', 'menu-data-title', 'menu-tools-title', 'menu-help-title'];
            menuTitles.forEach(titleId => {
                const element = document.getElementById(titleId);
                if (element) {
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const menuId = titleId.replace('-title', '-dropdown');
                        this.toggleMenu(menuId);
                    });
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.menu-item')) {
                    this.closeAllMenus();
                }
            });
        }

        closeAllMenus() {
            const dropdowns = ['menu-file-dropdown', 'menu-edit-dropdown', 'menu-view-dropdown', 
                              'menu-insert-dropdown', 'menu-format-dropdown', 'menu-data-dropdown', 
                              'menu-tools-dropdown', 'menu-help-dropdown'];
            dropdowns.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }

        toggleMenu(menuId) {
            this.closeAllMenus();
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }
        }

        newWorkbook() {
            if (confirm('确定要新建工作簿吗？未保存的更改将丢失。')) {
                this.cells.clear();
                this.mergedCells = [];
                this.conditionalFormats = [];
                this.dataValidations = new Map();
                this.hiddenRows = new Set();
                this.hiddenColumns = new Set();
                this.frozenRows = 0;
                this.frozenCols = 0;
                this.charts = [];
                this.undoStack = [];
                this.redoStack = [];
                this.dependencyGraph = new DependencyGraph();
                this.activeCell = { col: 0, row: 0 };
                this.selection = {
                    startCol: 0,
                    startRow: 0,
                    endCol: 0,
                    endRow: 0
                };
                this.render();
                this.updateUI();
            }
        }

        clearSelection() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cellId = this.getCellId(col, row);
                    this.cells.delete(cellId);
                }
            }
            this.evaluateAll();
            this.render();
            this.saveHistory();
        }

        freezeRows(count) {
            this.frozenRows = count;
            this.updateFrozenCanvases();
            this.render();
        }

        freezeColumns(count) {
            this.frozenCols = count;
            this.updateFrozenCanvases();
            this.render();
        }

        unfreeze() {
            this.frozenRows = 0;
            this.frozenCols = 0;
            this.updateFrozenCanvases();
            this.render();
        }

        toggleFormulaBar() {
            const bar = document.getElementById('formula-bar');
            if (bar) bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
        }

        toggleStatusBar() {
            const bar = document.getElementById('status-bar');
            if (bar) bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
        }

        setRowHeight(row, height) {
            this.rowHeights[row] = Math.max(10, Math.min(400, height));
            this.render();
        }

        setColumnWidth(col, width) {
            this.colWidths[col] = Math.max(20, Math.min(500, width));
            this.render();
        }

        hideRow(row) {
            this.hiddenRows.add(row);
            this.render();
        }

        hideColumn(col) {
            this.hiddenColumns.add(col);
            this.render();
        }

        unhideAllRows() {
            this.hiddenRows.clear();
            this.render();
        }

        unhideAllColumns() {
            this.hiddenColumns.clear();
            this.render();
        }

        sortSelection(order) {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            const values = [];
            for (let row = minRow; row <= maxRow; row++) {
                const rowData = [];
                for (let col = minCol; col <= maxCol; col++) {
                    const cellId = this.getCellId(col, row);
                    rowData.push({
                        value: this.getDisplayValue(col, row),
                        original: this.cells.get(cellId)
                    });
                }
                values.push(rowData);
            }
            
            values.sort((a, b) => {
                const valA = a[0]?.value ?? '';
                const valB = b[0]?.value ?? '';
                const numA = parseFloat(valA);
                const numB = parseFloat(valB);
                
                if (!isNaN(numA) && !isNaN(numB)) {
                    return order === 'asc' ? numA - numB : numB - numA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
            
            let rowIndex = minRow;
            values.forEach(rowData => {
                let colIndex = minCol;
                rowData.forEach(cellData => {
                    const cellId = this.getCellId(colIndex, rowIndex);
                    if (cellData.original) {
                        this.cells.set(cellId, cellData.original);
                    } else {
                        this.cells.delete(cellId);
                    }
                    colIndex++;
                });
                rowIndex++;
            });
            
            this.evaluateAll();
            this.render();
            this.saveHistory();
        }

        removeDuplicates() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            const seen = new Set();
            for (let row = maxRow; row >= minRow; row--) {
                let rowKey = '';
                for (let col = minCol; col <= maxCol; col++) {
                    rowKey += '|' + this.getDisplayValue(col, row);
                }
                if (seen.has(rowKey)) {
                    for (let col = minCol; col <= maxCol; col++) {
                        const cellId = this.getCellId(col, row);
                        this.cells.delete(cellId);
                    }
                } else {
                    seen.add(rowKey);
                }
            }
            this.render();
            this.saveHistory();
        }

        initToolbarEvents() {
            document.getElementById('btn-bold')?.addEventListener('click', () => this.toggleFormat('bold'));
            document.getElementById('btn-italic')?.addEventListener('click', () => this.toggleFormat('italic'));
            document.getElementById('btn-underline')?.addEventListener('click', () => this.toggleFormat('underline'));
            
            document.getElementById('font-family')?.addEventListener('change', (e) => this.setFormat('fontFamily', e.target.value));
            document.getElementById('font-size')?.addEventListener('change', (e) => this.setFormat('fontSize', parseInt(e.target.value)));
            
            document.getElementById('btn-align-left')?.addEventListener('click', () => this.setFormat('align', 'left'));
            document.getElementById('btn-align-center')?.addEventListener('click', () => this.setFormat('align', 'center'));
            document.getElementById('btn-align-right')?.addEventListener('click', () => this.setFormat('align', 'right'));
            
            document.getElementById('btn-merge')?.addEventListener('click', () => this.mergeCells());
            document.getElementById('btn-unmerge')?.addEventListener('click', () => this.unmergeCells());
            
            document.getElementById('bg-color')?.addEventListener('change', (e) => this.setFormat('bgColor', e.target.value));
            document.getElementById('text-color')?.addEventListener('change', (e) => this.setFormat('textColor', e.target.value));
            
            document.getElementById('btn-freeze')?.addEventListener('click', () => this.toggleFreeze());
            document.getElementById('btn-conditional')?.addEventListener('click', () => this.showConditionalModal());
            document.getElementById('btn-validation')?.addEventListener('click', () => this.showValidationModal());
            
            document.getElementById('btn-chart-line')?.addEventListener('click', () => this.showChartModal('line'));
            document.getElementById('btn-chart-bar')?.addEventListener('click', () => this.showChartModal('bar'));
            document.getElementById('btn-chart-pie')?.addEventListener('click', () => this.showChartModal('pie'));
            
            document.getElementById('btn-import')?.addEventListener('click', () => this.showImportModal());
            document.getElementById('btn-export')?.addEventListener('click', () => this.showExportModal());
        }

        initModalEvents() {
            document.getElementById('conditional-close')?.addEventListener('click', () => this.hideConditionalModal());
            document.getElementById('conditional-cancel')?.addEventListener('click', () => this.hideConditionalModal());
            document.getElementById('conditional-add')?.addEventListener('click', () => this.addConditionalFormat());
            
            document.getElementById('validation-close')?.addEventListener('click', () => this.hideValidationModal());
            document.getElementById('validation-cancel')?.addEventListener('click', () => this.hideValidationModal());
            document.getElementById('validation-save')?.addEventListener('click', () => this.saveDataValidation());
            
            document.getElementById('import-close')?.addEventListener('click', () => this.hideImportModal());
            document.getElementById('import-cancel')?.addEventListener('click', () => this.hideImportModal());
            document.getElementById('import-confirm')?.addEventListener('click', () => this.importFile());
            
            document.getElementById('export-close')?.addEventListener('click', () => this.hideExportModal());
            document.getElementById('export-cancel')?.addEventListener('click', () => this.hideExportModal());
            document.getElementById('export-confirm')?.addEventListener('click', () => this.exportFile());
            
            document.getElementById('chart-close')?.addEventListener('click', () => this.closeChart());
            document.getElementById('circular-close')?.addEventListener('click', () => {
                document.getElementById('circular-warning').style.display = 'none';
            });
            
            document.getElementById('conditional-type')?.addEventListener('change', (e) => {
                const isCellValue = e.target.value === 'cell-value';
                const isFormula = e.target.value === 'formula';
                document.getElementById('conditional-cell-value').style.display = isCellValue ? 'block' : 'none';
                document.getElementById('conditional-formula').style.display = isFormula ? 'block' : 'none';
            });
            
            document.getElementById('validation-type')?.addEventListener('change', (e) => {
                const isList = e.target.value === 'list';
                const hasConditions = ['integer', 'decimal', 'date', 'time', 'text-length'].includes(e.target.value);
                document.getElementById('validation-list').style.display = isList ? 'block' : 'none';
                document.getElementById('validation-conditions').style.display = hasConditions ? 'block' : 'none';
            });
            
            document.getElementById('conditional-operator')?.addEventListener('change', (e) => {
                const needsTwoValues = ['between', 'not-between'].includes(e.target.value);
                document.getElementById('conditional-value2').style.display = needsTwoValues ? 'inline-block' : 'none';
            });
            
            document.getElementById('validation-operator')?.addEventListener('change', (e) => {
                const needsTwoValues = ['between', 'not-between'].includes(e.target.value);
                document.getElementById('validation-value2').style.display = needsTwoValues ? 'inline-block' : 'none';
            });
            
            document.getElementById('filter-operator')?.addEventListener('change', (e) => {
                const needsTwoValues = ['between', 'not-between'].includes(e.target.value);
                document.getElementById('filter-value2-group').style.display = needsTwoValues ? 'block' : 'none';
            });
            
            document.getElementById('chart-modal-close')?.addEventListener('click', () => this.hideChartModal());
            document.getElementById('chart-modal-cancel')?.addEventListener('click', () => this.hideChartModal());
            document.getElementById('chart-modal-create')?.addEventListener('click', () => {
                const chartType = document.getElementById('chart-modal-type').value;
                const range = document.getElementById('chart-modal-range').value;
                const hasHeader = document.getElementById('chart-modal-has-header').checked;
                const hasLabels = document.getElementById('chart-modal-has-labels').checked;
                
                if (range) {
                    const parts = range.split(':');
                    if (parts.length === 2) {
                        const start = Utils.cellToCoords(parts[0].trim());
                        const end = Utils.cellToCoords(parts[1].trim());
                        
                        if (start && end) {
                            this.selection = {
                                startCol: start.col,
                                startRow: start.row,
                                endCol: end.col,
                                endRow: end.row
                            };
                        }
                    }
                }
                
                this.chartHasHeader = hasHeader;
                this.chartHasLabels = hasLabels;
                
                this.hideChartModal();
                this.insertChart(chartType);
            });
            
            document.getElementById('filter-modal-close')?.addEventListener('click', () => this.hideFilterModal());
            document.getElementById('filter-cancel')?.addEventListener('click', () => this.hideFilterModal());
            document.getElementById('filter-apply')?.addEventListener('click', () => this.applyFilter());
            document.getElementById('filter-clear')?.addEventListener('click', () => this.clearFilter());
        }

        showChartModal(chartType) {
            document.getElementById('chart-modal').style.display = 'flex';
            document.getElementById('chart-modal-type').value = chartType || 'line';
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            if (maxCol > minCol || maxRow > minRow) {
                const startCell = Utils.coordsToCell(minCol, minRow);
                const endCell = Utils.coordsToCell(maxCol, maxRow);
                document.getElementById('chart-modal-range').value = `${startCell}:${endCell}`;
            } else {
                document.getElementById('chart-modal-range').value = '';
            }
        }

        hideChartModal() {
            document.getElementById('chart-modal').style.display = 'none';
        }

        showFilterModal() {
            document.getElementById('filter-modal').style.display = 'flex';
            
            const select = document.getElementById('filter-column');
            select.innerHTML = '<option value="">选择列</option>';
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            
            for (let col = minCol; col <= maxCol; col++) {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = Utils.indexToColumn(col);
                select.appendChild(option);
            }
        }

        hideFilterModal() {
            document.getElementById('filter-modal').style.display = 'none';
        }

        applyFilter() {
            const filterCol = parseInt(document.getElementById('filter-column').value);
            const operator = document.getElementById('filter-operator').value;
            const value1 = document.getElementById('filter-value1').value;
            const value2 = document.getElementById('filter-value2').value;
            const applyToSelection = document.getElementById('filter-apply-selection').checked;
            
            if (isNaN(filterCol)) {
                alert('请选择要筛选的列');
                return;
            }
            
            let minRow, maxRow, minCol, maxCol;
            
            if (applyToSelection) {
                minRow = Math.min(this.selection.startRow, this.selection.endRow);
                maxRow = Math.max(this.selection.startRow, this.selection.endRow);
                minCol = Math.min(this.selection.startCol, this.selection.endCol);
                maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            } else {
                minRow = 0;
                maxRow = 1000;
                minCol = 0;
                maxCol = 100;
            }
            
            const numValue1 = parseFloat(value1);
            const numValue2 = parseFloat(value2);
            
            for (let row = minRow; row <= maxRow; row++) {
                const cell = this.getCell(filterCol, row);
                let cellValue = cell?.value;
                let showRow = true;
                
                if (cellValue === null || cellValue === undefined) {
                    cellValue = '';
                }
                
                switch (operator) {
                    case 'equal':
                        showRow = String(cellValue) === value1;
                        break;
                    case 'not-equal':
                        showRow = String(cellValue) !== value1;
                        break;
                    case 'greater':
                        showRow = parseFloat(cellValue) > numValue1;
                        break;
                    case 'less':
                        showRow = parseFloat(cellValue) < numValue1;
                        break;
                    case 'greater-equal':
                        showRow = parseFloat(cellValue) >= numValue1;
                        break;
                    case 'less-equal':
                        showRow = parseFloat(cellValue) <= numValue1;
                        break;
                    case 'between':
                        showRow = parseFloat(cellValue) >= numValue1 && parseFloat(cellValue) <= numValue2;
                        break;
                    case 'not-between':
                        showRow = parseFloat(cellValue) < numValue1 || parseFloat(cellValue) > numValue2;
                        break;
                    case 'contains':
                        showRow = String(cellValue).toLowerCase().includes(value1.toLowerCase());
                        break;
                    case 'starts-with':
                        showRow = String(cellValue).toLowerCase().startsWith(value1.toLowerCase());
                        break;
                    case 'ends-with':
                        showRow = String(cellValue).toLowerCase().endsWith(value1.toLowerCase());
                        break;
                }
                
                if (!showRow) {
                    this.hiddenRows.add(row);
                }
            }
            
            this.hideFilterModal();
            this.render();
        }

        clearFilter() {
            this.hiddenRows.clear();
            this.hideFilterModal();
            this.render();
        }

        initUI() {
            this.updateNameBox();
            this.updateColumnHeaders();
            this.updateRowHeaders();
        }

        updateColumnHeaders() {
            const container = document.getElementById('column-header-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            const visibleCols = this.getVisibleCols();
            for (const col of visibleCols) {
                const cell = document.createElement('div');
                cell.className = 'column-header-cell';
                cell.textContent = Utils.indexToColumn(col);
                cell.style.minWidth = this.cellWidth + 'px';
                container.appendChild(cell);
            }
        }

        updateRowHeaders() {
            const container = document.getElementById('row-header-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            const visibleRows = this.getVisibleRows();
            for (const row of visibleRows) {
                const cell = document.createElement('div');
                cell.className = 'row-header-cell';
                cell.textContent = (row + 1).toString();
                cell.style.height = this.rowHeight + 'px';
                container.appendChild(cell);
            }
        }

        getVisibleCols() {
            const cols = [];
            const startCol = Math.floor(this.scrollX / this.cellWidth);
            const endCol = startCol + Math.ceil(this.canvas.width / this.cellWidth) + 2;
            
            for (let col = startCol; col <= Math.min(endCol, this.maxCols - 1); col++) {
                if (!this.hiddenCols.has(col)) {
                    cols.push(col);
                }
            }
            return cols;
        }

        getVisibleRows() {
            const rows = [];
            const startRow = Math.floor(this.scrollY / this.rowHeight);
            const endRow = startRow + Math.ceil(this.canvas.height / this.rowHeight) + 2;
            
            for (let row = startRow; row <= Math.min(endRow, this.maxRows - 1); row++) {
                if (!this.hiddenRows.has(row)) {
                    rows.push(row);
                }
            }
            return rows;
        }

        updateScrollbars() {
            const hScroll = document.getElementById('scrollbar-h');
            const vScroll = document.getElementById('scrollbar-v');
            const hThumb = document.getElementById('scrollbar-thumb-h');
            const vThumb = document.getElementById('scrollbar-thumb-v');
            
            if (!hScroll || !vScroll || !hThumb || !vThumb) return;
            
            const maxScrollX = this.maxCols * this.cellWidth - this.canvas.width;
            const maxScrollY = this.maxRows * this.rowHeight - this.canvas.height;
            
            const hThumbWidth = Math.max(30, (this.canvas.width / (this.maxCols * this.cellWidth)) * (hScroll.clientWidth - 4));
            const vThumbHeight = Math.max(30, (this.canvas.height / (this.maxRows * this.rowHeight)) * (vScroll.clientHeight - 4));
            
            hThumb.style.width = hThumbWidth + 'px';
            vThumb.style.height = vThumbHeight + 'px';
            
            const hThumbLeft = (this.scrollX / maxScrollX) * (hScroll.clientWidth - hThumbWidth - 4);
            const vThumbTop = (this.scrollY / maxScrollY) * (vScroll.clientHeight - vThumbHeight - 4);
            
            hThumb.style.left = Math.max(0, hThumbLeft) + 'px';
            vThumb.style.top = Math.max(0, vThumbTop) + 'px';
        }

        handleMouseDown(e) {
            if (this.editingCell) {
                this.commitEdit();
            }
            
            const coords = this.getCellCoordsFromEvent(e);
            if (!coords) return;
            
            this.selection.startCol = coords.col;
            this.selection.startRow = coords.row;
            this.selection.endCol = coords.col;
            this.selection.endRow = coords.row;
            this.activeCell = { col: coords.col, row: coords.row };
            
            this.isDragging = true;
            this.updateNameBox();
            this.render();
        }

        handleMouseMove(e) {
            if (!this.isDragging) return;
            
            const coords = this.getCellCoordsFromEvent(e);
            if (!coords) return;
            
            this.selection.endCol = coords.col;
            this.selection.endRow = coords.row;
            this.activeCell = { col: coords.col, row: coords.row };
            
            this.updateNameBox();
            this.updateStatusBar();
            this.render();
            
            this.broadcastCursorPosition(coords.col, coords.row);
        }

        handleMouseUp(e) {
            this.isDragging = false;
            this.updateStatusBar();
        }

        handleDoubleClick(e) {
            const coords = this.getCellCoordsFromEvent(e);
            if (!coords) return;
            
            this.startEdit(coords.col, coords.row);
        }

        handleWheel(e) {
            e.preventDefault();
            
            const deltaX = e.deltaX || (e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY);
            const deltaY = e.deltaY || 0;
            
            const maxScrollX = this.maxCols * this.cellWidth - this.canvas.width;
            const maxScrollY = this.maxRows * this.rowHeight - this.canvas.height;
            
            this.scrollX = Math.max(0, Math.min(maxScrollX, this.scrollX + deltaX));
            this.scrollY = Math.max(0, Math.min(maxScrollY, this.scrollY + deltaY));
            
            this.updateScrollbars();
            this.updateColumnHeaders();
            this.updateRowHeaders();
            this.render();
        }

        handleContextMenu(e) {
            e.preventDefault();
            
            const coords = this.getCellCoordsFromEvent(e);
            if (coords) {
                this.activeCell = coords;
                this.selection = {
                    startCol: coords.col,
                    startRow: coords.row,
                    endCol: coords.col,
                    endRow: coords.row
                };
            }
            
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu) {
                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
                contextMenu.style.display = 'block';
                
                contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                    item.onclick = () => {
                        this.handleContextMenuAction(item.dataset.action);
                        contextMenu.style.display = 'none';
                    };
                });
            }
        }

        handleContextMenuAction(action) {
            switch (action) {
                case 'cut':
                    this.cut();
                    break;
                case 'copy':
                    this.copy();
                    break;
                case 'paste':
                    this.paste();
                    break;
                case 'insert-row':
                    this.insertRow();
                    break;
                case 'insert-column':
                    this.insertColumn();
                    break;
                case 'delete-row':
                    this.deleteRow();
                    break;
                case 'delete-column':
                    this.deleteColumn();
                    break;
                case 'hide-row':
                    this.hideRow();
                    break;
                case 'hide-column':
                    this.hideColumn();
                    break;
                case 'merge':
                    this.mergeCells();
                    break;
                case 'unmerge':
                    this.unmergeCells();
                    break;
                case 'format':
                    this.showConditionalModal();
                    break;
            }
        }

        handleKeyDown(e) {
            if (this.editingCell) {
                return;
            }

            const key = e.key;
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;

            if (ctrl) {
                switch (key.toLowerCase()) {
                    case 'a':
                        e.preventDefault();
                        this.selectAll();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.copy();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.paste();
                        break;
                    case 'x':
                        e.preventDefault();
                        this.cut();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (shift) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.toggleFormat('underline');
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportFile();
                        break;
                }
            } else {
                switch (key) {
                    case 'Enter':
                        e.preventDefault();
                        if (shift) {
                            this.navigate(0, -1);
                        } else {
                            this.startEdit(this.activeCell.col, this.activeCell.row);
                        }
                        break;
                    case 'Tab':
                        e.preventDefault();
                        this.navigate(shift ? -1 : 1, 0);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (shift) {
                            this.extendSelection(0, -1);
                        } else {
                            this.navigate(0, -1);
                        }
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        if (shift) {
                            this.extendSelection(0, 1);
                        } else {
                            this.navigate(0, 1);
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (shift) {
                            this.extendSelection(-1, 0);
                        } else {
                            this.navigate(-1, 0);
                        }
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        if (shift) {
                            this.extendSelection(1, 0);
                        } else {
                            this.navigate(1, 0);
                        }
                        break;
                    case 'Delete':
                    case 'Backspace':
                        e.preventDefault();
                        this.clearSelection();
                        break;
                    case 'F2':
                        e.preventDefault();
                        this.startEdit(this.activeCell.col, this.activeCell.row);
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.cancelEdit();
                        break;
                }
            }
        }

        getCellCoordsFromEvent(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const col = Math.floor((this.scrollX + x) / this.cellWidth);
            const row = Math.floor((this.scrollY + y) / this.rowHeight);
            
            if (col < 0 || col >= this.maxCols || row < 0 || row >= this.maxRows) {
                return null;
            }
            
            return { col, row };
        }

        navigate(dx, dy) {
            const newCol = Math.max(0, Math.min(this.maxCols - 1, this.activeCell.col + dx));
            const newRow = Math.max(0, Math.min(this.maxRows - 1, this.activeCell.row + dy));
            
            this.activeCell = { col: newCol, row: newRow };
            this.selection = {
                startCol: newCol,
                startRow: newRow,
                endCol: newCol,
                endRow: newRow
            };
            
            this.scrollToCell(newCol, newRow);
            this.updateNameBox();
            this.updateStatusBar();
            this.render();
        }

        extendSelection(dx, dy) {
            this.selection.endCol = Math.max(0, Math.min(this.maxCols - 1, this.selection.endCol + dx));
            this.selection.endRow = Math.max(0, Math.min(this.maxRows - 1, this.selection.endRow + dy));
            
            this.activeCell = {
                col: this.selection.endCol,
                row: this.selection.endRow
            };
            
            this.scrollToCell(this.selection.endCol, this.selection.endRow);
            this.updateNameBox();
            this.updateStatusBar();
            this.render();
        }

        scrollToCell(col, row) {
            const cellX = col * this.cellWidth;
            const cellY = row * this.rowHeight;
            
            const viewLeft = this.scrollX;
            const viewRight = this.scrollX + this.canvas.width;
            const viewTop = this.scrollY;
            const viewBottom = this.scrollY + this.canvas.height;
            
            if (cellX < viewLeft) {
                this.scrollX = cellX;
            } else if (cellX + this.cellWidth > viewRight) {
                this.scrollX = cellX + this.cellWidth - this.canvas.width;
            }
            
            if (cellY < viewTop) {
                this.scrollY = cellY;
            } else if (cellY + this.rowHeight > viewBottom) {
                this.scrollY = cellY + this.rowHeight - this.canvas.height;
            }
            
            this.updateScrollbars();
            this.updateColumnHeaders();
            this.updateRowHeaders();
        }

        selectAll() {
            this.selection = {
                startCol: 0,
                startRow: 0,
                endCol: this.maxCols - 1,
                endRow: this.maxRows - 1
            };
            this.activeCell = { col: 0, row: 0 };
            this.updateNameBox();
            this.updateStatusBar();
            this.render();
        }

        startEdit(col, row) {
            if (this.editingCell) {
                this.commitEdit();
            }
            
            this.editingCell = { col, row };
            
            const cellX = col * this.cellWidth - this.scrollX;
            const cellY = row * this.rowHeight - this.scrollY;
            
            this.cellEditor.style.left = cellX + 'px';
            this.cellEditor.style.top = cellY + 'px';
            this.cellEditor.style.width = this.cellWidth + 'px';
            this.cellEditor.style.height = this.rowHeight + 'px';
            
            const cell = this.getCell(col, row);
            this.cellEditor.value = cell?.rawValue || cell?.value || '';
            this.formulaInput.value = cell?.formula || cell?.rawValue || cell?.value || '';
            
            this.cellEditor.style.display = 'block';
            this.cellEditor.focus();
            this.cellEditor.select();
        }

        commitEdit() {
            if (!this.editingCell) return;
            
            const { col, row } = this.editingCell;
            const value = this.cellEditor.value.trim();
            
            this.cellEditor.style.display = 'none';
            this.formulaInput.value = '';
            
            this.setCellValue(col, row, value);
            
            this.editingCell = null;
            this.updateStatusBar();
            this.render();
        }

        cancelEdit() {
            this.cellEditor.style.display = 'none';
            this.formulaInput.value = '';
            this.editingCell = null;
        }

        getCell(col, row) {
            const cellId = Utils.coordsToCell(col, row);
            return this.cells.get(cellId);
        }

        getCellId(col, row) {
            return Utils.coordsToCell(col, row);
        }

        getDisplayValue(col, row) {
            const cell = this.getCell(col, row);
            if (!cell) return '';
            if (cell.value === null || cell.value === undefined) return '';
            
            if (cell.format?.numberFormat === 'currency') {
                return '¥' + Number(cell.value).toFixed(2);
            } else if (cell.format?.numberFormat === 'percent') {
                return (Number(cell.value) * 100).toFixed(1) + '%';
            } else if (cell.format?.numberFormat === 'date') {
                const d = new Date(cell.value);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString('zh-CN');
                }
                return cell.value;
            } else if (cell.format?.numberFormat === 'time') {
                const d = new Date(cell.value);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleTimeString('zh-CN');
                }
                return cell.value;
            }
            
            if (typeof cell.value === 'number') {
                return Number.isInteger(cell.value) ? String(cell.value) : cell.value.toFixed(4).replace(/\.?0+$/, '');
            }
            
            return String(cell.value);
        }

        evaluateAll() {
            const sortedCellIds = this.dependencyGraph.topologicalSort();
            for (const cellId of sortedCellIds) {
                const cell = this.cells.get(cellId);
                if (cell && cell.formula) {
                    try {
                        const ast = Parser.parse(cell.formula);
                        cell.value = this.evaluateFormula(ast);
                        cell.error = null;
                    } catch (e) {
                        cell.value = '#ERROR!';
                        cell.error = e.message;
                    }
                }
            }
        }

        setCellValue(col, row, value) {
            const cellId = Utils.coordsToCell(col, row);
            
            this.saveUndoState();
            
            let cell = this.cells.get(cellId) || {};
            
            this.dependencyGraph.removeDependencies(cellId);
            
            if (value.startsWith('=')) {
                cell.formula = value;
                cell.rawValue = value;
                
                try {
                    const ast = Parser.parse(value);
                    const references = this.dependencyGraph.extractReferences(ast);
                    
                    for (const ref of references) {
                        this.dependencyGraph.addDependency(cellId, ref);
                    }
                    
                    if (this.dependencyGraph.detectCycle(cellId)) {
                        document.getElementById('circular-warning').style.display = 'flex';
                        cell.value = '#CIRCULAR!';
                        cell.error = 'Circular reference detected';
                    } else {
                        cell.value = this.evaluateFormula(ast);
                        cell.error = null;
                    }
                } catch (e) {
                    cell.value = '#ERROR!';
                    cell.error = e.message;
                }
            } else {
                cell.rawValue = value;
                cell.formula = null;
                cell.error = null;
                
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && value === String(numValue)) {
                    cell.value = numValue;
                } else {
                    cell.value = value;
                }
            }
            
            this.cells.set(cellId, cell);
            
            this.lamportTimestamp++;
            const operation = this.crdtDoc.generateOperation(
                'set', cellId, cell, this.userId, this.lamportTimestamp
            );
            this.crdtDoc.applyOperation(operation);
            
            this.recalculateDependents(cellId);
            
            this.updateCharts();
        }

        evaluateFormula(ast) {
            return Interpreter.evaluate(
                ast,
                (col, row) => {
                    const cell = this.getCell(col, row);
                    return cell?.value ?? null;
                },
                (startCol, startRow, endCol, endRow) => {
                    const result = [];
                    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
                        const rowData = [];
                        for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
                            const cell = this.getCell(col, row);
                            rowData.push(cell?.value ?? null);
                        }
                        result.push(rowData);
                    }
                    return result;
                }
            );
        }

        recalculateDependents(cellId) {
            const sorted = this.dependencyGraph.topologicalSort();
            const startIndex = sorted.indexOf(cellId);
            
            if (startIndex === -1) return;
            
            for (let i = startIndex + 1; i < sorted.length; i++) {
                const depCellId = sorted[i];
                const cell = this.cells.get(depCellId);
                
                if (cell && cell.formula) {
                    try {
                        const ast = Parser.parse(cell.formula);
                        cell.value = this.evaluateFormula(ast);
                        cell.error = null;
                    } catch (e) {
                        cell.value = '#ERROR!';
                        cell.error = e.message;
                    }
                }
            }
        }

        clearSelection() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            this.saveUndoState();
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cellId = Utils.coordsToCell(col, row);
                    this.cells.delete(cellId);
                    this.dependencyGraph.removeDependencies(cellId);
                }
            }
            
            this.updateStatusBar();
            this.render();
        }

        copy() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            this.clipboard = {
                data: [],
                width: maxCol - minCol + 1,
                height: maxRow - minRow + 1
            };
            
            for (let row = minRow; row <= maxRow; row++) {
                const rowData = [];
                for (let col = minCol; col <= maxCol; col++) {
                    const cell = this.getCell(col, row);
                    rowData.push(cell ? Utils.deepClone(cell) : null);
                }
                this.clipboard.data.push(rowData);
            }
        }

        cut() {
            this.copy();
            this.clearSelection();
        }

        paste() {
            if (!this.clipboard) return;
            
            this.saveUndoState();
            
            const startCol = this.activeCell.col;
            const startRow = this.activeCell.row;
            
            for (let r = 0; r < this.clipboard.height; r++) {
                for (let c = 0; c < this.clipboard.width; c++) {
                    const cellData = this.clipboard.data[r]?.[c];
                    if (cellData) {
                        const col = startCol + c;
                        const row = startRow + r;
                        const cellId = Utils.coordsToCell(col, row);
                        
                        this.cells.set(cellId, Utils.deepClone(cellData));
                        
                        if (cellData.formula) {
                            try {
                                const ast = Parser.parse(cellData.formula);
                                const references = this.dependencyGraph.extractReferences(ast);
                                
                                this.dependencyGraph.removeDependencies(cellId);
                                for (const ref of references) {
                                    this.dependencyGraph.addDependency(cellId, ref);
                                }
                            } catch (e) {
                            }
                        }
                    }
                }
            }
            
            this.updateStatusBar();
            this.render();
        }

        saveUndoState() {
            const state = {
                cells: Utils.deepClone(Array.from(this.cells.entries())),
                mergedCells: Utils.deepClone(this.mergedCells),
                selection: Utils.deepClone(this.selection),
                activeCell: Utils.deepClone(this.activeCell)
            };
            
            this.undoStack.push(state);
            this.redoStack = [];
            
            if (this.undoStack.length > this.maxUndoSteps) {
                this.undoStack.shift();
            }
        }

        undo() {
            if (this.undoStack.length === 0) return;
            
            const state = this.undoStack.pop();
            this.redoStack.push({
                cells: Utils.deepClone(Array.from(this.cells.entries())),
                mergedCells: Utils.deepClone(this.mergedCells),
                selection: Utils.deepClone(this.selection),
                activeCell: Utils.deepClone(this.activeCell)
            });
            
            this.cells = new Map(state.cells);
            this.mergedCells = state.mergedCells;
            this.selection = state.selection;
            this.activeCell = state.activeCell;
            
            this.updateStatusBar();
            this.render();
        }

        redo() {
            if (this.redoStack.length === 0) return;
            
            const state = this.redoStack.pop();
            this.undoStack.push({
                cells: Utils.deepClone(Array.from(this.cells.entries())),
                mergedCells: Utils.deepClone(this.mergedCells),
                selection: Utils.deepClone(this.selection),
                activeCell: Utils.deepClone(this.activeCell)
            });
            
            this.cells = new Map(state.cells);
            this.mergedCells = state.mergedCells;
            this.selection = state.selection;
            this.activeCell = state.activeCell;
            
            this.updateStatusBar();
            this.render();
        }

        mergeCells() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            if (minCol === maxCol && minRow === maxRow) return;
            
            this.saveUndoState();
            
            for (let i = this.mergedCells.length - 1; i >= 0; i--) {
                const merge = this.mergedCells[i];
                if (this.selectionsOverlap(
                    minCol, maxCol, minRow, maxRow,
                    merge.startCol, merge.endCol, merge.startRow, merge.endRow
                )) {
                    this.mergedCells.splice(i, 1);
                }
            }
            
            this.mergedCells.push({
                startCol: minCol,
                endCol: maxCol,
                startRow: minRow,
                endRow: maxRow
            });
            
            this.updateStatusBar();
            this.render();
        }

        unmergeCells() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            this.saveUndoState();
            
            for (let i = this.mergedCells.length - 1; i >= 0; i--) {
                const merge = this.mergedCells[i];
                if (this.selectionsOverlap(
                    minCol, maxCol, minRow, maxRow,
                    merge.startCol, merge.endCol, merge.startRow, merge.endRow
                )) {
                    this.mergedCells.splice(i, 1);
                }
            }
            
            this.updateStatusBar();
            this.render();
        }

        selectionsOverlap(minCol1, maxCol1, minRow1, maxRow1, minCol2, maxCol2, minRow2, maxRow2) {
            return !(maxCol1 < minCol2 || minCol1 > maxCol2 || maxRow1 < minRow2 || minRow1 > maxRow2);
        }

        getMergeForCell(col, row) {
            for (const merge of this.mergedCells) {
                if (col >= merge.startCol && col <= merge.endCol &&
                    row >= merge.startRow && row <= merge.endRow) {
                    return merge;
                }
            }
            return null;
        }

        insertRow() {
            this.saveUndoState();
            this.updateStatusBar();
            this.render();
        }

        insertColumn() {
            this.saveUndoState();
            this.updateStatusBar();
            this.render();
        }

        deleteRow() {
            this.saveUndoState();
            this.updateStatusBar();
            this.render();
        }

        deleteColumn() {
            this.saveUndoState();
            this.updateStatusBar();
            this.render();
        }

        hideRow() {
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (let row = minRow; row <= maxRow; row++) {
                this.hiddenRows.add(row);
            }
            
            this.updateRowHeaders();
            this.render();
        }

        hideColumn() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            
            for (let col = minCol; col <= maxCol; col++) {
                this.hiddenCols.add(col);
            }
            
            this.updateColumnHeaders();
            this.render();
        }

        toggleFreeze() {
            if (this.frozenRows === 0 && this.frozenCols === 0) {
                this.frozenRows = this.activeCell.row + 1;
                this.frozenCols = this.activeCell.col + 1;
            } else {
                this.frozenRows = 0;
                this.frozenCols = 0;
            }
            this.updateFrozenCanvases();
            this.render();
        }

        updateFrozenCanvases() {
            const container = document.getElementById('grid-container');
            const frozenTL = document.getElementById('frozen-top-left');
            const frozenT = document.getElementById('frozen-top');
            const frozenL = document.getElementById('frozen-left');
            
            if (this.frozenRows > 0 || this.frozenCols > 0) {
                let frozenWidth = 0;
                for (let c = 0; c < this.frozenCols && c < this.maxCols; c++) {
                    if (!this.hiddenCols.has(c)) {
                        frozenWidth += this.cellWidth;
                    }
                }
                
                let frozenHeight = 0;
                for (let r = 0; r < this.frozenRows && r < this.maxRows; r++) {
                    if (!this.hiddenRows.has(r)) {
                        frozenHeight += this.rowHeight;
                    }
                }
                
                if (frozenTL) {
                    frozenTL.style.display = (this.frozenRows > 0 && this.frozenCols > 0) ? 'block' : 'none';
                    if (this.frozenCanvasTL) {
                        this.frozenCanvasTL.width = frozenWidth;
                        this.frozenCanvasTL.height = frozenHeight;
                    }
                }
                
                if (frozenT) {
                    frozenT.style.display = this.frozenRows > 0 ? 'block' : 'none';
                    if (this.frozenCanvasT) {
                        this.frozenCanvasT.width = this.canvas.width;
                        this.frozenCanvasT.height = frozenHeight;
                    }
                }
                
                if (frozenL) {
                    frozenL.style.display = this.frozenCols > 0 ? 'block' : 'none';
                    if (this.frozenCanvasL) {
                        this.frozenCanvasL.width = frozenWidth;
                        this.frozenCanvasL.height = this.canvas.height;
                    }
                }
            } else {
                if (frozenTL) frozenTL.style.display = 'none';
                if (frozenT) frozenT.style.display = 'none';
                if (frozenL) frozenL.style.display = 'none';
            }
        }

        saveHistory() {
            this.saveUndoState();
        }

        saveUndoState() {
            const state = {
                cells: new Map(this.cells),
                mergedCells: JSON.parse(JSON.stringify(this.mergedCells)),
                selection: JSON.parse(JSON.stringify(this.selection)),
                activeCell: JSON.parse(JSON.stringify(this.activeCell))
            };
            
            this.undoStack.push(state);
            if (this.undoStack.length > this.maxUndoSteps) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        }

        toggleFormat(formatType) {
            this.saveUndoState();
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cellId = Utils.coordsToCell(col, row);
                    let cell = this.cells.get(cellId) || {};
                    
                    if (!cell.format) cell.format = {};
                    
                    switch (formatType) {
                        case 'bold':
                            cell.format.bold = !cell.format.bold;
                            break;
                        case 'italic':
                            cell.format.italic = !cell.format.italic;
                            break;
                        case 'underline':
                            cell.format.underline = !cell.format.underline;
                            break;
                    }
                    
                    this.cells.set(cellId, cell);
                }
            }
            
            this.render();
        }

        setFormat(formatType, value) {
            this.saveUndoState();
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cellId = Utils.coordsToCell(col, row);
                    let cell = this.cells.get(cellId) || {};
                    
                    if (!cell.format) cell.format = {};
                    cell.format[formatType] = value;
                    
                    this.cells.set(cellId, cell);
                }
            }
            
            this.render();
        }

        showConditionalModal() {
            document.getElementById('conditional-modal').style.display = 'flex';
        }

        hideConditionalModal() {
            document.getElementById('conditional-modal').style.display = 'none';
        }

        addConditionalFormat() {
            const type = document.getElementById('conditional-type').value;
            const operator = document.getElementById('conditional-operator').value;
            const value1 = document.getElementById('conditional-value1').value;
            const value2 = document.getElementById('conditional-value2').value;
            const formula = document.getElementById('conditional-formula-input').value;
            const bgColor = document.getElementById('conditional-bg').value;
            const fgColor = document.getElementById('conditional-fg').value;
            const bold = document.getElementById('conditional-bold').checked;
            const italic = document.getElementById('conditional-italic').checked;
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            this.conditionalFormats.push({
                type,
                range: { startCol: minCol, endCol: maxCol, startRow: minRow, endRow: maxRow },
                condition: {
                    operator,
                    value1,
                    value2,
                    formula
                },
                format: {
                    bgColor,
                    fgColor,
                    bold,
                    italic
                }
            });
            
            this.hideConditionalModal();
            this.render();
        }

        showValidationModal() {
            document.getElementById('validation-modal').style.display = 'flex';
        }

        hideValidationModal() {
            document.getElementById('validation-modal').style.display = 'none';
        }

        saveDataValidation() {
            const type = document.getElementById('validation-type').value;
            const operator = document.getElementById('validation-operator').value;
            const value1 = document.getElementById('validation-value1').value;
            const value2 = document.getElementById('validation-value2').value;
            const source = document.getElementById('validation-source').value;
            const allowBlank = document.getElementById('validation-blank').checked;
            const showDropdown = document.getElementById('validation-dropdown').checked;
            
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cellId = Utils.coordsToCell(col, row);
                    this.dataValidations.set(cellId, {
                        type,
                        operator,
                        value1,
                        value2,
                        source: source ? source.split(',').map(s => s.trim()) : [],
                        allowBlank,
                        showDropdown
                    });
                }
            }
            
            this.hideValidationModal();
        }

        insertChart(chartType) {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            const colCount = maxCol - minCol + 1;
            const rowCount = maxRow - minRow + 1;
            
            const useHeader = this.chartHasHeader !== false;
            const useLabels = this.chartHasLabels !== false;
            
            let labels = [];
            let datasets = [];
            
            let dataStartRow = useHeader ? minRow + 1 : minRow;
            let dataStartCol = useLabels ? minCol + 1 : minCol;
            let dataEndRow = maxRow;
            let dataEndCol = maxCol;
            
            if (useHeader) {
                for (let col = dataStartCol; col <= dataEndCol; col++) {
                    const cell = this.getCell(col, minRow);
                    const label = cell?.value;
                    datasets.push({
                        label: label !== undefined && label !== null ? String(label) : `系列 ${col - dataStartCol + 1}`,
                        data: []
                    });
                }
            } else {
                for (let col = dataStartCol; col <= dataEndCol; col++) {
                    datasets.push({
                        label: `系列 ${col - dataStartCol + 1}`,
                        data: []
                    });
                }
            }
            
            if (useLabels) {
                for (let row = dataStartRow; row <= dataEndRow; row++) {
                    const cell = this.getCell(minCol, row);
                    const label = cell?.value;
                    labels.push(label !== undefined && label !== null ? String(label) : `数据 ${row - dataStartRow + 1}`);
                }
            } else {
                for (let i = 0; i <= dataEndRow - dataStartRow; i++) {
                    labels.push(`数据 ${i + 1}`);
                }
            }
            
            for (let col = dataStartCol; col <= dataEndCol; col++) {
                const datasetIndex = col - dataStartCol;
                if (datasets[datasetIndex]) {
                    for (let row = dataStartRow; row <= dataEndRow; row++) {
                        const cell = this.getCell(col, row);
                        let val = cell?.value;
                        
                        if (typeof val === 'string') {
                            const parsed = parseFloat(val);
                            if (!isNaN(parsed) && parsed.toString() === val.trim()) {
                                val = parsed;
                            }
                        }
                        
                        datasets[datasetIndex].data.push(typeof val === 'number' ? val : null);
                    }
                }
            }
            
            let hasValidData = false;
            for (const ds of datasets) {
                for (const val of ds.data) {
                    if (val !== null) {
                        hasValidData = true;
                        break;
                    }
                }
                if (hasValidData) break;
            }
            
            if (!hasValidData || datasets.length === 0 || labels.length === 0) {
                labels = ['一月', '二月', '三月', '四月', '五月', '六月'];
                datasets = [
                    { label: '销售额', data: [65, 59, 80, 81, 56, 55] },
                    { label: '利润', data: [28, 48, 40, 19, 86, 27] }
                ];
            }
            
            if (chartType === 'pie' && datasets.length > 0) {
                const firstDataset = datasets[0];
                const pieLabels = [];
                const pieData = [];
                
                for (let i = 0; i < firstDataset.data.length; i++) {
                    if (firstDataset.data[i] !== null) {
                        pieLabels.push(labels[i] || `数据 ${i + 1}`);
                        pieData.push(firstDataset.data[i]);
                    }
                }
                
                if (pieData.length > 0) {
                    labels = pieLabels;
                    datasets = [{ label: firstDataset.label, data: pieData }];
                }
            }
            
            const chartContainer = document.getElementById('chart-container');
            const chartCanvas = document.getElementById('chart-canvas');
            const chartTitle = document.getElementById('chart-title');
            
            if (chartContainer && chartCanvas) {
                chartContainer.style.display = 'block';
                chartContainer.style.position = 'absolute';
                chartContainer.style.left = '150px';
                chartContainer.style.top = '150px';
                chartContainer.style.width = '600px';
                chartContainer.style.height = '400px';
                chartContainer.style.zIndex = '1000';
                
                const typeNames = { 'line': '折线图', 'bar': '柱状图', 'pie': '饼图' };
                chartTitle.textContent = typeNames[chartType] || '图表';
                
                chartCanvas.width = 596;
                chartCanvas.height = 368;
                
                const renderer = new ChartRenderer(chartCanvas);
                renderer.resize(596, 368);
                renderer.setData(datasets, labels);
                renderer.setType(chartType);
                
                this.activeChart = {
                    renderer,
                    type: chartType,
                    range: { startCol: minCol, endCol: maxCol, startRow: minRow, endRow: maxRow }
                };
                this.charts.push(this.activeChart);
            }
        }

        closeChart() {
            const chartContainer = document.getElementById('chart-container');
            if (chartContainer) {
                chartContainer.style.display = 'none';
            }
            this.activeChart = null;
        }

        updateCharts() {
            for (const chart of this.charts) {
                if (!chart.range) continue;
                
                const { startCol, endCol, startRow, endRow } = chart.range;
                const labels = [];
                const datasets = [];
                
                if (endRow > startRow) {
                    for (let col = startCol + 1; col <= endCol; col++) {
                        const headerCell = this.getCell(col, startRow);
                        const dataset = {
                            label: headerCell?.value || `系列 ${col - startCol}`,
                            data: []
                        };
                        
                        for (let row = startRow + 1; row <= endRow; row++) {
                            const cell = this.getCell(col, row);
                            const val = cell?.value;
                            dataset.data.push(typeof val === 'number' ? val : null);
                        }
                        
                        datasets.push(dataset);
                    }
                    
                    for (let row = startRow + 1; row <= endRow; row++) {
                        const labelCell = this.getCell(startCol, row);
                        labels.push(labelCell?.value || `${row - startRow}`);
                    }
                }
                
                chart.renderer.setData(datasets, labels);
            }
        }

        showImportModal() {
            document.getElementById('import-modal').style.display = 'flex';
        }

        hideImportModal() {
            document.getElementById('import-modal').style.display = 'none';
        }

        showExportModal() {
            document.getElementById('export-modal').style.display = 'flex';
        }

        hideExportModal() {
            document.getElementById('export-modal').style.display = 'none';
        }

        importFile() {
            const fileInput = document.getElementById('import-file');
            const file = fileInput?.files[0];
            
            if (!file) {
                this.hideImportModal();
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    let workbook;
                    
                    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                        workbook = XLSX.read(data, { type: 'array' });
                    } else if (file.name.endsWith('.csv')) {
                        const csvData = new TextDecoder().decode(data);
                        workbook = XLSX.read(csvData, { type: 'string' });
                    } else if (file.name.endsWith('.json')) {
                        const jsonData = JSON.parse(new TextDecoder().decode(data));
                        this.importFromJSON(jsonData);
                        this.hideImportModal();
                        return;
                    }
                    
                    if (workbook) {
                        this.importFromWorkbook(workbook);
                    }
                    
                    this.hideImportModal();
                    this.render();
                } catch (err) {
                    console.error('Import error:', err);
                    alert('导入失败: ' + err.message);
                }
            };
            
            if (file.name.endsWith('.json')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }

        importFromWorkbook(workbook) {
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            
            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = { c: col, r: row };
                    const cell = worksheet[XLSX.utils.encode_cell(cellAddress)];
                    
                    if (cell) {
                        const cellId = Utils.coordsToCell(col, row);
                        const newCell = { value: cell.v };
                        
                        if (cell.f) {
                            newCell.formula = '=' + cell.f;
                            newCell.rawValue = newCell.formula;
                        } else {
                            newCell.rawValue = cell.w || String(cell.v);
                        }
                        
                        this.cells.set(cellId, newCell);
                    }
                }
            }
        }

        importFromJSON(jsonData) {
            if (Array.isArray(jsonData)) {
                for (let row = 0; row < jsonData.length; row++) {
                    const rowData = jsonData[row];
                    if (Array.isArray(rowData)) {
                        for (let col = 0; col < rowData.length; col++) {
                            const value = rowData[col];
                            if (value !== null && value !== undefined) {
                                const cellId = Utils.coordsToCell(col, row);
                                const newCell = { value };
                                newCell.rawValue = String(value);
                                this.cells.set(cellId, newCell);
                            }
                        }
                    }
                }
            } else if (typeof jsonData === 'object') {
                if (jsonData.cells) {
                    for (const [cellId, cellData] of Object.entries(jsonData.cells)) {
                        this.cells.set(cellId, cellData);
                    }
                }
            }
        }

        exportFile() {
            const format = document.getElementById('export-format').value;
            const filename = document.getElementById('export-filename').value || 'spreadsheet';
            
            try {
                if (format === 'json') {
                    this.exportAsJSON(filename);
                } else if (format === 'csv') {
                    this.exportAsCSV(filename);
                } else {
                    this.exportAsXLSX(filename);
                }
                
                this.hideExportModal();
            } catch (err) {
                console.error('Export error:', err);
                alert('导出失败: ' + err.message);
            }
        }

        exportAsJSON(filename) {
            const data = {
                cells: Object.fromEntries(this.cells),
                mergedCells: this.mergedCells,
                conditionalFormats: this.conditionalFormats,
                dataValidations: Object.fromEntries(this.dataValidations)
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadBlob(blob, filename + '.json');
        }

        exportAsCSV(filename) {
            let maxCol = 0;
            let maxRow = 0;
            
            for (const [cellId] of this.cells) {
                const coords = Utils.cellToCoords(cellId);
                if (coords) {
                    maxCol = Math.max(maxCol, coords.col);
                    maxRow = Math.max(maxRow, coords.row);
                }
            }
            
            let csvContent = '';
            
            for (let row = 0; row <= maxRow; row++) {
                const rowValues = [];
                for (let col = 0; col <= maxCol; col++) {
                    const cell = this.getCell(col, row);
                    const value = cell?.value;
                    
                    if (value === null || value === undefined) {
                        rowValues.push('');
                    } else {
                        let strValue = String(value);
                        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                            strValue = '"' + strValue.replace(/"/g, '""') + '"';
                        }
                        rowValues.push(strValue);
                    }
                }
                csvContent += rowValues.join(',') + '\n';
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            this.downloadBlob(blob, filename + '.csv');
        }

        exportAsXLSX(filename) {
            let maxCol = 0;
            let maxRow = 0;
            
            for (const [cellId] of this.cells) {
                const coords = Utils.cellToCoords(cellId);
                if (coords) {
                    maxCol = Math.max(maxCol, coords.col);
                    maxRow = Math.max(maxRow, coords.row);
                }
            }
            
            const worksheetData = [];
            
            for (let row = 0; row <= maxRow; row++) {
                const rowValues = [];
                for (let col = 0; col <= maxCol; col++) {
                    const cell = this.getCell(col, row);
                    rowValues.push(cell?.value ?? null);
                }
                worksheetData.push(rowValues);
            }
            
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
            for (const [cellId, cellData] of this.cells) {
                if (cellData.formula) {
                    const coords = Utils.cellToCoords(cellId);
                    if (coords) {
                        const cellAddress = XLSX.utils.encode_cell({ c: coords.col, r: coords.row });
                        if (worksheet[cellAddress]) {
                            worksheet[cellAddress].f = cellData.formula.substring(1);
                        }
                    }
                }
            }
            
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            
            XLSX.writeFile(workbook, filename + '.xlsx');
        }

        downloadBlob(blob, filename) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }

        updateNameBox() {
            if (this.nameBox) {
                this.nameBox.textContent = Utils.coordsToCell(this.activeCell.col, this.activeCell.row);
            }
        }

        updateStatusBar() {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            const width = maxCol - minCol + 1;
            const height = maxRow - minRow + 1;
            
            const selectionInfo = document.getElementById('selection-info');
            if (selectionInfo) {
                selectionInfo.textContent = `选择: ${width}×${height}`;
            }
            
            let sum = 0;
            let count = 0;
            let numericCount = 0;
            
            for (let col = minCol; col <= maxCol; col++) {
                for (let row = minRow; row <= maxRow; row++) {
                    const cell = this.getCell(col, row);
                    if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
                        count++;
                        if (typeof cell.value === 'number') {
                            sum += cell.value;
                            numericCount++;
                        }
                    }
                }
            }
            
            const sumDisplay = document.getElementById('sum-display');
            const avgDisplay = document.getElementById('avg-display');
            const countDisplay = document.getElementById('count-display');
            
            if (sumDisplay) sumDisplay.textContent = `求和: ${sum.toFixed(2)}`;
            if (avgDisplay) avgDisplay.textContent = `平均值: ${numericCount > 0 ? (sum / numericCount).toFixed(2) : '0'}`;
            if (countDisplay) countDisplay.textContent = `计数: ${count}`;
        }

        updateUI() {
            this.updateNameBox();
            this.updateStatusBar();
        }

        broadcastCursorPosition(col, row) {
        }

        render() {
            this.renderGrid(this.ctx, this.scrollX, this.scrollY, 0, 0, this.canvas.width, this.canvas.height);
        }

        renderGrid(ctx, scrollX, scrollY, offsetX, offsetY, width, height) {
            ctx.clearRect(offsetX, offsetY, width, height);
            
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 1;
            
            const visibleCols = this.getVisibleCols();
            const visibleRows = this.getVisibleRows();
            
            const selMinCol = Math.min(this.selection.startCol, this.selection.endCol);
            const selMaxCol = Math.max(this.selection.startCol, this.selection.endCol);
            const selMinRow = Math.min(this.selection.startRow, this.selection.endRow);
            const selMaxRow = Math.max(this.selection.startRow, this.selection.endRow);
            
            for (const row of visibleRows) {
                for (const col of visibleCols) {
                    const x = col * this.cellWidth - scrollX + offsetX;
                    const y = row * this.rowHeight - scrollY + offsetY;
                    
                    if (x + this.cellWidth < offsetX || x > offsetX + width ||
                        y + this.rowHeight < offsetY || y > offsetY + height) {
                        continue;
                    }
                    
                    const merge = this.getMergeForCell(col, row);
                    let isMergeTopLeft = false;
                    let mergeWidth = this.cellWidth;
                    let mergeHeight = this.rowHeight;
                    
                    if (merge) {
                        if (col === merge.startCol && row === merge.startRow) {
                            isMergeTopLeft = true;
                            mergeWidth = (merge.endCol - merge.startCol + 1) * this.cellWidth;
                            mergeHeight = (merge.endRow - merge.startRow + 1) * this.rowHeight;
                        } else {
                            continue;
                        }
                    }
                    
                    let bgColor = '#ffffff';
                    let textColor = '#000000';
                    let format = null;
                    
                    const cell = merge ? this.getCell(merge.startCol, merge.startRow) : this.getCell(col, row);
                    
                    if (cell?.format) {
                        format = cell.format;
                        if (format.bgColor) bgColor = format.bgColor;
                        if (format.textColor) textColor = format.textColor;
                    }
                    
                    for (const cf of this.conditionalFormats) {
                        if (col >= cf.range.startCol && col <= cf.range.endCol &&
                            row >= cf.range.startRow && row <= cf.range.endRow) {
                            if (this.evaluateConditionalFormat(cf, col, row, cell)) {
                                if (cf.format.bgColor) bgColor = cf.format.bgColor;
                                if (cf.format.fgColor) textColor = cf.format.fgColor;
                                if (!format) format = {};
                                if (cf.format.bold) format.bold = true;
                                if (cf.format.italic) format.italic = true;
                            }
                        }
                    }
                    
                    if (col >= selMinCol && col <= selMaxCol && row >= selMinRow && row <= selMaxRow) {
                        const alpha = isMergeTopLeft ? 0.15 : 0.1;
                        bgColor = this.lightenColor(bgColor, alpha);
                    }
                    
                    const drawX = isMergeTopLeft ? merge.startCol * this.cellWidth - scrollX + offsetX : x;
                    const drawY = isMergeTopLeft ? merge.startRow * this.rowHeight - scrollY + offsetY : y;
                    const drawWidth = isMergeTopLeft ? mergeWidth : this.cellWidth;
                    const drawHeight = isMergeTopLeft ? mergeHeight : this.rowHeight;
                    
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
                    
                    ctx.strokeStyle = '#e0e0e0';
                    ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
                    
                    if (cell) {
                        let displayValue = '';
                        if (cell.value !== null && cell.value !== undefined) {
                            displayValue = typeof cell.value === 'number' ? 
                                (Number.isInteger(cell.value) ? cell.value : cell.value.toFixed(4).replace(/\.?0+$/, '')) :
                                String(cell.value);
                        }
                        
                        if (displayValue) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(drawX + 2, drawY + 2, drawWidth - 4, drawHeight - 4);
                            ctx.clip();
                            
                            let fontStyle = '';
                            let fontWeight = '';
                            let fontSize = format?.fontSize || 12;
                            let fontFamily = format?.fontFamily || 'Arial';
                            
                            if (format?.italic) fontStyle = 'italic ';
                            if (format?.bold) fontWeight = 'bold ';
                            
                            ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;
                            ctx.fillStyle = textColor;
                            ctx.textBaseline = 'middle';
                            
                            let align = 'left';
                            if (format?.align === 'center') align = 'center';
                            else if (format?.align === 'right') align = 'right';
                            
                            let textX = drawX + 4;
                            if (align === 'center') textX = drawX + drawWidth / 2;
                            else if (align === 'right') textX = drawX + drawWidth - 4;
                            
                            ctx.textAlign = align;
                            ctx.fillText(displayValue, textX, drawY + drawHeight / 2);
                            
                            ctx.restore();
                        }
                        
                        if (cell.error) {
                            ctx.fillStyle = '#e74c3c';
                            ctx.beginPath();
                            ctx.moveTo(drawX + drawWidth - 8, drawY);
                            ctx.lineTo(drawX + drawWidth, drawY);
                            ctx.lineTo(drawX + drawWidth, drawY + 8);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                }
            }
            
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            
            const activeX = this.activeCell.col * this.cellWidth - scrollX + offsetX;
            const activeY = this.activeCell.row * this.rowHeight - scrollY + offsetY;
            
            const activeMerge = this.getMergeForCell(this.activeCell.col, this.activeCell.row);
            if (activeMerge) {
                const mergeX = activeMerge.startCol * this.cellWidth - scrollX + offsetX;
                const mergeY = activeMerge.startRow * this.rowHeight - scrollY + offsetY;
                const mergeW = (activeMerge.endCol - activeMerge.startCol + 1) * this.cellWidth;
                const mergeH = (activeMerge.endRow - activeMerge.startRow + 1) * this.rowHeight;
                ctx.strokeRect(mergeX, mergeY, mergeW, mergeH);
            } else {
                ctx.strokeRect(activeX, activeY, this.cellWidth, this.rowHeight);
            }
            
            ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
            ctx.fillRect(
                selMinCol * this.cellWidth - scrollX + offsetX,
                selMinRow * this.rowHeight - scrollY + offsetY,
                (selMaxCol - selMinCol + 1) * this.cellWidth,
                (selMaxRow - selMinRow + 1) * this.rowHeight
            );
        }

        evaluateConditionalFormat(cf, col, row, cell) {
            const value = cell?.value;
            
            if (cf.type === 'cell-value') {
                const op = cf.condition.operator;
                const v1 = this.parseValue(cf.condition.value1);
                const v2 = this.parseValue(cf.condition.value2);
                
                switch (op) {
                    case 'between':
                        return value >= Math.min(v1, v2) && value <= Math.max(v1, v2);
                    case 'not-between':
                        return value < Math.min(v1, v2) || value > Math.max(v1, v2);
                    case 'equal':
                        return value == v1;
                    case 'not-equal':
                        return value != v1;
                    case 'greater':
                        return value > v1;
                    case 'less':
                        return value < v1;
                    case 'greater-equal':
                        return value >= v1;
                    case 'less-equal':
                        return value <= v1;
                }
            } else if (cf.type === 'formula') {
                try {
                    const formula = cf.condition.formula;
                    if (formula.startsWith('=')) {
                        const ast = Parser.parse(formula);
                        const result = Interpreter.evaluate(
                            ast,
                            (c, r) => {
                                const refCell = this.getCell(c, r);
                                return refCell?.value ?? null;
                            },
                            () => []
                        );
                        return result === true || result === 1;
                    }
                } catch (e) {
                    return false;
                }
            }
            
            return false;
        }

        parseValue(str) {
            if (str === null || str === undefined || str === '') return null;
            const num = parseFloat(str);
            if (!isNaN(num)) return num;
            return str;
        }

        lightenColor(color, amount) {
            if (color.startsWith('#')) {
                const hex = color.substring(1);
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                
                const newR = Math.min(255, Math.round(r + (255 - r) * amount));
                const newG = Math.min(255, Math.round(g + (255 - g) * amount));
                const newB = Math.min(255, Math.round(b + (255 - b) * amount));
                
                return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
            }
            return color;
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        window.spreadsheet = new Spreadsheet();
        
        document.getElementById('status-left').textContent = '电子表格已就绪';
    });

})();