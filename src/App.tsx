import { useEffect } from 'react';
import { initLenis } from './lib/lenis';
import { Hero } from './sections/Hero/Hero';
import { Benefits } from './sections/Benefits/Benefits';
import { Services } from './sections/Services/Services';

export default function App() {
  useEffect(() => { initLenis(); }, []);
  return (
    <main>
      <Hero />
      <Benefits />
      <Services />
    </main>
  );
}
