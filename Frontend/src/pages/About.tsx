import { motion } from 'motion/react';
import { Target, Eye, Heart, ShieldCheck } from 'lucide-react';

export function About() {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      {/* Page Header */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="editorial-title mb-8 text-brand-text"
          >
            Our <span className="text-brand-sunset italic">Story</span>
          </motion.h1>
          <p className="text-xl text-brand-text/60 max-w-2xl mx-auto font-serif italic leading-relaxed">
            Alpha Women Elevates is a local initiative born from the vision of 
            empowering women through structured community, mentorship, and support.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-brand-bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 border border-brand-border"
              style={{ backgroundColor: '#C4BCC7' }}

            >
              <Target className="text-brand-indigo mb-6" size={40} />
              <h2 className="text-3xl font-serif mb-4 text-brand-text">Our Mission</h2>
              <p className="text-brand-text/70 leading-relaxed font-light" >
                To create an inclusive ecosystem where women can access the resources, 
                networks, and knowledge necessary to elevate their personal and professional 
                lives. We strive to break barriers and foster a culture of excellence.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-12 border border-brand-border bg-brand-luxury"
            >
              <Eye className="text-brand-sunset mb-6" size={40} />
              <h2 className="text-3xl font-serif mb-4 text-brand-text">Our Vision</h2>
              <p className="text-brand-text/70 leading-relaxed font-light">
                To become the leading global digital platform for women's development, 
                recognized for our impact on community building, business growth, 
                and leadership evolution.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy/Values */}
      <section className="py-24 px-4 bg-brand-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif text-brand-text">Core Values</h2>
            <div className="w-20 h-[1px] bg-brand-sunset mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Heart size={32} />, title: "Empowerment", desc: "Instilling confidence and strength through collective support." },
              { icon: <Users size={32} />, title: "Integrity", desc: "Upholding transparency and ethics in all our interactions." },
              { icon: <ShieldCheck size={32} />, title: "Excellence", desc: "Setting high standards for our community and services." },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-brand-luxury border border-brand-border flex items-center justify-center mx-auto mb-8 text-brand-sunset shadow-[0_0_20px_rgba(204,43,94,0.2)]">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-serif mb-4 text-brand-text">{value.title}</h3>
                <p className="text-brand-text/60 font-light italic">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Users({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
