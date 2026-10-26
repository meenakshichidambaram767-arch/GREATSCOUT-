import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Activity
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import {
  ClickSpark,
  SplashCursor,
  CircularText,
  TrueFocus,
  TacticalCrosshair,
  VariableProximity,
  DecryptedText,
  PixelCard,
  CursorGrid,
  ScrollExpand,
  CircularCarousel,
  CrystalizedBall,
} from '../components/reactbits';
import { BrandLogo } from '../components/common/BrandLogo';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SolutionItem {
  id: string;
  number: string;
  title: string;
  category: string;
  desc: string;
  path: string;
  angle: number; // needle target angle
}

const SOLUTIONS_DATA: SolutionItem[] = [
  {
    id: 'extraction',
    number: '01',
    title: 'Natural Language Signal Extraction',
    category: 'PAIN IDENTIFICATION',
    desc: 'Automated parser isolating concrete friction quotes, severity ratings, negative sentiment metrics, and competitor citations.',
    path: '/app/signals',
    angle: -60,
  },
  {
    id: 'scoring',
    number: '02',
    title: '7-Pillar Commercial Viability Scoring',
    category: 'SCIENTIFIC METHODOLOGY',
    desc: 'Weighted linear composite model clamping scores [0, 100] across demand, problem frequency, pain intensity, and competitive vacuum.',
    path: '/app/opportunities',
    angle: -42,
  },
  {
    id: 'ingestion',
    number: '03',
    title: 'Multi-Channel Public Feed Harvesters',
    category: 'DATA PIPELINE',
    desc: 'Continuous ingestion workers pulling public developer discussions from Reddit subreddits and Product Hunt launch comments.',
    path: '/app/jobs',
    angle: -24,
  },
  {
    id: 'validation',
    number: '04',
    title: 'Phase 3 Data Validation & Normalization',
    category: 'DATA INTEGRITY',
    desc: 'HTML/Markdown stripping, Unicode NFKC standardization, SHA-256 exact deduplication, and Jaccard word 2-shingling.',
    path: '/app/jobs',
    angle: -6,
  },
  {
    id: 'clustering',
    number: '05',
    title: 'Vector Embeddings & Semantic Clustering',
    category: 'AI SYNTHESIS',
    desc: '384-dimensional dense semantic projections grouping isolated complaints into cohesive recurring problem clusters.',
    path: '/app/signals',
    angle: 12,
  },
  {
    id: 'vacuum',
    number: '06',
    title: 'Competitive Vacuum & White Space Analysis',
    category: 'MARKET POSITIONING',
    desc: 'Mapping unaddressed user needs against existing market incumbent feature sets to identify uncontested commercial territory.',
    path: '/app/opportunities',
    angle: 30,
  },
  {
    id: 'telemetry',
    number: '07',
    title: 'Domain Concentration & Trend Analytics',
    category: 'LONGITUDINAL TELEMETRY',
    desc: 'Tracking shifting developer sentiment, pain recurrence velocities, and category expansion across enterprise software ecosystems.',
    path: '/app/analytics',
    angle: 48,
  },
  {
    id: 'dossiers',
    number: '08',
    title: 'Automated Opportunity Dossier Synthesis',
    category: 'EXECUTIVE INTELLIGENCE',
    desc: 'Complete product opportunity blueprints containing target user personas, core pain thesis, and feature specification roadmaps.',
    path: '/app/opportunities',
    angle: 66,
  },
];

const SECTORS_DATA: SolutionItem[] = [
  {
    id: 'devtools',
    number: '01',
    title: 'Developer Tooling & Cloud Infrastructure',
    category: 'INFRASTRUCTURE',
    desc: 'Kubernetes autoscaling friction, CI/CD pipeline latency, and observability telemetry gaps across AWS/GCP.',
    path: '/app/signals',
    angle: -45,
  },
  {
    id: 'fintech',
    number: '02',
    title: 'B2B FinTech & Reconciliation Platforms',
    category: 'PAYMENTS & ACCOUNTING',
    desc: 'Automated ACH / Wire transfer matching against Stripe, QuickBooks, and NetSuite accounting ledgers.',
    path: '/app/opportunities',
    angle: -15,
  },
  {
    id: 'ecommerce',
    number: '03',
    title: 'Multichannel Commerce & Logistics',
    category: 'INVENTORY & FULFILLMENT',
    desc: 'Real-time inventory synchronization preventing overselling across Shopify, Amazon Seller Central, and ERPs.',
    path: '/app/opportunities',
    angle: 15,
  },
  {
    id: 'aiagents',
    number: '04',
    title: 'AI Agent & LLM Orchestration',
    category: 'GENERATIVE INTELLIGENCE',
    desc: 'Structured evaluation harnesses, latency mitigation, deterministic tool call guards, and hallucination reduction.',
    path: '/app/signals',
    angle: 45,
  },
];

const INSIGHTS_DATA: SolutionItem[] = [
  {
    id: 'viability-index',
    number: '01',
    title: '7-Pillar Commercial Viability Index',
    category: 'SCIENTIFIC RIGOR',
    desc: 'Rigorous empirical evaluation clamping scores across market demand, pain frequency, and willingness-to-pay.',
    path: '/app/opportunities',
    angle: -40,
  },
  {
    id: 'dedup-rate',
    number: '02',
    title: '98.4% Empirical Signal Purity',
    category: 'DATA INTEGRITY',
    desc: 'Automated Unicode NFKC normalization, SHA-256 exact matching, and Jaccard word 2-shingling noise elimination.',
    path: '/app/jobs',
    angle: -10,
  },
  {
    id: 'vacuum-score',
    number: '03',
    title: 'Uncontested Market White Space',
    category: 'COMPETITIVE INTELLIGENCE',
    desc: 'Isolating recurring high-friction complaints with zero direct software incumbent coverage in current offerings.',
    path: '/app/opportunities',
    angle: 20,
  },
  {
    id: 'evidence-trace',
    number: '04',
    title: '100% Granular Evidence Traceability',
    category: 'AUDITABLE CITATIONS',
    desc: 'Every opportunity is directly linked to raw developer quotes with sentiment scores and timestamped permalinks.',
    path: '/app/signals',
    angle: 50,
  },
];

interface CaseStudyItem {
  id: string;
  category: string;
  score: string;
  title: string;
  desc: string;
  metricLabel: string;
  metricValue: string;
  path: string;
}

const CASE_STUDIES_DATA: CaseStudyItem[] = [
  {
    id: 'stripe-recon',
    category: 'FINTECH',
    score: '81.4',
    title: 'Automated Stripe & Bank Wire Reconciliation',
    desc: 'Bootstrapped SaaS founders lose 10+ hours monthly manually matching ACH payments and wire transfers to Stripe invoices.',
    metricLabel: 'Urgency Rating',
    metricValue: '88% // High Intent',
    path: '/app/opportunities',
  },
  {
    id: 'multichannel-inventory',
    category: 'ECOMMERCE',
    score: '73.2',
    title: 'Shopify & Amazon Multichannel Inventory Sync',
    desc: '15-minute polling lags cause catastrophic overselling during flash promotions, incurring Amazon account suspension penalties.',
    metricLabel: 'Commercial Intent',
    metricValue: '92% // 42 Signals',
    path: '/app/opportunities',
  },
  {
    id: 'k8s-autoscaling',
    category: 'DEV TOOLS',
    score: '77.8',
    title: 'Kubernetes Autoscaling Latency & Disruption',
    desc: 'Slow EKS node group scale-down latency and pod disruption budgets cause high alert fatigue and engineer burnout.',
    metricLabel: 'Vacuum Score',
    metricValue: '91% // Top 5%',
    path: '/app/opportunities',
  },
  {
    id: 'soc2-evidence',
    category: 'CYBERSECURITY',
    score: '79.5',
    title: 'SOC2 Type II Continuous Evidence Harvester',
    desc: 'Engineering teams waste weeks manually screenshotting AWS IAM and GitHub branch protections prior to annual audit season.',
    metricLabel: 'Audit Readiness',
    metricValue: '94% // Automated',
    path: '/app/opportunities',
  },
  {
    id: 'ai-guard',
    category: 'AI INFRA',
    score: '84.1',
    title: 'Deterministic Agent Tool-Call Fallback Guard',
    desc: 'Non-deterministic function calling failures in production LLM workflows crash background jobs without graceful degradation.',
    metricLabel: 'Reliability Index',
    metricValue: '96% // Zero Crash',
    path: '/app/opportunities',
  },
];

