# src/evaluate_model.py
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import math
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from tensorflow import keras
import joblib

# Suppress TensorFlow and numpy warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
np.seterr(divide='ignore', invalid='ignore')

# Configuration (matches your training script)
DATA_PATH = r'D:/DR_System/Dataset/main_dataset.csv'
RESULT_DIR = '../result/'
MODEL_FILE = 'lstm_model.keras'
SCALER_FILE = 'scaler.pkl'
HISTORY_FILE = 'history.csv'

def safe_mape(y_true, y_pred):
    """Calculate MAPE handling zero actual values"""
    mask = y_true != 0  # Create mask for non-zero values
    if not np.any(mask):
        return 0.0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

def load_assets():
    """Load model, scaler, and history"""
    model = keras.models.load_model(os.path.join(RESULT_DIR, MODEL_FILE))
    scaler = joblib.load(os.path.join(RESULT_DIR, SCALER_FILE))
    history = pd.read_csv(os.path.join(RESULT_DIR, HISTORY_FILE))
    return model, scaler, history

def prepare_data():
    """Prepare data identical to training process"""
    data = pd.read_csv(DATA_PATH, parse_dates=['datetime'], index_col='datetime')
    features = ['nat_demand', 'Price', 'Panama_Temperature', 'Panama_Humidity',
               'Panama_LiquidWater', 'Panama_WindSpeed', 'holiday', 'school', 'Peak_Hour']
    
    scaler = joblib.load(os.path.join(RESULT_DIR, SCALER_FILE))
    data[features] = scaler.transform(data[features])
    
    window_size = 7 * 24
    X, y = [], []
    for i in range(len(data) - window_size):
        X.append(data[features].iloc[i:i + window_size].values)
        y.append(data['nat_demand'].iloc[i + window_size])
    
    return np.array(X), np.array(y), scaler, features

def calculate_metrics(y_true, y_pred, scaler, feature_names):
    """Calculate all metrics in original units"""
    scale_factor = scaler.data_max_[feature_names.index('nat_demand')]
    y_true_unscaled = y_true * scale_factor
    y_pred_unscaled = y_pred * scale_factor
    
    metrics = {
        'MAE': mean_absolute_error(y_true_unscaled, y_pred_unscaled),
        'MSE': mean_squared_error(y_true_unscaled, y_pred_unscaled),
        'RMSE': math.sqrt(mean_squared_error(y_true_unscaled, y_pred_unscaled)),
        'MAPE': safe_mape(y_true_unscaled, y_pred_unscaled),
        'R2': r2_score(y_true_unscaled, y_pred_unscaled)
    }
    metrics['Accuracy (%)'] = 100 - metrics['MAPE'] if metrics['MAPE'] is not None else 100
    return metrics, y_true_unscaled, y_pred_unscaled

def plot_results(y_true, y_pred, title, filename):
    """Generate prediction vs actual plot"""
    plt.figure(figsize=(15, 6))
    plt.plot(y_true, label='Actual Demand', color='blue', alpha=0.7)
    plt.plot(y_pred, label='Predicted Demand', color='red', alpha=0.5)
    plt.title(f'{title}\nMAE: {mean_absolute_error(y_true, y_pred):.2f} MW | '
              f'RMSE: {math.sqrt(mean_squared_error(y_true, y_pred)):.2f} MW')
    plt.xlabel('Time Steps (Hours)')
    plt.ylabel('Electricity Demand (MW)')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(RESULT_DIR, filename), dpi=300)
    plt.close()

def save_metrics(train_metrics, test_metrics):
    """Save metrics to CSV"""
    metrics_df = pd.DataFrame({
        'Dataset': ['Training', 'Test'],
        'MAE (MW)': [train_metrics['MAE'], test_metrics['MAE']],
        'RMSE (MW)': [train_metrics['RMSE'], test_metrics['RMSE']],
        'MAPE (%)': [train_metrics['MAPE'], test_metrics['MAPE']],
        'Accuracy (%)': [train_metrics['Accuracy (%)'], test_metrics['Accuracy (%)']],
        'R² Score': [train_metrics['R2'], test_metrics['R2']]
    })
    metrics_df.to_csv(os.path.join(RESULT_DIR, 'performance_metrics.csv'), index=False)

def main():
    print("🔍 Evaluating model performance...\n")
    
    try:
        # Load assets
        model, scaler, history = load_assets()
        X, y, scaler, features = prepare_data()
        
        # Split data (80/20)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Generate predictions
        print("Generating predictions...")
        train_pred = model.predict(X_train, verbose=1).flatten()
        test_pred = model.predict(X_test, verbose=1).flatten()
        
        # Calculate metrics
        train_metrics, y_train_act, y_train_pred = calculate_metrics(y_train, train_pred, scaler, features)
        test_metrics, y_test_act, y_test_pred = calculate_metrics(y_test, test_pred, scaler, features)
        
        # Print results
        print("\n📊 Model Performance Summary")
        print("="*65)
        print(f"{'Metric':<15}{'Training Set':>20}{'Test Set':>20}")
        print("-"*65)
        for metric in ['MAE', 'RMSE', 'MAPE', 'Accuracy (%)', 'R2']:
            print(f"{metric:<15}{train_metrics[metric]:>20.2f}{test_metrics[metric]:>20.2f}")
        
        # Save outputs
        plot_results(y_train_act, y_train_pred, "Training Set Performance", "train_predictions.png")
        plot_results(y_test_act, y_test_pred, "Test Set Performance", "test_predictions.png")
        save_metrics(train_metrics, test_metrics)
        
        print("\n✅ Evaluation complete. Results saved to:")
        print(f"- {os.path.join(RESULT_DIR, 'performance_metrics.csv')}")
        print(f"- {os.path.join(RESULT_DIR, 'train_predictions.png')}")
        print(f"- {os.path.join(RESULT_DIR, 'test_predictions.png')}")
    
    except Exception as e:
        print(f"\n❌ Evaluation failed: {str(e)}")

if __name__ == "__main__":
    main()