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
    """网格密度特征"""
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
    """水平和垂直投影特征"""
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
            h_proj_norm[i] > 0.25):
            if not h_peaks or i - h_peaks[-1] >= 3:
                h_peaks.append(i)
    
    v_peaks = []
    for i in range(2, len(v_proj_norm) - 2):
        if (v_proj_norm[i] > v_proj_norm[i-1] and 
            v_proj_norm[i] > v_proj_norm[i+1] and
            v_proj_norm[i] > 0.25):
            if not v_peaks or i - v_peaks[-1] >= 3:
                v_peaks.append(i)
    
    h_valleys = []
    for i in range(2, len(h_proj_norm) - 2):
        if (h_proj_norm[i] < h_proj_norm[i-1] and 
            h_proj_norm[i] < h_proj_norm[i+1] and
            h_proj_norm[i] < 0.5):
            if not h_valleys or i - h_valleys[-1] >= 3:
                h_valleys.append(i)
    
    v_valleys = []
    for i in range(2, len(v_proj_norm) - 2):
        if (v_proj_norm[i] < v_proj_norm[i-1] and 
            v_proj_norm[i] < v_proj_norm[i+1] and
            v_proj_norm[i] < 0.5):
            if not v_valleys or i - v_valleys[-1] >= 3:
                v_valleys.append(i)
    
    return {
        'h_proj': h_proj_norm,
        'v_proj': v_proj_norm,
        'h_peaks': len(h_peaks),
        'v_peaks': len(v_peaks),
        'h_peak_positions': h_peaks,
        'v_peak_positions': v_peaks,
        'h_valleys': len(h_valleys),
        'v_valleys': len(v_valleys),
        'h_valley_positions': h_valleys,
        'v_valley_positions': v_valleys
    }

