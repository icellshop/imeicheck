import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

export default function CraigslistOfferupImeiMeetupCheck() {
  const pageUrl = 'https://imeicheck2.com/craigslist-offerup-iphone-imei-check';

  const faqItems = [
    {
      question: 'Should I check IMEI before or during meetup?',
      answer:
        'Check before meetup whenever possible, then confirm details again before final payment.',
    },
    {
      question: 'Is a public meetup location enough to stay safe?',
      answer:
        'It helps personal safety, but it does not verify phone status. IMEI checks are still required.',
    },
    {
      question: 'What if the seller says there is no SIM restriction?',
      answer:
        'That is only one signal. Always review blacklist, reporting, and activation-related indicators too.',
    },
  ];

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Check iPhone IMEI Before Craigslist or OfferUp Meetup',
        description:
          'A practical meetup checklist to verify iPhone IMEI before paying in person on classifieds marketplaces.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Ask for IMEI in chat',
            text: 'Request the exact 15-digit IMEI before agreeing to meetup.',
          },
          {
            '@type': 'HowToStep',
            name: 'Run report before leaving home',
            text: 'Review blacklist, reported, and lock-related indicators in advance.',
          },
          {
            '@type': 'HowToStep',
            name: 'Verify details at meetup',
            text: 'Match the device and listing details, then pay only if checks remain acceptable.',
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
        title="Craigslist/OfferUp iPhone IMEI Check Before Meetup"
        description="Meeting a seller in person? Check iPhone IMEI before paying on Craigslist or OfferUp to reduce blacklist and reported-device risk."
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
          <h1 className="text-3xl font-bold">In-person meetup deals: verify IMEI before paying</h1>
          <p className="text-slate-300 text-sm leading-6">
            Fast local deals can be convenient, but pressure to close quickly can hide risk. Use IMEI checks before
            and during meetup to avoid buying a problematic iPhone.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-xl font-semibold">Meetup safety checklist</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Request and verify IMEI before leaving for the meetup.</li>
            <li>Confirm device details match listing and report output.</li>
            <li>Avoid deposits until basic checks are reviewed.</li>
            <li>Keep screenshots of listing, chat, and verification summary.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Warning: local meetup trust is not a replacement for IMEI verification.
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
            <Link to="/icloud-fmi-check-used-iphone" className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">iCloud / FMI guide</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
