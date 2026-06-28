import { useEffect } from 'react';

export function Terms() {
  // Automatically scroll to the top of the page when navigating here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl mb-4 text-brand-luxury">Terms of Service</h1>
        <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-12">Last Updated: June 2026</p>

        <div className="space-y-8 font-serif leading-relaxed text-brand-text/80">
          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-wider text-brand-sunset mb-3">1. Acceptance of Terms</h2>
            <p>
              By registering for a membership with Alpha Women Elevates, you agree to abide by these Terms of Service, as well as all applicable local regulations and laws within the Republic of South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-wider text-brand-sunset mb-3">2. Membership Access & Fees</h2>
            <p>
              Access to our premium community features requires an active subscription fee of R100.00 per month. These payments are securely handled on a recurring monthly debit cycle via our third-party payment partner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-wider text-brand-sunset mb-3">3. Cancellation & Refunds</h2>
            <p>
              Members may cancel their monthly recurring billing profiles at any time directly through their member hub layout profiles. Due to the immediate delivery of digital network assets, platform services, and premium access, historic subscription payments are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-wider text-brand-sunset mb-3">4. Community Guidelines</h2>
            <p>
              We maintain a strict professional standard of empowerment, professional growth, and collective leadership. Any malicious activities, systematic scraping of platform directories, or harassing behaviors will result in immediate termination of membership access without recourse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-wider text-brand-sunset mb-3">5. Governing Law</h2>
            <p>
              These terms are governed and construed in accordance with South African law, operating fully within the compliance guidelines of the Protection of Personal Information Act (POPIA).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}