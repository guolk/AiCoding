import numpy as np
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

def flood_fill(image, x, y, visited, target_value, fill_value):
    """洪水填充算法，用于检测连通区域"""
    h, w = image.shape
    if x < 0 or x >= w or y < 0 or y >= h:
        return 0
    if visited[y, x]:
        return 0
    if image[y, x] != target_value:
        return 0
    
    stack = [(x, y)]
    area = 0
    
    while stack:
        cx, cy = stack.pop()
        if cx < 0 or cx >= w or cy < 0 or cy >= h:
            continue
        if visited[cy, cx]:
            continue
        if image[cy, cx] != target_value:
            continue
        
        visited[cy, cx] = True
        area += 1
        
        stack.append((cx + 1, cy))
        stack.append((cx - 1, cy))
        stack.append((cx, cy + 1))
        stack.append((cx, cy - 1))
    
    return area

def count_holes(image_binary):
    """
    检测图像中的孔洞数量
    孔洞是被像素包围的白色区域（背景）
    """
    h, w = image_binary.shape
    visited = np.zeros((h, w), dtype=bool)
    
    background_regions = []
    
    for x in [0, w - 1]:
        for y in range(h):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                area = flood_fill(image_binary, x, y, visited, 0.0, 1.0)
                background_regions.append({'area': area, 'edge': True})
    
    for y in [0, h - 1]:
        for x in range(w):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                area = flood_fill(image_binary, x, y, visited, 0.0, 1.0)
                background_regions.append({'area': area, 'edge': True})
    
    hole_count = 0
    hole_areas = []
    
    for y in range(h):
        for x in range(w):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                area = flood_fill(image_binary, x, y, visited, 0.0, 1.0)
                if area > 5:
                    hole_count += 1
                    hole_areas.append(area)
    
    return hole_count, hole_areas

def get_horizontal_projection(image_binary):
    """水平投影：每行的像素数量"""
    return np.sum(image_binary, axis=1)

def get_vertical_projection(image_binary):
    """垂直投影：每列的像素数量"""
    return np.sum(image_binary, axis=0)

def count_crossings(projection, threshold=0.5):
    """计算投影曲线穿越阈值的次数"""
    crossings = 0
    above = False
    for i, val in enumerate(projection):
        if val > threshold and not above:
            above = True
        elif val <= threshold and above:
            above = False
            crossings += 1
    return crossings

def find_peaks(projection, min_distance=3):
    """查找投影中的峰值"""
    peaks = []
    for i in range(1, len(projection) - 1):
        if (projection[i] > projection[i-1] and 
            projection[i] > projection[i+1] and
            projection[i] > np.max(projection) * 0.3):
            if not peaks or i - peaks[-1] >= min_distance:
                peaks.append(i)
    return peaks

