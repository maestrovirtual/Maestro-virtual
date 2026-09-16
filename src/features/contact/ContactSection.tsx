'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, FileText, MessageSquare, User } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaTiktok } from 'react-icons/fa6';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  // Mismos 5 links del Footer para consistencia. LinkedIn queda "#"
  // (pendiente) y se detecta abajo para no hacer preventDefault feo.
  const socials = [
    { name: 'YouTube',   icon: FaYoutube,    color: '#FF0000', url: 'https://youtube.com/@maestrovirtuala.c?si=r_4YnZdUnWquj8_P' },
    { name: 'Instagram', icon: FaInstagram,  color: '#E1306C', url: 'https://www.instagram.com/maestrovirtual.a.c?stkn=bzQ3d3RxeXhraXYx&utm_source=qr' },
    { name: 'Facebook',  icon: FaFacebookF,  color: '#1877F2', url: 'https://www.facebook.com/share/1EHNdrExY7/?mibextid=wwXIfr' },
    { name: 'LinkedIn',  icon: FaLinkedinIn, color: '#0077B5', url: '#' },
    { name: 'TikTok',    icon: FaTiktok,     color: '#000000', url: 'https://www.tiktok.com/@maestrovirtual.a.c?_r=1&_t=ZS-99XYM39hgw6' },
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
              {socials.map((social) => {
                const isPending = social.url === '#';
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    title={isPending ? `${social.name} · Próximamente` : social.name}
                    {...(isPending
                      ? { onClick: (e: React.MouseEvent) => e.preventDefault(), 'aria-disabled': true }
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    onMouseEnter={() => setHoveredSocial(social.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    whileHover={isPending ? undefined : { scale: 1.15, y: -3 }}
                    whileTap={isPending ? undefined : { scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center border border-border/60 dark:border-white/10 shadow-sm transition-all duration-300 ${
                      isPending ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    style={{
                      backgroundColor: hoveredSocial === social.name && !isPending ? social.color + '15' : '',
                      borderColor: hoveredSocial === social.name && !isPending ? social.color : '',
                    }}
                  >
                    <social.icon
                      className="h-5 w-5 transition-colors duration-300 text-slate-500 dark:text-slate-400"
                      style={{ color: hoveredSocial === social.name && !isPending ? social.color : undefined }}
                    />
                  </motion.a>
                );
              })}
            </div>
          </div>

        </motion.div>
      </Container>
    </section>
  );
}