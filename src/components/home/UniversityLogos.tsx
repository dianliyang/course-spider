import Image from "next/image";

const universities = [
  { name: "MIT", logo: "/mit.svg", width: 50, height: 50 },
  { name: "Stanford", logo: "/stanford.jpg", width: 50, height: 50 },
  { name: "UC Berkeley", logo: "/ucb.png", width: 50, height: 50 },
  { name: "Carnegie Mellon", logo: "/cmu.jpg", width: 50, height: 50 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UniversityLogos({ dict }: { dict: any }) {
  return (
    <div className="w-full bg-gray-950 border-b border-white/5 py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-20 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <p className="text-center text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-12">
          {dict.label}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 hover:opacity-100 transition-all duration-700">
          {universities.map((uni) => (
            <div key={uni.name} className="relative group">
              <div className="relative h-12 w-auto flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <Image
                  src={uni.logo}
                  alt={uni.name}
                  width={uni.width}
                  height={uni.height}
                  className="object-contain h-10 w-auto brightness-0 invert"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
