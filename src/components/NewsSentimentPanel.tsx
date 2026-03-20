import React from 'react';
import { Frown, Meh, Smile, AlertTriangle, ExternalLink } from 'lucide-react';
import type { NewsArticle, FearGreedData } from '../types';

interface NewsSentimentPanelProps {
  fearGreed: FearGreedData[];
  newsData: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const NewsSentimentPanel: React.FC<NewsSentimentPanelProps> = ({
  fearGreed,
  newsData,
  isLoading,
  error,
  lastUpdated,
}) => {
  const latestFG = fearGreed[0];
  const yesterdayFG = fearGreed[1];
  const lastWeekFG = fearGreed[6];

  const getSentimentColor = (value: number) => {
    if (value <= 25) return '#ef4444';
    if (value <= 45) return '#f97316';
    if (value <= 55) return '#eab308';
    if (value <= 75) return '#84cc16';
    return '#22c55e';
  };

  const getSentimentEmoji = (classification: string) => {
    if (classification.includes('Extreme Fear')) return <Frown size={24} color="#ef4444" />;
    if (classification.includes('Fear')) return <Frown size={24} color="#f97316" />;
    if (classification.includes('Neutral')) return <Meh size={24} color="#eab308" />;
    if (classification.includes('Extreme Greed')) return <Smile size={24} color="#22c55e" />;
    if (classification.includes('Greed')) return <Smile size={24} color="#84cc16" />;
    return <Meh size={24} color="#a1a1aa" />;
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const NewsCard = ({ article }: { article: NewsArticle }) => (
    <div className="news-card" style={{
      padding: '12px', 
      marginBottom: '10px', 
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      pointerEvents: 'all',
      position: 'relative',
      zIndex: 101,
      border: '1px solid rgba(255,255,255,0.02)'
    }}>
      {article.thumbnail && (
        <img 
          src={article.thumbnail} 
          alt=""
          onError={(e) => e.currentTarget.style.display = 'none'}
          style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
        />
      )}
      
      {/* Source badge */}
      <span style={{
        background: 'rgba(0,255,136,0.1)',
        color: '#00ff88',
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '4px',
        marginBottom: '6px',
        display: 'inline-block'
      }}>
        {article.source}
      </span>
  
      <p style={{ color: '#e8e8ff', fontSize: '13px', lineHeight: '1.5', margin: '0 0 6px 0', fontWeight: 600 }}>
        {article.title}
      </p>
  
      <p style={{ color: '#5555aa', fontSize: '11px', margin: '0 0 8px 0' }}>
        {timeAgo(article.publishedAt)}
      </p>
  
      <button
        className="read-more-btn"
        onMouseDown={(e) => {
          e.stopPropagation()
          window.open(article.url, '_blank', 'noopener,noreferrer')
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#00d4ff',
          fontSize: '12px',
          cursor: 'pointer',
          padding: '0',
          pointerEvents: 'all',
          textDecoration: 'underline'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Read More <ExternalLink size={12} />
        </span>
      </button>
    </div>
  );

  return (
    <div className="news-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', pointerEvents: 'all', position: 'relative', zIndex: 100 }}>
      {/* CSS Overrides */}
      <style>{`
        .news-panel {
          pointer-events: all !important;
          position: relative;
          z-index: 100;
        }
        .news-card {
          pointer-events: all !important;
          position: relative;
          z-index: 101;
        }
        .read-more-btn {
          pointer-events: all !important;
          position: relative;
          z-index: 102;
          cursor: pointer !important;
        }
      `}</style>

      {/* Section 1: Fear & Greed Meter */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Market Sentiment
        </div>
        
        {latestFG ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '24px', marginBottom: '8px' }}>
               {getSentimentEmoji(latestFG.value_classification)} {latestFG.value_classification.toUpperCase()}
            </div>
            
            <div style={{ position: 'relative', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', margin: '15px 0', overflow: 'hidden' }}>
               <div 
                 style={{ 
                   position: 'absolute', 
                   left: 0, 
                   top: 0, 
                   bottom: 0, 
                   width: `${latestFG.value}%`, 
                   background: getSentimentColor(parseInt(latestFG.value)),
                   boxShadow: `0 0 15px ${getSentimentColor(parseInt(latestFG.value))}bb`,
                   transition: 'width 1s ease-out'
                 }} 
               />
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {latestFG.value}
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
               <span>Yesterday: {yesterdayFG?.value}</span>
               <span>Last Week: {lastWeekFG?.value}</span>
            </div>
          </>
        ) : (
          <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
        )}
      </div>

      {/* News Feed */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {isLoading && newsData.length === 0 ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px', marginBottom: '10px' }} />
          ))
        ) : error ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', textAlign: 'center', padding: '20px', color: '#ef4444', fontSize: '13px' }}>
              <AlertTriangle size={16} /> {error}
           </div>
        ) : (
          newsData.length > 0 ? (
            newsData.map((article, idx) => (
              <NewsCard key={idx} article={article} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No news available.
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        fontSize: '10px', 
        color: 'var(--text-muted)', 
        marginTop: '16px', 
        textAlign: 'center', 
        opacity: 0.6,
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.03)'
      }}>
        {lastUpdated ? (
          (() => {
            const diff = Math.floor((Date.now() - lastUpdated) / 60000);
            return `Last updated: ${diff === 0 ? 'Just now' : `${diff}m ago`}`;
          })()
        ) : 'Refreshing...'}
      </div>
    </div>
  );
};

export default NewsSentimentPanel;
