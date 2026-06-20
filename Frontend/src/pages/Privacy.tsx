import { motion } from 'motion/react';

export function Privacy() {
  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 text-brand-text">
      <div className="max-w-4xl mx-auto bg-brand-luxury/50 backdrop-blur-md p-12 md:p-20 border border-brand-border shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-serif text-brand-text mb-8">Privacy Policy <span className="text-brand-sunset">(POPIA)</span></h1>
          <p className="section-label mb-12">Last Updated: May 11, 2026</p>
          
          <div className="max-w-none space-y-8 text-brand-text/70 leading-relaxed font-light font-serif italic">
            <section>
              <h2 className="text-2xl font-serif text-brand-indigo mb-4 uppercase tracking-tighter">1. Introduction</h2>
              <p>
                Alpha Women Elevates ("we", "us", "our") is committed to protecting the privacy of our members 
                in accordance with the Protection of Personal Information Act (POPIA). This policy outlines 
                how we collect, use, and safeguard your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brand-indigo mb-4 uppercase tracking-tighter">2. Information We Collect</h2>
              <p>We collect personal information that you provide to us directly, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-brand-sunset">
                <li><span className="text-brand-text/70">Full Name and Contact Details (Email, Phone)</span></li>
                <li><span className="text-brand-text/70">Location and Demographic Information</span></li>
                <li><span className="text-brand-text/70">Payment Information for Membership Subscriptions</span></li>
                <li><span className="text-brand-text/70">Business Details for Spotlight features</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brand-indigo mb-4 uppercase tracking-tighter">3. Use of Information</h2>
              <p>Your data is used solely for:</p>
              <ul className="list-disc pl-6 space-y-2 text-brand-sunset">
                <li><span className="text-brand-text/70">Managing your membership and subscriptions</span></li>
                <li><span className="text-brand-text/70">Facilitating community engagement and events</span></li>
                <li><span className="text-brand-text/70">Processing merchandise orders</span></li>
                <li><span className="text-brand-text/70">Communicating critical updates and empowerment resources</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brand-indigo mb-4 uppercase tracking-tighter">4. Data Security</h2>
              <p>
                We implement industry-standard encryption and security measures to protect your data. 
                Personal and financial information is stored in secured databases with restricted access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brand-indigo mb-4 uppercase tracking-tighter">5. Your Rights</h2>
              <p>
                Under POPIA, you have the right to access, correct, or request deletion of your personal information. 
                You may also object to the processing of your data at any time.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-brand-border text-center">
            <p className="text-sm font-medium text-brand-sunset italic">For privacy-related inquiries, contact privacy@alphawomenelevates.com</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
