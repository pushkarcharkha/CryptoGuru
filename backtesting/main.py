import pandas as pd
import os
# pyrefly: ignore [missing-import]
import matplotlib.pyplot as plt
from strategy.strategy import get_signals

def run_backtest():
    # Get the directory where the script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Load Data (REAL - 3 Months)
    data_dir = os.path.join(base_dir, 'data')
    data_path = os.path.join(data_dir, 'btc_usdt_real.csv')
    
    try:
        from fetch_real_data import fetch_binance_data
        fetched_path = fetch_binance_data(symbol="BTCUSDT", limit=90)
        if fetched_path:
            data_path = fetched_path
    except Exception as e:
        print(f"Warning: Could not fetch real data ({e}). Falling back to existing files.")

    if not os.path.exists(data_path):
        import generate_mock_data
        generate_mock_data.generate_data()
        data_path = os.path.join(data_dir, 'btc_usdt.csv')
        
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 2. Get Signals
    df['signal'] = get_signals(df)
    
    # 3. Simulation variables
    initial_balance = 10000.0
    balance = initial_balance
    position_size = 0  # 1 for Long, -1 for Short, 0 for None
    entry_price = 0
    trades = 0
    wins = 0
    losses = 0
    
    # Risk Management Settings
    stop_loss = 0.05
    take_profit = 0.15
    position_size_pct = 0.20 # Use only 20% of balance per trade (Proper Margin)
    leverage = 5             # 5x Leverage (Magnifies Profit & Loss)
    
    history = []
    active_margin = 0 # Capital currently locked in a trade
    
    # 4. Simulation loop
    for i in range(len(df)):
        current_price = df['close'].iloc[i]
        signal = df['signal'].iloc[i]
        
        # Calculate current Unrealized PnL % (Adjusted for Leverage)
        pnl_pct = 0
        if position_size != 0:
            price_move = 0
            if position_size == 1: # Long
                price_move = (current_price - entry_price) / entry_price
            else: # Short
                price_move = (entry_price - current_price) / entry_price
            
            pnl_pct = price_move * leverage # <--- Leverage Applied
            
        # --- Check Exit Conditions (Stop Loss / Take Profit) ---
        if position_size != 0:
            if pnl_pct <= -stop_loss or pnl_pct >= take_profit:
                # Close trade: Update total balance with only the PnL of the margin used
                trade_result = active_margin * pnl_pct
                balance += trade_result
                if pnl_pct > 0: wins += 1
                else: losses += 1
                trades += 1
                position_size = 0
                entry_price = 0
                active_margin = 0
                pnl_pct = 0
        
        # --- Process New Signals ---
        if signal == 1 and position_size != 1: # Switch to Long
            # Close existing short if any
            if position_size == -1:
                balance += active_margin * pnl_pct
                if pnl_pct > 0: wins += 1
                else: losses += 1
                trades += 1
            
            # Open Long with 20% of CURRENT balance
            active_margin = balance * position_size_pct
            entry_price = current_price
            position_size = 1
            pnl_pct = 0
            
        elif signal == -1 and position_size != -1: # Switch to Short
            # Close existing long if any
            if position_size == 1:
                balance += active_margin * pnl_pct
                if pnl_pct > 0: wins += 1
                else: losses += 1
                trades += 1
            
            # Open Short with 20% of CURRENT balance
            active_margin = balance * position_size_pct
            entry_price = current_price
            position_size = -1
            pnl_pct = 0
            
        # Track current portfolio value (Cash + (Margin + Margin PnL))
        current_portfolio_value = balance + (active_margin * pnl_pct)
        history.append(current_portfolio_value)
        
        # STOP after exactly 10 trades as requested
        if trades >= 10:
            print(f"--- Reached 10 trades limit. Stopping backtest... ---")
            break

    # 5. Calculate Final Metrics
    final_balance = history[-1]
    total_profit_pct = ((final_balance - initial_balance) / initial_balance) * 100
    accuracy = (wins / trades * 100) if trades > 0 else 0
    
    # --- OUTPUT RESULTS ---
    output_str = f"""
=========================================
      CRYPTO BACKTESTING RESULTS
=========================================
Initial Balance: ${initial_balance:,.2f}
Final Balance:   ${final_balance:,.2f}
Total Profit:    ${(final_balance - initial_balance):,.2f} ({total_profit_pct:.2f}%)
-----------------------------------------
Total Trades:    {trades}
Winning Trades:  {wins}
Losing Trades:   {losses}
Accuracy:        {accuracy:.2f}%
=========================================
"""
    print(output_str)
    
    # Save results
    results_dir = os.path.join(base_dir, 'results')
    os.makedirs(results_dir, exist_ok=True)
    with open(os.path.join(results_dir, 'output.txt'), 'w') as f:
        f.write(output_str)

    # 6. Plotting - Ensure df matches history length
    df = df.iloc[:len(history)]
    df['portfolio_value'] = history
    
    plt.figure(figsize=(12, 8))
    
    # Plot Price
    ax1 = plt.subplot(2, 1, 1)
    plt.plot(df['timestamp'], df['close'], label='BTC/USDT Price', alpha=0.5, color='blue')
    if 'fast_sma' in df.columns:
        plt.plot(df['timestamp'], df['fast_sma'], label='Fast SMA', linestyle='--', alpha=0.7)
    if 'slow_sma' in df.columns:
        plt.plot(df['timestamp'], df['slow_sma'], label='Slow SMA', linestyle='--', alpha=0.7)
    
    # Plot signals
    buys = df[df['signal'] == 1]
    sells = df[df['signal'] == -1]
    plt.scatter(buys['timestamp'], buys['close'], marker='^', color='green', s=100, label='BUY')
    plt.scatter(sells['timestamp'], sells['close'], marker='v', color='red', s=100, label='SELL')
    
    plt.title('BTC/USDT Trading Strategy Analysis')
    plt.legend()
    
    # Plot Portfolio Value
    plt.subplot(2, 1, 2, sharex=ax1)
    plt.plot(df['timestamp'], df['portfolio_value'], label='Portfolio Value ($)', color='green', linewidth=2)
    plt.axhline(y=initial_balance, color='red', linestyle='--', label='Initial Balance')
    plt.ylabel('Value ($)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(os.path.join(results_dir, 'performance_chart.png'))
    print(f"\nResults saved to {results_dir}")

if __name__ == "__main__":
    run_backtest()
