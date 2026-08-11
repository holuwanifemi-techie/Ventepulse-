import React, { useState } from 'react';
import { AiSignalNetworkCanvas } from './AiSignalNetworkCanvas';
import {
  MessageSquare,
  Calendar,
  Users,
  UploadCloud,
  BarChart3,
  Building2,
  Car,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Clock,
  Plus,
  FileSpreadsheet,
  Zap,
  X,
  Mail,
  MapPin,
  ShieldAlert,
  FileText,
  Twitter,
  Linkedin,
  Facebook,
  Instagram
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ---------------- NAVIGATION HEADER ---------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
              <Zap className="w-5 h-5 fill-current text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ventepulse
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigateToAuth('login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigateToAuth('register')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* ---------------- 1. DISTINCT HERO SECTION (CLEAN SINGLE ENVIRONMENT) ---------------- */}
      <section className="relative bg-slate-950 text-white pt-16 sm:pt-24 lg:pt-28 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Hero Three.js AI Network Canvas (★★★★★ Hero intensity) */}
        <AiSignalNetworkCanvas intensity="hero" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.14]">
              Never lose a lead. <br />
              <span className="text-emerald-400">Never miss a follow-up.</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Follow-up management for sales professionals who close high-value deals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => onNavigateToAuth('login')}
                className="text-sm font-semibold text-slate-300 hover:text-white py-2.5 px-4 cursor-pointer transition-colors"
              >
                Already have an account? <span className="text-emerald-400 font-bold underline underline-offset-4">Login</span>
              </button>
            </div>

          </div>

          {/* Right Visual Anchor Mobile Dashboard Mockup (Layered Overlap) */}
          <div className="lg:col-span-5 max-w-sm sm:max-w-md mx-auto lg:max-w-none w-full -mb-20 sm:-mb-28 relative z-20">
            <div className="bg-slate-900 text-white border-8 border-slate-800 rounded-[2.5rem] p-5 shadow-2xl space-y-4 text-left hover:-translate-y-1 transition-transform duration-300">
              
              <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-2" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Apex Real Estate
                  </span>
                  <h3 className="text-base font-bold text-white">Daily Dashboard</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  RJ
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-white">Add Lead</div>
                    <div className="text-[9px] text-slate-400">1-tap capture</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-teal-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-white">Import Leads</div>
                    <div className="text-[9px] text-slate-400">CSV / Excel</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Today's Follow-ups
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-800/50">
                    3 Due
                  </span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">Marcus Vance</div>
                    <div className="text-[10px] text-slate-400">Interested • Luxury Villa</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">Elena Rostova</div>
                    <div className="text-[10px] text-slate-400">Negotiating • Deal $450k</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Overdue Leads</span>
                  <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full font-semibold border border-rose-900/50">
                    1 Overdue
                  </span>
                </div>

                <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200 text-[11px]">David Miller</div>
                    <div className="text-[9px] text-rose-400">Day 3 Follow-up missed</div>
                  </div>
                  <span className="text-[9px] text-rose-400 font-semibold underline">Contact Now</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ---------------- 2. PROBLEM SECTION (WHITE BACKGROUND, TYPOGRAPHY-FIRST) ---------------- */}
      <section className="relative bg-white pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-8 overflow-hidden">
        
        {/* Subtle Three.js Canvas */}
        <AiSignalNetworkCanvas intensity="subtle" />

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Still managing leads with WhatsApp, notebooks or spreadsheets?
          </h2>

          <div className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed text-left sm:text-center bg-[#F7F8FA] p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <p>
              As your business grows, it's easy to lose track of conversations and forget important follow-ups.
            </p>
            <p className="font-bold text-emerald-600 text-xl tracking-tight">
              Every missed follow-up is a <span className="underline decoration-emerald-500/40 underline-offset-4">missed opportunity</span>.
            </p>
            <p className="text-slate-600 text-base">
              Ventepulse keeps every lead organized and helps you know exactly who to contact today.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 3. FEATURED SECTION #1: SOLUTIONS & FEATURES (SUBTLE NEUTRAL SURFACE #F7F8FA) ---------------- */}
      <section className="relative bg-[#F7F8FA] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-y border-slate-100/90 overflow-hidden">
        
        <AiSignalNetworkCanvas intensity="subtle" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to stay on top of <span className="text-emerald-600">every lead</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              A simple, powerful workspace built for modern sales professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lead Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keep every lead organized from first contact to closed deal with custom notes and stage tracking.
              </p>
            </div>

            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Follow-up Scheduling</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schedule follow-up reminders so you never miss the right time to reconnect with prospects.
              </p>
            </div>

            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">WhatsApp Ready</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate AI-drafted messages and launch WhatsApp with one tap to continue conversations smoothly.
              </p>
            </div>

            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Existing Data Import</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Import your existing lead databases from Excel or CSV files in seconds without data loss.
              </p>
            </div>

            <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-left md:col-span-2 lg:col-span-1 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Analytics Dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track active follow-ups, monitor pipeline progress and evaluate team sales performance easily.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 4. HOW IT WORKS SECTION (WHITE BACKGROUND, CONNECTED PROCESS FLOW) ---------------- */}
      <section className="relative bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-100 overflow-hidden">
        
        <AiSignalNetworkCanvas intensity="moderate" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get started in <span className="text-emerald-600">6 simple steps</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Streamlined workflow designed for maximum daily conversion.
            </p>
          </div>

          {/* Connected Process Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 bg-[#F7F8FA] border border-slate-200/90 rounded-2xl space-y-3.5 text-left hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Sign Up</h4>
              <p className="text-xs sm:text-sm text-slate-600">Create your account in under 30 seconds.</p>
            </div>

            <div className="p-6 bg-[#F7F8FA] border border-slate-200/90 rounded-2xl space-y-3.5 text-left hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Import Leads</h4>
              <p className="text-xs sm:text-sm text-slate-600">Upload Excel/CSV contacts or add leads manually.</p>
            </div>

            <div className="p-6 bg-[#F7F8FA] border border-slate-200/90 rounded-2xl space-y-3.5 text-left hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Check Daily Tasks</h4>
              <p className="text-xs sm:text-sm text-slate-600">Review who needs a follow-up today.</p>
            </div>

            <div className="p-6 bg-[#F7F8FA] border border-slate-200/90 rounded-2xl space-y-3.5 text-left hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900">Send Message</h4>
              <p className="text-xs sm:text-sm text-slate-600">Tap to launch pre-drafted WhatsApp messages.</p>
            </div>

            <div className="p-6 bg-[#F7F8FA] border border-slate-200/90 rounded-2xl space-y-3.5 text-left hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                5
              </div>
              <h4 className="text-base font-bold text-slate-900">Record Progress</h4>
              <p className="text-xs sm:text-sm text-slate-600">Log interaction notes and update lead stage.</p>
            </div>

            <div className="p-6 bg-emerald-950 text-white border border-emerald-500/30 rounded-2xl space-y-3.5 text-left shadow-md shadow-emerald-950/20">
              <div className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-400/20">
                6
              </div>
              <h4 className="text-base font-bold text-white">Close Deals</h4>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium">Consistently convert leads into closed deals.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 5. FEATURED SECTION #2: WHO IT'S FOR (SUBTLE NEUTRAL SURFACE #F7F8FA) ---------------- */}
      <section className="relative bg-[#F7F8FA] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-100/90 overflow-hidden">
        
        <AiSignalNetworkCanvas intensity="subtle" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for <span className="text-emerald-600">high-ticket industries</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Tailored follow-up solutions across leading sales verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real Estate Agents</h3>
              <p className="text-xs sm:text-sm text-slate-600">Manage property viewings and high-value buyers effortlessly.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Car Dealerships</h3>
              <p className="text-xs sm:text-sm text-slate-600">Track test drives, trade-ins, and automotive financing inquiries.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">High-Ticket Closers</h3>
              <p className="text-xs sm:text-sm text-slate-600">Never let high-value consultative prospects go cold.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Insurance Agents</h3>
              <p className="text-xs sm:text-sm text-slate-600">Maintain policy renewal reminders and quote follow-ups.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Financial Advisors</h3>
              <p className="text-xs sm:text-sm text-slate-600">Stay top-of-mind with wealth management clients.</p>
            </div>

            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-left hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sales Teams</h3>
              <p className="text-xs sm:text-sm text-slate-600">Empower sales reps to close deals consistently every day.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 6. CALL TO ACTION SECTION (WHITE BACKGROUND WITH DEEP SLATE CARD) ---------------- */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl overflow-hidden border border-slate-800">
          
          {/* CTA Three.js AI Signal Network Canvas */}
          <AiSignalNetworkCanvas intensity="cta" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Every missed follow-up is a <span className="text-emerald-400">missed opportunity</span>.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
              Start organizing your leads today and stay on top of every sales conversation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => onNavigateToAuth('login')}
                className="text-sm font-semibold text-slate-300 hover:text-white py-2.5 px-4 cursor-pointer transition-colors"
              >
                Already have an account? <span className="text-emerald-400 font-bold underline underline-offset-4">Login</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            
            {/* About Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current text-slate-950" />
                </div>
                <span className="text-lg font-bold text-white">
                  Ventepulse
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Streamlined follow-up management for high-ticket sales professionals, agencies, and revenue teams.
              </p>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><button type="button" onClick={() => setActiveModal('about')} className="hover:text-white transition-colors cursor-pointer">Features</button></li>
                <li><button type="button" onClick={() => setActiveModal('about')} className="hover:text-white transition-colors cursor-pointer">WhatsApp Integration</button></li>
                <li><button type="button" onClick={() => setActiveModal('about')} className="hover:text-white transition-colors cursor-pointer">Lead Import</button></li>
                <li><button type="button" onClick={() => setActiveModal('about')} className="hover:text-white transition-colors cursor-pointer">Analytics</button></li>
              </ul>
            </div>

            {/* Company & Legal Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><button type="button" onClick={() => setActiveModal('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                <li><button type="button" onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
                <li><button type="button" onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button></li>
                <li><button type="button" onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors cursor-pointer">Contact Support</button></li>
              </ul>
            </div>

            {/* Social Media Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Media</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors" title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Notice */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>Copyright © Ventepulse. All rights reserved.</p>
            <p className="text-[11px]">Designed for high-ticket sales conversion.</p>
          </div>

        </div>
      </footer>

      {/* ---------------- FOOTER MODALS (ABOUT, CONTACT, PRIVACY, TERMS) ---------------- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-slate-900">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 capitalize flex items-center gap-2">
                {activeModal === 'about' && <Zap className="w-4 h-4 text-emerald-600" />}
                {activeModal === 'contact' && <Mail className="w-4 h-4 text-emerald-600" />}
                {activeModal === 'privacy' && <ShieldAlert className="w-4 h-4 text-emerald-600" />}
                {activeModal === 'terms' && <FileText className="w-4 h-4 text-emerald-600" />}
                {activeModal === 'about' && 'About Ventepulse'}
                {activeModal === 'contact' && 'Contact Support'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3 pt-1">
              {activeModal === 'about' && (
                <>
                  <p>
                    <strong>Ventepulse</strong> is a streamlined sales follow-up application designed to help sales professionals stay organized and never miss a high-ticket sales opportunity.
                  </p>
                  <p>
                    Our mission is to eliminate lost deals by keeping prospect details, interaction notes, and timely reminders clear and actionable in one mobile-first workspace.
                  </p>
                </>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-3">
                  <p className="text-slate-600 font-medium">Reach out to our support team:</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                        <span className="font-semibold text-slate-900">ventepulse@gmail.com</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                        <span className="font-semibold text-slate-900">Lagos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p><strong>Last Updated: August 2026</strong></p>
                  <p>
                    Ventepulse respects your privacy. We collect minimal personal information (such as email address and business details) necessary to provide our service.
                  </p>
                  <p>
                    Your lead data and business records are protected by strict database Row Level Security (RLS) policies and will never be shared with third parties.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p><strong>Last Updated: August 2026</strong></p>
                  <p>
                    By using Ventepulse, you agree to maintain accurate account information and use the platform in compliance with applicable laws and regulations.
                  </p>
                  <p>
                    You retain full ownership of all lead data imported or generated within your account.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
