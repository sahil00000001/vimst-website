// Curated course catalogue.
//
// The source site ships duplicate and mislabelled files (both
// `pgd chemical-engineering.html` and `pgd-chemical-engineering.html` exist, and
// `diploma-chemical-engineering.html` actually holds PG Diploma copy). This list
// is the single source of truth for which file backs which route.

export const STREAMS = [
  'Engineering',
  'Management',
  'Computer Applications',
  'Science',
  'Commerce',
  'Arts',
];

export const LEVELS = ['Diploma', 'Bachelor', 'PG Diploma', 'Master'];

const eng = (slug, title, short, level, department, source) => ({
  slug,
  title,
  short,
  stream: 'Engineering',
  level,
  department,
  source,
});

export const COURSES = [
  /* ---------- Engineering :: Diploma ---------- */
  eng('diploma-automobile-engineering', 'Diploma in Automobile Engineering', 'DAE', 'Diploma', 'Automobile Engineering', 'diploma-automobile-engineering.html'),
  eng('diploma-chemical-engineering', 'Diploma in Chemical Engineering', 'DCE', 'Diploma', 'Chemical Engineering', 'diploma-chemical Engineering.html'),
  eng('diploma-civil-engineering', 'Diploma in Civil Engineering', 'DCE', 'Diploma', 'Civil Engineering', 'diploma-civil-engineering.html'),
  eng('diploma-computer-engineering', 'Diploma in Computer Engineering', 'DCE', 'Diploma', 'Computer Engineering', 'diploma-computer-engineering.html'),
  eng('diploma-electrical-engineering', 'Diploma in Electrical Engineering', 'DEE', 'Diploma', 'Electrical Engineering', 'diploma-electrical-engineering.html'),
  eng('diploma-electronics-engineering', 'Diploma in Electronics Engineering', 'DEE', 'Diploma', 'Electronics Engineering', 'diploma-electronics-engineering.html'),
  eng('diploma-electronics-communication-engineering', 'Diploma in Electronics & Communication Engineering', 'DECE', 'Diploma', 'Electronics & Communication', 'diploma-electronic-communication.html'),
  eng('diploma-electrical-electronics-engineering', 'Diploma in Electrical & Electronics Engineering', 'DEEE', 'Diploma', 'Electrical & Electronics Engineering', null),
  eng('diploma-mechanical-engineering', 'Diploma in Mechanical Engineering', 'DME', 'Diploma', 'Mechanical Engineering', 'diploma-mechanical-engineering.html'),
  eng('diploma-instrumentation-engineering', 'Diploma in Instrumentation Engineering', 'DIE', 'Diploma', 'Instrumentation Engineering', 'diploma-instrumentation-engineering.html'),
  eng('diploma-metallurgical-engineering', 'Diploma in Metallurgical Engineering', 'DMetE', 'Diploma', 'Metallurgical Engineering', 'diploma-metallurgical-engineering.html'),
  eng('diploma-mining-engineering', 'Diploma in Mining Engineering', 'DMinE', 'Diploma', 'Mining Engineering', 'diploma-mining-engineering.html'),

  /* ---------- Engineering :: Bachelor ---------- */
  eng('bachelor-automobile-engineering', 'Bachelor in Automobile Engineering', 'B.E.', 'Bachelor', 'Automobile Engineering', 'bachelor-automobile-engineering.html'),
  eng('bachelor-chemical-engineering', 'Bachelor in Chemical Engineering', 'B.E.', 'Bachelor', 'Chemical Engineering', 'bachelor-chemical-engineering.html'),
  eng('bachelor-civil-engineering', 'Bachelor in Civil Engineering', 'B.E.', 'Bachelor', 'Civil Engineering', 'bachelor-civil-engineering.html'),
  eng('bachelor-computer-engineering', 'Bachelor in Computer Engineering', 'B.E.', 'Bachelor', 'Computer Engineering', 'bachelor-computer-engineering.html'),
  eng('bachelor-electrical-engineering', 'Bachelor in Electrical Engineering', 'B.E.', 'Bachelor', 'Electrical Engineering', 'bachelor-electrical-engineering.html'),
  eng('bachelor-electronics-engineering', 'Bachelor in Electronics Engineering', 'B.E.', 'Bachelor', 'Electronics Engineering', 'bachelor-electronics-engineering.html'),
  eng('bachelor-electronics-communication-engineering', 'Bachelor in Electronics & Communication Engineering', 'B.E.', 'Bachelor', 'Electronics & Communication', 'bachelor-electronic-communication.html'),
  eng('bachelor-electrical-electronics-engineering', 'Bachelor in Electrical & Electronics Engineering', 'B.E.', 'Bachelor', 'Electrical & Electronics Engineering', null),
  eng('bachelor-mechanical-engineering', 'Bachelor in Mechanical Engineering', 'B.E.', 'Bachelor', 'Mechanical Engineering', 'bachelor-mechanical-engineering.html'),
  eng('information-technology', 'Bachelor in Information Technology', 'B.E.', 'Bachelor', 'Information Technology', 'information-technology.html'),

  /* ---------- Engineering :: PG Diploma ---------- */
  eng('pg-diploma-chemical-engineering', 'Post Graduate Diploma in Chemical Engineering', 'PGDCE', 'PG Diploma', 'Chemical Engineering', 'pgd chemical-engineering.html'),
  eng('pg-diploma-civil-engineering', 'Post Graduate Diploma in Civil Engineering', 'PGDCE', 'PG Diploma', 'Civil Engineering', 'pgd-civil-engineering.html'),
  eng('pg-diploma-computer-engineering', 'Post Graduate Diploma in Computer Engineering', 'PGDCE', 'PG Diploma', 'Computer Engineering', 'pgd-computer-engineering.html'),
  eng('pg-diploma-electrical-engineering', 'Post Graduate Diploma in Electrical Engineering', 'PGDEE', 'PG Diploma', 'Electrical Engineering', 'pgd-electrical-engineering.html'),
  eng('pg-diploma-electronics-engineering', 'Post Graduate Diploma in Electronics Engineering', 'PGDEE', 'PG Diploma', 'Electronics Engineering', 'pgd-electronics-engineering.html'),
  eng('pg-diploma-electronics-communication-engineering', 'Post Graduate Diploma in Electronics & Communication Engineering', 'PGDECE', 'PG Diploma', 'Electronics & Communication', 'pgd-electronic-communication.html'),
  eng('pg-diploma-mechanical-engineering', 'Post Graduate Diploma in Mechanical Engineering', 'PGDME', 'PG Diploma', 'Mechanical Engineering', 'pgd-mechanical-engineering.html'),

  /* ---------- Engineering :: Master ---------- */
  eng('master-automobile-engineering', 'Master in Automobile Engineering', 'M.E.', 'Master', 'Automobile Engineering', 'master-automobile-engineering.html'),
  eng('master-chemical-engineering', 'Master in Chemical Engineering', 'M.E.', 'Master', 'Chemical Engineering', 'master-chemical -engineering.html'),
  eng('master-civil-engineering', 'Master in Civil Engineering', 'M.E.', 'Master', 'Civil Engineering', 'master-civil-engineering.html'),
  eng('master-computer-engineering', 'Master in Computer Engineering', 'M.E.', 'Master', 'Computer Engineering', null),
  eng('master-electrical-engineering', 'Master in Electrical Engineering', 'M.E.', 'Master', 'Electrical Engineering', 'master-electrical-engineering.html'),
  eng('master-electronics-engineering', 'Master in Electronics Engineering', 'M.E.', 'Master', 'Electronics Engineering', 'master-electronics-engineering.html'),
  eng('master-electronics-communication-engineering', 'Master in Electronics & Communication Engineering', 'M.E.', 'Master', 'Electronics & Communication', 'master-electronic-communication.html'),
  eng('master-electrical-electronics-engineering', 'Master in Electrical & Electronics Engineering', 'M.E.', 'Master', 'Electrical & Electronics Engineering', null),
  eng('master-mechanical-engineering', 'Master in Mechanical Engineering', 'M.E.', 'Master', 'Mechanical Engineering', 'master-mechanical-engineering.html'),

  /* ---------- Management ---------- */
  { slug: 'diploma-hotel-management', title: 'Diploma in Hotel Management', short: 'DHM', stream: 'Management', level: 'Diploma', department: 'Hotel Management', source: 'diploma-hotel-management.html' },
  { slug: 'bba', title: 'Bachelor of Business Administration', short: 'BBA', stream: 'Management', level: 'Bachelor', department: 'Management', source: 'BBA.html' },
  { slug: 'bbm', title: 'Bachelor of Business Management', short: 'BBM', stream: 'Management', level: 'Bachelor', department: 'Management', source: 'BBM.html' },
  { slug: 'bhm', title: 'Bachelor of Hotel Management', short: 'BHM', stream: 'Management', level: 'Bachelor', department: 'Hotel Management', source: 'BHM.html' },
  { slug: 'pgdm', title: 'Post Graduate Diploma in Management', short: 'PGDM', stream: 'Management', level: 'PG Diploma', department: 'Management', source: 'PGDM.html' },
  { slug: 'mba', title: 'Master of Business Administration', short: 'MBA', stream: 'Management', level: 'Master', department: 'Management', source: 'MBA.html' },

  /* ---------- Computer Applications ---------- */
  { slug: 'bca', title: 'Bachelor of Computer Applications', short: 'BCA', stream: 'Computer Applications', level: 'Bachelor', department: 'Computer Applications', source: 'BCA.html' },
  { slug: 'pgdca', title: 'Post Graduate Diploma in Computer Applications', short: 'PGDCA', stream: 'Computer Applications', level: 'PG Diploma', department: 'Computer Applications', source: 'PGDCA.html' },
  { slug: 'mca', title: 'Master of Computer Applications', short: 'MCA', stream: 'Computer Applications', level: 'Master', department: 'Computer Applications', source: null },

  /* ---------- Science ---------- */
  { slug: 'bsc', title: 'Bachelor of Science', short: 'B.Sc', stream: 'Science', level: 'Bachelor', department: 'Science', source: 'BSc.html' },
  { slug: 'msc', title: 'Master of Science', short: 'M.Sc', stream: 'Science', level: 'Master', department: 'Science', source: 'MSc.html' },

  /* ---------- Commerce ---------- */
  { slug: 'bcom', title: 'Bachelor of Commerce', short: 'B.Com', stream: 'Commerce', level: 'Bachelor', department: 'Commerce', source: 'BCom.html' },
  { slug: 'mcom', title: 'Master of Commerce', short: 'M.Com', stream: 'Commerce', level: 'Master', department: 'Commerce', source: 'MCom.html' },

  /* ---------- Arts ---------- */
  { slug: 'ba', title: 'Bachelor of Arts', short: 'B.A.', stream: 'Arts', level: 'Bachelor', department: 'Arts', source: 'BA.html' },
];

