import requests
import pandas as pd
import os
from datetime import datetime

def fetch_binance_data(symbol="BTCUSDT", interval="1d", limit=90):
    """
    Fetches real historical OHLCV data from Binance Public API.
    """
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    
    print(f"Fetching real {symbol} data from Binance...")
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        
        # Binance klines format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
        df = pd.DataFrame(data, columns=[
            'timestamp', 'open', 'high', 'low', 'close', 'volume', 
            'close_time', 'qav', 'num_trades', 'taker_base_vol', 'taker_quote_vol', 'ignore'
        ])
        
        # Convert timestamp to human readable
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        
        # Convert values to numeric
        cols = ['open', 'high', 'low', 'close', 'volume']
        df[cols] = df[cols].apply(pd.to_numeric)
        
        # Keep only necessary columns
        df = df[['timestamp', 'open', 'high', 'low', 'close', 'volume']]
        
        # Save to data folder
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        file_path = os.path.join(data_dir, 'btc_usdt_real.csv')
        df.to_csv(file_path, index=False)
        print(f"Success! Real {symbol} data saved to {file_path}")
        return file_path
    else:
        print(f"Error fetching data: {response.text}")
        return None

if __name__ == "__main__":
    fetch_binance_data()
