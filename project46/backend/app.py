from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

LatexToNatural = {
    '\\alpha': '阿尔法',
    '\\beta': '贝塔',
    '\\gamma': '伽马',
    '\\delta': '德尔塔',
    '\\epsilon': '伊普西隆',
    '\\zeta': '泽塔',
    '\\eta': '伊塔',
    '\\theta': '西塔',
    '\\iota': '约塔',
    '\\kappa': '卡帕',
    '\\lambda': '兰布达',
    '\\mu': '缪',
    '\\nu': '纽',
    '\\xi': '克西',
    '\\pi': '派',
    '\\rho': '柔',
    '\\sigma': '西格玛',
    '\\tau': '陶',
    '\\upsilon': '宇普西隆',
    '\\phi': '菲',
    '\\chi': '希',
    '\\psi': '普西',
    '\\omega': '欧米伽',
    '\\infty': '无穷大',
    '\\pm': '正负',
    '\\mp': '负正',
    '\\times': '乘',
    '\\div': '除',
    '\\cdot': '点乘',
    '\\circ': '圆乘',
    '\\setminus': '除',
    '\\frac': '分数',
    '\\sqrt': '平方根',
    '\\sum': '求和',
    '\\prod': '连乘',
    '\\int': '积分',
    '\\iint': '二重积分',
    '\\iiint': '三重积分',
    '\\oint': '闭合积分',
    '\\partial': '偏导',
    '\\nabla': '拉普拉斯',
    '\\lim': '极限',
    '\\to': '趋向于',
    '\\rightarrow': '趋向于',
    '\\Rightarrow': '推出',
    '\\Leftarrow': '被推出',
    '\\Leftrightarrow': '等价于',
    '\\approx': '约等于',
    '\\neq': '不等于',
    '\\leq': '小于等于',
    '\\geq': '大于等于',
    '\\ll': '远小于',
    '\\gg': '远大于',
    '\\subset': '包含于',
    '\\supset': '包含',
    '\\in': '属于',
    '\\notin': '不属于',
    '\\cap': '交',
    '\\cup': '并',
    '\\forall': '任意',
    '\\exists': '存在',
    '\\neg': '非',
    '\\land': '与',
    '\\lor': '或',
    '\\oplus': '异或',
    '\\sin': '正弦',
    '\\cos': '余弦',
    '\\tan': '正切',
    '\\cot': '余切',
    '\\sec': '正割',
    '\\csc': '余割',
    '\\log': '对数',
    '\\ln': '自然对数',
    '\\exp': '指数',
}

def simplify_latex(latex_str):
    """简化LaTeX表达式，移除一些不需要的标记"""
    latex_str = latex_str.strip()
    latex_str = re.sub(r'^\$\$|\$\$$', '', latex_str)
    latex_str = re.sub(r'^\$|\$$', '', latex_str)
    latex_str = re.sub(r'\\begin\{align\}([\s\S]*?)\\end\{align\}', r'\1', latex_str)
    latex_str = re.sub(r'\\label\{[^}]+\}', '', latex_str)
    latex_str = re.sub(r'^\\\[|\\\]$', '', latex_str)
    return latex_str.strip()

def parse_fraction(latex_str):
    """解析分数表达式"""
    pattern = r'\\frac\{([^}]+)\}\{([^}]+)\}'
    matches = list(re.finditer(pattern, latex_str))
    if matches:
        for match in matches:
            num = match.group(1)
            den = match.group(2)
            num_desc = latex_to_natural(num)
            den_desc = latex_to_natural(den)
            return f"{num_desc} 除以 {den_desc}"
    return None

def parse_sqrt(latex_str):
    """解析平方根表达式"""
    pattern = r'\\sqrt\{([^}]+)\}'
    matches = list(re.finditer(pattern, latex_str))
    if matches:
        for match in matches:
            content = match.group(1)
            content_desc = latex_to_natural(content)
            return f"{content_desc} 的平方根"
    pattern = r'\\sqrt\[([^\]]+)\]\{([^}]+)\}'
    matches = list(re.finditer(pattern, latex_str))
    if matches:
        for match in matches:
            n = match.group(1)
            content = match.group(2)
            n_desc = latex_to_natural(n)
            content_desc = latex_to_natural(content)
            return f"{content_desc} 的 {n_desc} 次方根"
    return None

def latex_to_natural(latex_str):
    """
    将LaTeX公式转换为自然语言描述
    """
    if not latex_str:
        return ""
    
    latex_str = simplify_latex(latex_str)
    
    result = parse_fraction(latex_str)
    if result:
        return result
    
    result = parse_sqrt(latex_str)
    if result:
        return result
    
    for latex_cmd, natural_desc in LatexToNatural.items():
        if latex_cmd in latex_str:
            latex_str = latex_str.replace(latex_cmd, natural_desc)
    
    latex_str = latex_str.replace('+', ' 加 ')
    latex_str = latex_str.replace('-', ' 减 ')
    latex_str = latex_str.replace('=', ' 等于 ')
    latex_str = latex_str.replace(',', '，')
    latex_str = latex_str.replace('{', '')
    latex_str = latex_str.replace('}', '')
    latex_str = latex_str.replace('(', '左括号')
    latex_str = latex_str.replace(')', '右括号')
    
    latex_str = re.sub(r'\s+', ' ', latex_str).strip()
    
    return latex_str

@app.route('/api/latex-to-natural', methods=['POST'])
def latex_to_natural_endpoint():
    """
    API端点：将LaTeX公式转换为自然语言描述
    """
    try:
        data = request.get_json()
        if not data or 'latex' not in data:
            return jsonify({'error': '缺少latex参数'}), 400
        
        latex_str = data.get('latex', '')
        if not latex_str.strip():
            return jsonify({'error': 'latex公式不能为空'}), 400
        
        natural_description = latex_to_natural(latex_str)
        
        return jsonify({
            'success': True,
            'latex': latex_str,
            'natural': natural_description
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """
    健康检查端点
    """
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
