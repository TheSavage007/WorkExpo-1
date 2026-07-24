/**
 * site.config.js
 * Single source of truth for business details, services, and SEO.
 * Every component reads from here so a phone number or price only changes in one place.
 * This is the same constants.js pattern the locksmith build uses.
 */

export const BUSINESS = {
    name: 'Company Name',
    legalName: 'Company Name LLC',
    tagline: 'One line that says exactly what you do.',
    email: 'hello@example.com',
    phone: '(000) 000-0000',
    phoneHref: 'tel:+10000000000',
    address: {
          street: '0000 S Example Pkwy',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85044',
          country: 'US'
    },
    hours: 'Monday to Sunday, 24 hours',
    serviceArea: ['Ahwatukee', 'South Phoenix', 'Tempe', 'Chandler'],
    serviceRadiusMiles: 25
};

export const BRAND = {
    charcoal: '#1C1C1E',
    charcoal2: '#232326',
    teal: '#5FBFB5',
    tealDark: '#3D9E94',
    gold: '#C8960C',
    green: '#2D6A4F',
    cream: '#F8F5F0',
    line: '#3A3A3F',
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Inter', sans-serif"
};

export const SERVICES = [
  {
        id: 'service-one',
        name: 'Service One',
        blurb: 'What the client walks away with, in one plain sentence.',
        priceLabel: 'From $250',
        priceFrom: 250,
        unit: 'flat'
  },
  {
        id: 'service-two',
        name: 'Service Two',
        blurb: 'What the client walks away with, in one plain sentence.',
        priceLabel: 'From $300',
        priceFrom: 300,
        unit: 'flat'
  },
  {
        id: 'service-three',
        name: 'Service Three',
        blurb: 'What the client walks away with, in one plain sentence.',
        priceLabel: '$40 to $60 per hour',
        priceFrom: 40,
        unit: 'hour'
  }
  ];

export const FORMS = {
    provider: 'netlify',            // 'netlify' or 'formspree'
    formspreeEndpoint: '',          // https://formspree.io/f/XXXXXXX
    contactFormName: 'contact',
    leadFormName: 'lead'
};

export const SEO = {
    siteUrl: 'https://example.netlify.app',
    title: 'Company Name | Phoenix, Arizona',
    description: 'One sentence a search engine can show. Under 160 characters.',
    ogImage: '/og.jpg',
    twitter: ''
};

/** JSON-LD block for the head. Keeps schema in sync with the constants above. */
export function localBusinessSchema() {
    return {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: BUSINESS.name,
          url: SEO.siteUrl,
          email: BUSINESS.email,
          telephone: BUSINESS.phone,
          address: {
                  '@type': 'PostalAddress',
                  streetAddress: BUSINESS.address.street,
                  addressLocality: BUSINESS.address.city,
                  addressRegion: BUSINESS.address.state,
                  postalCode: BUSINESS.address.zip,
                  addressCountry: BUSINESS.address.country
          },
          areaServed: BUSINESS.serviceArea.map((a) => ({ '@type': 'Place', name: a })),
          openingHours: 'Mo-Su 00:00-23:59',
          makesOffer: SERVICES.map((s) => ({
                  '@type': 'Offer',
                  name: s.name,
                  description: s.blurb,
                  priceCurrency: 'USD',
                  price: s.priceFrom
          }))
    };
}

/** Travel fee math, ported from the locksmith calculator. */
export function travelFee(miles, base = 40, perMile = 0.75) {
    const m = Math.max(0, Number(miles) || 0);
    if (m > BUSINESS.serviceRadiusMiles) return { total: null, outOfRange: true };
    const total = base + m * perMile;
    return { base, miles: m, travel: +(m * perMile).toFixed(2), total: +total.toFixed(2), outOfRange: false };
}

      }
