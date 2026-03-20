import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function FacebookMarketplaceImeiCheck() {
  const pageUrl = 'https://imeicheck2.com/facebook-marketplace-iphone-imei-check';

  const faqItems = [
    {
      question: 'When should I ask for IMEI in a Facebook Marketplace deal?',
      answer:
        'Ask for the 15-digit IMEI before agreeing on payment or meetup so you can verify the device status early.',
    },
    {
      question: 'Is meeting in person enough protection?',
      answer:
        'No. In-person meetings reduce some risk, but they do not replace IMEI verification for blacklist and reporting signals.',
    },
    {
      question: 'What if the seller refuses to share IMEI?',
      answer:
        'Treat that as a major warning sign and avoid paying until the device can be independently verified.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Verify iPhone IMEI on Facebook Marketplace',
        description:
          'A practical step-by-step flow to validate IMEI before buying a used iPhone on Facebook Marketplace.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Request IMEI before meetup',
            text: 'Ask for the exact 15-digit IMEI and basic phone details from the seller.',
          },
          {
            '@type': 'HowToStep',
            name: 'Run IMEI check',
            text: 'Use a trusted IMEI checker to review blacklist, reporting, and lock indicators.',
          },
          {
            '@type': 'HowToStep',
            name: 'Pay only after review',
            text: 'Proceed only when report signals are acceptable and listing details match the device.',
          },
        ],
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
        title="Facebook Marketplace iPhone IMEI Check Before You Buy"
        description="Buying used iPhone on Facebook Marketplace? Verify IMEI first to reduce blacklist, reported, and lock-related risks."
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
          <h1 className="text-3xl font-bold">Facebook Marketplace used iPhone: check IMEI first</h1>
          <p className="text-slate-300 text-sm leading-6">
            Marketplace listings can look great but still hide expensive problems. Before meetup or payment,
            verify IMEI status so you can spot warning signals and avoid risky deals.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Quick buyer checklist</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Request IMEI early in chat before agreeing to buy.</li>
            <li>Run report before transferring money or deposit.</li>
            <li>Match report details with listing and device.</li>
            <li>Save screenshots of chat, listing, and report summary.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Important: a seller saying “unlocked” is not enough for a safe purchase decision.
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
            <Link to="/wholesale-bulk-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Wholesale bulk IMEI guide</Link>
            <Link to="/craigslist-offerup-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Craigslist/OfferUp meetup IMEI guide</Link>
            <Link to="/icloud-fmi-check-used-iphone" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">iCloud / FMI guide</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
