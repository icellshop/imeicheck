import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';
import Seo from '../components/Seo';

const EXAMPLES = [
  {
    title: 'Find My iPhone Status',
    description: 'Check FMI / iCloud lock status before purchasing devices.',
    sample: 'IMEI: 359998765432100 → FMI: ON · Model: iPhone 15 Pro',
  },
  {
    title: 'Carrier / SIM Lock',
    description: 'Verify lock policies to avoid activation surprises.',
    sample: 'IMEI: 352099001761481 → Carrier Lock: Unlocked',
  },
  {
    title: 'Blacklist / Lost Mode',
    description: 'Reduce fraud risk with blacklist and status verification.',
    sample: 'IMEI: 356779110024669 → Blacklist: Clean',
  },
];

export default function Landing() {
  const pageUrl = 'https://imeicheck2.com/';

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'IMEI Check for Used iPhone Safety',
    description:
      'Run an IMEI check before buying or selling any used iPhone to detect blacklisted or reported devices.',
    url: pageUrl,
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Why check IMEI before buying a used iPhone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An IMEI check helps detect blacklisted, stolen, or carrier-locked devices before payment.',
          },
        },
        {
          '@type': 'Question',
          name: 'If an iPhone says no SIM restriction, is it always safe?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Even with no SIM restrictions, the phone can still be reported lost, blacklisted, or have iCloud/FMI risk.',
          },
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Seo
        title="IMEI Check Before Buying Used iPhone | Stolen, Blacklisted & SIM Lock"
        description="Copy the IMEI and check it before buying or selling any used iPhone. Detect stolen or reported devices, blacklist status, SIM lock, and iCloud/FMI risks."
        canonical={pageUrl}
        jsonLd={pageSchema}
      />

      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-10 w-auto object-contain" fallbackClassName="text-xl font-bold" />
          <div className="flex items-center gap-2">
            <Link
              to="/guest-checker"
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm"
            >
              Guest Checker
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full border border-indigo-800 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-300">
              IMEI & serial intelligence platform
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Fast and reliable device checks for resellers, stores, and marketplaces.
            </h2>
            <p className="text-slate-300 text-sm leading-6">
              Run IMEI checks with service-based pricing, secure payments, and clear order history.
              Use guest mode for one-off checks or create an account for wallet-based workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/guest-checker"
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
              >
                Try Guest IMEI Checker
              </Link>
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-semibold"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300">How it works</h3>
            <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
              <li>Select a service and submit IMEI or serial.</li>
              <li>For guests, pay securely with Stripe before processing.</li>
              <li>Receive structured results and email confirmation.</li>
            </ol>
            <p className="text-xs text-slate-400">
              Need API access for partners? Sign in and use the API Access section.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Example checks</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {EXAMPLES.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2"
              >
                <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-5">{item.description}</p>
                <p className="text-xs font-mono rounded bg-slate-800 px-2 py-1 text-slate-200">
                  {item.sample}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-2xl font-semibold">Buying or selling a used iPhone? Check IMEI first.</h3>
          <p className="text-sm text-slate-300 leading-6">
            If someone sends you an IMEI number, run a check before payment. A device can look clean at first
            glance and still have hidden risk. This is especially important in second-hand marketplaces,
            social media deals, and local meetups.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
            <li>Confirm blacklist / reported lost or stolen records.</li>
            <li>Confirm iCloud / FMI / activation risk where available.</li>
            <li>Confirm carrier lock status before international resale.</li>
            <li>Verify model and service details from trusted report sources.</li>
          </ul>
          <p className="text-sm text-amber-300">
            Important: “No SIM restrictions” does not always mean safe. A phone can still be reported,
            blacklisted, or have account-related lock issues.
          </p>
          <div className="pt-1">
            <Link
              to="/guest-checker"
              className="inline-flex px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold"
            >
              Check IMEI Now
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Used iPhone safety guides</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
            <Link to="/stolen-iphone-check" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">Check if iPhone is stolen</h4>
              <p className="text-xs text-slate-400 mt-2">Learn how to validate IMEI before paying a seller.</p>
            </Link>
            <Link to="/imei-blacklist-check" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">IMEI blacklist check</h4>
              <p className="text-xs text-slate-400 mt-2">Follow a quick process to catch reported devices early.</p>
            </Link>
            <Link to="/buy-used-iphone-safely" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">Buy used iPhone safely</h4>
              <p className="text-xs text-slate-400 mt-2">Use a practical checklist to reduce fraud and lock risks.</p>
            </Link>
            <Link to="/no-sim-restrictions-used-iphone-risk" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">No SIM restrictions risk</h4>
              <p className="text-xs text-slate-400 mt-2">Learn what can still go wrong and what to verify first.</p>
            </Link>
            <Link to="/facebook-marketplace-iphone-imei-check" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">Facebook Marketplace IMEI</h4>
              <p className="text-xs text-slate-400 mt-2">Use a pre-meetup checklist before paying marketplace sellers.</p>
            </Link>
            <Link to="/wholesale-bulk-iphone-imei-check" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">Wholesale bulk IMEI checks</h4>
              <p className="text-xs text-slate-400 mt-2">Reduce batch risk before buying used iPhone inventory.</p>
            </Link>
            <Link to="/craigslist-offerup-iphone-imei-check" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">Craigslist/OfferUp meetup IMEI</h4>
              <p className="text-xs text-slate-400 mt-2">Verify local deal iPhones before in-person payment.</p>
            </Link>
            <Link to="/icloud-fmi-check-used-iphone" className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-100">iCloud / FMI check</h4>
              <p className="text-xs text-slate-400 mt-2">Review activation-related risk before buying used iPhone.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
