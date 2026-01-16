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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col relative group hover:border-brand-blue/30 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{dict.free.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{dict.free.price}</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed">{dict.free.desc}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              {dict.free.features.map((feat: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <i className="fa-solid fa-check text-brand-blue/50 text-xs"></i>
                  {feat}
                </li>
              ))}
            </ul>

            <Link 
              href="/courses" 
              className="w-full btn-secondary text-center justify-center flex"
            >
              {dict.free.cta}
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col relative overflow-hidden group">
            {/* Gloss Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-blue/20 transition-all duration-500"></div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{dict.pro.name}</h3>
                <span className="bg-brand-blue text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">Popular</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{dict.pro.price}</span>
                <span className="text-slate-400 font-medium text-sm">{dict.pro.period}</span>
              </div>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">{dict.pro.desc}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow relative z-10">
              {dict.pro.features.map((feat: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                  <div className="w-4 h-4 rounded-full bg-brand-blue flex items-center justify-center">
                    <i className="fa-solid fa-check text-white text-[8px]"></i>
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button className="w-full btn-primary bg-white text-slate-900 hover:bg-slate-100 border-none relative z-10 text-center justify-center flex">
              {dict.pro.cta}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
