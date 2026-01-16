import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Pricing({ dict }: { dict: any }) {
  return (
    <div id="pricing" className="py-32 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4 block">
            {dict.label}
          </span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">
            {dict.title_prefix} <span className="text-brand-blue">{dict.title_highlight}</span>.
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            {dict.desc}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4">
          
          {/* Free Tier */}
          <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-[2rem] p-8 md:p-10 border border-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 lg:my-8 relative overflow-hidden group">
            {/* Soft Top Light */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            
            <div className="mb-10 relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Tier 01</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{dict.free.name}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-8 h-12">{dict.free.desc}</p>
              <div className="flex items-baseline gap-1 bg-slate-100/50 w-fit px-4 py-2 rounded-2xl border border-slate-200/50 shadow-inner">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{dict.free.price}</span>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ Free</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-6 relative z-10">
              <ul className="space-y-4">
                {dict.free.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-slate-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <i className="fa-solid fa-check text-slate-300 text-[10px]"></i>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 relative z-10">
              <Link 
                href="/courses" 
                className="w-full py-4 px-6 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-md transition-all text-center flex items-center justify-center group active:shadow-inner"
              >
                {dict.free.cta}
                <i className="fa-solid fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
              </Link>
            </div>
          </div>

          {/* Pro Tier (RECOMMENDED) */}
          <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-100 shadow-[0_0_1px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.05),0_30px_70px_rgba(59,130,246,0.1)] flex flex-col relative z-20 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-[0_40px_90px_rgba(59,130,246,0.2)]">
            {/* Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="px-6 py-2 bg-brand-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_10px_20px_rgba(59,130,246,0.4)] border-2 border-white ring-4 ring-brand-blue/5">
                Most Popular
              </div>
            </div>

            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/50 to-transparent pointer-events-none rounded-[2.5rem]"></div>
            
            <div className="mb-10 relative z-10">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mb-6 block">Tier 02</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{dict.pro.name}</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed font-semibold mb-8 h-12">{dict.pro.desc}</p>
              <div className="flex items-baseline gap-1 bg-brand-blue/5 w-fit px-6 py-3 rounded-[2rem] border border-brand-blue/10 shadow-inner">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">{dict.pro.price}</span>
                <span className="text-slate-400 text-base font-black uppercase tracking-widest">{dict.pro.period}</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-6 relative z-10">
              <ul className="space-y-5">
                {dict.pro.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-4 text-[14px] text-slate-800 font-bold group/item">
                    <div className="w-7 h-7 rounded-full bg-brand-blue shadow-[0_4px_10px_rgba(59,130,246,0.3)] flex items-center justify-center transition-transform group-hover/item:scale-110">
                      <i className="fa-solid fa-check text-white text-[11px]"></i>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 relative z-10">
              <button className="w-full py-5 px-8 rounded-2xl bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-brand-blue hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.4)] flex items-center justify-center group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  {dict.pro.cta}
                  <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>

          {/* Elite Tier */}
          <div className="bg-slate-950 rounded-[2rem] p-8 md:p-10 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)] hover:-translate-y-1 lg:my-8 group">
            {/* Internal Lighting */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand-blue/20 transition-all duration-700"></div>
            
            <div className="mb-10 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 block">Tier 03</span>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">{dict.elite.name}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed font-medium mb-8 h-12">{dict.elite.desc}</p>
              <div className="flex items-baseline gap-1 bg-white/5 w-fit px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-5xl font-black text-white tracking-tighter">{dict.elite.price}</span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{dict.elite.period}</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-6 relative z-10">
              <ul className="space-y-4">
                {dict.elite.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-slate-300 font-medium">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <i className="fa-solid fa-plus text-slate-500 text-[10px]"></i>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 relative z-10">
              <button className="w-full py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all text-center flex items-center justify-center group active:shadow-inner">
                {dict.elite.cta}
                <i className="fa-solid fa-crown ml-2 opacity-0 group-hover:opacity-100 transition-all text-amber-400"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}