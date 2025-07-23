import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CompensationProvider } from '@/contexts/CompensationContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Israeli Tech Compensation Calculator | Calculate Your Total Compensation",
    template: "%s | Israeli Tech Compensation Calculator"
  },
  description: "Calculate your total compensation in the Israeli tech industry. Get accurate breakdown including salary, benefits, equity, and perks with 2024 Israeli tax calculations, real-time USD/ILS conversion, and market benchmarks.",
  keywords: [
    "Israeli tech salary",
    "compensation calculator",
    "Israel tax calculator", 
    "tech salary Israel",
    "total compensation",
    "Israeli benefits",
    "pension fund Israel",
    "bituach leumi",
    "equity calculator",
    "stock options Israel",
    "RSU calculator",
    "USD to ILS",
    "Israeli tax brackets",
    "tech industry Israel",
    "developer salary Israel",
    "engineer compensation"
  ],
  authors: [{ name: "Israeli Tech Compensation Calculator" }],
  creator: "Israeli Tech Compensation Calculator",
  publisher: "Israeli Tech Compensation Calculator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["he_IL"],
    url: "https://israeli-tech-compensation.vercel.app",
    siteName: "Israeli Tech Compensation Calculator",
    title: "Israeli Tech Compensation Calculator | Calculate Your Total Compensation",
    description: "Calculate your total compensation in the Israeli tech industry. Accurate breakdown with 2024 tax calculations, real-time exchange rates, and market benchmarks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Israeli Tech Compensation Calculator - Calculate your total compensation with Israeli tax considerations",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Israeli Tech Compensation Calculator",
    description: "Calculate your total compensation in the Israeli tech industry with accurate tax calculations and market benchmarks.",
    images: ["/og-image.png"],
    creator: "@israeli_tech_calc",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "technology",
  classification: "Business Tool",
  other: {
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#2563eb",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO and technical meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Israeli Tech Calc" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Israeli Tech Compensation Calculator",
              "description": "Calculate your total compensation in the Israeli tech industry with accurate tax calculations and market benchmarks.",
              "url": "https://israeli-tech-compensation.vercel.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Israeli Tech Compensation Calculator"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Tech Professionals",
                "geographicArea": {
                  "@type": "Country",
                  "name": "Israel"
                }
              },
              "featureList": [
                "Israeli tax calculations",
                "Real-time USD/ILS conversion", 
                "Equity valuation",
                "Benefits calculation",
                "Market benchmarks",
                "PDF export",
                "Package comparison"
              ]
            })
          }}
        />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://israeli-tech-compensation.vercel.app" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/exchange-rate" as="fetch" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, show update notification
                            if (confirm('New version available! Reload to update?')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }

              // PWA Install prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button after 10 seconds
                setTimeout(() => {
                  if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
                    const installBanner = document.createElement('div');
                    installBanner.style.cssText = \`
                      position: fixed;
                      bottom: 20px;
                      right: 20px;
                      background: #2563eb;
                      color: white;
                      padding: 16px;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                      z-index: 1000;
                      font-family: system-ui, sans-serif;
                      font-size: 14px;
                      max-width: 300px;
                      cursor: pointer;
                    \`;
                    installBanner.innerHTML = \`
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <span>📱</span>
                        <div>
                          <div style="font-weight: 600;">Install App</div>
                          <div style="opacity: 0.9; font-size: 12px;">Add to home screen for quick access</div>
                        </div>
                        <button style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
                      </div>
                    \`;
                    
                    installBanner.onclick = () => {
                      if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then(() => {
                          deferredPrompt = null;
                          installBanner.remove();
                        });
                      }
                    };
                    
                    installBanner.querySelector('button').onclick = (e) => {
                      e.stopPropagation();
                      installBanner.remove();
                    };
                    
                    document.body.appendChild(installBanner);
                  }
                }, 10000);
              });
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CompensationProvider>
          {children}
        </CompensationProvider>
      </body>
    </html>
  );
}
