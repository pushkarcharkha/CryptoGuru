import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_data():
    # Set seed for reproducibility
    np.random.seed(42)
    
    # Generate 200 days of data for better SMA crossover testing
    date_today = datetime.now()
    days = 200
    dates = [date_today - timedelta(days=x) for x in range(days)]
    dates.reverse()

    # Initial price
    price = 30000
    prices = []
    
    # Simulate a trending market with some noise
    for i in range(days):
        # Add a slight upward drift for half the time, downward for the other half
        drift = 50 if i < 100 else -40
        change = np.random.normal(drift, 400)
        price += change
        prices.append(max(price, 1000)) # Ensure price doesn't go below 1000

    df = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': [p + abs(np.random.normal(0, 150)) for p in prices],
        'low': [p - abs(np.random.normal(0, 150)) for p in prices],
        'close': prices,
        'volume': [np.random.uniform(500, 2000) for _ in prices]
    })

    # Get the directory where the script is located to ensure path correctness
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, 'btc_usdt.csv')
    df.to_csv(file_path, index=False)
    print(f"Success! 200 days of trending mock data generated at {file_path}")

if __name__ == "__main__":
    generate_data()