def get_shape_features(image_binary):
    """形状特征"""
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
    
    top_third = image_binary[:h//3, :]
    middle_third = image_binary[h//3:2*h//3, :]
    bottom_third = image_binary[2*h//3:, :]
    
    features['top_third_ratio'] = np.sum(top_third) / total
    features['middle_third_ratio'] = np.sum(middle_third) / total
    features['bottom_third_ratio'] = np.sum(bottom_third) / total
    
    left_third = image_binary[:, :w//3]
    center_third = image_binary[:, w//3:2*w//3]
    right_third = image_binary[:, 2*w//3:]
    
    features['left_third_ratio'] = np.sum(left_third) / total
    features['center_third_ratio'] = np.sum(center_third) / total
    features['right_third_ratio'] = np.sum(right_third) / total
    
    row_6 = image_binary[6, :]
    row_14 = image_binary[14, :]
    row_20 = image_binary[20, :]
    
    features['row_6_pixels'] = np.sum(row_6 > 0.3)
    features['row_14_pixels'] = np.sum(row_14 > 0.3)
    features['row_20_pixels'] = np.sum(row_20 > 0.3)
    
    col_6 = image_binary[:, 6]
    col_14 = image_binary[:, 14]
    col_20 = image_binary[:, 20]
    
    features['col_6_pixels'] = np.sum(col_6 > 0.3)
    features['col_14_pixels'] = np.sum(col_14 > 0.3)
    features['col_20_pixels'] = np.sum(col_20 > 0.3)
    
    return features

def classify_digit(features, grid_features, proj_features, image_binary):
    """
    优化的数字分类器，特别针对数字3和4
    """
    scores = np.zeros(10)
    
    if features.get('is_empty', False):
        scores[:] = 0.1
        return softmax(scores)
    
    hole_count, _ = count_holes(image_binary)
    aspect_ratio = features.get('aspect_ratio', 0.5)
    top_ratio = features.get('top_ratio', 0.5)
    bottom_ratio = features.get('bottom_ratio', 0.5)
    left_ratio = features.get('left_ratio', 0.5)
    right_ratio = features.get('right_ratio', 0.5)
    com_y = features.get('com_y', 0.5)
    com_x = features.get('com_x', 0.5)
    total_pixels = features.get('total_pixels', 0)
    bbox_height = features.get('bbox_height', 20)
    bbox_width = features.get('bbox_width', 10)
    
    top_third = features.get('top_third_ratio', 0.33)
    middle_third = features.get('middle_third_ratio', 0.33)
    bottom_third = features.get('bottom_third_ratio', 0.33)
    
    left_third = features.get('left_third_ratio', 0.33)
    center_third = features.get('center_third_ratio', 0.33)
    right_third = features.get('right_third_ratio', 0.33)
    
    row_6 = features.get('row_6_pixels', 0)
    row_14 = features.get('row_14_pixels', 0)
    row_20 = features.get('row_20_pixels', 0)
    
    col_6 = features.get('col_6_pixels', 0)
    col_14 = features.get('col_14_pixels', 0)
    col_20 = features.get('col_20_pixels', 0)
    
    h_peaks = proj_features.get('h_peaks', 0) if proj_features else 0
    v_peaks = proj_features.get('v_peaks', 0) if proj_features else 0
    h_valleys = proj_features.get('h_valleys', 0) if proj_features else 0
    v_valleys = proj_features.get('v_valleys', 0) if proj_features else 0
    
    print(f"DEBUG: holes={hole_count}, aspect={aspect_ratio:.2f}, "
          f"top={top_ratio:.2f}, bottom={bottom_ratio:.2f}, "
          f"left={left_ratio:.2f}, right={right_ratio:.2f}, "
          f"h_peaks={h_peaks}, v_peaks={v_peaks}")
    
    if hole_count == 0:
        scores[1] += 6.0
        scores[2] += 4.0
        scores[3] += 4.0
        scores[5] += 4.0
        scores[7] += 5.0
    elif hole_count == 1:
        scores[0] += 7.0
        scores[6] += 6.0
        scores[9] += 6.0
        scores[4] += 5.0
    elif hole_count >= 2:
        scores[8] += 12.0
    
    if aspect_ratio < 0.35:
        scores[1] += 12.0
        scores[7] += 4.0
        scores[2] -= 3.0
        scores[3] -= 3.0
    elif aspect_ratio < 0.45:
        scores[1] += 8.0
        scores[7] += 3.0
    elif aspect_ratio > 0.75:
        scores[0] += 5.0
        scores[8] += 4.0
        scores[3] += 3.0
        scores[9] += 2.0
    
    if top_ratio > 0.62:
        scores[7] += 10.0
        scores[9] += 5.0
        scores[5] -= 3.0
        scores[6] -= 3.0
    elif bottom_ratio > 0.62:
        scores[2] += 5.0
        scores[5] += 6.0
        scores[6] += 7.0
    
    if left_ratio > 0.6:
        scores[4] += 10.0
        scores[5] += 5.0
        scores[6] += 5.0
        scores[2] -= 3.0
        scores[3] -= 3.0
    elif right_ratio > 0.6:
        scores[2] += 6.0
        scores[3] += 5.0
        scores[4] -= 4.0
    
    if com_y < 0.42:
        scores[7] += 7.0
        scores[9] += 4.0
    elif com_y > 0.58:
        scores[2] += 4.0
        scores[5] += 5.0
        scores[6] += 6.0
    
    if com_x < 0.42:
        scores[4] += 5.0
        scores[5] += 3.0
        scores[6] += 3.0
    elif com_x > 0.58:
        scores[2] += 3.0
        scores[3] += 3.0
    
    if total_pixels > 400:
        scores[8] += 4.0
        scores[0] += 3.0
        scores[1] -= 3.0
    elif total_pixels < 80:
        scores[1] += 6.0
        scores[7] += 4.0
        scores[8] -= 3.0
    
    if bbox_height > 24:
        scores[1] += 3.0
        scores[7] += 3.0
    
    if hole_count == 0:
        if total_pixels > 150:
            scores[1] *= 0.6
        
        if left_ratio > 0.55 and top_ratio < 0.5:
            scores[4] += 5.0
        
        if top_ratio < 0.45 and bottom_ratio > 0.55:
            scores[5] += 4.0
            scores[6] += 5.0
        
        if proj_features:
            h_peak_pos = proj_features.get('h_peak_positions', [])
            v_peak_pos = proj_features.get('v_peak_positions', [])
            h_valley_pos = proj_features.get('h_valley_positions', [])
            v_valley_pos = proj_features.get('v_valley_positions', [])
            
            print(f"DEBUG: h_peak_pos={h_peak_pos}, v_peak_pos={v_peak_pos}")
            
            if h_peaks >= 2:
                scores[3] += 5.0
                scores[2] += 3.0
                scores[8] += 2.0
                
                if len(h_peak_pos) >= 2:
                    first_peak = h_peak_pos[0]
                    second_peak = h_peak_pos[1]
                    
                    if first_peak < 10 and second_peak > 18:
                        scores[3] += 6.0
                        scores[2] += 4.0
                        scores[8] += 3.0
            
            if v_peaks >= 2:
                scores[3] += 4.0
                scores[2] += 3.0
                
                if len(v_peak_pos) >= 2:
                    first_v_peak = v_peak_pos[0]
                    second_v_peak = v_peak_pos[1]
                    
                    if first_v_peak < 14 and second_v_peak > 14:
                        scores[3] += 5.0
                        scores[8] += 3.0
            
            if h_peaks >= 1 and v_peaks >= 1:
                if right_ratio > left_ratio:
                    scores[3] += 4.0
                elif left_ratio > right_ratio:
                    scores[4] += 3.0
        
        if grid_features is not None and len(grid_features) >= 49:
            top_row = grid_features[0:7]
            middle_row = grid_features[21:28]
            bottom_row = grid_features[42:49]
            
            top_density = np.max(top_row)
            middle_density = np.max(middle_row)
            bottom_density = np.max(bottom_row)
            
            print(f"DEBUG: top_density={top_density:.2f}, middle_density={middle_density:.2f}, bottom_density={bottom_density:.2f}")
            
            if top_density > 0.2 and bottom_density > 0.2:
                if middle_density < 0.15:
                    scores[3] += 7.0
                    scores[2] += 5.0
                    print("DEBUG: 检测到数字3/2特征: 上下有像素，中间稀疏")
                elif middle_density > 0.3:
                    scores[8] += 4.0
                    scores[0] += 3.0
            
            if top_density > 0.3 and bottom_density < 0.15:
                scores[7] += 5.0
                scores[9] += 3.0
            
            if bottom_density > 0.3 and top_density < 0.15:
                scores[5] += 4.0
                scores[6] += 4.0
            
            left_col = [grid_features[i*7 + 0] for i in range(7)]
            right_col = [grid_features[i*7 + 6] for i in range(7)]
            
            left_density = np.max(left_col)
            right_density = np.max(right_col)
            
            print(f"DEBUG: left_density={left_density:.2f}, right_density={right_density:.2f}")
            
            if left_density > 0.25 and right_density > 0.25:
                scores[3] += 5.0
                scores[8] += 4.0
                scores[0] += 3.0
            
            if left_density > 0.3 and right_density < 0.15:
                scores[4] += 7.0
                scores[5] += 5.0
                scores[6] += 4.0
                print("DEBUG: 检测到数字4/5/6特征: 左侧有像素，右侧稀疏")
            
            if right_density > 0.3 and left_density < 0.15:
                scores[2] += 5.0
                scores[7] += 3.0
            
            center_2x2 = [
                grid_features[21 + 3], grid_features[21 + 4],
                grid_features[28 + 3], grid_features[28 + 4]
            ]
            center_density = np.mean(center_2x2)
            
            print(f"DEBUG: center_density={center_density:.2f}")
            
            if center_density > 0.2:
                scores[8] += 3.0
                scores[3] += 2.0
            elif center_density < 0.1:
                scores[0] += 3.0
                if hole_count == 0:
                    scores[2] += 2.0
            
            top_left_2x2 = [grid_features[7], grid_features[8], grid_features[14], grid_features[15]]
            top_left_density = np.mean(top_left_2x2)
            
            top_right_2x2 = [grid_features[12], grid_features[13], grid_features[19], grid_features[20]]
            top_right_density = np.mean(top_right_2x2)
            
            bottom_left_2x2 = [grid_features[35], grid_features[36], grid_features[42], grid_features[43]]
            bottom_left_density = np.mean(bottom_left_2x2)
            
            bottom_right_2x2 = [grid_features[40], grid_features[41], grid_features[47], grid_features[48]]
            bottom_right_density = np.mean(bottom_right_2x2)
            
            print(f"DEBUG: top_left={top_left_density:.2f}, top_right={top_right_density:.2f}, "
                  f"bottom_left={bottom_left_density:.2f}, bottom_right={bottom_right_density:.2f}")
            
            if top_right_density > 0.2 and bottom_right_density > 0.2 and top_left_density < 0.1:
                scores[3] += 8.0
                print("DEBUG: 检测到数字3特征: 右上+右下有像素，左上少")
            
            if top_left_density > 0.2 and top_right_density < 0.1:
                scores[4] += 6.0
                scores[5] += 4.0
                print("DEBUG: 检测到数字4/5特征: 左上有像素，右上少")
            
            if top_left_density < 0.1 and bottom_right_density > 0.2 and top_right_density > 0.1:
                scores[2] += 6.0
                print("DEBUG: 检测到数字2特征: 左上少，右下+右上有像素")
            
            if top_right_density > 0.2 and bottom_left_density > 0.2 and bottom_right_density < 0.1:
                scores[5] += 7.0
                print("DEBUG: 检测到数字5特征: 右上+左下有像素，右下少")
            
            if bottom_left_density > 0.2 and bottom_right_density < 0.1:
                scores[6] += 6.0
                print("DEBUG: 检测到数字6特征: 左下有像素，右下少")
            
            if top_third > 0.4 and bottom_third < 0.25:
                scores[7] += 5.0
                scores[9] += 4.0
            
            if left_third > 0.5 and right_third < 0.2:
                scores[4] += 8.0
                scores[5] += 6.0
                scores[6] += 5.0
                print("DEBUG: 检测到数字4/5/6特征: 左三分之一像素多")
            
            if right_third > 0.4 and left_third < 0.2:
                scores[2] += 5.0
                scores[3] += 4.0
                print("DEBUG: 检测到数字2/3特征: 右三分之一像素多")
    
    if hole_count == 1:
        if com_y > 0.55:
            scores[6] += 9.0
            scores[0] -= 2.0
            scores[9] -= 2.0
        
        if com_y < 0.48:
            scores[9] += 9.0
            scores[0] -= 2.0
            scores[6] -= 2.0
        
        if aspect_ratio > 0.7:
            scores[0] += 6.0
        
        if left_ratio > 0.55 and bbox_width < 18:
            scores[4] += 7.0
        
        if grid_features is not None and len(grid_features) >= 49:
            top_row = grid_features[0:7]
            bottom_row = grid_features[42:49]
            left_col = [grid_features[i*7 + 0] for i in range(7)]
            right_col = [grid_features[i*7 + 6] for i in range(7)]
            
            if np.max(top_row) > 0.2 and np.max(bottom_row) > 0.2:
                if np.max(left_col) > 0.2 and np.max(right_col) > 0.2:
                    scores[0] += 5.0
            
            if np.max(bottom_row) > 0.25 and np.max(top_row) < 0.15:
                scores[6] += 6.0
            
            if np.max(top_row) > 0.25 and np.max(bottom_row) < 0.15:
                scores[9] += 6.0
            
            if np.max(left_col) > 0.25 and np.max(right_col) < 0.15:
                scores[4] += 7.0
    
    if hole_count >= 2:
        scores[8] += 12.0
        
        if grid_features is not None and len(grid_features) >= 49:
            top_middle = grid_features[14:21]
            bottom_middle = grid_features[28:35]
            
            if np.max(top_middle) > 0.2 and np.max(bottom_middle) > 0.2:
                scores[8] += 4.0
    
    if hole_count == 0:
        if right_ratio > 0.55 and h_peaks >= 2:
            scores[3] += 8.0
            scores[2] += 5.0
            print("DEBUG: 检测到数字3/2特征: 右重 + 多水平峰")
        
        if right_ratio > 0.5 and left_ratio < 0.3 and total_pixels > 120:
            scores[2] += 5.0
            scores[3] += 4.0
            print("DEBUG: 检测到数字2/3特征: 右侧像素多，左侧少")
        
        if left_ratio > 0.5 and right_ratio < 0.3 and total_pixels > 120:
            scores[4] += 7.0
            scores[5] += 5.0
            print("DEBUG: 检测到数字4/5特征: 左侧像素多，右侧少")
    
    scores += np.random.rand(10) * 0.2
    
    print(f"DEBUG: Final scores (before softmax): {scores}")
    
    return softmax(scores)

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
        grid_features = get_grid_features(processed_image)
        proj_features = get_projection_features(processed_image)
        
        probabilities = classify_digit(shape_features, grid_features, proj_features, processed_image)
        
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        
        probabilities_list = [float(p) for p in probabilities]
        
        print(f"Predicted: {predicted_class}, Confidence: {confidence:.2f}")
        print(f"Probabilities: {probabilities_list}")
        print("-" * 60)
        
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
    print("  实时手写数字识别系统 (优化版 v2)")
    print("=" * 60)
    print("  特别优化数字3和4的识别：")
    print("  - 数字3: 左右都有像素，中间稀疏，多个水平峰")
    print("  - 数字4: 左侧像素多，右侧稀疏，可能有1个洞")
    print("  - 增强四象限网格密度分析")
    print("  - 增强水平/垂直投影峰谷分析")
    print("  请在浏览器中访问: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
