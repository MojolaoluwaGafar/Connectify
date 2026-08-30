import CallToAction from '../components/landingPage/CallToAction';
import Connectify from '../components/landingPage/Connectify';
import EverythingConnect from '../components/landingPage/EverythingConnect';
import Hero from '../components/landingPage/Hero';
import Testimonials from '../components/landingPage/Testimonials';

const LandingPage = () => {
  return (
    <main>
      {/* Section 1: Hero */}
      <Hero />
      {/* Section 2: Connectify */}
      <Connectify />
      {/* Section 3: Features */}
      <EverythingConnect />
      {/* Section 4: Testimonials */}
      <Testimonials />
      {/* Section 5: Call To Action */}
      <CallToAction />
    </main>
  );
};

export default LandingPage;
