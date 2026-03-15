import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function BrandLogoLink({
  className = '',
  imageClassName = 'h-9 w-auto',
  fallbackClassName = 'text-xl font-bold text-white',
}) {
  const { token } = useAuth();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    let ignore = false;

    apiFetch('/api/branding')
      .then((data) => {
        if (ignore) return;
        setLogoUrl(typeof data?.logo_url === 'string' ? data.logo_url : '');
      })
      .catch(() => {
        if (ignore) return;
        setLogoUrl('');
      });

    return () => {
      ignore = true;
    };
  }, []);

  const href = useMemo(
    () => (token ? 'https://www.imeicheck2.com/dashboard' : 'https://www.imeicheck2.com'),
    [token]
  );

  return (
    <a href={href} className={className}>
      {logoUrl ? (
        <img src={logoUrl} alt="IMEICHECK2" className={imageClassName} />
      ) : (
        <span className={fallbackClassName}>
          IMEI<span className="text-indigo-400">Check</span>
        </span>
      )}
    </a>
  );
}
