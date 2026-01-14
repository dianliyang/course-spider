import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-6">
                <i className="fa-solid fa-code text-sm"></i>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">CodeCampus</span>
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">Global Network</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-12">
            <div className="hidden md:flex items-center gap-10">
              <Link href="/study-plan" className="group text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-all flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-brand-blue transition-colors"></span>
                  Study Roadmap
                </div>
                <div className="h-0.5 w-0 group-hover:w-full bg-brand-blue mt-1 transition-all duration-300"></div>
              </Link>
              <Link href="/profile" className="group text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-all flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-brand-blue transition-colors"></span>
                  My Profile
                </div>
                <div className="h-0.5 w-0 group-hover:w-full bg-brand-blue mt-1 transition-all duration-300"></div>
              </Link>
            </div>
            
            <Link href="/profile" className="flex items-center gap-3 pl-10 border-l border-gray-100 group">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 group-hover:border-brand-blue group-hover:text-brand-blue transition-all overflow-hidden">
                <i className="fa-regular fa-user text-lg"></i>
              </div>
              <div className="hidden sm:flex flex-col -space-y-1">
                <span className="text-xs font-black text-gray-900 uppercase tracking-tight">Active</span>
                <span className="text-[9px] font-bold text-brand-green uppercase tracking-widest">Scholar</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}