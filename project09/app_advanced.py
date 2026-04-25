import numpy as np
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

def flood_fill(image, x, y, visited, target_value):
    """洪水填充算法"""
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
    """检测图像中的孔洞数量"""
    h, w = image_binary.shape
    visited = np.zeros((h, w), dtype=bool)
    
    for x in [0, w - 1]:
        for y in range(h):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                flood_fill(image_binary, x, y, visited, 0.0)
    
    for y in [0, h - 1]:
        for x in range(w):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                flood_fill(image_binary, x, y, visited, 0.0)
    
    hole_count = 0
    hole_areas = []
    
    for y in range(h):
        for x in range(w):
            if not visited[y, x] and image_binary[y, x] < 0.5:
                area = flood_fill(image_binary, x, y, visited, 0.0)
                if area > 3:
                    hole_count += 1
                    hole_areas.append(area)
    
    return hole_count, hole_areas

def get_grid_features(image_binary, grid_size=7):
    """
    将图像分成 grid_size x grid_size 的网格
    计算每个网格的像素密度
    """
    h, w = image_binary.shape
    cell_h = h // grid_size
    cell_w = w // grid_size
    
    features = []
    
    for i in range(grid_size):
        for j in range(grid_size):
            y_start = i * cell_h
            y_end = y_start + cell_h
            x_start = j * cell_w
            x_end = x_start + cell_w
            
            cell = image_binary[y_start:y_end, x_start:x_end]
            density = np.sum(cell) / (cell_h * cell_w)
            features.append(density)
    
    return np.array(features)

def get_projection_features(image_binary):
    """获取水平和垂直投影特征"""
    h_proj = np.sum(image_binary, axis=1)
    v_proj = np.sum(image_binary, axis=0)
    
    h_max = np.max(h_proj) if np.max(h_proj) > 0 else 1
    v_max = np.max(v_proj) if np.max(v_proj) > 0 else 1
    
    h_proj_norm = h_proj / h_max
    v_proj_norm = v_proj / v_max
    
    h_peaks = []
    for i in range(2, len(h_proj_norm) - 2):
        if (h_proj_norm[i] > h_proj_norm[i-1] and 
            h_proj_norm[i] > h_proj_norm[i+1] and
            h_proj_norm[i] > 0.3):
            h_peaks.append(i)
    
    v_peaks = []
    for i in range(2, len(v_proj_norm) - 2):
        if (v_proj_norm[i] > v_proj_norm[i-1] and 
            v_proj_norm[i] > v_proj_norm[i+1] and
            v_proj_norm[i] > 0.3):
            v_peaks.append(i)
    
    return {
        'h_proj': h_proj_norm,
        'v_proj': v_proj_norm,
        'h_peaks': len(h_peaks),
        'v_peaks': len(v_peaks),
        'h_peak_positions': h_peaks,
        'v_peak_positions': v_peaks
    }

def get_shape_features(image_binary):
    """获取形状特征"""
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
    
    fg_y, fg_x = foreground_pixels
    if len(fg_y) > 0:
        features['com_y'] = np.mean(fg_y) / h
        features['com_x'] = np.mean(fg_x) / w
    else:
        features['com_y'] = 0.5
        features['com_x'] = 0.5
    
    h_half = h // 2
    w_half = w // 2
    
    top_part = image_binary[:h_half, :]
    bottom_part = image_binary[h_half:, :]
    left_part = image_binary[:, :w_half]
    right_part = image_binary[:, w_half:]
    
    total = features['total_pixels'] + 1
    features['top_ratio'] = np.sum(top_part) / total
    features['bottom_ratio'] = np.sum(bottom_part) / total
    features['left_ratio'] = np.sum(left_part) / total
    features['right_ratio'] = np.sum(right_part) / total
    
    q1 = image_binary[:h_half, w_half:]
    q2 = image_binary[:h_half, :w_half]
    q3 = image_binary[h_half:, :w_half]
    q4 = image_binary[h_half:, w_half:]
    
    features['q1_ratio'] = np.sum(q1) / total
    features['q2_ratio'] = np.sum(q2) / total
    features['q3_ratio'] = np.sum(q3) / total
    features['q4_ratio'] = np.sum(q4) / total
    
    return features

