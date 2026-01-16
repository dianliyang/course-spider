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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-all duration-300 h-fit">
            <div className="mb-8">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-4 block w-fit">Essential</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dict.free.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{dict.free.price}</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-3 leading-relaxed min-h-[40px]">{dict.free.desc}</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-4">
                {dict.free.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-slate-600">
                    <i className="fa-solid fa-check text-slate-300 text-[10px]"></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              href="/courses" 
              className="mt-10 w-full py-3 px-6 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all text-center"
            >
              {dict.free.cta}
            </Link>
          </div>

          {/* Pro Tier (RECOMMENDED) */}
          <div className="bg-white rounded-3xl p-10 border-2 border-brand-blue shadow-2xl shadow-brand-blue/10 flex flex-col relative overflow-hidden group transition-all duration-300 lg:scale-105 z-10">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
              Popular
            </div>
            
            <div className="mb-8">
              <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border-b border-brand-blue/10 pb-1 mb-4 block w-fit">Advanced</span>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{dict.pro.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{dict.pro.price}</span>
                <span className="text-slate-400 text-sm font-bold">{dict.pro.period}</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed min-h-[40px] font-medium">{dict.pro.desc}</p>
            </div>
            
            <div className="flex-grow border-t border-slate-50 pt-8">
              <ul className="space-y-5">
                {dict.pro.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center">
                      <i className="fa-solid fa-check text-brand-blue text-[10px]"></i>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-10 w-full py-4 px-6 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl shadow-slate-200">
              {dict.pro.cta}
            </button>
          </div>

          {/* Elite Tier */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-all duration-300 h-fit">
            <div className="mb-8">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-4 block w-fit">Enterprise</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dict.elite.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{dict.elite.price}</span>
                <span className="text-slate-400 text-xs font-bold">{dict.elite.period}</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-3 leading-relaxed min-h-[40px]">{dict.elite.desc}</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-4">
                {dict.elite.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-slate-600">
                    <i className="fa-solid fa-check text-slate-300 text-[10px]"></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-10 w-full py-3 px-6 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all text-center">
              {dict.elite.cta}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}