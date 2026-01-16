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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-all duration-300">
            <div className="mb-8">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-4 block w-fit">Standard</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dict.free.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{dict.free.price}</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{dict.free.desc}</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-4">
                {dict.free.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-slate-600">
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

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl p-8 border border-brand-blue/20 shadow-lg shadow-brand-blue/5 flex flex-col relative overflow-hidden group hover:border-brand-blue/40 transition-all duration-300">
            <div className="mb-8">
              <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest border-b border-brand-blue/10 pb-1 mb-4 block w-fit">Advanced</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dict.pro.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{dict.pro.price}</span>
                <span className="text-slate-400 text-xs">{dict.pro.period}</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{dict.pro.desc}</p>
            </div>
            
            <div className="flex-grow">
              <ul className="space-y-4">
                {dict.pro.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <i className="fa-solid fa-check text-brand-blue text-[10px]"></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-10 w-full py-3 px-6 rounded-lg bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-brand-blue transition-all shadow-md shadow-slate-200">
              {dict.pro.cta}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}