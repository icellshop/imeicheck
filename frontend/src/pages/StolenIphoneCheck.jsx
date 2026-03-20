import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function StolenIphoneCheck() {
  const pageUrl = 'https://imeicheck2.com/stolen-iphone-check';
  const faqItems = [
    {
      question: 'Can an iPhone be risky even if it works normally?',
      answer:
        'Yes. A device can appear normal and still have lost, reported, or blacklist-related problems that affect long-term usage.',
    },
    {
      question: 'If a seller says no SIM restrictions, is that enough?',
      answer:
        'No. SIM status is only one signal. You should still verify IMEI blacklist and reporting indicators before paying.',
    },
    {
      question: 'When should I run an IMEI check?',
      answer:
        'Run it before payment, before shipping, and before finalizing local meetups for used iPhone transactions.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'How to Check if an iPhone Is Stolen Before You Buy',
        description:
          'Use IMEI to verify whether a used iPhone may be reported lost, stolen, blacklisted, or risky to activate.',
        mainEntityOfPage: pageUrl,
        author: {
          '@type': 'Organization',
          name: 'IMEICHECK2',
        },
        publisher: {
          '@type': 'Organization',
          name: 'IMEICHECK2',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Seo
        title="Check if iPhone Is Stolen | IMEI Lost or Reported Status"
        description="Before buying a used iPhone, check the IMEI for lost or stolen reports, blacklist status, and activation risks."
        canonical={pageUrl}
        jsonLd={pageSchema}
      />

      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-10 w-auto object-contain" fallbackClassName="text-xl font-bold" />
          <div className="flex gap-2">
            <Link to="/" className="px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm">Home</Link>
            <Link to="/guest-checker" className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">Check IMEI</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">How to check if an iPhone is stolen</h1>
          <p className="text-slate-300 text-sm leading-6">
            When someone shares an iPhone IMEI, verify it before payment. A phone can power on, look clean,
            and still have hidden risk. An IMEI check helps you detect if a device may be reported, blocked,
            or difficult to activate later.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">What to verify before you buy</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Lost/stolen reporting indicators where available.</li>
            <li>Blacklist history that can affect network usage.</li>
            <li>Carrier lock and activation-related signals.</li>
            <li>Model/IMEI consistency with seller claims.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Warning: No SIM restrictions alone is not a full safety check.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/imei-blacklist-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">IMEI blacklist check guide</Link>
            <Link to="/buy-used-iphone-safely" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Buy used iPhone safely guide</Link>
            <Link to="/no-sim-restrictions-used-iphone-risk" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">No SIM restrictions risk guide</Link>
            <Link to="/facebook-marketplace-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Facebook Marketplace IMEI guide</Link>
            <Link to="/wholesale-bulk-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Wholesale bulk IMEI guide</Link>
            <Link to="/craigslist-offerup-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Craigslist/OfferUp meetup IMEI guide</Link>
            <Link to="/icloud-fmi-check-used-iphone" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">iCloud / FMI guide</Link>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article key={item.question}>
                <h3 className="text-sm font-semibold text-slate-100">{item.question}</h3>
                <p className="text-sm text-slate-300 mt-1">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
