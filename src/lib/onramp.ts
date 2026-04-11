export const openOnramp = (flow: 'BUY' | 'SELL' = 'BUY', walletAddress: string = '', coin: string = 'USDT', network: string = 'BSC') => {
  const appId = "1966724";
  
  // Onramp.money parameters
  const params = new URLSearchParams({
    appId: appId,
    walletAddress: walletAddress,
    coinCode: coin,
    network: network,
    flow: flow,
  });

  // Dynamically select the correct endpoint based on flow
  const endpoint = flow === 'BUY' ? 'buy' : 'sell';
  const url = `https://onramp.money/main/${endpoint}/?${params.toString()}`;
  
  const width = 450;
  const height = 750;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  console.log(`Opening Onramp.money ${flow} URL:`, url);
  
  const onrampWindow = window.open(
    url, 
    'Onramp', 
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );

  if (!onrampWindow) {
    alert(`Popup blocked! Please allow popups for this site to continue with the ${flow.toLowerCase()}.`);
  }
};
