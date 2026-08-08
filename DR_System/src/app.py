#src/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from tensorflow import keras
import pickle

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# File paths
MODEL_PATH = '../result/lstm_model.h5'
SCALER_PATH = '../result/scaler.pkl'
DATASET_PATH = '../Dataset/main_dataset.csv'
SIMULATION_DATA_PATH = '../Dataset/real_time_simulation_data.csv'

# Load model and scaler
# Load model without compiling

model = keras.models.load_model('../result/lstm_model.keras', compile=False)


# Compile the model with the correct loss function
model.compile(optimizer='adam', loss='mse', metrics=['mse'])

with open(SCALER_PATH, 'rb') as f:
    scaler = pickle.load(f)

# Load historical data
@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    try:
        # Load historical prediction data
        data = pd.read_csv(DATASET_PATH)
        
        # Mock prediction data for demonstration (use actual prediction logic here)
        predictions = data.head(10).to_dict(orient='records')
        
        return jsonify(predictions)
    
    except Exception as e:
        print(f'Error fetching historical prediction data: {e}')
        return jsonify({'error': 'Failed to fetch historical prediction data'}), 500

# Real-time prediction using simulation data
@app.route('/api/real-time-predictions', methods=['GET'])
def get_real_time_predictions():
    try:
        # Load real-time simulation data
        real_time_data = pd.read_csv(SIMULATION_DATA_PATH)
        
        # Preprocessing (assuming 'time' and 'features' exist in the simulation data)
        feature_columns = real_time_data.columns.drop('time')
        features = real_time_data[feature_columns]
        
        # Scale the features using the loaded scaler
        scaled_features = scaler.transform(features)
        
        # Predict using the loaded LSTM model
        predictions = model.predict(scaled_features)
        
        # Prepare data for the frontend
        response_data = []
        for i, prediction in enumerate(predictions):
            response_data.append({
                'time': real_time_data['time'].iloc[i],
                'predicted_demand': float(prediction[0])
            })
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f'Error fetching real-time prediction data: {e}')
        return jsonify({'error': 'Failed to fetch real-time prediction data'}), 500

# Run Flask app
if __name__ == '__main__':
    app.run(port=5000, debug=True)
