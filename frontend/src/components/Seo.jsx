import { useEffect } from 'react';

const DEFAULT_TITLE = 'IMEI Check for Stolen, Blacklisted & Carrier Lock Status | IMEICHECK2';
const DEFAULT_DESCRIPTION = 'Check IMEI before buying or selling a used iPhone. Detect blacklist, lost/stolen reports, SIM lock, iCloud/FMI status, and activation risks in seconds.';
const DEFAULT_IMAGE = 'https://imeicheck2.com/favicon.svg';

function upsertMetaByName(name, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertMetaByProperty(property, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url) {
  if (!url) return;
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function upsertJsonLd(id, jsonLd) {
  if (!jsonLd) return;
  let element = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.setAttribute('data-seo-jsonld', id);
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(jsonLd);
}

export default function Seo({
  title,
  description,
  canonical,
  image,
  robots,
  jsonLd,
}) {
  useEffect(() => {
    const safeTitle = title || DEFAULT_TITLE;
    const safeDescription = description || DEFAULT_DESCRIPTION;
    const safeImage = image || DEFAULT_IMAGE;
    const safeCanonical = canonical || 'https://imeicheck2.com/';

    document.title = safeTitle;
    upsertMetaByName('description', safeDescription);
    upsertMetaByName('robots', robots || 'index, follow, max-image-preview:large');
    upsertCanonical(safeCanonical);

    upsertMetaByProperty('og:type', 'website');
    upsertMetaByProperty('og:site_name', 'IMEICHECK2');
    upsertMetaByProperty('og:title', safeTitle);
    upsertMetaByProperty('og:description', safeDescription);
    upsertMetaByProperty('og:url', safeCanonical);
    upsertMetaByProperty('og:image', safeImage);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', safeTitle);
    upsertMetaByName('twitter:description', safeDescription);
    upsertMetaByName('twitter:image', safeImage);

    if (jsonLd) {
      upsertJsonLd('page', jsonLd);
    }
  }, [title, description, canonical, image, robots, jsonLd]);

  return null;
}