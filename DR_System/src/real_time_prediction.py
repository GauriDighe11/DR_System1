from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import pandas as pd
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
import joblib
import time
import json
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient('mongodb://localhost:27017/')
db = client['dr_system']
queries_collection = db['consumer_queries']
alerts_collection = db['system_alerts']

# Load model and scaler
model = keras.models.load_model('../result/lstm_model.h5', compile=False)
model.compile(loss='mse', optimizer='adam')

scaler = joblib.load('../result/scaler.pkl')

# Load dataset
data_path = '../Dataset/real_time_simulation_data.csv'
data = pd.read_csv(data_path).head(1000)

data['datetime'] = pd.to_datetime(data['datetime'], dayfirst=True)
data = data.sort_values('datetime')

features = ['nat_demand', 'Price', 'Panama_Temperature', 'Panama_Humidity',
            'Panama_LiquidWater', 'Panama_WindSpeed', 'holiday', 'school', 'Peak_Hour']

data[features] = scaler.transform(data[features])

window_size = 7 * 24
peak_hour_threshold = 1470
price_increase_factor = 1.20

prediction_index = window_size
prediction_active = False

# ==============================
# 🚦 API for Historical Data (1st to 17th)
# ==============================
@app.route('/api/historical-data', methods=['GET'])
def historical_data():
    historical_data = data[(data['datetime'] >= '2020-01-01 00:00:00') & 
                         (data['datetime'] <= '2020-01-17 23:00:00')]
    
    transformed_data = historical_data.apply(lambda row: {
        'datetime': row['datetime'].strftime('%Y-%m-%d %H:%M:%S'),
        'actual_demand': row['nat_demand'] * scaler.data_max_[features.index('nat_demand')],
        'Price': row['Price'] * scaler.data_max_[features.index('Price')],
        'Peak_Hour': row['Peak_Hour']
    }, axis=1).tolist()

    return jsonify(transformed_data)

# ==============================
# 🚦 API for Actual Data Range (18th onwards)
# ==============================
@app.route('/api/actual-data-range', methods=['GET'])
def actual_data_range():
    global prediction_index
    start_index = prediction_index - 24
    end_index = prediction_index

    actual_data = data.iloc[start_index:end_index].apply(lambda row: {
        'datetime': row['datetime'].strftime('%Y-%m-%d %H:%M:%S'),
        'actual_demand': row['nat_demand'] * scaler.data_max_[features.index('nat_demand')],
        'Price': row['Price'] * scaler.data_max_[features.index('Price')],
        'Peak_Hour': row['Peak_Hour']
    }, axis=1).tolist()

    return jsonify(actual_data)

# ==============================
# 🚦 API for Predictions (18th onwards)
# ==============================
@app.route('/api/predict', methods=['GET'])
def prediction():
    global prediction_index, prediction_active
    
    user_input = request.args.get('continue', 'y').lower()
    
    if user_input == 'n':
        prediction_active = False
        prediction_index = window_size
        return Response("data:Prediction stopped by user.\n\n", mimetype='text/event-stream')

    prediction_active = True

    def generate_predictions():
        global prediction_index, prediction_active
        predictions_count = 0
        
        while prediction_active and prediction_index < len(data) and predictions_count < 24:
            input_data = data[features].iloc[prediction_index-window_size:prediction_index].values
            input_data = np.expand_dims(input_data, axis=0)

            predicted_demand = model.predict(input_data)
            predicted_demand = scaler.inverse_transform(
                [[predicted_demand[0][0]] + [0] * (len(features) - 1)]
            )[0][0]

            actual_demand = data['nat_demand'].iloc[prediction_index] * scaler.data_max_[features.index('nat_demand')]
            price = data['Price'].iloc[prediction_index] * scaler.data_max_[features.index('Price')]
            peak_hour = data['Peak_Hour'].iloc[prediction_index]

            is_peak_hour = predicted_demand >= peak_hour_threshold
            updated_price = price * price_increase_factor if is_peak_hour else price
            alert_message = "⚠️ Peak Hour Alert!" if is_peak_hour else "✅ Normal Hour."

            current_time = data['datetime'].iloc[prediction_index].strftime('%Y-%m-%d %H:%M:%S')
            output = {
                'datetime': current_time,
                'predicted_demand': predicted_demand,
                'actual_demand': actual_demand,
                'Price': updated_price,
                'Peak_Hour': peak_hour,
                'alert_message': alert_message
            }
            
            yield f"data:{json.dumps(output)}\n\n"
            time.sleep(1)
            
            prediction_index += 1
            predictions_count += 1

        prediction_active = False

    return Response(generate_predictions(), mimetype='text/event-stream')


