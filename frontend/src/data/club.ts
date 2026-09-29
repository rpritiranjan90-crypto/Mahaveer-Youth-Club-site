export interface ClubInfo {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  upiId: string;
  foundedYear: string;
  regNumber: string;
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
}

export const clubInfo: ClubInfo = {
  name: 'Mahaveer Youth Club',
  shortName: 'MYC',
  tagline: 'Celebrating Faith, Tradition & Community',
  description:
    'A community-driven non-profit youth organization established in 1998, dedicated to organizing the annual Ganesh Utsav festival and spearheading social welfare initiatives.',
  location: 'Mahaveer Youth Club Ground, Ward No. 12',
  address: 'Main Pandal Ground, Near Community Hall, Ward No. 12',
  city: 'Bhubaneswar',
  state: 'Odisha',
  pincode: '751001',
  phone: '+91 XXXXX XXXXX',
  email: 'contact@mahaveeryouthclub.org',
  upiId: 'mahaveeryouthclub@upi',
  foundedYear: '1998',
  regNumber: 'MYC/SOC/1998/412',
  socials: {
    instagram: 'https://instagram.com/mahaveeryouthclub',
    facebook: 'https://facebook.com/mahaveeryouthclub',
    youtube: 'https://youtube.com/@mahaveeryouthclub',
  },
};
