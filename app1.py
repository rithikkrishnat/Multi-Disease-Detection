import streamlit as st
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from PIL import Image

# Load the trained AI models
tb_model = tf.keras.models.load_model("tb_detection_model.h5")
dr_model = tf.keras.models.load_model("diabetic_retinopathy_model.keras")

# Function to preprocess the image
def preprocess_image(uploaded_image):
    img = Image.open(uploaded_image).convert("RGB")
    img = img.resize((224, 224))  # Resize to match model input
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize
    return img_array

# Function to make predictions
def predict_disease(img_array, model):
    prediction = model.predict(img_array)[0][0]  # Extract the single prediction value
    confidence = float(prediction * 100)  # Convert to percentage
    return confidence

# Streamlit UI
st.set_page_config(page_title="AI Disease Diagnosis", page_icon="🩺", layout="centered")
st.title("🩺 AI Disease Diagnosis")
st.write("Upload an X-ray or retina image to check for Tuberculosis or Diabetic Retinopathy.")

# Add a snow filter for better UI
st.snow()

# File uploader (now accepts PNG and JPG)
uploaded_file = st.file_uploader("Upload an image (.JPG or .PNG)", type=["jpg", "jpeg", "png"])

# Diagnose button
if uploaded_file:
    if st.button("Diagnose"):
        with st.spinner("Analyzing the image... ⏳"):
            img_array = preprocess_image(uploaded_file)

            # Predict TB
            tb_confidence = predict_disease(img_array, tb_model)
            tb_result = "Positive" if tb_confidence > 50 else "Negative"

            # Predict Diabetic Retinopathy
            dr_confidence = predict_disease(img_array, dr_model)
            dr_result = "Positive" if dr_confidence > 50 else "Negative"

            # Display results
            st.subheader("📋 Diagnosis Results:")
            col1, col2 = st.columns(2)

            with col1:
                st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)

            with col2:
                st.write(f"**🫁 Tuberculosis Diagnosis:** {tb_result}")
                st.progress(tb_confidence / 100)  # Convert to 0-1 range
                st.write(f"Confidence: **{tb_confidence:.2f}%**")

                st.write(f"**👁️ Diabetic Retinopathy Diagnosis:** {dr_result}")
                st.progress(dr_confidence / 100)  # Convert to 0-1 range
                st.write(f"Confidence: **{dr_confidence:.2f}%**")

        st.success("Diagnosis Complete! ✅")