interface Waypoint {
  id: string;
  angle: number;
  label: string;
  category: string;
  path: string;
  count: string;
  desc: string;
}

const HERO_WAYPOINTS: Waypoint[] = [
  {
    id: 'dashboard',
    angle: 0,
    label: 'Dashboard Console',
    category: 'EXECUTIVE OVERVIEW',
    path: '/app',
    count: '13 RAW SOURCES',
    desc: 'Executive KPI metrics, category concentration, and high-urgency pain clusters.',
  },
  {
    id: 'opportunities',
    angle: 60,
    label: 'Opportunity Catalog',
    category: 'SYNTHESIS DOSSIERS',
    path: '/app/opportunities',
    count: '5 OPPORTUNITIES',
    desc: '7-Pillar evaluated product opportunities ranked by demand, willingness-to-pay, and competitive vacuum.',
  },
  {
    id: 'signals',
    angle: 120,
    label: 'Signals & Evidence',
    category: 'PAIN EXTRACTION',
    path: '/app/signals',
    count: '17 SIGNALS',
    desc: 'Granular extracted user pain quotes with severity ratings, sentiment metrics, and competitor citations.',
  },
  {
    id: 'analytics',
    angle: 180,
    label: 'Market Trends',
    category: 'TELEMETRY & TIMELINES',
    path: '/app/analytics',
    count: '7 TAXONOMIES',
    desc: 'Historical sentiment timelines and domain concentration across Product Hunt and Reddit.',
  },
  {
    id: 'jobs',
    angle: 240,
    label: 'Ingestion & Jobs',
    category: 'BACKGROUND WORKER',
    path: '/app/jobs',
    count: '100% TRACEABLE',
    desc: 'Live background worker monitoring, Reddit & Product Hunt collector controls, and execution logs.',
  },
  {
    id: 'preprocessing',
    angle: 300,
    label: 'Phase 3 Validation',
    category: 'DATA INTEGRITY',
    path: '/app/jobs',
    count: '14 VERIFIED TESTS',
    desc: 'HTML/Markdown cleanup, Unicode NFKC, exact SHA-256 deduplication, and Jaccard shingling.',
  },
];

