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

export default function Home() {
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