#delete queery

@app.route('/api/delete-query/<query_id>', methods=['DELETE'])
def delete_query(query_id):
    try:
        result = queries_collection.delete_one({"_id": ObjectId(query_id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Query not found"}), 404
        return jsonify({"message": "Query deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Error deleting query", "error": str(e)}), 500

# ==============================
# 🚦 API for Query Management
# ==============================
@app.route('/api/submit-query', methods=['POST'])
def submit_query():
    try:
        query_data = request.json
        query_text = query_data.get("query")
        user_name = query_data.get("user_name", "Consumer")
        user_email = query_data.get("user_email", "")
        
        if not query_text:
            return jsonify({"message": "No query provided"}), 400
            
        query_obj = {
            "text": query_text,
            "user_name": user_name,
            "user_email": user_email,
            "timestamp": datetime.now().isoformat(),
            "status": "unanswered"
        }
        
        result = queries_collection.insert_one(query_obj)
        return jsonify({
            "message": "Query submitted successfully!",
            "query": {**query_obj, "_id": str(result.inserted_id)}
        }), 200
    except Exception as e:
        return jsonify({"message": "Error submitting query", "error": str(e)}), 500

@app.route('/api/get-queries', methods=['GET'])
def get_queries():
    try:
        queries = list(queries_collection.find({}).sort("timestamp", -1))
        for query in queries:
            query['_id'] = str(query['_id'])
        return jsonify(queries), 200
    except Exception as e:
        return jsonify({"message": "Error fetching queries", "error": str(e)}), 500

@app.route('/api/update-query', methods=['POST'])
def update_query():
    try:
        query_id = request.json.get("id")
        response = request.json.get("response")
        
        if not query_id or not response:
            return jsonify({"message": "Missing query ID or response"}), 400
            
        result = queries_collection.update_one(
            {"_id": ObjectId(query_id)},
            {"$set": {
                "status": "answered",
                "response": response,
                "answered_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }}
        )
        
        if result.modified_count == 0:
            return jsonify({"message": "Query not found"}), 404
            
        return jsonify({"message": "Query updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Error updating query", "error": str(e)}), 500
    
    #delete prediction from consumer dasjhboard

@app.route('/api/delete-prediction/<prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    try:
        # For MongoDB
        result = alerts_collection.delete_one({"_id": ObjectId(prediction_id)})
        
        # For SQL databases you might use:
        # result = db.session.delete(Prediction.query.get(prediction_id))
        # db.session.commit()
        
        if result.deleted_count == 0:
            return jsonify({"message": "Prediction not found"}), 404
        return jsonify({"message": "Prediction deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Error deleting prediction", "error": str(e)}), 500
# ==============================
# 🚦 API for Alert Management
# ==============================
@app.route('/api/send-alerts', methods=['POST'])
def send_alerts():
    try:
        alerts = request.json
        alerts_with_ids = []
        
        for alert in alerts:
            alert_data = {
                "_id": ObjectId(),  # Generate new ID
                "datetime": alert.get('datetime', datetime.now().isoformat()),
                "predicted_demand": alert['predicted_demand'],
                "Price": alert['Price'],
                "Peak_Hour": alert['Peak_Hour'],
                "created_at": datetime.now()
            }
            alerts_with_ids.append(alert_data)
        
        alerts_collection.insert_many(alerts_with_ids)
        return jsonify({
            "message": f"{len(alerts)} alerts sent successfully",
            "alerts": [str(alert['_id']) for alert in alerts_with_ids]
        }), 200
    except Exception as e:
        return jsonify({"message": "Error sending alerts", "error": str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def fetch_alerts():
    try:
        alerts = list(alerts_collection.find({}).sort("datetime", -1).limit(50))
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"message": "Error fetching alerts", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)