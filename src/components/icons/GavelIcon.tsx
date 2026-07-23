import Image from 'next/image';
import type { HTMLAttributes } from 'react';

// Free-tier Flaticon asset ("Guilt" by Magnific) — attribution: flaticon.com.
export function GavelIcon({ className }: HTMLAttributes<HTMLElement>) {
  return <Image src="/gavel.png" alt="" width={28} height={28} className={className} />;
}
