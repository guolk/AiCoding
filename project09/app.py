import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
CORS(app)

model = None

def build_model():
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation='relu'),
        Flatten(),
        Dense(64, activation='relu'),
        Dropout(0.5),
        Dense(10, activation='softmax')
    ])
    
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    return model

def train_model():
    global model
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    
    x_train = x_train.reshape((60000, 28, 28, 1)).astype('float32') / 255
    x_test = x_test.reshape((10000, 28, 28, 1)).astype('float32') / 255
    
    y_train = to_categorical(y_train)
    y_test = to_categorical(y_test)
    
    print("Building model...")
    model = build_model()
    
    print("Training model...")
    model.fit(x_train, y_train, epochs=10, batch_size=64, validation_split=0.1)
    
    test_loss, test_acc = model.evaluate(x_test, y_test)
    print(f"Test accuracy: {test_acc:.4f}")
    
    model_path = 'mnist_model.h5'
    model.save(model_path)
    print(f"Model saved to {model_path}")

def load_trained_model():
    global model
    model_path = 'mnist_model.h5'
    
    if os.path.exists(model_path):
        print(f"Loading existing model from {model_path}...")
        model = tf.keras.models.load_model(model_path)
    else:
        print("No existing model found. Training new model...")
        train_model()

def preprocess_image(image_data):
    if image_data.startswith('data:image'):
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    
    width, height = image.size
    if width > height:
        new_width = 20
        new_height = int(height * (20 / width))
    else:
        new_height = 20
        new_width = int(width * (20 / height))
    
    image = image.resize((new_width, new_height), Image.LANCZOS)
    
    new_image = Image.new('L', (28, 28), 0)
    x_offset = (28 - new_width) // 2
    y_offset = (28 - new_height) // 2
    new_image.paste(image, (x_offset, y_offset))
    
    image_array = np.array(new_image).astype('float32') / 255
    image_array = image_array.reshape(1, 28, 28, 1)
    
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
        
        predictions = model.predict(processed_image, verbose=0)
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class])
        
        probabilities = [float(p) for p in predictions[0]]
        
        return jsonify({
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': probabilities
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_trained_model()
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
