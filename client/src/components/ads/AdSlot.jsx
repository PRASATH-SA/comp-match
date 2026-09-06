import { useState, useEffect } from 'react';
import { adAPI } from '../../services/api';

export default function AdSlot({ placement, style = {} }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    let mounted = true;
    adAPI.getActive(placement)
      .then(({ data }) => {
        if (mounted && data.ads && data.ads.length > 0) {
          setAd(data.ads[0]);
        }
      })
      .catch(() => {
        // Silently fail if no ad or backend not connected
      });

    return () => {
      mounted = false;
    };
  }, [placement]);

  // If no ad is configured or available, do not render any empty space or placeholder
  if (!ad) return null;

  const handleClick = () => {
    if (ad._id) {
      adAPI.trackClick(ad._id).catch(() => {});
    }
  };

  if (ad.type === 'custom-banner' && ad.image?.url) {
    return (
      <div className="ad-banner" style={{ margin: '24px 0', ...style }}>
        <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
          <img
            src={ad.image.url}
            alt={ad.title || 'Advertisement'}
            style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        </a>
      </div>
    );
  }

  if (ad.type === 'amazon-referral' && ad.link) {
    return (
      <div className="ad-banner" style={{ margin: '24px 0', ...style }}>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          style={{
            display: 'block',
            padding: 20,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {ad.image?.url && (
            <img src={ad.image.url} alt="" style={{ maxHeight: 120, margin: '0 auto 12px', objectFit: 'contain' }} />
          )}
          <div style={{ fontWeight: 600, fontSize: '0.938rem', color: 'var(--secondary)' }}>{ad.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Sponsored Amazon Recommendation</div>
        </a>
      </div>
    );
  }

  if (ad.type === 'google-adsense' && ad.adsenseSlotId) {
    return (
      <div className="ad-banner" style={{ margin: '24px 0', overflow: 'hidden', ...style }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client={ad.amazonAffiliateTag || ''}
          data-ad-slot={ad.adsenseSlotId}
          data-ad-format={ad.adSize === 'responsive' ? 'auto' : undefined}
          data-full-width-responsive={ad.adSize === 'responsive' ? 'true' : 'false'}
        />
      </div>
    );
  }

  return null;
}
