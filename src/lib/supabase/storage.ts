export function getUniversityLogoUrl(filename: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return `/${filename}`;
  
  // Clean filename: remove leading slash if present
  const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
  
  return `${baseUrl}/storage/v1/object/public/logos/${cleanFilename}`;
}

export const UNIVERSITY_LOGOS: Record<string, string> = {
  "MIT": getUniversityLogoUrl("mit.svg"),
  "Stanford": getUniversityLogoUrl("stanford.jpg"),
  "CMU": getUniversityLogoUrl("cmu.jpg"),
  "Carnegie Mellon": getUniversityLogoUrl("cmu.jpg"),
  "UC Berkeley": getUniversityLogoUrl("ucb.png"),
  "CAU Kiel": getUniversityLogoUrl("cau.png"),
  "NCU": getUniversityLogoUrl("ncu.png"),
};
