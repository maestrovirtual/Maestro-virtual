import "./globals.css";

// Script blocking que corre ANTES del primer paint.
// Si el usuario ya vio el splash en esta sesión, agrega la clase 'splash-shown'
// al <html> y el CSS oculta el splash sin flash visual.
const splashPrehideScript = `
(function(){try{
  if (sessionStorage.getItem('mv-splash-shown')) {
    document.documentElement.classList.add('splash-shown');
  }
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashPrehideScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}