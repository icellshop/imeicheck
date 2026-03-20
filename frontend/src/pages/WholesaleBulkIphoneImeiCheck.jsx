import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function WholesaleBulkIphoneImeiCheck() {
  const pageUrl = 'https://imeicheck2.com/wholesale-bulk-iphone-imei-check';

  const faqItems = [
    {
      question: 'Why are IMEI checks critical for wholesale iPhone lots?',
      answer:
        'Bulk purchases amplify risk. One problematic batch can impact margins, refund rates, and reseller reputation.',
    },
    {
      question: 'Should I sample a few IMEIs or verify all units?',
      answer:
        'For higher confidence, verify as many units as practical before final payment, especially for mixed-condition lots.',
    },
    {
      question: 'What is the main red flag in bulk deals?',
      answer:
        'Inconsistent device details, missing IMEIs, or seller pressure to skip verification are high-risk signs.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Wholesale & Bulk iPhone IMEI Checks Before You Buy Inventory',
        description:
          'A practical guide for wholesalers and resellers to reduce risk when buying bulk used iPhone inventory.',
        mainEntityOfPage: pageUrl,
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
        title="Wholesale iPhone IMEI Check | Bulk Lot Risk Checklist"
        description="Buying bulk used iPhones? Run IMEI checks before paying to reduce blacklist, reported-status, and lock-related inventory risk."
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
          <h1 className="text-3xl font-bold">Bulk iPhone inventory? Verify IMEI before purchase</h1>
          <p className="text-slate-300 text-sm leading-6">
            Wholesale deals move fast and can look profitable on paper. But one risky lot can create expensive
            returns and blocked inventory. IMEI verification helps you filter out hidden risk before funds are sent.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Bulk buyer checklist</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Collect IMEI list from seller before payment terms are finalized.</li>
            <li>Verify report status across the batch and flag suspicious entries.</li>
            <li>Match IMEI results with lot grade, model, and storage claims.</li>
            <li>Require replacement/refund clauses for mismatched or high-risk units.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Tip: profitable wholesale operations depend on verification discipline, not only low purchase price.
          </p>
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

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/stolen-iphone-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Check if iPhone is stolen</Link>
            <Link to="/imei-blacklist-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">IMEI blacklist check guide</Link>
            <Link to="/buy-used-iphone-safely" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Buy used iPhone safely guide</Link>
            <Link to="/no-sim-restrictions-used-iphone-risk" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">No SIM restrictions risk guide</Link>
            <Link to="/facebook-marketplace-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Facebook Marketplace IMEI guide</Link>
            <Link to="/craigslist-offerup-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Craigslist/OfferUp meetup IMEI guide</Link>
            <Link to="/icloud-fmi-check-used-iphone" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">iCloud / FMI guide</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
