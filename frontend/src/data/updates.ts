export interface UpdateItem {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  fullContent?: string;
  featured?: boolean;
  imageSrc?: string;
}

export const updatesData: UpdateItem[] = [
  {
    id: 'upd-1',
    title: 'Ganesh Utsav 2026: Vedic Palace Pandal Concept Unveiled',
    date: '28 September 2026',
    category: 'Pandal & Decor',
    description:
      'The executive committee has officially announced this year’s theme celebrating ancient Indian Vedic architectural heritage using 100% sustainable materials.',
    fullContent:
      'Our master artisans from West Bengal and Odisha have commenced structural work for the Vedic Palace Pandal. Constructed using bamboo, natural clay, coir, and eco-friendly pigments, this year’s pandal promises to be an architectural marvel designed to inspire cultural pride and environmental consciousness.',
    featured: true,
  },
  {
    id: 'upd-2',
    title: 'Volunteer Intake Roster Open for Devotee Crowd Management',
    date: '24 September 2026',
    category: 'Volunteers',
    description:
      'Youth club members and neighborhood volunteers are invited to register for duty shifts across Prasad distribution, senior citizen queue assistance, and tech control.',
    fullContent:
      'To ensure a seamless, disciplined experience for all visiting devotees, the youth executive committee is mobilizing 120+ active volunteers. Training sessions on emergency first-aid, queue coordination, and lost-and-found protocols will be held at the club office this Saturday.',
    featured: true,
  },
  {
    id: 'upd-3',
    title: 'Digital UPI QR Contribution Portal Live for Remote Devotees',
    date: '20 September 2026',
    category: 'Donations',
    description:
      'Devotees living across other cities and overseas can now contribute directly via the official club UPI QR code with transparent digital receipt tracking.',
    fullContent:
      'We have upgraded our online contribution process to be completely transparent. Devotees can scan our official UPI QR, enter their 12-digit transaction UTR number, and have their contribution recorded for our annual audited financial statement.',
    featured: true,
  },
  {
    id: 'upd-4',
    title: 'Special Darshan Arrangements for Senior Citizens & Differently-Abled',
    date: '15 September 2026',
    category: 'Advisory',
    description:
      'Dedicated wheelchair ramps, shaded seating bays, and priority queue lanes will be operational throughout all 10 days of the festival.',
    fullContent:
      'Our volunteer Seva team has arranged dedicated accessible ramps and continuous drinking water kiosks at Gate No. 2 for elderly devotees and persons with disabilities.',
  },
  {
    id: 'upd-5',
    title: 'Eco-Friendly Immersion Guidelines & Route Map Published',
    date: '10 September 2026',
    category: 'Visarjan',
    description:
      'In coordination with local civic authorities and pollution control boards, the designated immersion route and timings have been finalized.',
    fullContent:
      'Mahaveer Youth Club continues its pledge for clean waterbodies. Our clay idol will be immersed in an artificial immersion tank created exclusively for the festival to prevent river pollution.',
  },
];
