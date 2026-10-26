import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Compass, 
  Layers, 
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loginWithOAuth, loginAsGuest } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    try {
      setLoading(true);
      await signup(name, email, password, company);
      // Explicit requirement: Navigate to the landing page after sign up!
      navigate('/?welcome=true');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      await loginWithOAuth(provider);
      navigate('/?welcome=true');
    } catch (err) {
      setError(`Failed to sign up with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/?welcome=true');
  };

  return (
    <div className="min-h-screen bg-[#071317] text-white font-outfit flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Starlight & Ambient Teal Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#0e6670]/25 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#178996]/20 rounded-full blur-[150px]" />
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* Top Header / Back to Landing Navigation */}
      <header className="relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#1b343b]/60 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo size="md" variant="full" />
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-mono font-medium text-[#8da3a8] hover:text-white px-3.5 py-1.5 rounded-full border border-[#1e3c45] hover:border-[#38bdf8]/50 bg-[#0c242c]/60 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* Main Split Grid Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-[#0a1a20]/90 border border-[#1b3b45] rounded-[32px] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* LEFT: Sign Up Form Section (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e3b47] border border-[#1b505f] text-[11px] font-mono text-[#38bdf8] mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Create Your Free Founder Workspace</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Turn complaints into <span className="text-[#38bdf8]">proven software.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8da3a8] mt-1.5 leading-relaxed">
                Join founders who use GreatScout to discover unbuilt customer gaps from Reddit and Product Hunt.
              </p>

              {/* Error message banner */}
              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Social 1-Click Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#1e3c45] bg-[#0c242c] hover:bg-[#133742] hover:border-[#38bdf8]/40 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#1e3c45] bg-[#0c242c] hover:bg-[#133742] hover:border-[#38bdf8]/40 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1b343b]" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider text-[#55696e]">
                  <span className="bg-[#0a1a20] px-3">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#8da3a8] uppercase font-semibold mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#1e3c45] bg-[#07161b] text-white placeholder-[#55696e] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8da3a8] uppercase font-semibold mb-1">
                    Work or Personal Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#1e3c45] bg-[#07161b] text-white placeholder-[#55696e] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#8da3a8] uppercase font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 pr-9 rounded-xl border border-[#1e3c45] bg-[#07161b] text-white placeholder-[#55696e] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#55696e] hover:text-[#8da3a8]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#8da3a8] uppercase font-semibold mb-1">
                      Project or Studio Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Labs"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#1e3c45] bg-[#07161b] text-white placeholder-[#55696e] focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                    />
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1e3c45] bg-[#07161b] text-[#0e6670] focus:ring-[#0e6670] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-[#8da3a8] cursor-pointer">
                    I agree to GreatScout's <span className="text-[#38bdf8] hover:underline">Terms</span> and <span className="text-[#38bdf8] hover:underline">Privacy Policy</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0e6670] via-[#178996] to-[#38bdf8] text-[#071317] hover:brightness-110 shadow-lg shadow-[#0e6670]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Creating Workspace...' : 'Create Account & Explore'}</span>
                  <ArrowRight className="w-4 h-4 text-[#071317]" />
                </button>
              </form>
            </div>

            {/* Bottom Links: Sign In & Guest Demo */}
            <div className="pt-6 mt-6 border-t border-[#1b343b]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#8da3a8]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#38bdf8] hover:underline font-semibold">
                  Sign In here
                </Link>
              </span>

              <button
                type="button"
                onClick={handleGuest}
                className="text-[#8da3a8] hover:text-white font-mono text-[11px] hover:underline flex items-center gap-1"
              >
                <span>Continue as Guest Demo</span>
                <ArrowRight className="w-3 h-3 text-[#38bdf8]" />
              </button>
            </div>
          </div>

          {/* RIGHT: Visual Benefit Teaser Panel (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0c242c] via-[#091b20] to-[#071519] p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-[#1b3b45] flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Nebula glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#0c2e38] px-2.5 py-1 rounded-full border border-[#1b4b59]">
                  What You Get
                </span>
                <h3 className="text-xl font-extrabold text-white mt-3 leading-snug">
                  Everything you need to validate your next software venture.
                </h3>
              </div>

              {/* Feature Points */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0e3b47] border border-[#1b505f] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Visual Galaxy Market Map</h4>
                    <p className="text-[#8da3a8] mt-0.5 leading-relaxed">
                      Explore clusters of high-demand and high-frustration problems in a 2D topological cosmos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0e3b47] border border-[#1b505f] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">1-Click PRD & Linear Blueprints</h4>
                    <p className="text-[#8da3a8] mt-0.5 leading-relaxed">
                      Instant complete tech stack recommendations, architecture schemas, and agile task boards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0e3b47] border border-[#1b505f] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">AI Evidence Copilot</h4>
                    <p className="text-[#8da3a8] mt-0.5 leading-relaxed">
                      Chat directly with an AI trained on verbatim customer quotes to stress-test your value proposition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Social Proof Badge */}
            <div className="relative z-10 pt-6 mt-6 border-t border-[#1b3b45]/70">
              <div className="p-3.5 rounded-2xl bg-[#07191e]/80 border border-[#173842] flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                  <span className="text-[#8da3a8]">Scraping engine:</span>
                </div>
                <span className="text-[#38bdf8] font-bold">17+ Live Signals Synced</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 px-6 sm:px-12 text-center text-xs text-[#55696e] border-t border-[#1b343b]/40">
        <span>© 2026 GreatScout Intelligence Inc. • Scout Smart, Build Better.</span>
      </footer>
    </div>
  );
};
