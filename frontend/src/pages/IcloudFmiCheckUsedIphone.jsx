import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function IcloudFmiCheckUsedIphone() {
  const pageUrl = 'https://imeicheck2.com/icloud-fmi-check-used-iphone';

  const faqItems = [
    {
      question: 'Why does iCloud or FMI status matter before buying?',
      answer:
        'It can affect activation and future use of the device. Buyers should verify it before paying for any used iPhone.',
    },
    {
      question: 'Is carrier unlock enough if iCloud risk still exists?',
      answer:
        'No. Carrier status and iCloud or FMI-related risk are different checks, and both should be reviewed.',
    },
    {
      question: 'When should I run this check?',
      answer:
        'Run it as soon as the seller shares the IMEI, then confirm key details again before final payment or meetup handoff.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'iCloud and FMI Check Before Buying a Used iPhone',
        description:
          'A practical guide explaining why iCloud and Find My iPhone status should be reviewed before buying a used device.',
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
        title="iCloud / FMI Check Before Buying Used iPhone"
        description="Check iCloud and Find My iPhone risk before buying a used iPhone. Verify IMEI status before payment to reduce activation problems."
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
          <h1 className="text-3xl font-bold">Check iCloud / FMI before paying for a used iPhone</h1>
          <p className="text-slate-300 text-sm leading-6">
            Used iPhones can look clean and still carry activation-related risk. Reviewing iCloud and FMI-related
            signals alongside your IMEI check helps you avoid expensive surprises after purchase.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">What to review before payment</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>IMEI status and device detail consistency.</li>
            <li>Any available iCloud or FMI-related risk indicators.</li>
            <li>Carrier lock status separately from activation concerns.</li>
            <li>Seller claims compared with report output and device behavior.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Important: an unlocked phone can still have account or activation-related issues.
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
            <Link to="/craigslist-offerup-iphone-imei-check" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Craigslist/OfferUp meetup IMEI guide</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
