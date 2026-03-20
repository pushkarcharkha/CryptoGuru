import { useState, useEffect, useCallback } from 'react';
import type { FearGreedData } from '../types';

export interface RSSArticle {
  title: string;
  url: string;
  source: string;
  thumbnail: string | null;
  publishedAt: string;
  description: string;
}

const RSS_FEEDS = [
  {
    name: 'CoinDesk',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/'
  },
  {
    name: 'CoinTelegraph', 
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss'
  },
  {
    name: 'Decrypt',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed'
  }
];

let newsCache = { data: [] as RSSArticle[], timestamp: 0 };

const fetchRSSNews = async (): Promise<RSSArticle[]> => {
  const allArticles: RSSArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        const articles = data.items.map((item: any) => ({
          title: item.title,
          url: item.link,
          source: feed.name,
          thumbnail: item.thumbnail || item.enclosure?.link || null,
          publishedAt: item.pubDate,
          description: item.description
            ?.replace(/<[^>]*>/g, '') // strip HTML tags
            ?.slice(0, 150) + '...'
        }));
        allArticles.push(...articles);
      }
    } catch (e) {
      console.error(`Failed to fetch ${feed.name}:`, e);
      continue;
    }
  }

  // Sort all articles by date newest first
  allArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Filter crypto only
  const cryptoKeywords = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain',
    'defi', 'nft', 'web3', 'solana', 'bnb', 'binance', 'altcoin',
    'token', 'wallet', 'exchange', 'stablecoin', 'cardano', 'ripple',
    'xrp', 'polygon', 'dogecoin', 'avalanche', 'chainlink', 'trading'
  ];

  return allArticles.filter(article =>
    cryptoKeywords.some(keyword =>
      article.title.toLowerCase().includes(keyword) ||
      article.description?.toLowerCase().includes(keyword)
    )
  );
};

const fetchNewsWithCache = async (): Promise<RSSArticle[]> => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (newsCache.data.length > 0 && (now - newsCache.timestamp) < fiveMinutes) {
    return newsCache.data;
  }

  const fresh = await fetchRSSNews();
  if (fresh.length > 0) {
    newsCache.data = fresh;
    newsCache.timestamp = now;
  }

  return newsCache.data;
};

export function useNews() {
  const [fearGreedData, setFearGreedData] = useState<FearGreedData[]>([]);
  const [newsData, setNewsData] = useState<RSSArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchFearGreed = useCallback(async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=7');
      if (!response.ok) return;
      const data = await response.json();
      setFearGreedData(data.data || []);
    } catch (err) {
      console.error('Failed to fetch Fear & Greed Index:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([
      fetchFearGreed(),
      fetchNewsWithCache().then(data => {
        setNewsData(data);
        setLastUpdated(Date.now());
      }).catch(err => {
        setError(err.message);
      })
    ]);
    setIsLoading(false);
  }, [fetchFearGreed]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const interval = setInterval(refreshAll, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [refreshAll]);

  return {
    fearGreedData,
    newsData,
    isLoading,
    error,
    lastUpdated,
    refreshAll,
  };
}
