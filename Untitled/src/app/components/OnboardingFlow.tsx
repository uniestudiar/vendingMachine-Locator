import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Mail, CheckCircle, ArrowRight, Edit, Sparkles, Loader2 } from 'lucide-react';
import { supabase, apiCall } from '../utils/supabase';

type OnboardingStep = 'phone' | 'template' | 'review' | 'generating';

const DEFAULT_EMAIL_TEMPLATE = `Subject: Premium Vending Machine Opportunity at {{BUSINESS_NAME}}

Hi there,

I hope this message finds you well! My name is {{YOUR_NAME}}, and I specialize in placing high-quality vending machines in businesses throughout the area.

I noticed {{BUSINESS_NAME}} and think it would be an excellent location for a vending machine. Here's why this could be great for you:

✓ No cost to you - I provide and maintain the equipment
✓ Additional revenue stream through commission
✓ Convenient amenity for your employees/customers
✓ Professional, modern machines with healthy options

I'd love to discuss how we can work together. Would you have 10 minutes this week for a quick call?

Best regards,
{{YOUR_NAME}}
{{YOUR_PHONE}}`;

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('phone');
  const [phone, setPhone] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user info
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || '');
          if (profile.phone) {
            setPhone(profile.phone);
          }
        }
      }
    };
    loadUserInfo();
  }, []);

  const handlePhoneSubmit = async () => {
    setError('');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save phone number
      await supabase
        .from('users')
        .update({ phone })
        .eq('id', user.id);

      setIsLoading(false);
      setCurrentStep('template');
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number');
      setIsLoading(false);
    }
  };

  const handleTemplateSubmit = () => {
    setCurrentStep('review');
  };

  const handleStartGeneration = async () => {
    setIsLoading(true);
    setCurrentStep('generating');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save email template
      await supabase
        .from('users')
        .update({
          phone,
          email_template: emailTemplate
        })
        .eq('id', user.id);

      // Trigger lead generation (this would call your Python scripts on the server)
      // await apiCall('/generate-leads', { method: 'POST' });

      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsLoading(false);
    }
  };

  // Phone Number Step
  if (currentStep === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Add Your Phone Number</h1>
              </div>
              <p className="text-gray-600">
                Your phone number will be included in emails to businesses so they can easily contact you.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter 10 digits (numbers only)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Why we need this:</strong> Including your contact information in outreach emails
                  increases response rates by 40% compared to generic messages.
                </p>
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading || phone.length < 10}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email Template Step
  if (currentStep === 'template') {
    const previewTemplate = emailTemplate
      .replace(/{{YOUR_NAME}}/g, userName || '[Your Name]')
      .replace(/{{YOUR_PHONE}}/g, phone ? `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}` : '[Your Phone]')
      .replace(/{{BUSINESS_NAME}}/g, 'Sample Business Name');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Customize Your Email</h1>
              </div>
              <p className="text-gray-600">
                This email will be sent to all discovered businesses. You can customize it or use our proven template.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Template
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Available merge fields:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">{'{{YOUR_NAME}}'}</code>
                    <code className="bg-white px-2 py-1 rounded text-xs">{'{{YOUR_PHONE}}'}</code>
                    <code className="bg-white px-2 py-1 rounded text-xs">{'{{BUSINESS_NAME}}'}</code>
                  </div>
                </div>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Preview
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-gray-800">
                    {previewTemplate}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('phone')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleTemplateSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Step
  if (currentStep === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Review & Launch</h1>
              </div>
              <p className="text-gray-600">
                Everything looks good! We're ready to start finding vending machine locations for you.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Contact Information</h3>
                    <p className="text-sm text-gray-600">Name: {userName}</p>
                    <p className="text-sm text-gray-600">Phone: ({phone.slice(0,3)}) {phone.slice(3,6)}-{phone.slice(6)}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('phone')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Template</h3>
                    <p className="text-sm text-gray-600">Custom template with your contact info</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('template')}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
              <h3 className="text-xl font-bold mb-3">What Happens Next:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>We'll search for qualifying businesses in your area</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Automatically send personalized emails with your contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Follow up with non-responders after 48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Track all responses in your dashboard</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('template')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStartGeneration}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Finding Locations
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generating Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Finding Your Locations...</h2>
        <p className="text-gray-600 mb-6">
          We're searching for the best vending machine locations in your area and preparing your outreach campaigns.
        </p>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">Analyzing target area</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="text-sm text-gray-700">Discovering businesses...</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-5 h-5" />
            <span className="text-sm text-gray-500">Preparing email campaigns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
