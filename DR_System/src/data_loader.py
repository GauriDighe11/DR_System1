# src/data_loader.py
import pandas as pd
import os

def load_historical_data():
    # Define the file path
    file_path = os.path.join('..', 'Dataset', 'main_dataset.csv')
    
    # Load the dataset
    df = pd.read_csv(file_path)
    
    # Display basic information about the dataset
    print("Dataset Head:")
    print(df.head())
    
    print("\nDataset Info:")
    print(df.info())
    
    print("\nDataset Description:")
    print(df.describe())
    
    # Return the loaded dataframe
    return df

if __name__ == "__main__":
    df = load_historical_data()
