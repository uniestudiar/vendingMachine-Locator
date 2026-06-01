import { Link } from 'react-router';
import {
  Search,
  Mail,
  Clock,
  TrendingUp,
  CheckCircle,
  Database,
  Settings,
  ArrowRight,
  MapPin,
  Zap,
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">VendLocate Pro</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">How VendLocate Pro Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            From finding locations to managing follow-ups, here's exactly what happens when you run your campaigns.
          </p>
          <p className="text-lg text-indigo-600 font-semibold">Complete automation. Maximum results.</p>
        </div>
      </section>

      {/* Main Process Flow */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">The Complete Workflow</h2>

          {/* Step 1 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 1: Choose Your Search Area</h3>
                    <p className="text-blue-100 text-lg">
                      Define where you want to find vending machine locations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-gray-900">What You Do:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Enter your location:</strong> Your city/state (this is your search center)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Choose your radius:</strong> 5 miles to 30 miles (bigger = more leads)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Select business types:</strong> Laundromats, warehouses, apartments, etc.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 md:order-2">
                <h4 className="text-2xl font-bold text-gray-900">What We Do:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Our system scans your area:</strong> We search Google Maps, Yelp, and other sources
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Finds 100+ qualified leads:</strong> Businesses matching your criteria
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Extracts contact info:</strong> Emails, phone numbers, websites
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Ranks leads by quality:</strong> Best locations first based on foot traffic
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 text-white md:order-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Database className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 2: Intelligent Discovery</h3>
                    <p className="text-purple-100 text-lg">
                      Our system finds all the perfect locations for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 3: Automated Email Campaign</h3>
                    <p className="text-green-100 text-lg">
                      We send professional outreach to all your leads.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-gray-900">What Happens:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Personalized emails sent:</strong> Each business gets a custom message
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Professional tone:</strong> Highlighting why vending machines benefit them
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Your contact info included:</strong> So they can reach you back
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Duplicates prevented:</strong> Won't email businesses you've already contacted
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 md:order-2">
                <h4 className="text-2xl font-bold text-gray-900">What Gets Tracked:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Initial response rate:</strong> Who replies to the first email
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Email opens:</strong> Which businesses show interest
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Email history:</strong> All communication with each location
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Status tracking:</strong> Interested, not interested, or pending
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white md:order-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 4: Smart Follow-ups</h3>
                    <p className="text-orange-100 text-lg">
                      Automatic reminders to boost response rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 5: 48-Hour Auto Follow-up</h3>
                    <p className="text-indigo-100 text-lg">
                      We remind non-responders about your offer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-gray-900">How It Works:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>48 hours after initial email:</strong> Second email automatically sent
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Only to non-responders:</strong> Won't bug businesses that already replied
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Friendly reminder tone:</strong> Just checking in, not pushy
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Prevents duplicate emails:</strong> Tracks by email address
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 md:order-2">
                <h4 className="text-2xl font-bold text-gray-900">Your Dashboard Shows:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>All your leads:</strong> Complete list with info, rankings, and status
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Email tracking:</strong> Who opened, who replied, who's engaged
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Response history:</strong> Every message sent and received
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Real-time updates:</strong> See responses as they come in
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white md:order-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Step 6: Your Control Panel</h3>
                    <p className="text-cyan-100 text-lg">
                      Monitor everything in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSV & Database Info */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Your Data is Always Yours
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-600" />
                Automatic Cloud Sync
              </h3>
              <p className="text-gray-700 mb-4">
                Your leads and campaign data automatically sync to our secure database. No upload buttons, no manual exports needed.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Real-time synchronization
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Access from anywhere
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Secure encrypted storage
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  24/7 automatic backups
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                One-Click Execution
              </h3>
              <p className="text-gray-700 mb-4">
                Click the "Run Campaign" button and everything happens automatically. Your settings, your leads, your follow-ups.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  No coding required
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Uses your saved settings
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Prevents duplicate emails
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Live progress tracking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <FAQItem
            question="Will I be emailed multiple times by the same business?"
            answer="No. Our system tracks all emails sent and received. Businesses won't get duplicate emails unless it's been more than 7 days and we're sending an automated check-in follow-up."
          />
          <FAQItem
            question="What if I've already contacted some of these businesses?"
            answer="You can upload your existing email CSV file, and we'll automatically skip any businesses you've already reached out to."
          />
          <FAQItem
            question="Can I customize the email templates?"
            answer="Yes! On the settings page you can customize your email subject lines and message content. These changes apply to all future campaigns."
          />
          <FAQItem
            question="How long does it take to run a campaign?"
            answer="Depends on how many leads you have. Typically a 100-location campaign takes 2-3 minutes to execute and start sending emails."
          />
          <FAQItem
            question="What if I want to pause or cancel a campaign?"
            answer="You can stop a campaign at any time while it's running. Emails already sent will be tracked, but no new ones will be sent."
          />
          <FAQItem
            question="Do I get the lead data in a spreadsheet?"
            answer="Yes! All your leads are automatically stored in our database and can be downloaded as CSV anytime. No manual export needed."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 mt-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Vending Machine Location?
          </h3>
          <p className="text-xl text-indigo-100 mb-8">
            Start with 100+ qualified leads and watch the responses come in.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now <ArrowRight className="inline-block w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-indigo-400" />
                <h3 className="text-white font-bold text-lg">VendLocate Pro</h3>
              </div>
              <p className="text-sm">
                Helping vending machine operators find and secure premium locations since 2026.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-indigo-400 transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-indigo-400 transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <a
                href="mailto:qcvending01@gmail.com"
                className="text-sm hover:text-indigo-400 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                qcvending01@gmail.com
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>&copy; 2026 VendLocate Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

import { Mail } from 'lucide-react';
