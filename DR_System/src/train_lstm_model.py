#src/train_lstm_model.py
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import CSVLogger
import joblib

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Load the main dataset
data = pd.read_csv(r'D:/DR_System/Dataset/main_dataset.csv', parse_dates=['datetime'], index_col='datetime')


# Ensure correct column names
print('Available columns in the dataset:', data.columns)


# Define input features and target variable
features = ['nat_demand', 'Price', 'Panama_Temperature', 'Panama_Humidity',
            'Panama_LiquidWater', 'Panama_WindSpeed', 'holiday', 'school', 'Peak_Hour']
target = 'nat_demand'

# Scale the data
scaler = MinMaxScaler()
data[features] = scaler.fit_transform(data[features])

# Save the scaler for real-time prediction
joblib.dump(scaler, '../result/scaler.pkl')

# Prepare the data for LSTM
window_size = 7 * 24  # 7 days of hourly data
X, y = [], []
for i in range(len(data) - window_size):
    X.append(data[features].iloc[i:i + window_size].values)
    y.append(data[target].iloc[i + window_size])

X, y = np.array(X), np.array(y)

# Split the data into training and testing sets
split_ratio = 0.8
split_index = int(len(X) * split_ratio)
X_train, X_test = X[:split_index], X[split_index:]
y_train, y_test = y[:split_index], y[split_index:]

# Build the LSTM model
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(window_size, len(features))),
    LSTM(32),
    Dense(1)
])

model.compile(optimizer='adam', loss='mse')

# Train the model and log training history
csv_logger = CSVLogger('../result/history.csv', append=True)
model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test), callbacks=[csv_logger])

# Save the trained model
model.save('../result/lstm_model.keras', save_format='keras')


print('\n✅ Model training complete. Model saved to ../result/lstm_model.h5')
