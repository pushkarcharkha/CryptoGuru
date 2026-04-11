import pandas as pd
import numpy as np

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def get_signals(df):
    """
    Ultra-Pro Strategy:
    1. SMA Crossover (Trend)
    2. Double Top/Bottom (Geometric)
    3. RSI Filter (Momentum/Overbought/Oversold)
    """
    # math indicators
    df['fast_sma'] = df['close'].rolling(window=3).mean()
    df['slow_sma'] = df['close'].rolling(window=10).mean()
    df['rsi'] = calculate_rsi(df['close'], 14)
    
    # geometric points
    strength = 3
    df['is_high'] = False
    df['is_low'] = False
    for i in range(strength, len(df) - strength):
        if df['high'].iloc[i] == df['high'].iloc[i-strength:i+strength+1].max():
            df.at[df.index[i], 'is_high'] = True
        if df['low'].iloc[i] == df['low'].iloc[i-strength:i+strength+1].min():
            df.at[df.index[i], 'is_low'] = True
            
    signals = []
    for i in range(len(df)):
        if i < 10: # Warm up (reduced for faster entry)
            signals.append(0)
            continue
            
        # SEED LOGIC: On the very first day after warm-up, enter based on current trend
        if i == 10:
            if df['fast_sma'].iloc[i] > df['slow_sma'].iloc[i]:
                signals.append(1) # Start Long
            else:
                signals.append(-1) # Start Short
            continue

        current_price = df['close'].iloc[i]
        rsi = df['rsi'].iloc[i]
        
        # 1. GEOMETRIC: DOUBLE TOP (only if RSI suggests it's overbought)
        highs = df[df.index < df.index[i]][df['is_high'] == True].tail(2)
        if len(highs) == 2:
            if abs(highs['high'].iloc[0] - highs['high'].iloc[1]) / highs['high'].iloc[0] < 0.03:
                neckline = df['low'].iloc[highs.index[0]:highs.index[1]].min()
                if current_price < neckline and rsi > 50:
                    signals.append(-1)
                    continue

        # 2. GEOMETRIC: DOUBLE BOTTOM (only if RSI suggests it's oversold)
        lows = df[df.index < df.index[i]][df['is_low'] == True].tail(2)
        if len(lows) == 2:
            if abs(lows['low'].iloc[0] - lows['low'].iloc[1]) / lows['low'].iloc[0] < 0.03:
                neckline = df['high'].iloc[lows.index[0]:lows.index[1]].max()
                if current_price > neckline and rsi < 50:
                    signals.append(1)
                    continue

        # 3. MATHEMATICAL: SMA CROSS + RSI FILTER
        curr_fast = df['fast_sma'].iloc[i]
        curr_slow = df['slow_sma'].iloc[i]
        prev_fast = df['fast_sma'].iloc[i-1]
        prev_slow = df['slow_sma'].iloc[i-1]
        
        # BUY only if not extremely overbought (RSI < 70)
        if curr_fast > curr_slow and prev_fast <= prev_slow and rsi < 70:
            signals.append(1)
        # SHORT only if not extremely oversold (RSI > 30)
        elif curr_fast < curr_slow and prev_fast >= prev_slow and rsi > 30:
            signals.append(-1)
        else:
            signals.append(0)
            
    return signals