export const CnRLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const justRegistered = searchParams.get('welcome') === 'true';
  const justSignedIn = searchParams.get('signedin') === 'true';
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'solutions' | 'sectors' | 'insights'>('solutions');
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number>(0);
  const [activeSectorIdx, setActiveSectorIdx] = useState<number>(0);
  const [activeInsightIdx, setActiveInsightIdx] = useState<number>(0);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint>(HERO_WAYPOINTS[0]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  const [hoveredNetworkIdx, setHoveredNetworkIdx] = useState<number | null>(null);

  // Inquiry form state
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Helper getters for current active tab item and list
  const getActiveItem = () => {
    if (activeTab === 'solutions') return SOLUTIONS_DATA[activeSolutionIdx] || SOLUTIONS_DATA[0];
    if (activeTab === 'sectors') return SECTORS_DATA[activeSectorIdx] || SECTORS_DATA[0];
    return INSIGHTS_DATA[activeInsightIdx] || INSIGHTS_DATA[0];
  };

  const getActiveList = () => {
    if (activeTab === 'solutions') return SOLUTIONS_DATA;
    if (activeTab === 'sectors') return SECTORS_DATA;
    return INSIGHTS_DATA;
  };

  const currentActiveItem = getActiveItem();
  const currentList = getActiveList();

  // Lenis Smooth Scroll Engine synchronized with GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  // Mouse move listener for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setSubmitted(true);
  };

  // =========================================================================
  // GSAP SCROLLTRIGGER ENGINE: EXACT C&R RESEARCH SCROLL MOTION TIMELINE
  // =========================================================================
  useGSAP(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    // 1. Hero Stage: 3D Compass Glides to Center while Teal Card Expands
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      }
    });

    heroTl
      .to('.hero-visual-in', {
        clipPath: 'inset(30px 40px 30px 3% round 24px)',
        ease: 'none',
      }, 0)
      .to('.hero-compass-container', {
        x: '-12vw',
        y: '48vh',
        rotation: 30,
        opacity: 0.2,
        scale: 0.9,
        ease: 'power1.in',
      }, 0);

    // 2. THE COMPASS FALLS INTO PLACE AS THE SECOND COMPASS IN SECTION 02!
    // EXACT C&R REPLICATION (main_con02_before):
    // As Section 02 approaches (top bottom -> top top), the 3D compass device
    // falls smoothly from translateY(-200%) scale(0.7) opacity: 0 down to translateY(0) scale(1) opacity: 1,
    // docking right on top of the dial socket as Section 02 reaches the top of viewport!
    gsap.fromTo(
      '.solutions-compass-wrap',
      {
        yPercent: -200,
        scale: 0.7,
        opacity: 0,
      },
      {
        yPercent: 0,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#solutions',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        }
      }
    );

    // 3. EXACT C&R REPLICATION (main_con02):
    // Section 02 locks into pinned position (top top -> +=2400) while user scrubs through all 3 stages!
    const solutionsTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#solutions',
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.35) {
            setActiveTab('solutions');
            const sub = p / 0.35;
            const idx = Math.min(
              SOLUTIONS_DATA.length - 1,
              Math.floor(sub * SOLUTIONS_DATA.length)
            );
            setActiveSolutionIdx(idx);
          } else if (p < 0.70) {
            setActiveTab('sectors');
            const sub = (p - 0.35) / 0.35;
            const idx = Math.min(
              SECTORS_DATA.length - 1,
              Math.floor(sub * SECTORS_DATA.length)
            );
            setActiveSectorIdx(idx);
          } else {
            setActiveTab('insights');
            const sub = (p - 0.70) / 0.30;
            const idx = Math.min(
              INSIGHTS_DATA.length - 1,
              Math.floor(sub * INSIGHTS_DATA.length)
            );
            setActiveInsightIdx(idx);
          }
        },
      }
    });

    // Pivoting Needle Pin scrubs through solutions
    solutionsTl.fromTo(
      '.solutions-needle-pin',
      { rotation: -60 },
      { rotation: 66, ease: 'none' }
    );

    // EXACT C&R REPLICATION (main_con03_mot):
    // As user scrolls out of Section 02 into Section 03 (#metrics),
    // the 3D compass device floats away into Section 03!
    gsap.timeline({
      scrollTrigger: {
        trigger: '#metrics',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      }
    })
    .to('.solutions-compass-wrap', {
      yPercent: 140,
      xPercent: 80,
      scale: 0.8,
      duration: 0.5,
      ease: 'none'
    })
    .to('.solutions-compass-wrap', {
      yPercent: 240,
      xPercent: -120,
      scale: 0.35,
      opacity: 0,
      duration: 0.5,
      ease: 'none'
    });

    // 4. Section 03 Metrics Banner Reveal
    gsap.fromTo(
      '#metrics .metric-glass-banner',
      { opacity: 0.75, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        scrollTrigger: {
          trigger: '#metrics',
          start: 'top 85%',
          end: 'top 35%',
          scrub: 0.6,
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="bg-[#F4F9F9] text-[#333333] min-h-screen font-outfit selection:bg-[#16717d] selection:text-white relative overflow-x-hidden"
    >
      {/* React Bits: Cursor Grid Throughout The Entire Page Background */}
      <CursorGrid cellSize={56} radius={160} color="#16717d" borderColor="rgba(22, 113, 125, 0.08)" />

      {/* React Bits: Kinetic Micro-Sparks & WebGL Fluid Trail & Tactical Reticle HUD */}
      <ClickSpark sparkColor="#16717d" sparkCount={10} sparkRadius={28} sparkSize={10} />
      <SplashCursor COLOR="#16717d" />
      <TacticalCrosshair color="#16717d" size={40} showCoordinates={true} />

      {/* 0. AUTHENTIC C&R TRAILING MOUSE CURSOR (#cursor2) */}
      <div 
        id="cursor2"
        className={`fixed pointer-events-none z-[99999] transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block ${
          cursorActive ? 'scale-125' : 'scale-100'
        }`}
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      >
        <div className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-md border border-[#16717d]/40 shadow-lg flex items-center justify-center transition-all duration-300">
          <img src="/img/main/cursor.png" alt="" className="w-4 h-4 opacity-80" />
        </div>
      </div>

      {/* Welcome Banner when navigated after Sign Up or Sign In */}
      {showWelcomeBanner && (justRegistered || justSignedIn) && (
        <div className="bg-gradient-to-r from-[#0c4e56] via-[#16717d] to-[#0c4e56] text-white px-6 py-2.5 text-xs font-mono flex items-center justify-between sticky top-0 z-50 border-b border-white/20 shadow-md">
          <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span className="font-bold">{justRegistered ? 'Welcome to GreatScout!' : 'Welcome back!'}</span>
              <span className="hidden md:inline text-white/90">
                {user ? `Workspace ready for ${user.name} (${user.company || 'Founder'})` : 'Your free workspace is active.'}
              </span>
            </span>
            <div className="flex items-center gap-4 shrink-0">
              <Link 
                to="/app" 
                className="underline font-bold text-white hover:text-white/80 flex items-center gap-1"
              >
                <span>Launch Console Now</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button 
                onClick={() => setShowWelcomeBanner(false)} 
                className="text-white/70 hover:text-white text-xs px-1 cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER NAVIGATION (C&R Clean White Header) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DDDDDD] px-6 sm:px-12 py-4 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <BrandLogo size="md" variant="full" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-outfit text-[15px] font-medium text-[#444444]">
            <a href="#hero" className="hover:text-[#16717d] transition-colors">
              Hero Compass
            </a>
            <a href="#tunnel" className="hover:text-[#16717d] transition-colors">
              Pathways
            </a>
            <a href="#solutions" className="hover:text-[#16717d] transition-colors">
              Solutions Dial
            </a>
            <a href="#metrics" className="hover:text-[#16717d] transition-colors">
              Metrics
            </a>
            <a href="#scope" className="hover:text-[#16717d] transition-colors">
              Scope of Service
            </a>
            <a href="#network" className="hover:text-[#16717d] transition-colors">
              Network
            </a>
            <a href="#cases" className="hover:text-[#16717d] transition-colors">
              Dossiers
            </a>
          </nav>

          {/* Right Action Controls: Auth Status & Launch Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eaf3f3] border border-[#dbe7e7] text-xs font-mono text-[#0e6670]">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="font-bold truncate max-w-[110px]">{user.name}</span>
                  {user.isGuest && <span className="text-[10px] text-[#55696e]">(Guest)</span>}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-[#55696e] hover:text-[#1f2a2e] font-outfit px-2 py-1 rounded-md hover:bg-[#f4f8f8] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
                <Link
                  to="/app"
                  onMouseEnter={() => setCursorActive(true)}
                  onMouseLeave={() => setCursorActive(false)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#000000] hover:bg-[#16717d] text-white font-outfit text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>Console</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold font-outfit text-[#444444] hover:text-[#16717d] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-semibold font-outfit rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] hover:bg-[#0e6670] hover:text-white transition-all shadow-xs"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/app"
                  onMouseEnter={() => setCursorActive(true)}
                  onMouseLeave={() => setCursorActive(false)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#000000] hover:bg-[#16717d] text-white font-outfit text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="hidden sm:inline">Launch Platform</span>
                  <span className="sm:hidden">Launch</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN VISUAL HERO (C&R main_visual with GSAP Scroll-Linked Traveling 3D Compass) */}
      <section id="hero" className="relative min-h-[95vh] w-full pt-8 pb-16 px-6 sm:px-12 border-b border-[#DDDDDD] overflow-hidden flex flex-col justify-between">
        {/* Background Visual Container with GSAP Animated Clip-Path (.hero-visual-in) */}
        <div 
          className="hero-visual-in absolute inset-0 z-0 bg-[#065660] pointer-events-none hidden lg:block opacity-95 transition-all"
          style={{ 
            clipPath: 'inset(30px 40px 30px 50% round 24px)',
            backgroundImage: 'url(/img/main/visual_in.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Laser trajectory crosslines inside teal container */}
          <svg className="w-full h-full opacity-30" viewBox="0 0 1440 900" fill="none">
            <line x1="1200" y1="0" x2="300" y2="900" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="200" y1="100" x2="1400" y2="800" stroke="#33C3D5" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-[1400px] w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* LEFT: Grand Typography & Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Status Pill with DecryptedText */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3.5 py-1 rounded-full bg-white border border-[#DDDDDD] text-xs font-mono font-bold text-[#16717d] shadow-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <DecryptedText
                  text="POWERED BY GSAP SCROLLTRIGGER // 120 FPS SCRUB"
                  speed={25}
                  encryptedClassName="text-[#10b981]"
                />
              </span>
            </div>

            {/* C&R 100px Typography with Eyebrow DecryptedText */}
            <div className="mb-4">
              <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
                <DecryptedText
                  text="AUTONOMOUS OPPORTUNITY DISCOVERY"
                  speed={30}
                  encryptedClassName="text-[#16717d]"
                />
              </span>
              <h1 className="font-outfit font-medium text-[50px] sm:text-[70px] lg:text-[88px] leading-[1.02] text-[#333333] tracking-[-3px]">
                Navigator of <br />
                <span className="text-[#16717d] font-bold">Market Opportunities</span> <br />
                GreatScout
              </h1>
            </div>

            {/* React Bits: TrueFocus Optical Target Lens */}
            <div className="mb-6 p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#DDDDDD] inline-block max-w-fit shadow-sm">
              <TrueFocus
                sentence="Clinical Evidence Signal Extraction Opportunity Radar"
                borderColor="#16717d"
                glowColor="rgba(22, 113, 125, 0.45)"
                blurAmount={3}
                className="font-mono text-xs sm:text-sm text-[#333333]"
              />
            </div>

            <p className="font-outfit text-[18px] sm:text-[20px] text-[#555555] leading-[1.65] max-w-[580px] mb-8">
              Transforming unstructured user complaints into rigorous, evidence-backed B2B product opportunities through clinical-grade data validation and explainable 7-pillar opportunity scoring.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                to="/app"
                onMouseEnter={() => setCursorActive(true)}
                onMouseLeave={() => setCursorActive(false)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#000000] hover:bg-[#16717d] text-white font-outfit text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span>Launch Platform Console</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>
              <Link
                to="/app/signals"
                onMouseEnter={() => setCursorActive(true)}
                onMouseLeave={() => setCursorActive(false)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#F4F9F9] text-[#000000] border border-[#DDDDDD] hover:border-[#16717d] font-outfit text-base font-semibold transition-all duration-200"
              >
                <Activity className="w-4 h-4 text-[#16717d]" />
                <span>Inspect 17 Raw Signals</span>
              </Link>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#DDDDDD] max-w-[620px]">
              <div className="p-3.5 rounded-[14px] bg-white border border-[#DDDDDD] shadow-sm">
                <span className="text-[11px] font-mono text-[#888888] block uppercase">Raw Sources</span>
                <span className="font-outfit font-bold text-2xl text-[#000000]">13</span>
              </div>
              <div className="p-3.5 rounded-[14px] bg-white border border-[#DDDDDD] shadow-sm">
                <span className="text-[11px] font-mono text-[#888888] block uppercase">Pain Signals</span>
                <span className="font-outfit font-bold text-2xl text-[#16717d]">17+</span>
              </div>
              <div className="p-3.5 rounded-[14px] bg-white border border-[#DDDDDD] shadow-sm">
                <span className="text-[11px] font-mono text-[#888888] block uppercase">Dossiers</span>
                <span className="font-outfit font-bold text-2xl text-[#000000]">5</span>
              </div>
              <div className="p-3.5 rounded-[14px] bg-white border border-[#DDDDDD] shadow-sm">
                <span className="text-[11px] font-mono text-[#888888] block uppercase">Accuracy</span>
                <span className="font-outfit font-bold text-2xl text-[#10b981]">98.4%</span>
              </div>
            </div>
          </div>

          {/* RIGHT: THE AUTHENTIC 3D C&R COMPASS WITH GSAP SCROLL GLIDE */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[500px]">
            {/* Scroll Rotation HUD Label */}
            <div className="text-center mb-3">
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#DDDDDD] text-xs font-mono font-semibold text-[#16717d] shadow-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span>GSAP HARDWARE-ACCELERATED COMPASS</span>
                <span className="text-slate-300">|</span>
                <span className="text-[#333333]">SCROLL TO GLIDE</span>
              </span>
            </div>

            {/* Dynamic Traveling 3D Compass Container (.hero-compass-container) */}
            <div className="hero-compass-container relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] flex items-center justify-center select-none will-change-transform">
              {/* React Bits: CircularText Rotating Typographic Dial */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <CircularText
                  text="• GREATSCOUT INTELLIGENCE • EVIDENCE-BACKED OPPORTUNITY RADAR •"
                  radius={210}
                  fontSize={8.5}
                  letterSpacing={3.5}
                  speed={28}
                  color="#16717d"
                />
              </div>

              {/* Counter-Clockwise Orbital Ring (compass_cir01.png) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-cir01">
                <img src="/img/main/compass_cir01.png" alt="" className="w-[88%] h-[88%] opacity-80" />
              </div>

              {/* Clockwise Orbital Ring (compass_cir02.png) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-cir02">
                <img src="/img/main/compass_cir02.png" alt="" className="w-[74%] h-[74%] opacity-85" />
              </div>

              {/* The Authentic Photorealistic C&R 3D Compass Device (compass_object.png) */}
              <div className="relative w-[78%] h-[78%] flex items-center justify-center filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] brightness-[0.88] contrast-[1.12]">
                <img 
                  src="/img/main/compass_object.png" 
                  alt="C&R 3D Compass" 
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Clickable Interactive Waypoint Nodes along radius */}
              {HERO_WAYPOINTS.map((wp) => {
                const rad = ((wp.angle - 90) * Math.PI) / 180;
                const x = 50 + 44 * Math.cos(rad);
                const y = 50 + 44 * Math.sin(rad);
                const isSelected = activeWaypoint.id === wp.id;

                return (
                  <button
                    key={wp.id}
                    onClick={() => {
                      setActiveWaypoint(wp);
                      navigate(wp.path);
                    }}
                    onMouseEnter={() => {
                      setActiveWaypoint(wp);
                      setCursorActive(true);
                    }}
                    onMouseLeave={() => setCursorActive(false)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-30 ${
                      isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`Navigate to ${wp.label}`}
                    aria-label={`Compass node: ${wp.label}`}
                  >
                    <div 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-outfit transition-all duration-200 border shadow-md ${
                        isSelected 
                          ? 'bg-[#16717d] text-white border-[#16717d] shadow-[0_4px_16px_rgba(22,113,125,0.5)]'
                          : 'bg-white/95 backdrop-blur-sm text-[#000000] border-[#DDDDDD] hover:border-[#16717d] hover:bg-[#F4F9F9]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#10b981]' : 'bg-[#16717d]'}`} />
                      <span className="font-semibold whitespace-nowrap hidden sm:inline">{wp.label}</span>
                      <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#16717d]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Waypoint Details Card */}
            <div className="w-full max-w-[500px] mt-4 bg-white/95 backdrop-blur-md border border-[#DDDDDD] rounded-[20px] p-5 shadow-cnr-card transition-all duration-300">
              <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16717d]" />
                  <span className="font-outfit text-xs font-bold text-[#16717d] uppercase">
                    {activeWaypoint.category} // {activeWaypoint.angle}°
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF5F5] text-[#16717d]">
                  {activeWaypoint.count}
                </span>
              </div>
              <h4 className="font-outfit font-bold text-lg text-[#000000] mb-1">
                {activeWaypoint.label}
              </h4>
              <p className="font-outfit text-xs text-[#666666] leading-relaxed mb-4">
                {activeWaypoint.desc}
              </p>
              <button
                onClick={() => navigate(activeWaypoint.path)}
                onMouseEnter={() => setCursorActive(true)}
                onMouseLeave={() => setCursorActive(false)}
                className="w-full py-2.5 rounded-full bg-[#000000] hover:bg-[#16717d] text-white font-outfit text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Launch {activeWaypoint.label} Module</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator (.scroll) */}
        <div className="max-w-[1400px] w-full mx-auto flex items-center gap-4 mt-8 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-[1px] h-14 bg-[#DDDDDD] relative overflow-hidden">
              <div className="w-full h-full bg-[#333333] animate-scr" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#555555]">
              Scroll Down
            </span>
          </div>
        </div>
      </section>

      {/* 3. SECTION 01: THE TUNNEL LOOP TRANSITION (C&R main_con01 100vh with 3D Perspective Loops) */}
      <section id="tunnel" className="relative h-screen min-h-[700px] w-full bg-white border-t-[1.5px] border-b-[1.5px] border-black overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Animated Perspective Tunnel Rings (.line_box .line.line_a) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[0, 0.8, 1.6, 2.4, 3.2].map((delay, idx) => (
            <div
              key={idx}
              className="absolute w-[670px] h-[320px] pointer-events-none line-tunnel"
              style={{ animationDelay: `${delay}s` }}
            >
              <div className="w-full h-full border border-[#333333] rounded-full" />
            </div>
          ))}
        </div>

        {/* Central Masking Card (C&R dim_box & title01) */}
        <div className="relative z-10 max-w-[1000px] px-6">
          <span className="font-outfit text-xs font-bold tracking-[0.25em] text-[#16717d] uppercase mb-4 block">
            <DecryptedText
              text="01 // RESEARCH RIGOR & INTEGRITY"
              speed={30}
              animateOn="view"
              encryptedClassName="text-[#16717d]"
            />
          </span>
          <h2 className="font-outfit font-medium text-[44px] sm:text-[68px] lg:text-[84px] leading-[1.08] text-[#333333] tracking-[-3px] mb-6">
            <VariableProximity label="GreatScout Drives Success In Market Pathways" radius={160} />
          </h2>
          <p className="font-outfit text-[18px] sm:text-[21px] text-[#555555] max-w-[720px] mx-auto leading-[1.65] mb-8">
            Pioneering evidence-backed product discovery with zero hallucination. We observe recurring user friction in the wild and transform real pain points into verified, high-confidence SaaS opportunities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/opportunities"
              onMouseEnter={() => setCursorActive(true)}
              onMouseLeave={() => setCursorActive(false)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#16717d] hover:bg-[#125861] text-white font-outfit text-sm font-semibold transition-all shadow-sm"
            >
              <span>Explore Verified Opportunities</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app/signals"
              onMouseEnter={() => setCursorActive(true)}
              onMouseLeave={() => setCursorActive(false)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F4F9F9] hover:bg-white text-[#000000] border border-[#DDDDDD] font-outfit text-sm font-semibold transition-all"
            >
              <span>Inspect Raw Signal Quotes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SECTION 02: THE ICONIC C&R SOLUTIONS SECTION (PINNED WITH GSAP SCROLLTRIGGER) */}
      <section id="solutions" className="relative min-h-screen w-full py-20 px-6 sm:px-12 bg-[#F4F9F9] border-b border-[#DDDDDD] flex flex-col justify-center">
        {/* Background Vertical Blueprint Line */}
        <div className="absolute inset-0 pointer-events-none flex justify-center opacity-30">
          <div className="w-[1px] h-full border-r border-dashed border-[#AAAAAA]" />
        </div>

        <div className="max-w-[1400px] w-full mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10">
            <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
              <DecryptedText
                text="02 // RESEARCH CAPABILITIES (PINNED SCROLL SCRUBBING)"
                speed={30}
                animateOn="view"
                encryptedClassName="text-[#16717d]"
              />
            </span>
            <h2 className="font-outfit font-medium text-[42px] sm:text-[60px] text-[#000000] tracking-[-2px]">
              Interactive Solutions Compass
            </h2>
            <p className="font-outfit text-base text-[#666666] mt-1">
              Scroll wheel pivots the needle automatically through solutions, or hover to manually target
            </p>
          </div>

          {/* C&R 3-Column Layout: Vertical 60px Tabs + Center Falling 3D Compass + Interactive Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* COLUMN 1: Large Vertical Typography Tabs (Outfit 60px: Solutions / Sectors / Insights) */}
            <div className="lg:col-span-3 hidden lg:flex flex-col gap-6 text-right pr-6">
              <button
                onClick={() => setActiveTab('solutions')}
                className={`font-outfit text-[60px] leading-[1.1] tracking-[-2px] text-right transition-all duration-300 ${
                  activeTab === 'solutions' 
                    ? 'text-[#000000] font-semibold scale-105' 
                    : 'text-[#CCCCCC] hover:text-[#16717d]'
                }`}
              >
                Solutions
              </button>
              <button
                onClick={() => setActiveTab('sectors')}
                className={`font-outfit text-[60px] leading-[1.1] tracking-[-2px] text-right transition-all duration-300 ${
                  activeTab === 'sectors' 
                    ? 'text-[#000000] font-semibold scale-105' 
                    : 'text-[#CCCCCC] hover:text-[#16717d]'
                }`}
              >
                Sectors
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`font-outfit text-[60px] leading-[1.1] tracking-[-2px] text-right transition-all duration-300 ${
                  activeTab === 'insights' 
                    ? 'text-[#000000] font-semibold scale-105' 
                    : 'text-[#CCCCCC] hover:text-[#16717d]'
                }`}
              >
                Insights
              </button>
            </div>

            {/* COLUMN 2: The Dedicated 3D Compass Device That FALLS INTO PLACE! (.solutions-compass-wrap) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center select-none bg-[#0a0f1d] rounded-full border-2 border-[#1e293b] shadow-[0_30px_70px_rgba(0,0,0,0.65)] p-4">
                  {/* React Bits: Secondary CircularText orbiting the solution needle dial */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <CircularText
                      text={
                        activeTab === 'solutions'
                          ? '• 8 CORE CAPABILITIES • EVIDENCE PIPELINE • 100% EXPLAINABLE •'
                          : activeTab === 'sectors'
                          ? '• 4 TARGET SECTORS • UNTAPPED OPPORTUNITY DOMAINS •'
                          : '• STRATEGIC INSIGHTS • VALIDATION RIGOR • PROVEN CONVICTION •'
                      }
                      radius={180}
                      fontSize={7.5}
                      letterSpacing={2.8}
                      speed={36}
                      color="#16717d"
                    />
                  </div>

                  {/* Dashed Coordinate Dial Background (compass_dash.png) - Dark Bold Crisp */}
                  <img 
                    src="/img/main/compass_dash.png" 
                    alt="" 
                    className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] object-contain pointer-events-none opacity-85 contrast-125" 
                  />

                  {/* The GSAP Controlled Pivoting Compass Needle Pin (.solutions-needle-pin) */}
                  <div 
                    className="solutions-needle-pin absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out will-change-transform z-15"
                    style={{ transform: `rotate(${currentActiveItem.angle}deg)` }}
                  >
                    <img 
                      src="/img/main/compass_ob02.png" 
                      alt="Needle Pin" 
                      className="w-[72%] h-[72%] object-contain filter drop-shadow-[0_6px_20px_rgba(22,113,125,0.7)]" 
                    />
                  </div>

                  {/* Active Target Hub */}
                  <div className="absolute z-20 text-center pointer-events-none bg-[#090e1a] rounded-full p-2 w-16 h-16 flex flex-col items-center justify-center shadow-xl border border-[#334155]">
                    <span className="font-outfit font-bold text-lg text-[#16717d] leading-none block">
                      {currentActiveItem.number}
                    </span>
                    <span className="text-[9px] font-mono text-[#888888] uppercase block font-semibold mt-0.5">
                      {currentActiveItem.angle}°
                    </span>
                  </div>

                  {/* THE EXACT C&R 3D COMPASS BEZEL OBJECT THAT FALLS INTO PLACE! (.solutions-compass-wrap) */}
                  <div className="solutions-compass-wrap absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform z-30">
                    <img 
                      src="/img/main/compass_middle.png" 
                      alt="C&R 3D Compass Bezel Frame" 
                      className="w-[88%] h-[88%] object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] contrast-110" 
                    />
                  </div>
                </div>
              </div>

              {/* Active Solution Sub-Card (Stationary base indicator) */}
              <div className="mt-6 p-4 rounded-[16px] bg-[#0c1322] border border-[#1e293b] shadow-md text-center max-w-[340px] w-full transition-all">
                <span className="text-[11px] font-mono font-bold text-[#16717d] uppercase block mb-1">
                  {currentActiveItem.category}
                </span>
                <h4 className="font-outfit font-bold text-sm text-white mb-2 line-clamp-1">
                  {currentActiveItem.title}
                </h4>
                  <button
                    onClick={() => navigate(currentActiveItem.path)}
                    onMouseEnter={() => setCursorActive(true)}
                    onMouseLeave={() => setCursorActive(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#16717d] hover:bg-[#125861] text-white font-outfit text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Open {activeTab.toUpperCase()} Module</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            {/* COLUMN 3: The Interactive Buttons for Active Tab (.list_wrap .list) */}
            <div className="lg:col-span-5 space-y-2.5">
              {currentList.map((item, idx) => {
                const isItemActive =
                  activeTab === 'solutions'
                    ? activeSolutionIdx === idx
                    : activeTab === 'sectors'
                    ? activeSectorIdx === idx
                    : activeInsightIdx === idx;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => {
                      if (activeTab === 'solutions') setActiveSolutionIdx(idx);
                      else if (activeTab === 'sectors') setActiveSectorIdx(idx);
                      else setActiveInsightIdx(idx);
                      setCursorActive(true);
                    }}
                    onMouseLeave={() => setCursorActive(false)}
                    onClick={() => {
                      if (activeTab === 'solutions') setActiveSolutionIdx(idx);
                      else if (activeTab === 'sectors') setActiveSectorIdx(idx);
                      else setActiveInsightIdx(idx);
                      navigate(item.path);
                    }}
                    className={`relative h-[68px] px-6 rounded-[12px] border transition-all duration-300 cursor-pointer flex items-center justify-between group overflow-hidden ${
                      isItemActive 
                        ? 'border-[#16717d] shadow-md -translate-y-0.5' 
                        : 'border-[#333333] hover:border-[#16717d]'
                    }`}
                  >
                    {/* Hover Expanding Cyan Gradient Background (:after effect) */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r from-[#007F8F] to-[#33C3D5] rounded-[12px] transition-all duration-300 pointer-events-none ${
                        isItemActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                      }`} 
                    />

                    {/* Content Layer */}
                    <div className="relative z-10 flex items-center gap-4">
                      <span className={`font-outfit font-bold text-lg transition-colors ${
                        isItemActive ? 'text-white' : 'text-[#333333] group-hover:text-white'
                      }`}>
                        {item.number}
                      </span>
                      <span className={`font-outfit text-[17px] font-medium tracking-tight transition-colors ${
                        isItemActive ? 'text-white' : 'text-[#333333] group-hover:text-white'
                      }`}>
                        {item.title}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <ArrowUpRight className={`w-4 h-4 transition-colors ${
                        isItemActive ? 'text-white' : 'text-[#333333] group-hover:text-white'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 03: KEY EMPIRICAL METRICS (C&R main_con03 Glass Banner with 4 Corner Dots) */}
      <section id="metrics" className="py-24 px-6 sm:px-12 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[1400px] mx-auto">
          {/* C&R 100px Title */}
          <div className="text-center mb-16">
            <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
              <DecryptedText
                text="03 // END-TO-END INTELLIGENCE PROVIDER"
                speed={30}
                animateOn="view"
                encryptedClassName="text-[#16717d]"
              />
            </span>
            <h2 className="font-outfit font-medium text-[42px] sm:text-[68px] lg:text-[88px] leading-[1.05] text-[#333333] tracking-[-3px]">
              End to End <br />
              Service Provider <br />
              <span className="text-[#16717d] font-bold">GreatScout</span>
            </h2>
          </div>

          {/* React Bits: ScrollExpand Applied To The Signature Metric Glass Banner */}
          <ScrollExpand startWidth={68} startRadius={36} endRadius={18} triggerId="metrics">
            <div className="metric-glass-banner relative w-full p-2 rounded-[24px] bg-[#065660]/95 backdrop-blur-xl shadow-2xl border border-white/20 will-change-transform">
              {/* 4 Corner Accent Dots */}
              <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-[#16717d] border-2 border-white shadow-sm" />
              <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-[#16717d] border-2 border-white shadow-sm" />
              <div className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-[#16717d] border-2 border-white shadow-sm" />
              <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-[#16717d] border-2 border-white shadow-sm" />

              {/* 4 Metric Columns with VariableProximity Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10 rounded-[20px] overflow-hidden text-white">
                <div className="h-[280px] sm:h-[360px] p-8 text-center flex flex-col justify-center items-center">
                  <em className="font-outfit not-italic text-2xl text-white/80 block mb-2">Since</em>
                  <span className="text-sm text-[#E3FFCC]/80 font-medium block mb-2">OPERATING EPOCH</span>
                  <strong className="font-outfit font-bold text-[64px] sm:text-[84px] text-white leading-none block">
                    <VariableProximity label="2026" radius={100} />
                  </strong>
                </div>

                <div className="h-[280px] sm:h-[360px] p-8 text-center flex flex-col justify-center items-center">
                  <em className="font-outfit not-italic text-2xl text-white/80 block mb-2">Raw Records</em>
                  <span className="text-sm text-[#E3FFCC]/80 font-medium block mb-2">5 CORE DOMAINS</span>
                  <strong className="font-outfit font-bold text-[64px] sm:text-[84px] text-white leading-none block">
                    <VariableProximity label="13" radius={100} />
                  </strong>
                </div>

                <div className="h-[280px] sm:h-[360px] p-8 text-center flex flex-col justify-center items-center">
                  <em className="font-outfit not-italic text-2xl text-white/80 block mb-2">Pain Signals</em>
                  <span className="text-sm text-[#E3FFCC]/80 font-medium block mb-2">EXTRACTED QUOTES</span>
                  <strong className="font-outfit font-bold text-[64px] sm:text-[84px] text-[#33C3D5] leading-none block">
                    <VariableProximity label="17+" radius={100} />
                  </strong>
                </div>

                <div className="h-[280px] sm:h-[360px] p-8 text-center flex flex-col justify-center items-center">
                  <em className="font-outfit not-italic text-2xl text-white/80 block mb-2">Traceability</em>
                  <span className="text-sm text-[#E3FFCC]/80 font-medium block mb-2">RAW CITATIONS</span>
                  <strong className="font-outfit font-bold text-[64px] sm:text-[84px] text-white leading-none block">
                    <VariableProximity label="100%" radius={100} />
                  </strong>
                </div>
              </div>
            </div>
          </ScrollExpand>
        </div>
      </section>

      {/* 6. SECTION 04: FULL SCOPE SERVICE ARCHITECTURE (C&R main_con04 Dual Scope Radar Dials) */}
      <section id="scope" className="py-24 px-6 sm:px-12 bg-[#F4F9F9] border-b border-[#DDDDDD]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
              04 // COMPLETE ARCHITECTURE
            </span>
            <h2 className="font-outfit font-medium text-[42px] sm:text-[68px] text-[#333333] tracking-[-3px]">
              Full Scope Service
            </h2>
            <p className="font-outfit text-base text-[#666666] mt-3">
              [Dual-Engine End-to-End Processing Framework]
            </p>
          </div>

          {/* C&R Dual Scope Radar Wheels with Dynamic Levitating CrystalizedBall Energy Cores (.wr with .scope_w01, .line, .scope_w02) */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
            {/* Scope 01: Empirical Ingestion Scope with Aurora Crystalized Energy Core */}
            <div className="relative animate-orb-levitate-1 will-change-transform">
              {/* Backing Ambient Pulsing Aura */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-[#16717d]/25 via-[#33C3D5]/25 to-[#10b981]/15 blur-2xl animate-pulse-aura -z-10 pointer-events-none" />

              <div className="w-[360px] sm:w-[460px] lg:w-[480px] h-[360px] sm:h-[460px] lg:h-[480px] rounded-full bg-[#EBF5F5]/60 backdrop-blur-sm border-2 border-[#70a8af]/50 relative flex items-center justify-center p-6 sm:p-8 shadow-[0_15px_45px_rgba(22,113,125,0.2)] overflow-hidden group">
                {/* React Bits: Dynamic Crystalized Ball WebGL Canvas */}
                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <CrystalizedBall
                    preset="aurora"
                    color="#16717d"
                    size={0.92}
                    speed={1.5}
                    dustSpeed={1.6}
                    crackle={0.92}
                    flares={0.85}
                    glow={1.15}
                    sparks={0.9}
                    particleCount={20000}
                    fill={0.52}
                    sway={0.85}
                    twinkle={0.85}
                    depth={0.7}
                    motion="rise"
                    theme="light"
                    interactive={true}
                    hoverStrength={0.9}
                  />
                </div>

                {/* Counter-Rotating Concentric Tactical Radar Rings */}
                <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <circle cx="200" cy="200" r="185" fill="none" stroke="#70a8af" strokeWidth="1.2" strokeDasharray="3 5" className="animate-cir01 origin-center opacity-80" />
                  <circle cx="200" cy="200" r="145" fill="none" stroke="#16717d" strokeWidth="1.2" strokeDasharray="4 6" className="animate-spin-counter origin-center opacity-60" />
                  {/* Orbiting Satellite Marker Beacons */}
                  <circle cx="200" cy="15" r="4" fill="#16717d" className="animate-cir01 origin-center drop-shadow-[0_0_8px_#16717d]" />
                  <circle cx="385" cy="200" r="3.5" fill="#33C3D5" className="animate-cir01 origin-center drop-shadow-[0_0_8px_#33C3D5]" />
                  <circle cx="200" cy="55" r="3" fill="#16717d" className="animate-spin-counter origin-center drop-shadow-[0_0_6px_#16717d]" />
                </svg>

                {/* Scope 01 Tactical Cockpit / Live Telemetry HUD */}
                <div className="text-center relative z-20 max-w-[270px] sm:max-w-[290px] p-5 sm:p-6 rounded-[24px] bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_rgba(22,113,125,0.14)] pointer-events-auto transition-transform duration-300 group-hover:scale-[1.03]">
                  {/* Live Status Telemetry Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16717d]/10 border border-[#16717d]/30 text-[10px] font-mono font-bold text-[#16717d] mb-2 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16717d] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16717d]" />
                    </span>
                    PREPROCESSING // STREAMING
                  </div>
                  <h3 className="font-outfit font-bold text-2xl text-[#111827] mb-2 tracking-tight">
                    Empirical Ingestion
                  </h3>
                  <p className="font-outfit text-xs text-[#4b5563] leading-relaxed mb-4">
                    Multi-source collectors, HTML/Markdown stripping, Unicode NFKC, SHA-256 deduplication, and Jaccard 2-shingling.
                  </p>
                  <Link
                    to="/app/jobs"
                    onMouseEnter={() => setCursorActive(true)}
                    onMouseLeave={() => setCursorActive(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#16717d] text-white font-outfit text-xs font-semibold shadow-md hover:bg-[#125861] transition-all hover:scale-105 active:scale-95"
                  >
                    <span>14 Verified Tests</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* C&R Center Connecting Vertical Pipeline with Animated Traveling Energy Beam (.line) */}
            <div className="hidden lg:flex flex-col items-center justify-between h-[420px] w-6 relative py-2">
              {/* Top Terminal Hub */}
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-[#16717d] shadow-sm z-10" />
                <div className="absolute -inset-1 rounded-full bg-[#16717d]/30 animate-ping" />
              </div>

              {/* Center Beam Conduit */}
              <div className="w-[2px] h-full bg-gradient-to-b from-[#16717d] via-[#33C3D5] to-[#007F8F] relative overflow-hidden">
                {/* Dynamic Traveling Photon Particle */}
                <div className="absolute w-2 h-10 rounded-full bg-gradient-to-b from-transparent via-[#33C3D5] to-transparent shadow-[0_0_12px_#33C3D5] animate-pulse-beam-v -left-[3px] pointer-events-none" />
              </div>

              {/* Bottom Terminal Hub */}
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-[#007F8F] shadow-sm z-10" />
                <div className="absolute -inset-1 rounded-full bg-[#007F8F]/30 animate-ping" style={{ animationDelay: '-1s' }} />
              </div>
            </div>

            {/* Scope 02: Strategic Viability Scope with Abyss Crystalized Energy Core */}
            <div className="relative animate-orb-levitate-2 will-change-transform">
              {/* Backing Ambient Pulsing Aura */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-[#007F8F]/25 via-[#10b981]/25 to-[#33C3D5]/15 blur-2xl animate-pulse-aura -z-10 pointer-events-none" style={{ animationDelay: '-3.5s' }} />

              <div className="w-[360px] sm:w-[460px] lg:w-[480px] h-[360px] sm:h-[460px] lg:h-[480px] rounded-full bg-[#EBF5F5]/60 backdrop-blur-sm border-2 border-[#007F8F]/50 relative flex items-center justify-center p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,127,143,0.2)] overflow-hidden group">
                {/* React Bits: Dynamic Crystalized Ball WebGL Canvas */}
                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <CrystalizedBall
                    preset="abyss"
                    color="#007F8F"
                    size={0.92}
                    speed={1.4}
                    dustSpeed={1.5}
                    crackle={0.9}
                    flares={0.9}
                    glow={1.2}
                    sparks={0.85}
                    particleCount={22000}
                    fill={0.55}
                    sway={0.88}
                    twinkle={0.85}
                    depth={0.8}
                    motion="orbit"
                    theme="light"
                    interactive={true}
                    hoverStrength={0.9}
                  />
                </div>

                {/* Counter-Rotating Concentric Tactical Radar Rings */}
                <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <circle cx="200" cy="200" r="185" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4 6" className="animate-cir02 origin-center opacity-80" />
                  <circle cx="200" cy="200" r="145" fill="none" stroke="#007F8F" strokeWidth="1.2" strokeDasharray="3 5" className="animate-cir01 origin-center opacity-60" />
                  {/* Orbiting Satellite Marker Beacons */}
                  <circle cx="200" cy="15" r="4" fill="#10b981" className="animate-cir02 origin-center drop-shadow-[0_0_8px_#10b981]" />
                  <circle cx="15" cy="200" r="3.5" fill="#007F8F" className="animate-cir02 origin-center drop-shadow-[0_0_8px_#007F8F]" />
                  <circle cx="200" cy="55" r="3" fill="#10b981" className="animate-cir01 origin-center drop-shadow-[0_0_6px_#10b981]" />
                </svg>

                {/* Scope 02 Tactical Cockpit / Live Telemetry HUD */}
                <div className="text-center relative z-20 max-w-[270px] sm:max-w-[290px] p-5 sm:p-6 rounded-[24px] bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_rgba(0,127,143,0.14)] pointer-events-auto transition-transform duration-300 group-hover:scale-[1.03]">
                  {/* Live Status Telemetry Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007F8F]/10 border border-[#007F8F]/30 text-[10px] font-mono font-bold text-[#007F8F] mb-2 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
                    </span>
                    AI SYNTHESIS // 384-D CLUSTER
                  </div>
                  <h3 className="font-outfit font-bold text-2xl text-[#111827] mb-2 tracking-tight">
                    Strategic Viability
                  </h3>
                  <p className="font-outfit text-xs text-[#4b5563] leading-relaxed mb-4">
                    384-dimensional vector embeddings, cosine clustering, 7-pillar viability scoring, and automated opportunity dossiers.
                  </p>
                  <Link
                    to="/app/opportunities"
                    onMouseEnter={() => setCursorActive(true)}
                    onMouseLeave={() => setCursorActive(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#000000] text-white font-outfit text-xs font-semibold shadow-md hover:bg-[#16717d] transition-all hover:scale-105 active:scale-95"
                  >
                    <span>5 Active Dossiers</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 05: PROMINENT NETWORK (C&R main_con05 with Interactive Expanding Accordion Cards) */}
      <section id="network" className="py-24 px-6 sm:px-12 bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
              05 // PROMINENT ARCHITECTURE
            </span>
            <h2 className="font-outfit font-medium text-[42px] sm:text-[68px] text-[#333333] tracking-[-3px]">
              Prominent Network
            </h2>
            <p className="font-outfit text-base text-[#666666] mt-3">
              Leading the Future of Market Intelligence With Integrated Services
            </p>
          </div>

          {/* Interactive Expanding Horizontal Accordion Container (.network_cont) */}
          <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[480px] w-full">
            {[
              {
                id: 'reddit',
                tag: 'DATA INGESTION STREAM',
                title: 'Reddit Harvester',
                desc: 'Real-time telemetry and discussion polling across r/SaaS, r/startups, and developer communities.',
                gradient: 'from-[#065660] to-[#16717d]',
                route: '/app/jobs',
              },
              {
                id: 'producthunt',
                tag: 'COMMERCIAL GAPS',
                title: 'Product Hunt Engine',
                desc: 'Extracting product complaints, missing features, and pricing objections from daily new releases.',
                gradient: 'from-[#16717d] to-[#007F8F]',
                route: '/app/jobs',
              },
              {
                id: 'pgvector',
                tag: 'SEMANTIC INDEXER',
                title: 'pgvector Vector Store',
                desc: '384-dimensional dense embeddings with cosine similarity for sub-second semantic clustering.',
                gradient: 'from-[#007F8F] to-[#10b981]',
                route: '/app/signals',
              },
              {
                id: 'fastapi',
                tag: 'DISTRIBUTED INFERENCE',
                title: 'FastAPI Worker Fleet',
                desc: 'Scalable Python 3.11 backend orchestrating deterministic deduplication and 7-pillar synthesis.',
                gradient: 'from-[#10b981] to-[#065660]',
                route: '/app/opportunities',
              },
            ].map((card, idx) => {
              const isHovered = hoveredNetworkIdx === idx;
              return (
                <div
                  key={card.id}
                  onMouseEnter={() => {
                    setHoveredNetworkIdx(idx);
                    setCursorActive(true);
                  }}
                  onMouseLeave={() => {
                    setHoveredNetworkIdx(null);
                    setCursorActive(false);
                  }}
                  onClick={() => navigate(card.route)}
                  className={`relative rounded-[20px] overflow-hidden transition-all duration-700 cursor-pointer p-8 flex flex-col justify-between border border-[#DDDDDD] shadow-sm bg-gradient-to-br ${card.gradient} text-white ${
                    hoveredNetworkIdx === null 
                      ? 'md:flex-1' 
                      : isHovered 
                        ? 'md:flex-[2.4] shadow-2xl scale-[1.01]' 
                        : 'md:flex-[0.8] opacity-80'
                  }`}
                >
                  <div className="relative z-10">
                    <span className="font-mono text-xs font-bold tracking-widest text-[#E3FFCC] uppercase block mb-3">
                      {card.tag}
                    </span>
                    <h3 className="font-outfit font-bold text-3xl sm:text-4xl leading-tight mb-4">
                      {card.title}
                    </h3>
                    <p className={`font-outfit text-sm text-white/90 leading-relaxed transition-all duration-500 max-w-[340px] ${
                      isHovered || hoveredNetworkIdx === null ? 'opacity-100 max-h-32' : 'md:opacity-0 md:max-h-0'
                    }`}>
                      {card.desc}
                    </p>
                  </div>

                  <div className="relative z-10 pt-6 flex items-center justify-between border-t border-white/20">
                    <span className="font-outfit text-sm font-semibold tracking-wider">
                      VISIT COMPONENT
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. SECTION 06: VERIFIED RESEARCH CASE STUDIES (C&R main_con06) */}
      <section id="cases" className="py-24 px-6 sm:px-12 bg-[#F4F9F9] border-b border-[#DDDDDD]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <span className="font-outfit text-xs font-bold tracking-[0.2em] text-[#16717d] uppercase mb-2 block">
                <DecryptedText
                  text="06 // RESEARCH DOSSIERS"
                  speed={30}
                  animateOn="view"
                  encryptedClassName="text-[#16717d]"
                />
              </span>
              <h2 className="font-outfit font-medium text-[42px] sm:text-[68px] text-[#000000] tracking-[-3px]">
                Verified Problem Case Studies
              </h2>
            </div>
            <Link
              to="/app/opportunities"
              onMouseEnter={() => setCursorActive(true)}
              onMouseLeave={() => setCursorActive(false)}
              className="inline-flex items-center gap-2 text-base font-outfit font-bold text-[#16717d] hover:underline"
            >
              <span>View All 5 Opportunity Dossiers</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {/* React Bits: 3D Circular Carousel with Quantum PixelCard Reveal on Each Slide */}
          <div className="w-full">
            <CircularCarousel
              items={CASE_STUDIES_DATA}
              cardWidth={370}
              cardHeight={410}
              radiusOffset={60}
              renderItem={(item, _index, isActive) => (
                <PixelCard
                  pixelColor="#16717d"
                  pixelSize={9}
                  gap={2}
                  className={`rounded-[20px] h-full shadow-lg border transition-all duration-300 bg-white ${
                    isActive
                      ? 'border-[#16717d] shadow-[0_15px_40px_rgba(22,113,125,0.22)] scale-[1.02]'
                      : 'border-[#DDDDDD] opacity-80'
                  }`}
                >
                  <div 
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setCursorActive(true)}
                    onMouseLeave={() => setCursorActive(false)}
                    className="p-7 h-full flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-mono font-bold text-[#16717d] uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#EBF5F5] text-xs font-outfit font-bold text-[#16717d] border border-[#16717d]/20">
                          SCORE {item.score}
                        </span>
                      </div>
                      <h4 className="font-outfit font-bold text-lg text-[#000000] group-hover:text-[#16717d] transition-colors mb-3 leading-snug">
                        {item.title}
                      </h4>
                      <p className="font-outfit text-xs sm:text-sm text-[#666666] leading-relaxed line-clamp-4">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#DDDDDD] flex justify-between items-center text-xs font-outfit text-[#16717d] font-semibold">
                      <span>{item.metricValue}</span>
                      <div className="w-7 h-7 rounded-full bg-[#EBF5F5] group-hover:bg-[#16717d] text-[#16717d] group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}
            />
          </div>
        </div>
      </section>

      {/* 9. FOOTER & CONTACT SECTION WITH C&R SIGNATURE PILL BUTTON */}
      <footer id="contact" className="py-24 px-6 sm:px-12 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#16717d] flex items-center justify-center text-white mb-6 shadow-sm">
                <span className="font-outfit font-bold text-lg">GS</span>
              </div>
              <h3 className="font-outfit font-medium text-[42px] sm:text-[54px] text-[#000000] tracking-[-2px] mb-4">
                GreatScout Intelligence Platform
              </h3>
              <p className="font-outfit text-[17px] text-[#555555] leading-relaxed max-w-[480px] mb-8">
                Applying clinical research rigor and automated validation to discover verified software market opportunities across public developer channels.
              </p>

              {/* Authentic C&R Signature Pill Button (.button_w a) */}
              <div className="button_w flex flex-wrap items-center gap-4">
                <Link
                  to="/app"
                  onMouseEnter={() => setCursorActive(true)}
                  onMouseLeave={() => setCursorActive(false)}
                  className="cnr-pill-btn h-[64px] px-8 bg-transparent text-[#000000] hover:text-white font-outfit text-lg font-medium tracking-tight shadow-sm"
                >
                  <span className="relative z-10 mr-4">Launch Platform Console</span>
                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#333333] text-white flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link
                  to="/app/opportunities"
                  className="px-6 py-3.5 rounded-full bg-white border border-[#DDDDDD] hover:border-[#16717d] text-[#000000] font-outfit text-sm font-semibold transition-colors"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>

            {/* Corporate Inquiry Form */}
            <div className="p-8 rounded-[20px] bg-[#F4F9F9] border border-[#DDDDDD] shadow-sm">
              <h4 className="font-outfit font-bold text-xl text-[#000000] mb-2">
                Research Inquiry & Custom Intelligence
              </h4>
              <p className="font-outfit text-xs text-[#777777] mb-6">
                Request domain-specific opportunity scouting or priority signal alerts.
              </p>

              {submitted ? (
                <div className="p-4 rounded-[10px] bg-white border border-[#10b981] text-[#10b981] flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-outfit text-sm font-medium">Inquiry received. A research associate will respond promptly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-outfit text-xs font-semibold text-[#555555] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-11 px-4 bg-white border border-[#DDDDDD] rounded-[10px] text-sm font-outfit text-[#000000] outline-none focus:border-[#16717d]"
                    />
                  </div>
                  <div>
                    <label className="block font-outfit text-xs font-semibold text-[#555555] mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-11 px-4 bg-white border border-[#DDDDDD] rounded-[10px] text-sm font-outfit text-[#000000] outline-none focus:border-[#16717d]"
                    />
                  </div>
                  <div>
                    <label className="block font-outfit text-xs font-semibold text-[#555555] mb-1">Research Inquiry</label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Specify the SaaS domain or market problem you would like analyzed."
                      className="w-full p-4 bg-white border border-[#DDDDDD] rounded-[10px] text-sm font-outfit text-[#000000] outline-none focus:border-[#16717d] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-[10px] bg-[#16717d] hover:bg-[#125861] text-white font-outfit text-sm font-semibold transition-colors"
                  >
                    Submit Research Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-[#DDDDDD] flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888] font-outfit gap-4">
            <p>© 2026 GreatScout Research Inc. Authentic C&R Research Design System with GSAP Motion Engine.</p>
            <div className="flex items-center gap-6">
              <Link to="/app" className="hover:text-[#000000]">Platform Console</Link>
              <Link to="/app/opportunities" className="hover:text-[#000000]">Opportunities</Link>
              <Link to="/app/signals" className="hover:text-[#000000]">Signals</Link>
              <Link to="/app/jobs" className="hover:text-[#000000]">System Jobs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

