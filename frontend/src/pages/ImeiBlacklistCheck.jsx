import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function ImeiBlacklistCheck() {
  const pageUrl = 'https://imeicheck2.com/imei-blacklist-check';
  const faqItems = [
    {
      question: 'What does blacklisted IMEI usually mean?',
      answer:
        'It usually indicates restrictions associated with the device identity that may impact network usage, resale, or acceptance in some channels.',
    },
    {
      question: 'Should I run only a blacklist check?',
      answer:
        'It is better to combine blacklist checks with lock and activation indicators for a more complete risk review.',
    },
    {
      question: 'Is IMEI verification useful for sellers too?',
      answer:
        'Yes. Sellers can verify status before listing to increase buyer confidence and reduce transaction disputes.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Run an IMEI Blacklist Check',
        description:
          'Step-by-step process to check IMEI blacklist status before buying or reselling a used iPhone.',
        step: [
          { '@type': 'HowToStep', name: 'Copy IMEI from seller', text: 'Ask the seller for the full 15-digit IMEI.' },
          { '@type': 'HowToStep', name: 'Run IMEI report', text: 'Use a trusted IMEI checker service to get status details.' },
          { '@type': 'HowToStep', name: 'Review red flags', text: 'Check blacklist and report indicators before payment.' },
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
        title="IMEI Blacklist Check for Used iPhone | Avoid Reported Devices"
        description="Run an IMEI blacklist check before buying or selling used iPhones. Spot reported or blocked devices and reduce fraud risk."
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
          <h1 className="text-3xl font-bold">IMEI blacklist check: simple and fast</h1>
          <p className="text-slate-300 text-sm leading-6">
            A blacklist check is essential for second-hand iPhone deals. If a phone is reported or blocked,
            resale value and usability can drop immediately. Always verify before paying or shipping.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">3-step checklist</h2>
          <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
            <li>Copy the full 15-digit IMEI exactly.</li>
            <li>Run a report through the IMEI checker.</li>
            <li>Review blacklist, lock status, and risk signals before buying.</li>
          </ol>
          <p className="text-sm text-slate-400">
            Pro tip: combine blacklist checks with lock/activation checks for better protection.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/stolen-iphone-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Check if iPhone is stolen</Link>
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