def extract_shape_features(image_binary):
    """
    提取形状特征
    image_binary: 二值化图像 (28x28)，1表示前景（数字），0表示背景
    """
    features = {}
    
    h, w = image_binary.shape
    
    foreground_mask = image_binary > 0.3
    foreground_pixels = np.where(foreground_mask)
    
    if len(foreground_pixels[0]) == 0:
        features['is_empty'] = True
        return features
    
    features['is_empty'] = False
    
    min_y, max_y = np.min(foreground_pixels[0]), np.max(foreground_pixels[0])
    min_x, max_x = np.maximum(0, np.min(foreground_pixels[1])), np.minimum(w-1, np.max(foreground_pixels[1]))
    
    features['bbox_height'] = max_y - min_y + 1
    features['bbox_width'] = max_x - min_x + 1
    features['aspect_ratio'] = features['bbox_width'] / max(features['bbox_height'], 1)
    
    features['total_pixels'] = np.sum(foreground_mask)
    features['density'] = features['total_pixels'] / (features['bbox_height'] * features['bbox_width'] + 1)
    
    center_y = (min_y + max_y) / 2.0
    center_x = (min_x + max_x) / 2.0
    features['bbox_center_y'] = center_y / h
    features['bbox_center_x'] = center_x / w
    
    fg_y, fg_x = foreground_pixels
    if len(fg_y) > 0:
        features['com_y'] = np.mean(fg_y) / h
        features['com_x'] = np.mean(fg_x) / w
    else:
        features['com_y'] = 0.5
        features['com_x'] = 0.5
    
    h_proj = get_horizontal_projection(image_binary)
    v_proj = get_vertical_projection(image_binary)
    
    features['h_proj_peaks'] = len(find_peaks(h_proj))
    features['v_proj_peaks'] = len(find_peaks(v_proj))
    
    h_max = np.max(h_proj) if np.max(h_proj) > 0 else 1
    features['h_crossings'] = count_crossings(h_proj, h_max * 0.3)
    v_max = np.max(v_proj) if np.max(v_proj) > 0 else 1
    features['v_crossings'] = count_crossings(v_proj, v_max * 0.3)
    
    if len(fg_y) > 0:
        top_part = image_binary[:h//2, :]
        bottom_part = image_binary[h//2:, :]
        left_part = image_binary[:, :w//2]
        right_part = image_binary[:, w//2:]
        
        features['top_ratio'] = np.sum(top_part) / (features['total_pixels'] + 1)
        features['bottom_ratio'] = np.sum(bottom_part) / (features['total_pixels'] + 1)
        features['left_ratio'] = np.sum(left_part) / (features['total_pixels'] + 1)
        features['right_ratio'] = np.sum(right_part) / (features['total_pixels'] + 1)
        
        q1 = image_binary[:h//2, w//2:]
        q2 = image_binary[:h//2, :w//2]
        q3 = image_binary[h//2:, :w//2]
        q4 = image_binary[h//2:, w//2:]
        
        features['q1_ratio'] = np.sum(q1) / (features['total_pixels'] + 1)
        features['q2_ratio'] = np.sum(q2) / (features['total_pixels'] + 1)
        features['q3_ratio'] = np.sum(q3) / (features['total_pixels'] + 1)
        features['q4_ratio'] = np.sum(q4) / (features['total_pixels'] + 1)
        
        mid_row = image_binary[h//2, :]
        mid_col = image_binary[:, w//2]
        
        features['mid_row_pixels'] = np.sum(mid_row > 0.3)
        features['mid_col_pixels'] = np.sum(mid_col > 0.3)
        
        row_segments = []
        in_segment = False
        for val in mid_row:
            if val > 0.3 and not in_segment:
                in_segment = True
            elif val <= 0.3 and in_segment:
                in_segment = False
                row_segments.append(1)
        features['mid_row_segments'] = len(row_segments)
        
        col_segments = []
        in_segment = False
        for val in mid_col:
            if val > 0.3 and not in_segment:
                in_segment = True
            elif val <= 0.3 and in_segment:
                in_segment = False
                col_segments.append(1)
        features['mid_col_segments'] = len(col_segments)
    
    hole_count, hole_areas = count_holes(image_binary)
    features['hole_count'] = hole_count
    features['hole_areas'] = hole_areas
    
    return features

def classify_by_features(features):
    """
    基于特征的数字分类
    返回10个数字的概率分布
    """
    scores = np.zeros(10)
    
    if features.get('is_empty', False):
        scores[:] = 0.1
        return softmax(scores)
    
    hole_count = features.get('hole_count', 0)
    aspect_ratio = features.get('aspect_ratio', 0.5)
    total_pixels = features.get('total_pixels', 0)
    top_ratio = features.get('top_ratio', 0.5)
    bottom_ratio = features.get('bottom_ratio', 0.5)
    left_ratio = features.get('left_ratio', 0.5)
    right_ratio = features.get('right_ratio', 0.5)
    q1 = features.get('q1_ratio', 0.25)
    q2 = features.get('q2_ratio', 0.25)
    q3 = features.get('q3_ratio', 0.25)
    q4 = features.get('q4_ratio', 0.25)
    com_y = features.get('com_y', 0.5)
    com_x = features.get('com_x', 0.5)
    mid_row_segments = features.get('mid_row_segments', 0)
    mid_col_segments = features.get('mid_col_segments', 0)
    h_proj_peaks = features.get('h_proj_peaks', 0)
    v_proj_peaks = features.get('v_proj_peaks', 0)
    
    if hole_count == 0:
        scores[1] += 8.0
        scores[2] += 5.0
        scores[3] += 4.0
        scores[5] += 5.0
        scores[7] += 7.0
    elif hole_count == 1:
        scores[0] += 7.0
        scores[6] += 6.0
        scores[9] += 6.0
        scores[4] += 3.0
    elif hole_count >= 2:
        scores[8] += 10.0
        scores[0] += 2.0
    
    if aspect_ratio < 0.35:
        scores[1] += 10.0
        scores[7] += 4.0
    elif aspect_ratio < 0.5:
        scores[1] += 6.0
        scores[7] += 3.0
    elif aspect_ratio > 0.8:
        scores[0] += 3.0
        scores[8] += 3.0
        scores[3] += 2.0
        scores[9] += 2.0
    
    if top_ratio > 0.65:
        scores[7] += 8.0
        scores[9] += 4.0
        scores[5] -= 2.0
        scores[6] -= 2.0
    elif bottom_ratio > 0.65:
        scores[2] += 4.0
        scores[5] += 5.0
        scores[6] += 5.0
    
    if left_ratio > 0.6:
        scores[4] += 7.0
        scores[5] += 3.0
        scores[6] += 3.0
    elif right_ratio > 0.6:
        scores[2] += 4.0
        scores[3] += 3.0
    
    if com_y < 0.4:
        scores[7] += 6.0
        scores[9] += 3.0
    elif com_y > 0.6:
        scores[2] += 3.0
        scores[5] += 3.0
        scores[6] += 4.0
    
    if com_x < 0.4:
        scores[1] += 2.0
        scores[4] += 3.0
        scores[7] += 2.0
    elif com_x > 0.6:
        scores[1] += 1.0
        scores[7] += 1.0
    
    if mid_row_segments >= 2:
        if hole_count >= 2:
            scores[8] += 5.0
        else:
            scores[0] += 4.0
            scores[4] += 3.0
            scores[6] += 4.0
            scores[9] += 4.0
    
    if mid_col_segments >= 2:
        scores[8] += 4.0
        scores[3] += 3.0
    
    if total_pixels > 350:
        scores[8] += 3.0
        scores[0] += 2.0
    elif total_pixels < 100:
        scores[1] += 5.0
        scores[7] += 3.0
    
    if q2 > 0.35 and q3 > 0.25 and q4 < 0.15:
        scores[5] += 6.0
        scores[6] += 5.0
    
    if q2 < 0.15 and q4 > 0.35:
        scores[2] += 5.0
    
    if hole_count == 0:
        if top_ratio > 0.55 and bottom_ratio < 0.45:
            scores[7] += 5.0
        elif top_ratio < 0.45 and bottom_ratio > 0.55:
            scores[5] += 3.0
            scores[6] += 4.0
            scores[2] += 3.0
    
    if hole_count == 1:
        if top_ratio > 0.55:
            scores[9] += 4.0
        elif bottom_ratio > 0.55:
            scores[6] += 4.0
        
        if aspect_ratio > 0.7:
            scores[0] += 4.0
    
    if hole_count >= 2:
        scores[8] += 8.0
    
    if aspect_ratio < 0.4 and total_pixels < 150:
        scores[1] = scores[1] * 2.0
    
    if hole_count == 0 and aspect_ratio > 0.5:
        scores[1] *= 0.3
    
    if q1 < 0.15 and q4 > 0.35 and hole_count == 0:
        scores[2] += 6.0
    
    if left_ratio > 0.55 and hole_count == 0:
        scores[4] += 4.0
    
    scores += np.random.rand(10) * 0.5
    
    return softmax(scores)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def preprocess_image(image_data):
    """
    预处理图像
    返回: 28x28的二值化图像，1表示前景（数字），0表示背景
    """
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    
    image_np = np.array(image)
    
    threshold = 128
    binary = (image_np < threshold).astype(np.float32)
    
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    
    width, height = image.size
    if width == 0 or height == 0:
        return np.zeros((28, 28), dtype=np.float32)
    
    if width > height:
        new_width = 20
        new_height = int(height * (20 / width))
    else:
        new_height = 20
        new_width = int(width * (20 / height))
    
    new_width = max(new_width, 1)
    new_height = max(new_height, 1)
    
    image = image.resize((new_width, new_height), Image.LANCZOS)
    
    image_np = np.array(image)
    binary = (image_np < 128).astype(np.float32)
    
    new_image = np.zeros((28, 28), dtype=np.float32)
    x_offset = (28 - new_width) // 2
    y_offset = (28 - new_height) // 2
    new_image[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = binary
    
    return new_image

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        image_data = data.get('image', '')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        processed_image = preprocess_image(image_data)
        
        features = extract_shape_features(processed_image)
        
        probabilities = classify_by_features(features)
        
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        
        probabilities_list = [float(p) for p in probabilities]
        
        print(f"Predicted: {predicted_class}, Confidence: {confidence:.2f}")
        print(f"Features: hole_count={features.get('hole_count', 0)}, "
              f"aspect_ratio={features.get('aspect_ratio', 0):.2f}, "
              f"total_pixels={features.get('total_pixels', 0)}")
        
        return jsonify({
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': probabilities_list
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("  实时手写数字识别系统")
    print("=" * 60)
    print("  基于形状特征和孔洞检测的智能识别引擎")
    print("  请在浏览器中访问: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
