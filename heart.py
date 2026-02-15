import os
import numpy as np
import random
from scipy.io import loadmat
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, Flatten, MaxPooling2D

# Define the path to your dataset folder
dataset_folder = r"D:\Human Disease Diagnosis\dataset\Cardio"

# Limit the number of files to load
num_files_to_load = 500  # Change this as needed

# Get all .mat files and shuffle
all_files = [f for f in os.listdir(dataset_folder) if f.endswith(".mat")]
random.shuffle(all_files)  
selected_files = all_files[:num_files_to_load]  # Pick a subset

# Initialize lists to store features and labels
X_list = []
y_list = []

# Load the selected .mat files
for i, filename in enumerate(selected_files):
    file_path = os.path.join(dataset_folder, filename)
    data = loadmat(file_path)

    # Print keys for the first file only
    if i == 0:
        print(f"Keys in {filename}: {data.keys()}")

    # Update with actual keys found in .mat files
    feature_key = "val"  # Features are stored in 'val'
    label_key = "label"  # Replace with the correct key for labels

    if feature_key in data and label_key in data:
        features = np.array(data[feature_key])
        label = np.array(data[label_key]).ravel()
        
        if features.shape[0] == label.shape[0]:  # Ensure matching samples
            X_list.append(features)
            y_list.append(label)
        else:
            print(f"⚠️ Skipping {filename}: Feature-label mismatch! {features.shape[0]} vs {label.shape[0]}")
    else:
        print(f"⚠️ Skipping {filename}: Missing required keys!")

# Convert lists to numpy arrays
if X_list and y_list:
    X = np.concatenate(X_list, axis=0)
    y = np.concatenate(y_list, axis=0)
else:
    raise ValueError("No valid .mat files loaded with both features and labels.")

# Print final dataset shape
print("Final dataset shape:", X.shape, y.shape)

# Normalize X if needed
X = X.astype("float32") / 255.0

# Reshape if necessary
X = X.reshape(X.shape[0], X.shape[1], X.shape[2], 1)  # Adjust for grayscale

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define CNN model
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=X_train.shape[1:]),
    MaxPooling2D((2,2)),
    Flatten(),
    Dense(64, activation='relu'),
    Dense(1, activation='sigmoid')  # Adjust for multi-class classification
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test), batch_size=32)

# Save the trained model
model.save("heart_disease_model.h5")

print("✅ Model training complete! Saved as 'heart_disease_model.h5'!")
