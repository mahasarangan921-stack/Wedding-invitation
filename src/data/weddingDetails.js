// ─────────────────────────────────────────────────────────────
//  EDIT EVERYTHING HERE. No other file contains wedding details.
//  Leave a value as '' (empty string) and the website shows a
//  clearly marked "To be announced" placeholder instead.
// ─────────────────────────────────────────────────────────────

export const wedding = {
  groom: {
    firstName: 'Ashwin',
    fullName: 'Ashwin S',
    parents: ['Mr. D. Sugumaran', 'Mrs. S. Rekha'],
  },
  bride: {
    firstName: 'Swathi',
    fullName: 'Swathi',
    parents: ['Mr. S. Jayaprakash', 'Mrs. J. Sumathi'],
  },

  welcome: {
    lines: ['With love in our hearts,', 'we welcome you to our new beginning.'],
    signature: '— Ashwin & Swathi',
  },

  // The marriage ceremony ONLY (at the Murugan temple)
  ceremony: {
    date: '2027-02-12', // YYYY-MM-DD — used everywhere
    city: 'Kanchipuram, Tamil Nadu',
    templeName: '', // ← TO BE CONFIRMED  e.g. 'Sri ... Murugan Temple'
    time: '', // ← TO BE CONFIRMED  e.g. '9:00 AM'
  },

  // Remaining rituals & celebrations (at the marriage hall)
  hall: {
    name: 'Arya Vysya Satram Marriage Hall',
    city: 'Kanchipuram, Tamil Nadu',
    address: '', // ← optional street address, only if you want to add one
    // ← PASTE THE GOOGLE MAPS SHARE LINK HERE (e.g. https://maps.app.goo.gl/xxxx).
    //   If empty, the button falls back to a Google Maps search for the hall name.
    mapLink: '',
    // Add rows later, e.g. { time: '11:00 AM', title: 'Lunch' }
    schedule: [],
  },

  reception: {
    date: '2027-02-14',
    venue: '', // ← TO BE CONFIRMED
    time: '', // ← TO BE CONFIRMED
    address: '', // ← TO BE CONFIRMED
  },

  // Where wishes are sent. Digits only with country code, e.g. '919876543210'.
  // Leave '' and WhatsApp will let the guest choose the contact.
  contact: {
    whatsappNumber: '',
  },
}

export const wishes = [
  {
    id: 1,
    title: 'A Beautiful Beginning',
    text: 'May your love grow stronger with every passing day.\nMay your hearts always find comfort in each other.\nWishing you both a lifetime of happiness and togetherness.',
  },
  {
    id: 2,
    title: 'A Lifetime of Love',
    text: 'May your journey together be filled with endless love.\nMay every new day bring you closer to each other.\nWishing you a beautiful life hand in hand.',
  },
  {
    id: 3,
    title: 'Divine Blessings',
    text: 'May Lord Murugan bless your beautiful union.\nMay your home always be filled with peace and joy.\nWishing you both a blessed and happy married life.',
  },
  {
    id: 4,
    title: 'Always Together',
    text: 'May you stand beside each other through every season.\nMay your love bring strength, laughter, and understanding.\nWishing you a lifetime of cherished moments together.',
  },
  {
    id: 5,
    title: 'Two Hearts, One Journey',
    text: 'May your dreams blossom together as one.\nMay your bond grow deeper with every passing year.\nWishing Ashwin & Swathi a wonderful life ahead.',
  },
  {
    id: 6,
    title: 'A Heartfelt Wish',
    text: 'May your days be bright and your nights peaceful.\nMay your life together be rich with love and laughter.\nMay happiness follow you wherever your journey leads.',
  },
]
