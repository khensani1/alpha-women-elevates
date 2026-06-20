import { motion } from 'motion/react';
import { BookOpen, Briefcase, TrendingUp, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Services() {
  const services = [
    {
      icon: <BookOpen size={32} />,
      title: "Mentorship Programs",
      desc: "Structured guidance from industry leaders and experienced mentors to help you navigate your career and personal growth.",
      benefits: ["1-on-1 Sessions", "Group Coaching", "Curated Resources"]
    },
    {
      icon: <Briefcase size={32} />,
      title: "Business Support",
      desc: "Strategic advice and technical support for member-owned businesses, from scaling operations to digital presence.",
      benefits: ["Strategic Planning", "Networking Access", "Funding Guidance"]
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Empowerment Workshops",
      desc: "Regular workshops focused on skill-building, financial literacy, and personal leadership development.",
      benefits: ["Skill Certifications", "Expert Panels", "Self-Development Tools"]
    },
    {
      icon: <Handshake size={32} />,
      title: "Networking Hub",
      desc: "Instant access to a global network of professional women through our digital community and local chapters.",
      benefits: ["Global Directory", "Exclusive Events", "Collaborative Projects"]
    }
  ];

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 text-brand-text">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-brand-border pb-12">
          <div className="max-w-2xl">
            <span className="section-label mb-6 block text-brand-indigo">Our Offerings</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title text-brand-text"
            >
              Empowerment<br />
              <span className="italic opacity-60">Architectures.</span>
            </motion.h1>
          </div>
          <p className="text-lg text-brand-text/70 font-serif italic max-w-xs">
            We provide a comprehensive range of services designed to support your 
            journey at every stage.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-brand-border">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 border-r border-b border-brand-border group hover:bg-brand-bg-accent/10 transition-colors"
            >
              <div className="text-brand-indigo mb-8">{service.icon}</div>
              <h2 className="text-3xl font-serif mb-6 text-brand-text">{service.title}</h2>
              <p className="text-brand-text/60 mb-10 leading-relaxed font-light">
                {service.desc}
              </p>
              <ul className="space-y-4 mb-12">
                {service.benefits.map(benefit => (
                  <li key={benefit} className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-4 text-brand-text">
                    <div className="w-1 h-1 bg-brand-sunset" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link 
                to="/signup" 
                className="inline-block border border-brand-text px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-luxury transition-all text-brand-text"
              >
                Enroll Today
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
