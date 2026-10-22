import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ParticleCanvas } from '../components/landing/ParticleCanvas';
import { CustomCursor } from '../components/landing/CustomCursor';
import { ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

export const AxiomLandingPage: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('--:--:-- UTC');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState({
    state: 'SCANNING',
    channel: 'PRODUCT HUNT + REDDIT',
    drift: '0.001%',
    clustersFound: '14 ACTIVE',
  });

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${mins}:${secs} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const driftValues = ['0.001%', '0.002%', '<0.001%', '0.003%'];
    const interval = setInterval(() => {
      const randomDrift = driftValues[Math.floor(Math.random() * driftValues.length)];
      setActiveTelemetry((prev) => ({ ...prev, drift: randomDrift }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const existing = JSON.parse(localStorage.getItem('greatscout_waitlist') || '[]');
      existing.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('greatscout_waitlist', JSON.stringify(existing));
    } catch {
      // fallback
    }

    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <div className="bg-[#0c0c0d] text-white min-h-screen selection:bg-[#DA840A] selection:text-black font-sans relative overflow-x-hidden">
      {/* Custom Amber Cursor */}
      <CustomCursor />

      {/* Reactive Force-Field Canvas */}
      <ParticleCanvas />

      {/* TOP TELEMETRY & NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0c0c0d]/80 backdrop-blur-md border-b border-white/[0.08] px-[40px] max-sm:px-[20px] py-[20px] transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo & State */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DA840A] animate-pulse shadow-[0_0_10px_#DA840A]" />
              <div className="flex flex-col">
                <span className="font-display font-medium text-[22px] tracking-tight uppercase text-white group-hover:text-white/90">
                  GreatScout
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#DA840A] uppercase font-bold">
                  SCOUT SMART, BUILD BETTER
                </span>
              </div>
            </Link>
          </div>

          {/* Center UTC Clock */}
          <div className="hidden md:flex items-center font-mono text-[12px] tracking-[-0.36px] uppercase text-white/80">
            <span className="text-[#DA840A] mr-2">●</span>
            <span>SYSTEM CLOCK: {timeString}</span>
          </div>

          {/* Right Telemetry & Links */}
          <div className="flex items-center gap-8 max-md:gap-4 shrink-0">
            <div className="hidden lg:flex flex-col font-mono text-[11px] leading-[1.3] uppercase text-white/60 text-right">
              <p>
                <span className="opacity-50">GS-FIELD / STATE: </span>
                <span className="text-white">{activeTelemetry.state}</span>
              </p>
              <p>
                <span className="opacity-50">CHANNELS: </span>
                <span className="text-white">{activeTelemetry.channel}</span>
              </p>
            </div>

            <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6 font-mono text-[12px] leading-none uppercase text-white/70">
              <a href="#archive" className="hover:text-white transition-colors duration-200">
                Opportunities
              </a>
              <a href="#conditions" className="hover:text-white transition-colors duration-200">
                Conditions
              </a>
              <a href="#manifesto" className="hover:text-white transition-colors duration-200">
                Manifesto
              </a>
            </nav>

            {/* Launch Console Direct CTA */}
            <Link
              to="/app"
              className="inline-flex items-center gap-2 h-[34px] px-[16px] rounded-full bg-[#DA840A] hover:bg-[#DA840A]/90 text-black font-mono font-bold text-[11px] uppercase tracking-wider transition-all duration-200 shadow-[0_0_16px_rgba(218,132,10,0.4)] hover:shadow-[0_0_24px_rgba(218,132,10,0.6)]"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-[80px]">
        {/* 1. HERO SECTION */}
        <section className="relative min-h-[860px] max-lg:min-h-[720px] max-sm:min-h-[640px] w-full flex flex-col justify-between px-[40px] max-sm:px-[20px] pt-[70px] pb-[60px] max-w-[1440px] mx-auto">
          {/* Top spacer */}
          <div className="h-[20px]" />

          {/* Main Hero Typography & Scroll cue */}
          <div className="flex items-end justify-between w-full max-md:flex-col max-md:items-start gap-12">
            {/* Left Scroll Indicator */}
            <div className="flex gap-3 items-center shrink-0 max-md:hidden ax-fade">
              <div className="w-[1px] h-[36px] bg-gradient-to-b from-[#DA840A] to-transparent" />
              <p className="font-mono text-[11px] tracking-widest uppercase text-white/60 leading-[1.3]">
                Scroll down <br />
                to observe signals
              </p>
            </div>

            {/* Right Giant Title and Subtitle */}
            <div className="flex flex-col gap-[36px] items-end max-md:items-start text-right max-md:text-left shrink-0 max-w-[850px]">
              <div className="w-full">
                <span className="font-mono text-[13px] uppercase tracking-[0.25em] text-[#DA840A] block mb-3 font-semibold">
                  Evidence-First Opportunity Discovery
                </span>
                <h1 className="font-display font-medium text-[130px] max-lg:text-[96px] max-sm:text-[54px] leading-[0.82] tracking-[-0.04em] text-white">
                  GreatScout <br />
                  <span className="text-white/40">Intelligence</span>
                </h1>
              </div>
              <p className="font-mono text-[15px] max-sm:text-[13px] leading-[1.4] uppercase text-white/80 max-w-[480px]">
                Autonomous intelligence platform observing software friction as a recurring physical phenomenon across Product Hunt and Reddit.
              </p>

              {/* Action Pill Group */}
              <div className="flex items-center gap-4 pt-2">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 h-[42px] px-[24px] rounded-full bg-[#DA840A] hover:bg-[#c47407] text-black font-mono font-bold text-[12px] uppercase tracking-wider transition-all duration-200"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Explore Intelligence DB</span>
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 h-[42px] px-[20px] rounded-full border border-white/20 hover:border-white/50 text-white font-mono text-[12px] uppercase tracking-wider transition-all duration-200 bg-white/[0.03]"
                >
                  <span>Methodology</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATEMENT SECTION */}
        <section id="statement" className="relative min-h-[640px] max-sm:min-h-[480px] w-full flex items-center justify-end px-[40px] max-sm:px-[20px] py-[100px] border-t border-white/[0.08] max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-[36px] items-start w-[760px] max-lg:w-[580px] max-sm:w-full">
            <span className="font-mono text-[12px] leading-none uppercase tracking-[0.2em] text-[#DA840A]">
              01 // CORE THESIS
            </span>
            <div className="font-display text-[46px] max-lg:text-[38px] max-sm:text-[28px] leading-[1.05] tracking-[-0.03em] text-white">
              <h2 className="mb-6 font-medium">
                We stopped designing interfaces that guess.
              </h2>
              <p className="text-white/60">
                We started creating systems that observe genuine market pain.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ABOUT / PHILOSOPHY SECTION */}
        <section id="about" className="relative min-h-[700px] w-full flex flex-col justify-center px-[40px] max-sm:px-[20px] py-[100px] border-t border-white/[0.08] max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-[48px] max-w-[900px]">
            <div className="font-display text-[48px] max-lg:text-[38px] max-sm:text-[30px] leading-[1.05] tracking-[-0.03em] text-white">
              <h2 className="font-medium text-white mb-2">We do not brainstorm startup ideas.</h2>
              <p className="text-[#DA840A]">We observe recurring market friction.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="font-mono text-[13px] leading-[1.5] uppercase text-white/70 space-y-4">
                <p>
                  GreatScout is an automated market intelligence system dedicated to studying software friction as structural forces, trajectories, and persistence states.
                </p>
                <p>
                  Free from founder bias and pitch-deck fiction, we focus on what precedes product application: the empirical structure of user frustration itself.
                </p>
              </div>

              <div className="border-l border-white/20 pl-8 max-sm:pl-4">
                <ul className="font-mono text-[12px] leading-[1.8] uppercase text-white/90 space-y-2 list-none">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA840A]" />
                    <span>We do not invent artificial problems</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA840A]" />
                    <span>We do not optimize vanity metrics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA840A]" />
                    <span>We observe unprompted user rants</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA840A]" />
                    <span>We map semantic signal clusters</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DA840A]" />
                    <span>We score 7-pillar commercial viability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. EMPIRICAL ARCHIVE SECTION (Axiom Research Light Cards) */}
        <section id="archive" className="relative py-[100px] border-t border-white/[0.08] px-[40px] max-sm:px-[20px] max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-8 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#DA840A] block mb-2">
                  02 // EMPIRICAL ARCHIVE
                </span>
                <h2 className="font-display font-medium text-[44px] max-sm:text-[32px] text-white tracking-tight">
                  Verified Problem Trajectories
                </h2>
              </div>
              <span className="font-mono text-[12px] uppercase text-white/50 hidden sm:block">
                3 CLUSTERS DOCUMENTED
              </span>
            </div>
            <p className="font-mono text-[13px] uppercase text-white/60 max-w-[620px]">
              Actual recurring user friction detected across developer and operator communities, normalized without altering original user quotes.
            </p>
          </div>

          {/* Cards Grid — Light background paper cards matching Axiom #f2f2f2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#f2f2f2] text-[#0c0c0d] p-[24px] max-sm:p-[16px] flex flex-col justify-between rounded-[4px] shadow-2xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex flex-col gap-6">
                {/* Visual Header */}
                <div className="w-full aspect-[393/220] bg-[#0c0c0d] p-4 flex flex-col justify-between relative overflow-hidden rounded-[2px]">
                  <div className="flex justify-between items-center text-white font-mono text-[11px] uppercase">
                    <span className="text-[#DA840A]">FINTECH / BILLING</span>
                    <span className="text-white/60">OBS-01</span>
                  </div>
                  {/* Abstract force SVG */}
                  <div className="flex items-center justify-center py-6">
                    <svg viewBox="0 0 100 60" className="w-3/4 h-auto stroke-[#DA840A] fill-none" strokeWidth="1.5">
                      <path d="M10,30 Q25,5 50,30 T90,30" opacity="0.4" />
                      <path d="M10,30 Q35,55 50,30 T90,30" opacity="0.8" />
                      <circle cx="50" cy="30" r="4" fill="#DA840A" />
                      <circle cx="25" cy="18" r="2" fill="white" />
                      <circle cx="75" cy="42" r="2" fill="white" />
                    </svg>
                  </div>
                  <div className="text-white/40 font-mono text-[10px] uppercase">
                    HASH: 8f9b...3c12 // 18 SIGNALS
                  </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-medium text-[28px] max-sm:text-[24px] leading-[1.1] tracking-tight">
                    Attractor Formation in Stripe & Wire Reconciliation
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-85 space-y-2">
                    <p>
                      Bootstrapped SaaS founders lose 10+ hours monthly manually reconciling bank wire transfers and ACH payments with Stripe Billing subscriptions.
                    </p>
                    <p className="opacity-70">
                      Repeated friction rarely resolves with generic software. Instead, operations orbit persistent manual spreadsheets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-8 pt-4 border-t border-[rgba(12,12,13,0.15)] flex items-center justify-between font-mono text-[11px] uppercase">
                <span className="font-bold text-[#DA840A]">URGENCY: 88%</span>
                <span className="opacity-60">CONFIDENCE: 92%</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f2f2f2] text-[#0c0c0d] p-[24px] max-sm:p-[16px] flex flex-col justify-between rounded-[4px] shadow-2xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex flex-col gap-6">
                {/* Visual Header */}
                <div className="w-full aspect-[393/220] bg-[#0c0c0d] p-4 flex flex-col justify-between relative overflow-hidden rounded-[2px]">
                  <div className="flex justify-between items-center text-white font-mono text-[11px] uppercase">
                    <span className="text-[#DA840A]">ECOMMERCE / SYNC</span>
                    <span className="text-white/60">OBS-02</span>
                  </div>
                  {/* Abstract force SVG */}
                  <div className="flex items-center justify-center py-6">
                    <svg viewBox="0 0 100 60" className="w-3/4 h-auto stroke-[#DA840A] fill-none" strokeWidth="1.5">
                      <line x1="10" y1="15" x2="90" y2="15" strokeDasharray="3 3" opacity="0.3" />
                      <line x1="10" y1="45" x2="90" y2="45" strokeDasharray="3 3" opacity="0.3" />
                      <path d="M20,15 L50,45 L80,15" stroke="#DA840A" />
                      <circle cx="50" cy="45" r="4" fill="#DA840A" />
                    </svg>
                  </div>
                  <div className="text-white/40 font-mono text-[10px] uppercase">
                    HASH: 4e2a...98df // 42 SIGNALS
                  </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-medium text-[28px] max-sm:text-[24px] leading-[1.1] tracking-tight">
                    Field Coherence in Multi-Channel Inventory Lag
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-85 space-y-2">
                    <p>
                      Under flash sales and promotion surges, distributed marketplaces desynchronize without real-time coordination between Shopify and Amazon FBM.
                    </p>
                    <p className="opacity-70">
                      Coherence emerges not as theory, but as 42 distinct merchant complaints in 14 days citing catastrophic overselling penalties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-8 pt-4 border-t border-[rgba(12,12,13,0.15)] flex items-center justify-between font-mono text-[11px] uppercase">
                <span className="font-bold text-[#DA840A]">INTENT: 92%</span>
                <span className="opacity-60">SCORE: 73.2/100</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f2f2f2] text-[#0c0c0d] p-[24px] max-sm:p-[16px] flex flex-col justify-between rounded-[4px] shadow-2xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex flex-col gap-6">
                {/* Visual Header */}
                <div className="w-full aspect-[393/220] bg-[#0c0c0d] p-4 flex flex-col justify-between relative overflow-hidden rounded-[2px]">
                  <div className="flex justify-between items-center text-white font-mono text-[11px] uppercase">
                    <span className="text-[#DA840A]">DEV TOOLS / SRE</span>
                    <span className="text-white/60">OBS-03</span>
                  </div>
                  {/* Abstract force SVG */}
                  <div className="flex items-center justify-center py-6">
                    <svg viewBox="0 0 100 60" className="w-3/4 h-auto stroke-[#DA840A] fill-none" strokeWidth="1.5">
                      <path d="M10,30 L40,30 L70,10 M40,30 L70,50" />
                      <circle cx="70" cy="10" r="3" fill="#DA840A" />
                      <circle cx="70" cy="50" r="3" fill="white" />
                      <circle cx="40" cy="30" r="4" fill="#DA840A" />
                    </svg>
                  </div>
                  <div className="text-white/40 font-mono text-[10px] uppercase">
                    HASH: 7a11...bb04 // 27 SIGNALS
                  </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-medium text-[28px] max-sm:text-[24px] leading-[1.1] tracking-tight">
                    Bifurcation Points in Observability Sprawl
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-85 space-y-2">
                    <p>
                      At specific microservice density, alerting latency produces sudden irreversible developer cognitive fatigue across hybrid cloud environments.
                    </p>
                    <p className="opacity-70">
                      Engineers transition from monitoring to survival, signaling immediate commercial purchasing readiness for focused tools.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-8 pt-4 border-t border-[rgba(12,12,13,0.15)] flex items-center justify-between font-mono text-[11px] uppercase">
                <span className="font-bold text-[#DA840A]">VACUUM: 91%</span>
                <span className="opacity-60">SCORE: 81.4/100</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONDITIONS SECTION (Axiom Research 3-Column Paper Layout) */}
        <section id="conditions" className="bg-[#f2f2f2] text-[#0c0c0d] relative z-20 pt-[100px] pb-[140px] px-[40px] max-sm:px-[20px]">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-[90px]">
            {/* Top Headline Banner */}
            <div className="flex gap-[60px] items-baseline max-md:flex-col max-md:gap-[24px]">
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#DA840A] block mb-2 font-bold">
                  03 // CONDITIONS FOR VIABILITY
                </span>
                <p className="font-mono text-[14px] leading-tight uppercase opacity-60">
                  SCIENTIFIC VIABILITY THRESHOLDS
                </p>
              </div>
              <div className="w-[740px] max-lg:w-[520px] max-md:w-full font-display text-[38px] max-lg:text-[30px] max-sm:text-[24px] leading-[1.1] tracking-[-0.03em]">
                <h2 className="mb-4">
                  The emergence of viable software opportunities is conditioned by structural market friction.
                </h2>
                <p className="text-black/60 text-[24px] max-sm:text-[18px]">
                  Small variations in signal density, pain latency, and threshold states produce irreversible commercial divergence.
                </p>
              </div>
            </div>

            {/* 3 Columns with thin border dividers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[rgba(12,12,13,0.2)]">
              {/* Column 1 */}
              <div className="pt-8 pr-8 border-r max-md:border-r-0 max-md:border-b border-[rgba(12,12,13,0.2)] flex flex-col justify-between min-h-[340px]">
                <div>
                  <div className="flex justify-between font-mono text-[11px] uppercase opacity-70 mb-6">
                    <span>CONDITION 01</span>
                    <span>FREQUENCY</span>
                  </div>
                  <h3 className="font-display text-[44px] max-lg:text-[34px] leading-none tracking-tight mb-4">
                    Signal <br />Density
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-80 space-y-3">
                    <p>
                      Increasing complaint volume across uncoordinated sources alters the persistence of market demand.
                    </p>
                    <p className="opacity-60">
                      Coherence becomes commercially actionable only beyond a critical cross-channel concentration.
                    </p>
                  </div>
                </div>
                <div className="pt-6 font-mono text-[11px] uppercase font-bold text-[#DA840A]">
                  PILLAR: VOLUME & COHERENCE
                </div>
              </div>

              {/* Column 2 */}
              <div className="pt-8 px-8 max-md:px-0 max-md:border-b border-r max-md:border-r-0 border-[rgba(12,12,13,0.2)] flex flex-col justify-between min-h-[340px]">
                <div>
                  <div className="flex justify-between font-mono text-[11px] uppercase opacity-70 mb-6">
                    <span>CONDITION 02</span>
                    <span>TIME LOSS</span>
                  </div>
                  <h3 className="font-display text-[44px] max-lg:text-[34px] leading-none tracking-tight mb-4">
                    Pain <br />Latency
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-80 space-y-3">
                    <p>
                      Delayed resolution in operational workflows creates cumulative cognitive and financial hemorrhaging.
                    </p>
                    <p className="opacity-60">
                      Temporal offset in solving the issue reshapes customer willingness to adopt targeted point solutions.
                    </p>
                  </div>
                </div>
                <div className="pt-6 font-mono text-[11px] uppercase font-bold text-[#DA840A]">
                  PILLAR: URGENCY & INTENSITY
                </div>
              </div>

              {/* Column 3 */}
              <div className="pt-8 pl-8 max-md:pl-0 flex flex-col justify-between min-h-[340px]">
                <div>
                  <div className="flex justify-between font-mono text-[11px] uppercase opacity-70 mb-6">
                    <span>CONDITION 03</span>
                    <span>CONVERSION</span>
                  </div>
                  <h3 className="font-display text-[44px] max-lg:text-[34px] leading-none tracking-tight mb-4">
                    Critical <br />Threshold
                  </h3>
                  <div className="font-mono text-[12px] leading-[1.4] uppercase opacity-80 space-y-3">
                    <p>
                      Near critical thresholds, minimal variation in product execution reorganizes the market structure.
                    </p>
                    <p className="opacity-60">
                      User inertia collapses into immediate procurement when competitive vacuums align with acute pain.
                    </p>
                  </div>
                </div>
                <div className="pt-6 font-mono text-[11px] uppercase font-bold text-[#DA840A]">
                  PILLAR: WILLINGNESS TO PAY
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MANIFESTO SECTION */}
        <section id="manifesto" className="border-b border-white/[0.12] px-[40px] max-sm:px-[20px] py-[140px] max-md:py-[80px] max-w-[1440px] mx-auto">
          <div className="font-display text-[44px] max-lg:text-[34px] max-sm:text-[26px] leading-[1.1] tracking-[-0.03em] text-white max-w-[900px]">
            <div className="mb-6">
              <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#DA840A] block mb-4">
                04 // MANIFESTO
              </span>
              <h2 className="text-white font-medium">
                Software opportunity is not something we invent. <br />
                It is something we encounter.
              </h2>
            </div>
            <div className="mb-6 text-white/50 space-y-2">
              <p>Not an armchair hypothesis.</p>
              <p>Not a marketing forecast.</p>
            </div>
            <p className="text-[#DA840A]">
              A condition of reality we are finally equipped to observe.
            </p>
          </div>
        </section>

        {/* 7. FOOTER & WAITLIST ACCESS */}
        <footer id="contact" className="min-h-[580px] flex flex-col justify-between px-[40px] max-sm:px-[20px] pt-[80px] pb-[40px] max-w-[1440px] mx-auto">
          <div className="flex items-start justify-between w-full max-md:flex-col max-md:gap-[40px]">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#DA840A] flex items-center justify-center bg-[#DA840A]/10">
                <span className="w-4 h-4 rounded-full bg-[#DA840A]" />
              </div>
            </div>

            {/* Content & Form */}
            <div className="flex flex-col gap-[40px] w-[740px] max-lg:w-[540px] max-md:w-full">
              <div>
                <h2 className="font-display font-medium text-[96px] max-lg:text-[72px] max-sm:text-[44px] leading-[0.85] tracking-tight text-white mb-4">
                  GreatScout
                </h2>
                <span className="font-mono text-[12px] uppercase tracking-widest text-white/40">
                  AUTONOMOUS MARKET INTELLIGENCE // VERSION 1.0.0
                </span>
              </div>

              <div className="flex flex-col gap-[24px] w-full">
                <div className="font-mono text-[12px] leading-[1.4] uppercase text-white/70">
                  <p className="mb-2">
                    GreatScout continuously synthesizes pain signals from public developer channels.
                  </p>
                  <p>
                    Enter your email to receive weekly opportunity dossier alerts, or launch the live intelligence console immediately:
                  </p>
                </div>

                {/* Email Form */}
                {isSubmitted ? (
                  <div className="h-[46px] flex items-center gap-3 px-4 bg-[#DA840A]/20 border border-[#DA840A] text-[#DA840A] font-mono text-[12px] uppercase rounded-[2px]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Access requested. You will receive priority dispatch dispatches.</span>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER YOUR WORK EMAIL"
                      aria-label="Work Email Address"
                      required
                      className="flex-1 h-[44px] px-[16px] bg-white/[0.08] border border-white/20 focus:border-[#DA840A] font-mono text-[12px] uppercase text-white placeholder:text-white/40 outline-none transition-colors duration-150 rounded-[2px]"
                    />
                    <button
                      type="submit"
                      className="h-[44px] px-[24px] bg-[#DA840A] hover:bg-[#c47407] text-black font-mono font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shrink-0 rounded-[2px]"
                    >
                      <span>Request Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Direct Console Launch Button */}
                <div className="pt-2">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-3 font-mono text-[13px] uppercase font-bold text-white hover:text-[#DA840A] transition-colors duration-200 group"
                  >
                    <span className="underline underline-offset-4 decoration-[#DA840A]">
                      Or skip waitlist and launch live console now
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-[#DA840A]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Telemetry */}
          <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] uppercase text-white/40 pt-16 border-t border-white/[0.08] gap-4">
            <p>© 2026 GREATSCOUT INTELLIGENCE. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <span>REDDIT + PRODUCT HUNT MONITORS ACTIVE</span>
              <span>•</span>
              <span className="text-white/70">7-PILLAR ENGINE NOMINAL</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
