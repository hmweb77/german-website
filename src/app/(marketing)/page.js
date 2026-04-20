import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import Roadmap from '@/components/roadmap';
import ValueProps from '@/components/valueprops';
import Courses from '@/components/courses';
import Pricing from '@/components/pricing';
import RegistrationForm from '@/components/registrationform';
import Testimonials from '@/components/testimonials';
import FAQ from '@/components/faq';
import { FinalCTA, Footer } from '@/components/finalcta';

export default async function Home({ searchParams }) {
  // Supabase recovery/invite/magic-link emails sometimes land here with a
  // `?code=...` when the `redirectTo` we passed isn't in the Supabase URL
  // allowlist — Supabase falls back to the Site URL root. Forward any code
  // to our /auth/callback so it can exchange for a session.
  const sp = (await searchParams) || {};
  const code = typeof sp.code === 'string' ? sp.code : null;
  if (code) {
    // Password-recovery codes: route to /reset-password so the user can set
    // a new password. For other flows the middleware will redirect as needed
    // after the session is established.
    redirect(
      `/auth/callback?code=${encodeURIComponent(code)}&next=/reset-password`
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-['Cairo']">
      <Navbar />
      <Hero />
      <Roadmap />
      <ValueProps />
      <Courses />
      <Pricing />
      <RegistrationForm />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