/* Banner fallbacks, used for routes whose source page carries no banner. */
export const BANNER_BY_DEPARTMENT = {
  'Automobile Engineering': 'images/banner/banner-Automobile.jpg',
  'Chemical Engineering': 'images/banner/banner-Chemical.jpg',
  'Civil Engineering': 'images/banner/banner-Civil.jpg',
  'Computer Engineering': 'images/banner/banner-computer.jpg',
  'Electrical Engineering': 'images/banner/banner-Electrical.jpg',
  'Electronics Engineering': 'images/banner/banner-Electronics.jpg',
  'Electronics & Communication': 'images/banner/banner-Electronics-Communication.jpg',
  'Electrical & Electronics Engineering': 'images/banner/banner-Electrical.jpg',
  'Mechanical Engineering': 'images/banner/banner-Mechanical.jpg',
  'Instrumentation Engineering': 'images/banner/banner-Instrumentation.jpg',
  'Metallurgical Engineering': 'images/banner/banner-Metallurgical.jpg',
  'Mining Engineering': 'images/banner/banner-Mining.jpg',
  'Information Technology': 'images/banner/about-us.jpg',
  Management: 'images/banner/banner-Business-1.jpg',
  'Hotel Management': 'images/banner/banner-hotel.jpg',
  'Computer Applications': 'images/banner/banner-bca.jpg',
  Science: 'images/banner/banner-bsc.jpg',
  Commerce: 'images/banner/banner-Business-4.jpg',
  Arts: 'images/banner/banner-ba.jpg',
};
