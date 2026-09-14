import { ArrowUpRight, Copy, Check, Mail } from 'lucide-react';
import { useState } from 'react';
import { contactContent as baseContact } from '../../data/content';
import { useLocale } from '../../i18n/LocaleContext';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Premium';
import { Magnetic } from '../ui/Magnetic';
import './Contact.css';

// Ícones das redes em SVG inline (GitHub, LinkedIn, WhatsApp). O nome vem de contactContent.links[].icon.
const BrandIcon = ({ name }) => {
  // Octocat estilizado em traço
  if (name === 'github') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  // Logo "in" do LinkedIn
  if (name === 'linkedin') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  // Balão + telefone do WhatsApp
  if (name === 'whatsapp') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22l6.1-2z" />
        <path d="M9.5 9.3c.5-1 1.5-1 2-.2l1 1.4c.3.5.2 1-.1 1.4l-.5.6c.6 1.2 1.4 2 2.6 2.6l.6-.5c.4-.3.9-.4 1.4-.1l1.4 1c.8.5.8 1.5-.2 2-2.4 1.2-5.9-.6-8-3.2-2.1-2.6-3.4-6.6-2.2-8z" />
      </svg>
    );
  }
  return null;
};

// Seção Contato: cartão de e-mail com copiar + CTA grande com efeito shine + lista de canais (GitHub/LinkedIn/WhatsApp)
const Contact = () => {
  const { t } = useLocale();
  const contactContent = t.contact;
  const [copied, setCopied] = useState(false);
  // Copia o e-mail para a área de transferência e mostra "Copiado" por 1.8s
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contactContent.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="section contact-sec">
      <div className="wrap">
        <Reveal variant="blur">
          <SectionHeading index={contactContent.index} eyebrow={contactContent.eyebrow} title={contactContent.title} sub={contactContent.subtitle} />
        </Reveal>
        <div className="contact-grid">
          <div>
            {/* Cartão do e-mail: abre o cliente de e-mail ao clicar, ou copia com o botão */}
            <Reveal variant="scale" delay="d2">
              <div className="card email-card">
                <Mail size={20} className="email-icon" />
                <a href={`mailto:${contactContent.email}?subject=${encodeURIComponent(contactContent.mailSubject)}`} className="email-link">{contactContent.email}</a>
                <button className="copy-btn" onClick={copy} aria-label={copied ? contactContent.copiedLabel : contactContent.copyLabel}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? contactContent.copied : contactContent.copy}</span>
                </button>
              </div>
            </Reveal>
            {/* CTA principal com efeito magnético + brilho varrendo (classe shine, igual ao "Vamos construir") */}
            <Reveal variant="fade" delay="d3">
              <Magnetic strength={0.05}>
                <a className="btn btn-primary shine contact-big-cta" href={`mailto:${contactContent.email}?subject=${encodeURIComponent(contactContent.mailHire)}&body=${encodeURIComponent(contactContent.mailBody)}`}>
                  {contactContent.bigCta} <ArrowUpRight size={18} />
                </a>
              </Magnetic>
            </Reveal>
          </div>
          {/* Canais: cada link vira um cartão; no WhatsApp mostra o número em vez da URL */}
          <div className="contact-links">
            {baseContact.links.map((l, i) => {
              const isWhats = l.icon === 'whatsapp';
              const display = isWhats ? '+55 14 98201-9092' : l.url.replace('https://', '');
              return (
                <Reveal key={l.label} variant="right" delay={['d2', 'd3', 'd4'][i % 3]}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="card social-card" aria-label={`Abrir ${l.label} em nova aba`}>
                    <span className="social-icon"><BrandIcon name={l.icon} /></span>
                    <span className="social-label">{l.label}</span>
                    <span className="social-url">{display}</span>
                    <ArrowUpRight size={18} className="social-arrow" />
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
        <div className="sec-rule" />
      </div>
    </section>
  );
};

export default Contact;