def classify_by_patterns(features, grid_features, proj_features):
    """
    基于模式匹配的数字分类
    """
    scores = np.zeros(10)
    
    if features.get('is_empty', False):
        scores[:] = 0.1
        return softmax(scores)
    
    hole_count, _ = count_holes_cache(features.get('image_binary', np.zeros((28,28))))
    aspect_ratio = features.get('aspect_ratio', 0.5)
    top_ratio = features.get('top_ratio', 0.5)
    bottom_ratio = features.get('bottom_ratio', 0.5)
    left_ratio = features.get('left_ratio', 0.5)
    right_ratio = features.get('right_ratio', 0.5)
    com_y = features.get('com_y', 0.5)
    total_pixels = features.get('total_pixels', 0)
    bbox_height = features.get('bbox_height', 20)
    bbox_width = features.get('bbox_width', 10)
    
    if hole_count == 0:
        scores[1] += 7.0
        scores[2] += 5.0
        scores[3] += 4.0
        scores[5] += 5.0
        scores[7] += 7.0
    elif hole_count == 1:
        scores[0] += 8.0
        scores[6] += 7.0
        scores[9] += 7.0
        scores[4] += 4.0
    elif hole_count >= 2:
        scores[8] += 12.0
    
    if aspect_ratio < 0.35:
        scores[1] += 12.0
        scores[7] += 4.0
    elif aspect_ratio < 0.45:
        scores[1] += 8.0
        scores[7] += 3.0
    elif aspect_ratio > 0.75:
        scores[0] += 4.0
        scores[8] += 4.0
        scores[3] += 2.0
    
    if top_ratio > 0.6:
        scores[7] += 10.0
        scores[9] += 5.0
        scores[5] -= 2.0
        scores[6] -= 2.0
    elif bottom_ratio > 0.6:
        scores[2] += 5.0
        scores[5] += 6.0
        scores[6] += 7.0
    
    if left_ratio > 0.6:
        scores[4] += 9.0
        scores[5] += 5.0
        scores[6] += 5.0
    elif right_ratio > 0.6:
        scores[2] += 6.0
        scores[3] += 5.0
    
    if com_y < 0.42:
        scores[7] += 7.0
        scores[9] += 4.0
    elif com_y > 0.58:
        scores[2] += 4.0
        scores[5] += 5.0
        scores[6] += 6.0
    
    if total_pixels > 400:
        scores[8] += 4.0
        scores[0] += 3.0
    elif total_pixels < 80:
        scores[1] += 6.0
        scores[7] += 4.0
    
    if bbox_height > 24:
        scores[1] += 3.0
        scores[7] += 3.0
    
    if hole_count == 0:
        if total_pixels > 150:
            scores[1] *= 0.5
        
        if left_ratio > 0.55 and top_ratio < 0.5:
            scores[4] += 5.0
        
        if top_ratio < 0.45 and bottom_ratio > 0.55:
            scores[5] += 4.0
            scores[6] += 5.0
        
        if grid_features is not None and len(grid_features) >= 49:
            top_row = grid_features[0:7]
            bottom_row = grid_features[42:49]
            
            if np.max(top_row) > 0.3 and np.max(bottom_row) > 0.3:
                if left_ratio > right_ratio:
                    scores[5] += 3.0
                else:
                    scores[2] += 3.0
                    scores[3] += 3.0
    
    if hole_count == 1:
        if com_y > 0.55:
            scores[6] += 8.0
            scores[0] -= 2.0
            scores[9] -= 2.0
        
        if com_y < 0.48:
            scores[9] += 8.0
            scores[0] -= 2.0
            scores[6] -= 2.0
        
        if aspect_ratio > 0.7:
            scores[0] += 6.0
        
        if left_ratio > 0.55 and bbox_width < 18:
            scores[4] += 6.0
    
    if hole_count >= 2:
        scores[8] += 10.0
    
    if hole_count == 0:
        if proj_features:
            h_peaks = proj_features.get('h_peaks', 0)
            v_peaks = proj_features.get('v_peaks', 0)
            
            if h_peaks >= 3:
                scores[2] += 4.0
                scores[3] += 3.0
            elif h_peaks == 2:
                scores[2] += 2.0
                scores[5] += 2.0
            
            if v_peaks >= 2:
                scores[2] += 3.0
                scores[3] += 3.0
    
    scores += np.random.rand(10) * 0.3
    
    return softmax(scores)

def count_holes_cache(image_binary):
    """缓存孔洞检测"""
    return count_holes(image_binary)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def preprocess_image(image_data):
    """预处理图像"""
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    
    image_np = np.array(image)
    
    threshold = 128
    binary = (image_np < threshold).astype(np.float32)
    
    bbox = Image.fromarray((binary * 255).astype(np.uint8)).getbbox()
    if bbox:
        image = image.crop(bbox)
    
    width, height = image.size
    if width == 0 or height == 0:
        return np.zeros((28, 28), dtype=np.float32)
    
    max_dim = max(width, height)
    scale = 20.0 / max_dim
    new_width = int(width * scale)
    new_height = int(height * scale)
    
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
        
        shape_features = get_shape_features(processed_image)
        shape_features['image_binary'] = processed_image
        
        grid_features = get_grid_features(processed_image)
        proj_features = get_projection_features(processed_image)
        
        hole_count, hole_areas = count_holes(processed_image)
        
        probabilities = classify_by_patterns(shape_features, grid_features, proj_features)
        
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        
        probabilities_list = [float(p) for p in probabilities]
        
        print(f"Predicted: {predicted_class}, Confidence: {confidence:.2f}")
        print(f"Features: holes={hole_count}, aspect={shape_features.get('aspect_ratio', 0):.2f}, "
              f"top={shape_features.get('top_ratio', 0):.2f}, pixels={shape_features.get('total_pixels', 0)}")
        print(f"Probabilities: {probabilities_list}")
        
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
    print("  实时手写数字识别系统 (高级版)")
    print("=" * 60)
    print("  基于多特征融合的智能识别引擎")
    print("  - 孔洞检测 (0/6/9=1个洞, 8=2个洞)")
    print("  - 7x7网格密度特征")
    print("  - 水平/垂直投影分析")
    print("  - 形状特征 (宽高比、四象限、重心等)")
    print("  请在浏览器中访问: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
