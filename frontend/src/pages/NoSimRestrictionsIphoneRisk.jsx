import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function NoSimRestrictionsIphoneRisk() {
  const pageUrl = 'https://imeicheck2.com/no-sim-restrictions-used-iphone-risk';

  const faqItems = [
    {
      question: 'Does no SIM restrictions mean the iPhone is fully safe?',
      answer:
        'No. It only describes carrier lock status. You still need to verify blacklist, reported status, and activation-related risks.',
    },
    {
      question: 'What should I check besides SIM status?',
      answer:
        'Check IMEI blacklist indicators, reporting signals, model consistency, and any available activation or account lock warnings.',
    },
    {
      question: 'When should this verification happen?',
      answer:
        'Before payment and before shipping or meetup handoff in any used iPhone transaction.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'No SIM Restrictions on Used iPhone: What Can Still Go Wrong',
        description:
          'A practical guide explaining why no SIM restrictions is not enough when evaluating a used iPhone deal.',
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
        title="No SIM Restrictions iPhone: Still Check IMEI Before You Buy"
        description="A used iPhone can still be risky even with no SIM restrictions. Learn what to verify with an IMEI check before you pay."
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
          <h1 className="text-3xl font-bold">No SIM restrictions doesn’t mean zero risk</h1>
          <p className="text-slate-300 text-sm leading-6">
            Many buyers assume “no SIM restrictions” means the deal is safe. It does not. Carrier status is only
            one piece of the puzzle. A used iPhone can still have blacklist, reporting, or activation-related
            issues that affect value and usability.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">What to verify before paying</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Blacklist / reported lost indicators.</li>
            <li>Carrier/SIM status plus activation-related signals.</li>
            <li>IMEI and model consistency with listing details.</li>
            <li>Any mismatch between seller claims and report output.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Rule of thumb: if the seller refuses to share IMEI, treat the deal as high risk.
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
            <Link to="/facebook-marketplace-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Facebook Marketplace IMEI guide</Link>
            <Link to="/wholesale-bulk-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Wholesale bulk IMEI guide</Link>
            <Link to="/craigslist-offerup-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Craigslist/OfferUp meetup IMEI guide</Link>
            <Link to="/icloud-fmi-check-used-iphone" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">iCloud / FMI guide</Link>
          </div>
        </section>
      </main>
    </div>
  );
}