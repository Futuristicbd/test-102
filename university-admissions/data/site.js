// SITE SETTINGS — names, credits and photos used across the site.

export const SITE = {
  name: 'ক্যাম্পাস পথে',
  nameEn: 'Campus Pothe',
  tagline: 'একটু একটু করে, স্বপ্নের ক্যাম্পাসের দিকে।',
  initiative: 'SBS Students’ Association',
  developer: { name: 'Misbahul Tuhin', url: 'https://web.facebook.com/misbahul.tuhin' },
  url: 'https://university-admissions-games-and-qui.vercel.app/',
};

const commons = (file, width = 1280) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const commonsPage = file => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

// Photos of the University of Chittagong.
// `src` is a local image that always works. `remote` (optional) is a larger
// Wikimedia Commons photo that replaces it once it loads; if it cannot load,
// the local image simply stays. Remote-only items are hidden when they fail.
// Always keep the credit + licence link for Commons photos.
export const CU_PHOTOS = [
  {
    src: 'assets/img/cu-cover.webp',
    remote: commons('Campus, University of Chittagong 1.jpg', 1600),
    alt: 'পাহাড় আর সবুজে ঘেরা চট্টগ্রাম বিশ্ববিদ্যালয় campus',
    caption: 'পাহাড়ঘেরা চবি campus',
    credit: 'Wikimedia Commons',
    creditUrl: commonsPage('Campus, University of Chittagong 1.jpg'),
  },
  {
    src: 'assets/img/cu-buildings.webp',
    alt: 'পাহাড়ের মাঝে চবির academic ও আবাসিক ভবন (illustrative)',
    caption: 'পাহাড়ের কোলে academic ভবন',
    credit: 'Illustrative image',
  },
  {
    remote: commons('Central Shaheed Minar, University of Chittagong (08).jpg'),
    alt: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের কেন্দ্রীয় শহীদ মিনার',
    caption: 'কেন্দ্রীয় শহীদ মিনার',
    credit: 'Moheen Reeyad · Wikimedia Commons',
    creditUrl: commonsPage('Central Shaheed Minar, University of Chittagong (08).jpg'),
  },
  {
    remote: commons('Chittagong University Library (04).jpg'),
    alt: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের কেন্দ্রীয় গ্রন্থাগার',
    caption: 'কেন্দ্রীয় গ্রন্থাগার',
    credit: 'Moheen Reeyad · Wikimedia Commons',
    creditUrl: commonsPage('Chittagong University Library (04).jpg'),
  },
  {
    remote: commons('Chittagong University Road (01).jpg'),
    alt: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের ভেতরের সবুজ রাস্তা',
    caption: 'Campus-এর সবুজ পথ',
    credit: 'Moheen Reeyad · Wikimedia Commons',
    creditUrl: commonsPage('Chittagong University Road (01).jpg'),
  },
  {
    remote: commons('Chittagong University Museum (02).jpg'),
    alt: 'চট্টগ্রাম বিশ্ববিদ্যালয় জাদুঘর',
    caption: 'বিশ্ববিদ্যালয় জাদুঘর',
    credit: 'Moheen Reeyad · Wikimedia Commons',
    creditUrl: commonsPage('Chittagong University Museum (02).jpg'),
  },
];

export const AVATARS = ['🚂', '🦁', '🐯', '🐼', '🦊', '🐸', '🐵', '🦄', '🐧', '🐙', '🐨', '🤖'];
