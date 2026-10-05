import { useEffect, useState } from 'react';
import { brandingService } from '../../services/brandingService';

export default function BrandLogo({ light = false, compact = false }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    let active = true;
    brandingService
      .getLogo()
      .then((url) => {
        if (active) setImageUrl(url);
      })
      .catch(() => {});
    const syncLogo = (event) => setImageUrl(event.detail?.url || null);
    window.addEventListener('aurelis:brand-logo-updated', syncLogo);
    return () => {
      active = false;
      window.removeEventListener('aurelis:brand-logo-updated', syncLogo);
    };
  }, []);

  if (imageUrl) {
    return (
      <div className="flex items-center gap-3">
        <span className={`brand-logo-image-wrap${compact ? ' is-compact' : ''}`}>
          <img
            className="brand-logo-image"
            src={imageUrl}
            alt=""
            aria-hidden="true"
            onError={() => setImageUrl(null)}
          />
        </span>
        {!compact && (
          <div>
            <div
              className={`brand-display text-lg font-semibold tracking-[.12em] ${light ? 'text-white' : 'text-espresso'}`}
            >
              AURELIS
            </div>
            <div
              className={`text-[10px] tracking-[.34em] ${light ? 'text-white/60' : 'text-coffee/60'}`}
            >
              COFFEE
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid h-10 w-10 place-items-center rounded-full border ${light ? 'border-white/30 text-white' : 'border-gold/50 text-espresso'} font-serif text-xl`}
      >
        A
      </div>
      {!compact && (
        <div>
          <div
            className={`brand-display text-lg font-semibold tracking-[.12em] ${light ? 'text-white' : 'text-espresso'}`}
          >
            AURELIS
          </div>
          <div
            className={`text-[10px] tracking-[.34em] ${light ? 'text-white/60' : 'text-coffee/60'}`}
          >
            COFFEE
          </div>
        </div>
      )}
    </div>
  );
}
