import numpy as np
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

def extract_features(image_array):
    features = {}
    
    features['total_pixels'] = np.sum(image_array)
    
    rows = np.sum(image_array, axis=1)
    cols = np.sum(image_array, axis=0)
    
    nz_rows = np.where(rows > 0)[0]
    nz_cols = np.where(cols > 0)[0]
    
    if len(nz_rows) > 0 and len(nz_cols) > 0:
        features['height'] = nz_rows[-1] - nz_rows[0] + 1
        features['width'] = nz_cols[-1] - nz_cols[0] + 1
        features['aspect_ratio'] = features['width'] / max(features['height'], 1)
    else:
        features['height'] = 0
        features['width'] = 0
        features['aspect_ratio'] = 0
    
    total = features['total_pixels']
    if total > 0:
        h, w = image_array.shape
        center_y, center_x = h // 2, w // 2
        
        q1 = np.sum(image_array[:center_y, center_x:])
        q2 = np.sum(image_array[:center_y, :center_x])
        q3 = np.sum(image_array[center_y:, :center_x])
        q4 = np.sum(image_array[center_y:, center_x:])
        
        features['q1_ratio'] = q1 / total
        features['q2_ratio'] = q2 / total
        features['q3_ratio'] = q3 / total
        features['q4_ratio'] = q4 / total
        
        y_coords, x_coords = np.where(image_array > 0.1)
        if len(y_coords) > 0:
            features['center_of_mass_y'] = np.mean(y_coords) / h
            features['center_of_mass_x'] = np.mean(x_coords) / w
        else:
            features['center_of_mass_y'] = 0.5
            features['center_of_mass_x'] = 0.5
        
        features['top_heavy'] = np.sum(image_array[:h//2, :]) / total
        features['bottom_heavy'] = np.sum(image_array[h//2:, :]) / total
        features['left_heavy'] = np.sum(image_array[:, :w//2]) / total
        features['right_heavy'] = np.sum(image_array[:, w//2:]) / total
        
        horizontal_proj = np.sum(image_array, axis=1)
        horizontal_proj = horizontal_proj / (np.max(horizontal_proj) + 1e-10)
        peaks = np.where((horizontal_proj[1:-1] > horizontal_proj[:-2]) & 
                         (horizontal_proj[1:-1] > horizontal_proj[2:]))[0]
        features['num_horizontal_peaks'] = len(peaks)
        
        vertical_proj = np.sum(image_array, axis=0)
        vertical_proj = vertical_proj / (np.max(vertical_proj) + 1e-10)
        v_peaks = np.where((vertical_proj[1:-1] > vertical_proj[:-2]) & 
                          (vertical_proj[1:-1] > vertical_proj[2:]))[0]
        features['num_vertical_peaks'] = len(v_peaks)
        
        mid_row = image_array[h//2, :]
        crossings = np.sum(np.diff((mid_row > 0.1).astype(int)) != 0)
        features['mid_row_crossings'] = crossings
        
        mid_col = image_array[:, w//2]
        v_crossings = np.sum(np.diff((mid_col > 0.1).astype(int)) != 0)
        features['mid_col_crossings'] = v_crossings
    else:
        for key in ['q1_ratio', 'q2_ratio', 'q3_ratio', 'q4_ratio', 
                   'center_of_mass_y', 'center_of_mass_x',
                   'top_heavy', 'bottom_heavy', 'left_heavy', 'right_heavy',
                   'num_horizontal_peaks', 'num_vertical_peaks',
                   'mid_row_crossings', 'mid_col_crossings']:
            features[key] = 0
    
    return features

def predict_digit(features):
    scores = np.zeros(10)
    
    if features['total_pixels'] < 10:
        scores[:] = 0.1
        return softmax(scores)
    
    if features['aspect_ratio'] < 0.4:
        scores[1] += 5.0
        scores[7] += 1.0
    elif features['aspect_ratio'] > 0.9:
        scores[0] += 2.0
        scores[8] += 2.5
        scores[3] += 1.0
        scores[9] += 1.0
    else:
        scores[2] += 1.0
        scores[5] += 1.0
        scores[6] += 1.0
        scores[9] += 1.0
        scores[4] += 1.0
    
    if features['aspect_ratio'] < 0.35 and features['total_pixels'] < 200:
        scores[1] += 3.0
    
    if features['top_heavy'] > 0.55:
        scores[7] += 3.0
        scores[9] += 1.5
        scores[5] -= 1.0
        scores[6] -= 1.0
    
    if features['bottom_heavy'] > 0.55:
        scores[2] += 1.5
        scores[3] += 1.0
        scores[5] += 1.5
        scores[6] += 2.0
    
    if features['q4_ratio'] > 0.35:
        scores[2] += 2.0
        scores[3] += 1.0
        scores[8] += 1.0
    
    if features['q2_ratio'] > 0.3 and features['q3_ratio'] > 0.2:
        scores[5] += 2.0
        scores[6] += 2.5
    
    if features['mid_row_crossings'] >= 4:
        scores[8] += 2.5
        scores[0] += 1.5
        scores[9] += 1.0
    
    if features['mid_row_crossings'] == 2:
        scores[0] += 1.0
        scores[4] += 1.0
        scores[6] += 1.0
        scores[9] += 1.0
    
    if features['mid_col_crossings'] >= 3:
        scores[8] += 1.5
        scores[3] += 1.5
    
    if features['num_horizontal_peaks'] >= 3:
        scores[2] += 1.5
        scores[3] += 1.0
        scores[8] += 1.0
    
    if features['num_vertical_peaks'] >= 3:
        scores[8] += 1.0
        scores[0] += 0.5
    
    if features['center_of_mass_y'] < 0.4:
        scores[7] += 2.5
        scores[9] += 1.0
    
    if features['center_of_mass_y'] > 0.6:
        scores[2] += 1.0
        scores[5] += 1.0
        scores[6] += 1.5
    
    if features['left_heavy'] > 0.6:
        scores[4] += 2.0
        scores[5] += 1.0
        scores[6] += 1.0
    
    if features['total_pixels'] > 350:
        scores[8] += 2.0
        scores[0] += 1.5
        scores[9] += 1.0
    elif features['total_pixels'] < 150:
        scores[1] += 2.0
        scores[7] += 1.0
    
    if features['aspect_ratio'] > 0.5 and features['mid_row_crossings'] >= 2:
        scores[4] += 1.5
    
    if features['num_horizontal_peaks'] == 2 and features['aspect_ratio'] < 0.7:
        scores[7] += 1.0
    
    if features['q3_ratio'] > 0.3 and features['q4_ratio'] < 0.2:
        scores[5] += 2.0
        scores[6] += 2.5
    
    if features['q2_ratio'] < 0.2 and features['q4_ratio'] > 0.3:
        scores[2] += 2.0
    
    if features['aspect_ratio'] > 0.8 and features['mid_row_crossings'] >= 4:
        scores[8] += 3.0
    elif features['aspect_ratio'] > 0.8 and features['mid_row_crossings'] == 2:
        scores[0] += 2.0
    
    scores += np.random.rand(10) * 0.3
    
    return softmax(scores)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

def preprocess_image(image_data):
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    
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
    
    new_image = Image.new('L', (28, 28), 0)
    x_offset = (28 - new_width) // 2
    y_offset = (28 - new_height) // 2
    new_image.paste(image, (x_offset, y_offset))
    
    image_array = np.array(new_image).astype('float32') / 255
    
    return image_array

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
        
        features = extract_features(processed_image)
        
        probabilities = predict_digit(features)
        
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        
        probabilities_list = [float(p) for p in probabilities]
        
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
    print("=" * 50)
    print("  实时手写数字识别系统")
    print("=" * 50)
    print("  基于图像特征的智能识别引擎已启动")
    print("  请在浏览器中访问: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
