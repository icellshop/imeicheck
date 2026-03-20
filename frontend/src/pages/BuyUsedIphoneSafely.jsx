import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function BuyUsedIphoneSafely() {
  const pageUrl = 'https://imeicheck2.com/buy-used-iphone-safely';
  const faqItems = [
    {
      question: 'What should I ask a used iPhone seller before paying?',
      answer:
        'Ask for the exact 15-digit IMEI and verify key status signals before payment or shipment.',
    },
    {
      question: 'Can a clean-looking phone still be risky?',
      answer:
        'Yes. Cosmetic condition does not guarantee blacklist, reporting, or activation safety.',
    },
    {
      question: 'When should I verify IMEI in the deal process?',
      answer:
        'Verify early when first receiving the listing details, then confirm again before final payment.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Buy Used iPhone Safely: IMEI Checklist',
        description:
          'Practical checklist to reduce risk when buying or selling used iPhones, including IMEI verification.',
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
        title="Buy Used iPhone Safely | IMEI Checklist Before You Pay"
        description="Use this used iPhone safety checklist: verify IMEI, blacklist status, SIM lock, and activation risks before buying."
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
          <h1 className="text-3xl font-bold">Buy or sell used iPhone safely</h1>
          <p className="text-slate-300 text-sm leading-6">
            Used iPhone deals move fast, but fast deals can hide expensive problems. A quick IMEI check helps
            you catch warning signs early and avoid paying for a device with hidden restrictions.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Safety checklist before payment</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Confirm IMEI matches device and listing details.</li>
            <li>Check blacklist / lost-report risk.</li>
            <li>Check carrier/SIM lock and activation status.</li>
            <li>Keep proof of communication and transaction records.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Even if a seller says the phone has no SIM restrictions, always verify IMEI status independently.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/stolen-iphone-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Check if iPhone is stolen</Link>
            <Link to="/imei-blacklist-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">IMEI blacklist check guide</Link>
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
