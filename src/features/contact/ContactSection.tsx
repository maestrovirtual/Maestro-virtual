'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, FileText, MessageSquare, User, MessageCircle } from 'lucide-react';
import type { SVGProps } from "react";
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const Instagram = (p: SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
const Linkedin = (p: SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>;
const Youtube = (p: SVGProps<SVGSVGElement>) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>;

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socials = [
    { name: 'WhatsApp', icon: MessageCircle, color: '#25D366', url: '#' },
    { name: 'Instagram', icon: Instagram, color: '#E1306C', url: '#' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5', url: '#' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000', url: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section aria-labelledby="contact-section-title" className="relative overflow-hidden min-h-screen flex flex-col justify-center bg-bgLight dark:bg-bgDark transition-colors duration-300 py-16 sm:py-20 lg:py-24">
      
      {/* Fondos */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-bgLight to-bgLight dark:from-blue-600/20 dark:via-bgDark dark:to-bgDark" />
      <div className="absolute -top-[350px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/20 blur-[180px] animate-pulse-slower" />
      <div className="absolute top-40 left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[150px]" />
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:48px_48px]" />

      <Container size="xl" className="relative z-10">
        {/* Encabezado */}
        <div className="mb-14 text-center max-w-4xl mx-auto animate-fadeUp">
          <h2 id="contact-section-title" className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-heading flex flex-col items-center gap-2">
            <span className="text-black uppercase block dark:text-white">Contacto</span>
            <span className="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient block pt-3">
              Escríbenos un correo
            </span>
          </h2>
          <p className="mx-auto mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            ¿Tienes dudas o comentarios? Compártenos tu mensaje y nos pondremos en contacto contigo lo antes posible.
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl"
        >
          {/* Barra superior Cliente de Correo */}
          <div className="bg-slate-800 dark:bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-700">
            <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" /> Mensaje nuevo
            </span>
            <div className="flex gap-2 opacity-60">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>

          {submitted ? (
            <motion.div className="p-10 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                <Send className="h-7 w-7 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary">¡Correo enviado con éxito!</h3>
              <p className="text-muted-foreground max-w-sm">Gracias por escribirnos. Respondemos muy pronto.</p>
              <Button variant="primary" className="mt-4 rounded-full bg-blue-700 text-white border-none" onClick={() => setSubmitted(false)}>
                Redactar otro mensaje
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-border/60 pb-3">
                <span className="text-sm font-semibold text-muted-foreground w-20">Para:</span>
                <span className="text-sm font-medium text-text-primary bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-md">contacto@maestrovirtual.org</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-border/60 pb-2 focus-within:border-blue-500 transition-colors">
                <label htmlFor="name" className="text-sm font-semibold text-muted-foreground w-20 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Nombre:</label>
                <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Tu nombre completo" className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary py-1" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-border/60 pb-2 focus-within:border-blue-500 transition-colors">
                <label htmlFor="email" className="text-sm font-semibold text-muted-foreground w-20 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> De:</label>
                <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="tu-correo@ejemplo.com" className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary py-1" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-border/60 pb-2 focus-within:border-blue-500 transition-colors">
                <label htmlFor="subject" className="text-sm font-semibold text-muted-foreground w-20 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Asunto:</label>
                <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Motivo de tu mensaje" className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary py-1" />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label htmlFor="message" className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Mensaje:</label>
                <textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} placeholder="Escribe aquí..." className="w-full resize-none rounded-2xl border border-border bg-surface/50 p-4 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 backdrop-blur-sm" />
              </div>

              <div className="mt-4 flex items-center justify-end">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" variant="primary" disabled={isSending} className="rounded-full bg-blue-700 text-white font-medium px-8 py-2.5 flex items-center gap-2 disabled:opacity-50">
                    {isSending ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</>) : (<><Send className="h-4 w-4" /> Enviar</>)}
                  </Button>
                </motion.div>
              </div>
            </form>
          )}

          {/* Apartado de Redes Sociales */}
          <div className="border-t border-border/40 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-3xl">
            <span className="text-sm font-medium text-muted-foreground">También puedes encontrarnos en:</span>
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  title={social.name} 
                  onMouseEnter={() => setHoveredSocial(social.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-border/60 dark:border-white/10 shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: hoveredSocial === social.name ? social.color + '15' : '',
                    borderColor: hoveredSocial === social.name ? social.color : '',
                  }}
                >
                  <social.icon 
                    className="h-5 w-5 transition-colors duration-300 text-slate-500 dark:text-slate-400" 
                    style={{ color: hoveredSocial === social.name ? social.color : undefined }}
                  />
                </motion.a>
              ))}
            </div>
          </div>

        </motion.div>
      </Container>
    </section>
  );
}