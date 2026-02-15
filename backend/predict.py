import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from PIL import Image
import os

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

def predict():
    try:
        # Get image path from command line arguments
        img_path = sys.argv[1]
        
        # Load models
        tb_model = tf.keras.models.load_model("tb_detection_model.h5")
        dr_model = tf.keras.models.load_model("diabetic_retinopathy_model.keras")
        
        # Preprocess
        img_array = preprocess_image(img_path)
        
        # Make predictions
        tb_pred = tb_model.predict(img_array, verbose=0)[0][0]
        dr_pred = dr_model.predict(img_array, verbose=0)[0][0]
        
        # Format results
        result = {
            "tb_probability": float(tb_pred) * 100,
            "dr_probability": float(dr_pred) * 100,
            "tb_diagnosis": "Positive" if tb_pred > 0.85 else "Negative",
            "dr_diagnosis": "Positive" if dr_pred > 0.85 else "Negative"
        }
        
        # Print JSON for Node.js to read
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()