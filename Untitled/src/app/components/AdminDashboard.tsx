import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { apiCall, supabase } from '../utils/supabase';
import {
  MapPin,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Filter,
  Search,
  TrendingUp,
  ArrowLeft,
  Send,
  Settings,
  Plus,
  Trash2,
  CreditCard,
  Phone,
  KeyRound,
  Save,
  Loader2,
} from 'lucide-react';

interface Lead {
  id: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
  businessType: string;
  ranking: number;
  hasWebsite: boolean;
  websiteUrl?: string;
  emailSent: boolean;
  emailSentDate?: string;
  responded: boolean;
  responseDate?: string;
  followUpSent: boolean;
  followUpDate?: string;
  notes: string;
  estimatedFootTraffic: string;
  distanceFromClient: number;
}

interface BusinessType {
  id: string;
  name: string;
  requiredKeywords: string[];
  optionalKeywords: string[];
  enabled: boolean;
}

type TabType = 'dashboard' | 'filters' | 'noWebsites' | 'settings';

interface OutreachSettings {
  phone: string;
  outreachEmail: string;
  smtpAppPassword: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'responded' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'date' | 'name'>('ranking');
  const [hasPaid, setHasPaid] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<OutreachSettings>({
    phone: '',
    outreachEmail: '',
    smtpAppPassword: '',
  });
  const [settingsStatus, setSettingsStatus] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([
    {
      id: '1',
      name: 'Laundromat',
      requiredKeywords: ['laundry', 'laundromat'],
      optionalKeywords: ['wash', 'dry', 'clean'],
      enabled: true,
    },
    {
      id: '2',
      name: 'Auto Shops',
      requiredKeywords: ['car', 'auto'],
      optionalKeywords: ['repair', 'tire', 'service', 'mechanic'],
      enabled: true,
    },
    {
      id: '3',
      name: 'Apartments',
      requiredKeywords: ['apartment', 'apartments'],
      optionalKeywords: ['complex', 'housing', 'residential'],
      enabled: true,
    },
    {
      id: '4',
      name: 'Hotels',
      requiredKeywords: ['hotel', 'motel'],
      optionalKeywords: ['inn', 'lodge', 'resort'],
      enabled: true,
    },
    {
      id: '5',
      name: 'Senior Communities',
      requiredKeywords: ['senior', 'retirement'],
      optionalKeywords: ['assisted living', 'nursing home', 'care'],
      enabled: true,
    },
    {
      id: '6',
      name: 'Hospitals',
      requiredKeywords: ['hospital', 'medical center'],
      optionalKeywords: ['health', 'clinic'],
      enabled: true,
    },
    {
      id: '7',
      name: 'Urgent Cares',
      requiredKeywords: ['urgent care'],
      optionalKeywords: ['walk-in', 'immediate care'],
      enabled: true,
    },
    {
      id: '8',
      name: 'Pet Hospitals',
      requiredKeywords: ['veterinary', 'vet', 'animal hospital'],
      optionalKeywords: ['pet clinic', 'animal care'],
      enabled: true,
    },
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      const currentUser = localStorage.getItem('vendlocate_current_user');
      const user = supabaseUser || (currentUser ? JSON.parse(currentUser) : null);
      setIsAuthenticated(!!user);

      if (user?.email) {
        setSettings((current) => ({ ...current, outreachEmail: user.email }));
      }

      const purchases = JSON.parse(localStorage.getItem('vendlocate_purchases') || '[]');
      const localPurchase = user ? purchases.find((p: any) => p.userId === user.id) : null;

      try {
        const response = await apiCall('/purchases');
        setHasPaid(!!localPurchase || (response.purchases || []).length > 0);
      } catch {
        setHasPaid(!!localPurchase);
      }

      const savedSettings = localStorage.getItem('vendlocate_outreach_settings');
      if (savedSettings) {
        setSettings((current) => ({ ...current, ...JSON.parse(savedSettings) }));
      }

      try {
        const response = await apiCall('/outreach-settings');
        if (response.settings) {
          setSettings((current) => ({
            ...current,
            phone: response.settings.phone || current.phone,
            outreachEmail: response.settings.outreachEmail || current.outreachEmail,
            smtpAppPassword: response.settings.smtpAppPassword || current.smtpAppPassword,
          }));
        }
      } catch {
        // Visitors can still preview the dashboard without signing in.
      }

      try {
        const response = await apiCall('/leads');
        const realLeads: Lead[] = (response.leads || []).map((lead: any) => ({
          id: lead.id,
          businessName: lead.business_name || 'Unknown Business',
          address: lead.address || '',
          city: lead.city || '',
          state: lead.state || '',
          zipCode: lead.zip_code || '',
          email: lead.email || 'Not found yet',
          phone: lead.phone || 'Not found yet',
          businessType: lead.business_type || 'General',
          ranking: lead.ranking || lead.profit_score || 0,
          hasWebsite: !!lead.has_website,
          websiteUrl: lead.website || undefined,
          emailSent: !!lead.email_sent,
          emailSentDate: lead.email_sent_date || undefined,
          responded: !!lead.responded,
          responseDate: lead.response_date || undefined,
          followUpSent: !!lead.follow_up_sent,
          followUpDate: lead.follow_up_date || undefined,
          notes: lead.notes || '',
          estimatedFootTraffic: lead.estimated_foot_traffic || 'Calculated during scan',
          distanceFromClient: Number(lead.distance_from_client || 0),
        }));
        setLeads(realLeads);
        setFilteredLeads(realLeads);
      } catch {
        setLeads([]);
        setFilteredLeads([]);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    let filtered = [...leads];

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'responded') {
      filtered = filtered.filter((lead) => lead.responded);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((lead) => !lead.responded);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'ranking') return b.ranking - a.ranking;
      if (sortBy === 'date') {
        const dateA = new Date(a.emailSentDate || 0).getTime();
        const dateB = new Date(b.emailSentDate || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'name') return a.businessName.localeCompare(b.businessName);
      return 0;
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, filterStatus, sortBy]);

  const stats = {
    total: leads.length,
    emailsSent: leads.filter((l) => l.emailSent).length,
    responded: leads.filter((l) => l.responded).length,
    pending: leads.filter((l) => !l.responded).length,
  };

  const noWebsiteLeads = leads.filter((l) => !l.hasWebsite);

  const addBusinessType = () => {
    const newType: BusinessType = {
      id: Date.now().toString(),
      name: 'New Business Type',
      requiredKeywords: [],
      optionalKeywords: [],
      enabled: true,
    };
    setBusinessTypes([...businessTypes, newType]);
  };

  const updateBusinessType = (id: string, updates: Partial<BusinessType>) => {
    setBusinessTypes(businessTypes.map((bt) => (bt.id === id ? { ...bt, ...updates } : bt)));
  };

  const deleteBusinessType = (id: string) => {
    setBusinessTypes(businessTypes.filter((bt) => bt.id !== id));
  };

  const saveOutreachSettings = async () => {
    setSettingsStatus('');
    setIsSavingSettings(true);

    try {
      localStorage.setItem('vendlocate_outreach_settings', JSON.stringify(settings));
      await apiCall('/outreach-settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      setSettingsStatus('Settings saved to Supabase.');
    } catch {
      setSettingsStatus('Saved locally. Log in to sync these settings to Supabase.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage and track your vending location leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('filters')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentTab === 'filters'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Business Filters
            </button>
            <button
              onClick={() => setCurrentTab('noWebsites')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentTab === 'noWebsites'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              No Websites ({noWebsiteLeads.length})
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Database
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <>
            {!hasPaid && (
              <div className="bg-white rounded-lg shadow-sm border border-indigo-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Preview the lead engine before you buy</h2>
                    <p className="text-gray-600 mt-1">
                      Buy a search package, enter your location once, and the database will fill automatically after
                      the lead program runs.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(isAuthenticated ? '/pricing' : '/register')}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Unlock Your Area
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Leads"
                value={stats.total}
                icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="Emails Sent"
                value={stats.emailsSent}
                icon={<Send className="w-8 h-8 text-indigo-600" />}
                color="indigo"
              />
              <StatCard
                title="Responded"
                value={stats.responded}
                icon={<CheckCircle className="w-8 h-8 text-green-600" />}
                color="green"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={<Clock className="w-8 h-8 text-yellow-600" />}
                color="yellow"
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search businesses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">All Leads</option>
                      <option value="responded">Responded</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="ranking">Ranking (High to Low)</option>
                    <option value="date">Date Contacted</option>
                    <option value="name">Business Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ranking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Follow-up
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{lead.businessName}</div>
                            <div className="text-sm text-gray-500">{lead.businessType}</div>
                            <div className="text-sm text-gray-500">
                              {lead.city}, {lead.state} • {lead.distanceFromClient} mi
                            </div>
                            {!lead.hasWebsite && (
                              <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
                                <Globe className="w-3 h-3" />
                                No website
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{lead.ranking}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{lead.estimatedFootTraffic}</div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.responded ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4" />
                              Responded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {lead.emailSent && (
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Mail className="w-4 h-4" />
                                {lead.emailSentDate && new Date(lead.emailSentDate).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">{lead.email}</div>
                            <div className="text-xs text-gray-500">{lead.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.followUpSent ? (
                            <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                              <AlertCircle className="w-4 h-4" />
                              Sent {lead.followUpDate && new Date(lead.followUpDate).toLocaleDateString()}
                            </span>
                          ) : lead.emailSent && !lead.responded ? (
                            <span className="text-sm text-gray-500">Scheduled</span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">{lead.notes}</div>
                          {lead.hasWebsite && lead.websiteUrl && (
                            <a
                              href={lead.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                            >
                              <Globe className="w-3 h-3" />
                              Visit website
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredLeads.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No live leads yet</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Once your purchase is complete and the Python discovery program runs, qualified businesses from
                  Supabase will appear here with rankings, contact details, outreach status, and follow-up history.
                </p>
              </div>
            )}
          </>
        )}

        {/* Business Filters Tab */}
        {currentTab === 'filters' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Business Type Filters</h2>
                  <p className="text-gray-600 mt-1">
                    Customize which types of businesses we search for when finding vending machine locations
                  </p>
                </div>
                <button
                  onClick={addBusinessType}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Business Type
                </button>
              </div>

              <div className="space-y-4">
                {businessTypes.map((bt) => (
                  <div key={bt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={bt.name}
                          onChange={(e) => updateBusinessType(bt.id, { name: e.target.value })}
                          className="text-lg font-semibold text-gray-900 border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-0 py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bt.enabled}
                            onChange={(e) => updateBusinessType(bt.id, { enabled: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                        <button
                          onClick={() => deleteBusinessType(bt.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Keywords *
                        </label>
                        <input
                          type="text"
                          value={bt.requiredKeywords.join(', ')}
                          onChange={(e) =>
                            updateBusinessType(bt.id, {
                              requiredKeywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                            })
                          }
                          placeholder="e.g., car, auto"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Business must contain at least one of these keywords
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Optional Keywords
                        </label>
                        <input
                          type="text"
                          value={bt.optionalKeywords.join(', ')}
                          onChange={(e) =>
                            updateBusinessType(bt.id, {
                              optionalKeywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                            })
                          }
                          placeholder="e.g., repair, tire, service"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Helps refine search but not required
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Websites Tab */}
        {currentTab === 'noWebsites' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Why No-Website Businesses Are Gold Mines</h2>
                  <p className="text-purple-100 mb-4 text-lg">
                    These locations are hidden gems that most vending operators overlook. Here's why they're valuable:
                  </p>
                  <ul className="space-y-2 text-purple-100">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Less Competition:</strong> Without an online presence, these businesses are harder to find. Your competitors likely haven't contacted them yet.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">In-Person Advantage:</strong> Visit them directly. Face-to-face conversations build trust faster than cold emails ever could.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Decision Makers On-Site:</strong> Small businesses without websites often have owners working on-location. You can pitch directly to the person who says yes.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Proven High Foot Traffic:</strong> Many of these locations still rank highly because they have excellent foot traffic and accessibility.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* No Website Leads Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  No-Website Locations ({noWebsiteLeads.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Perfect candidates for in-person visits
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ranking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {noWebsiteLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{lead.businessName}</div>
                            <div className="text-sm text-gray-500">{lead.businessType}</div>
                            <div className="text-sm text-gray-500">
                              {lead.address}, {lead.city}, {lead.state} {lead.zipCode}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{lead.ranking}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{lead.estimatedFootTraffic}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-600">{lead.email}</div>
                            <div className="text-gray-600">{lead.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.distanceFromClient} miles
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{lead.notes}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {noWebsiteLeads.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {leads.length === 0
                    ? 'No live leads yet. No-website opportunities will appear here after the first scan runs.'
                    : 'All businesses in your current database have websites.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Database Tab */}
        {currentTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Outreach Settings</h2>
              <p className="text-gray-600 mb-6">
                Save the contact details used by the outreach engine. Leads and sent-email history sync to Supabase
                automatically when the discovery program runs.
              </p>

              {settingsStatus && (
                <div className="mb-6 bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg">
                  {settingsStatus}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sending Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={settings.outreachEmail}
                      onChange={(e) => setSettings({ ...settings, outreachEmail: e.target.value })}
                      placeholder="you@gmail.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gmail App Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={settings.smtpAppPassword}
                      onChange={(e) => setSettings({ ...settings, smtpAppPassword: e.target.value })}
                      placeholder="16-character app password"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium mb-2">How to get a Gmail app password</p>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Turn on 2-Step Verification in your Google Account.</li>
                  <li>Go to Google Account, Security, App passwords.</li>
                  <li>Create an app password for Mail, then paste the 16-character code here.</li>
                </ol>
              </div>

              <button
                onClick={saveOutreachSettings}
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Settings
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Automatic Database Sync</h2>
              <p className="text-gray-600 mb-6">
                There is nothing for the user to upload or export. The Python program writes the lead database and
                sent-email database into Supabase during the run.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Lead rows</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Example: name, address, website, phone, email, business type, distance, and profit score.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Outreach history</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Example: each sent email is stored once so the system will not contact the same place twice.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Run status</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Example: when the scan finishes, the dashboard updates from empty to ranked live results.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-indigo-900">
                  Before the first run, this page is intentionally empty of fake businesses. After the run, it will
                  show real businesses found inside the purchased search radius.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
