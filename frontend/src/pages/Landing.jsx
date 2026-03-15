import { Link } from 'react-router-dom';
import BrandLogoLink from '../components/BrandLogoLink';

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
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-8 w-auto" fallbackClassName="text-xl font-bold" />
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
      </main>
    </div>
  );
}
