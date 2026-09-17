import { COURSE_REWRITES } from './course-copy.mjs';

/**
 * Rewritten website copy.
 *
 * The text inherited from the old site was lifted from elsewhere, written in
 * heavy corporate language, and awkward in places. This file replaces it with
 * plain English that a sixteen year old and their parent can both read
 * quickly.
 *
 * Two rules held throughout:
 *
 * 1. **Every fact is preserved.** Founding year, accreditations, the library
 *    holdings, the number of computers, the bodies the institute is registered
 *    with. Nothing here is invented, and nothing true was dropped. Where the
 *    original made a claim I could not verify, the claim is kept but stated
 *    plainly rather than dressed up.
 * 2. **No em dashes.** They were asked to go, and short sentences do the job.
 *
 * It lives here, not in content/site.json, because site.json is generated.
 * Editing it directly would be undone the next time anyone runs
 * `npm run content`.
 *
 * A page listed here replaces the extracted text completely. Anything not
 * listed falls through to the original.
 */

/**
 * The quality, professional and accreditation frameworks the institute is
 * associated with, as supplied in its own institutional profile.
 *
 * One list, used in three places: the recognition section of About, the
 * quality policy page, and the strip on the home page. Kept as pairs rather
 * than sentences so the home page can set the short form large and the full
 * name beneath it, while the prose pages join them back into a line.
 */
export const ACCREDITATIONS = [
  { abbr: 'ISO 9001:2015', name: 'Quality Management System' },
  { abbr: 'AICTE', name: 'All India Council for Technical Education' },
  { abbr: 'AIMS', name: 'Association of Indian Management Schools' },
  { abbr: 'ATMA', name: 'AIMS Test for Management Admissions' },
  { abbr: 'MHRD', name: 'Ministry of Human Resource Development, Government of India' },
  { abbr: 'UKAS', name: 'United Kingdom Accreditation Service' },
  { abbr: 'KVQA', name: 'KVQA Certification Services' },
  { abbr: 'IIC', name: 'International Industrial Certificate' },
  { abbr: 'DAC', name: 'Dubai Accreditation Centre' },
  { abbr: 'IAF', name: 'International Accreditation Forum' },
  { abbr: 'IMSV', name: 'Integrated Management System Verification' },
  { abbr: 'JAS-ANZ', name: 'Joint Accreditation System of Australia and New Zealand' },
];

/** The same list as prose lines, for the pages built from PAGE_COPY. */
const accreditationLines = [
  'The Institute is registered under an act of the Government of Andhra Pradesh, India.',
  ...ACCREDITATIONS.map((a) => `${a.abbr}, ${a.name}.`),
  'And other relevant educational, professional, quality, and accreditation frameworks, as applicable to the respective programmes and certifications.',
];

/* ------------------------------------------------------------------
   Editorial pages
   ------------------------------------------------------------------ */

export const PAGE_COPY = {
  about: [
    {
      heading: 'About the institute',
      lines: [
        'Established in 1997, Vivekananda Institute of Management Science and Technology is an educational institution committed to promoting accessible, structured, and career-oriented education. The Institute aims to provide learners with opportunities to develop academic knowledge, professional competencies, practical understanding, and skills relevant to the evolving requirements of higher education and the professional world.',
        'The Institute offers a range of educational programmes through Regular and Part-Time modes, providing flexibility to students and working professionals who wish to pursue their academic and professional development alongside their other commitments.',
        'With an emphasis on quality-oriented education, continuous learning, professional development, and practical exposure, the Institute strives to create a learning environment that encourages academic growth, discipline, confidence, and responsible professional conduct.',
        "The Institute's profile includes associations, certifications, quality frameworks, and references to various educational, management, quality-assurance, and accreditation organisations, as applicable to the respective programmes and certifications.",
      ],
    },
    {
      heading: 'Who teaches you',
      lines: [
        'Our faculty are drawn from the pool of Professors, Associate Professors and Assistant Professors under the Department of Technical Education. They are among the most experienced teachers in the state, and they bring that experience directly into the course material.',
        'We teach across a wide range of engineering branches, including chemical, electronics, mechanical, civil, computer and several others, alongside our management, science and commerce programmes.',
      ],
    },
    {
      heading: 'Quality and professional associations',
      lines: accreditationLines,
    },
    {
      heading: 'Why choose this institute',
      lines: [
        'Established educational legacy. With an institutional journey dating back to 1997, the Institute represents a long-standing commitment to education and professional development.',
        'Flexible learning options. Regular and Part-Time programmes provide learners with greater flexibility to pursue their educational goals.',
        'Career-oriented education. Our programmes aim to develop knowledge and competencies that can support learners in their academic and professional journeys.',
        'Quality-focused approach. The Institute follows a structured approach towards quality, continuous improvement, and systematic educational processes.',
        'Professional development. We focus on developing not only academic knowledge but also practical understanding, professional skills, and personal confidence.',
        'Learner-centric environment. We aim to create an environment that supports the individual learning and development needs of students and working professionals.',
        'Commitment to continuous growth. Our objective is to continuously improve our academic and institutional practices in response to the changing needs of learners and the professional world.',
      ],
    },
    {
      heading: 'The library and computing',
      lines: [
        'The college library holds more than 101,000 books, along with a large number of journals and magazines. There is a spacious reading room, a separate floor set aside for teachers and research scholars, and a book bank that lends textbooks to students who need them.',
        'The campus has a Web Access Centre with 30 computers. The servers run on optical fibre, the campus is covered by Wi-Fi, and the library has its own computers and internet access for students to use.',
      ],
    },
    {
      heading: 'Life beyond the classroom',
      lines: [
        'We run seminars, lectures, workshops and sports activities through the year, along with N.S.S. and N.C.C. and other co-curricular programmes. The college students union gives every student a voice in how that life is organised.',
        'Scholarships and financial aid are awarded each year to students who earn them and to students who need them.',
        'Our Career Counselling and Placement Cell helps graduating students find work, and brings employers on to campus to recruit.',
      ],
    },
    {
      heading: 'Our commitment',
      lines: [
        'At Vivekananda Institute of Management Science and Technology, we believe that education plays a vital role in shaping individuals and contributing to the development of society.',
        'Our commitment is to provide an environment that encourages learning, professional development, discipline, innovation, integrity, and continuous improvement.',
        'We aspire to empower learners with the knowledge, skills, confidence, and values required to pursue their academic and professional aspirations and become responsible contributors to society.',
      ],
    },
  ],

  vision: [
    {
      heading: 'Our vision',
      lines: [
        'To emerge as a progressive and quality-focused educational institution that contributes to the development of knowledgeable, skilled, ethical, and professionally competent individuals.',
        'We envision an educational ecosystem where learners are encouraged to pursue excellence, develop practical competencies, embrace continuous learning, and contribute positively to society and the professional world.',
      ],
    },
    /* Values sit with the vision rather than on About. They are what the vision
       is made of, and a visitor who has just read one wants the other. */
    {
      heading: 'Our core values',
      lines: [
        'Academic excellence. We strive to encourage high standards of learning, knowledge development, and academic growth.',
        'Integrity. We believe in ethical conduct, transparency, accountability, and responsible educational practices.',
        'Student-centric learning. Our learners remain at the centre of our educational approach, with emphasis on their academic and professional development.',
        'Continuous improvement. We believe that education is an evolving process, and we continuously encourage improvement in teaching, learning, systems, and practices.',
        'Professional development. We aim to equip learners with knowledge and competencies that support their academic and professional aspirations.',
        'Accessibility and flexibility. Through Regular and Part-Time programmes, we seek to make educational opportunities more flexible and accessible.',
        'Social responsibility. We encourage learners to develop a responsible attitude towards society, professional life, and the wider community.',
      ],
    },
  ],

  mission: [
    {
      heading: 'Our mission',
      lines: [
        'Provide accessible and structured educational opportunities to learners from diverse backgrounds.',
        'Promote academic excellence through systematic and learner-centric education.',
        'Develop practical knowledge and professional skills relevant to contemporary requirements.',
        'Encourage innovation, critical thinking, discipline, and lifelong learning.',
        'Provide flexible Regular and Part-Time learning opportunities for students and working professionals.',
        'Foster an environment that supports personal, academic, and professional development.',
        'Maintain a strong commitment towards quality, transparency, and continuous improvement.',
      ],
    },
    {
      heading: 'Our educational approach',
      lines: [
        'We believe that meaningful education goes beyond classroom learning. Our educational approach seeks to integrate knowledge, practical understanding, professional skills, discipline, and continuous development.',
        'Through our Regular and Part-Time programmes, learners are provided with flexible pathways for pursuing education according to their individual academic and professional requirements.',
      ],
    },
    {
      heading: 'What we encourage learners to develop',
      lines: [
        'Strong conceptual knowledge.',
        'Practical and professional skills.',
        'Analytical and critical-thinking abilities.',
        'Communication and interpersonal skills.',
        'Confidence and leadership qualities.',
        'A commitment to continuous learning.',
      ],
    },
  ],

  qualityPolicy: [
    {
      heading: 'Our quality policy',
      lines: [
        'Vivekananda Institute of Management Science and Technology is committed to maintaining a systematic and quality-oriented approach towards education and institutional practices.',
      ],
    },
    {
      heading: 'What we commit to',
      lines: [
        'Maintaining consistent standards in educational delivery.',
        'Supporting effective and learner-focused academic processes.',
        'Encouraging continuous improvement in institutional systems.',
        'Promoting professional and practical learning.',
        'Developing a culture of discipline, responsibility, and accountability.',
        'Responding to the changing needs of learners and the professional environment.',
        'Striving for continual improvement in the effectiveness of the Quality Management System.',
      ],
    },
    {
      heading: 'Quality and professional associations',
      lines: accreditationLines,
    },
    {
      heading: 'An ongoing commitment',
      lines: [
        'The Institute aims to build a culture where quality is treated as an ongoing commitment rather than a one-time objective.',
      ],
    },
  ],

  career: [
    {
      heading: 'Building a career',
      lines: [
        'A career is more than one good job. It takes clear goals, careful planning, and advice from people who know the ground.',
        'We have helped thousands of professionals find and reach their potential, and our career consultants work with people at every stage, from senior management to professional staff.',
      ],
    },
    {
      heading: 'How we help',
      lines: [
        'Getting in front of the people who make hiring decisions is harder than it used to be. You need to keep your professional skills sharp, and that is difficult when the working day is already full.',
        'That is where our team comes in. Our professionals stay current across every discipline, from technology to personal communication, and they know how to get the most out of a career.',
        'Our team has years of experience in the employment industry, and more importantly, experience in presenting what makes a particular person worth hiring. It is no longer a question of who you know. It is a question of how you meet the right people and show them what you can do.',
      ],
    },
    {
      heading: 'Why it matters to us',
      lines: [
        'Good career management helps people see the opportunities that are actually in front of them. That is why we treat it as part of the education rather than something that happens afterwards.',
      ],
    },
  ],

  /* Supplied by the institute and reproduced as written. No heading: the page
     banner above it already says "Director's Message". */
  directorMessage: [
    {
      heading: null,
      lines: [
        'It gives me immense pleasure to welcome you to Vivekananda Institute of Management Science and Technology (VIMST).',
        'At VIMST, we believe that education is not merely the acquisition of knowledge, but a continuous process of developing competence, character, confidence, and a strong sense of responsibility. Our endeavour is to create an academic environment where students are encouraged to think independently, develop professional skills, embrace innovation, and prepare themselves to meet the evolving demands of the professional world.',
        'Since our establishment, we have remained committed to promoting quality education, academic excellence, professional development, and ethical values. Our academic approach focuses on combining sound theoretical knowledge with practical exposure so that learners can confidently apply their knowledge in real-world situations.',
        'We are committed to providing our students with a supportive and intellectually stimulating learning environment through dedicated faculty, structured academic programmes, professional guidance, and opportunities for overall development. We also encourage our students to cultivate leadership qualities, teamwork, communication skills, creativity, and a lifelong commitment to learning.',
        'Inspired by the ideals and vision of Swami Vivekananda, VIMST strives to nurture individuals who are not only professionally capable but also socially responsible and value-driven. We believe that true education empowers individuals to discover their potential and contribute meaningfully to society.',
        'I invite students, parents, academic professionals, and all stakeholders to become a part of the VIMST family and join us in our journey towards creating a future driven by knowledge, innovation, integrity, and excellence.',
        'With best wishes for a bright and successful future.',
        'Director',
        'Vivekananda Institute of Management Science and Technology (VIMST)',
      ],
    },
  ],
};

/* ------------------------------------------------------------------
   Home page
   ------------------------------------------------------------------ */

export const HOME_COPY = {
  about:
    'Established in 1997, Vivekananda Institute of Management Science and Technology is an educational institution committed to promoting accessible, structured, and career-oriented education. Programmes are offered through Regular and Part-Time modes, giving students and working professionals the flexibility to pursue their academic and professional development alongside their other commitments. Our faculty come from the pool of Professors, Associate Professors and Assistant Professors under the Department of Technical Education.',

  director:
    'It gives me immense pleasure to welcome you to Vivekananda Institute of Management Science and Technology (VIMST).',

  news: [
    'Admissions are open for the new session. Vivekananda Institute of Management Science and Technology offers a wide range of undergraduate and postgraduate courses in engineering and management. Fill in the enquiry form and one of our counsellors will contact you.',
  ],

  discover: {
    'Indian Knowledge System':
      'The Centre for Indian Knowledge Systems at the institute supports research across every aspect of IKS. It works to spread the rich heritage and traditional knowledge of our country.',
    'Viksit Bharat @2047':
      'The goal of the country is a developed and self reliant India. Every citizen has a part in it. Public participation is the means by which even the largest resolutions get accomplished.',
    Placement:
      'The Placement Cell offers internships and job opportunities through the year. It keeps the institute connected to industry through experts, coaches and alumni, and it prepares students for the process itself, from writing a CV to handling group discussions and interviews.',
    Library:
      'The college library is among the largest in the region, both in space and in what it holds. It runs on modern ICT infrastructure and gives students access to electronic resources as well as more than 101,000 books.',
  },
};

/* ------------------------------------------------------------------
   Course pages
   ------------------------------------------------------------------ */

/**
 * Course prose falls into a small number of repeated shapes: a paragraph
 * introducing the subject, a list of objectives, an eligibility line and a
 * duration line. These rewrite the shapes that appeared on many pages at once.
 *
 * Facts stay exactly as they were. Only the wording changes.
 */
/** "Three Year" in the source needs a plural to read correctly. */
const plural = (phrase) =>
  phrase
    .toLowerCase()
    .replace(/\byear\b/g, 'years')
    .replace(/\bsemester\b/g, 'semesters')
    .trim();

export const SECTION_REWRITES = [
  // The long inherited programme descriptions, rewritten in plain English.
  // Kept in their own file because there are fifty-odd of them and each runs
  // to a paragraph; see scripts/course-copy.mjs.
  ...COURSE_REWRITES,
  [
    /^The candidate who has successfully completed 10\/10\+2 with Physics, Mathematics, Chemistry\s*\/\s*Diploma with work experience\.?$/i,
    'You need to have passed Class 10 or Class 12 with Physics, Mathematics and Chemistry, or to hold a diploma. Work experience in the field is preferred.',
  ],
  [
    /^The candidate who has successfully completed 10\+2 with Physics, Mathematics, Chemistry\s*\/\s*Diploma with work experience\.?$/i,
    'You need to have passed Class 12 with Physics, Mathematics and Chemistry, or to hold a diploma. Work experience in the field is preferred.',
  ],
  [
    /^The candidate who has successfully completed 10th with work experience\.?$/i,
    'You need to have passed Class 10. Work experience in the field is preferred.',
  ],
  [
    /^The candidate who has successfully(?: completed)? 10th with PCM with work experience\.?$/i,
    'You need to have passed Class 10 with Physics, Chemistry and Mathematics. Work experience in the field is preferred.',
  ],
  [
    /^The candidate who has successfully completed graduation\s*\/\s*Diploma with work experience\.?$/i,
    'You need to be a graduate, or to hold a diploma. Work experience in the field is preferred.',
  ],
  [
    /^The Candidate who has successfully completed three years of diploma or Its equivalent after 10th standard is eligible.*$/i,
    'You need to have completed a three year diploma, or an equivalent qualification, after Class 10.',
  ],
  [
    /^The candidate who has successfully completed 10\+2.*with work experience\.?$/i,
    'You need to have passed Class 12. Work experience in the field is preferred.',
  ],
  // Objectives were all written as "To demonstrate ...", which reads as a
  // syllabus rather than as something addressed to a student.
  [
    /^To demonstrate a sound knowledge in (.+?)\.?$/i,
    (_m, rest) => `Build a sound working knowledge of ${rest}.`,
  ],
  [
    /^To demonstrate a substantial understanding of (.+?)\.?$/i,
    (_m, rest) => `Understand ${rest} in depth.`,
  ],
  [
    /^To demonstrate professional competence in (.+?)\.?$/i,
    (_m, rest) => `Work competently and professionally in ${rest}.`,
  ],
  [
    /^To carry out the required analysis and synthesis involved in (.+?)\.?$/i,
    (_m, rest) => `Carry out the analysis and design work involved in ${rest}.`,
  ],
  [
    /^To develop sound practical skills to enable them to addressing (.+?)\.?$/i,
    (_m, rest) => `Develop the practical skills to tackle ${rest}.`,
  ],
  [
    /^To develop (.+?)\.?$/i,
    (_m, rest) => `Develop ${rest}.`,
  ],
  [
    /^To (?:be able to )?apply (.+?)\.?$/i,
    (_m, rest) => `Apply ${rest}.`,
  ],
  // Eligibility and admission, stated plainly.
  [
    /^Candidates who have passed Intermediate \(12th\) in any stream from a recognized board but should have basic knowledge of computers or have computers as a subject in intermediate exams\.?$/i,
    'You need to have passed Intermediate, or Class 12, in any stream from a recognised board. You also need a basic working knowledge of computers, or to have taken computers as a subject at Intermediate level.',
  ],
  [
    /^The candidate who has successfully completed B\.?E\/?B\.?Tech with work experience\.?$/i,
    'You need to have completed a B.E. or B.Tech. Work experience in the field is preferred.',
  ],
  [
    /^Candidates who have passed Intermediate \(12th\) in any stream from a recognized board\.?$/i,
    'You need to have passed Intermediate, or Class 12, in any stream from a recognised board.',
  ],
  // Duration, in the form students actually ask about. The source writes this
  // sentence five different ways, so each shape gets its own pattern, longest
  // first. Every one of them ends in the same voice.
  [
    /^The Program Duration for (.+?) will be (.+?) comprising of (.+?), Students may choose to take breaks in between subjects\/(?:semesters|parts)\. However, they are expected to follow a normative period of (.+?) i\.\s?e\.? Students will have to complete the program within (.+?) from session start date\.?$/i,
    (_m, course, years, sems, _norm, limit) =>
      `${course} runs for ${plural(years)}, made up of ${sems.toLowerCase()}. You may take breaks between subjects or semesters if you need to. You have up to ${plural(limit)} from the start of your session to finish.`,
  ],
  [
    /^The Program Duration for (.+?) will be (.+?) comprising of (.+?), Students may choose to take breaks in between subjects\/(?:semesters|parts)\.?$/i,
    (_m, course, years, sems) =>
      `${course} runs for ${plural(years)}, made up of ${sems.toLowerCase()}. You may take breaks between subjects or semesters if you need to.`,
  ],
  // The BBA page splits this sentence over two paragraphs, so the second half
  // arrives on its own.
  [
    /^However, they are expected to follow a normative period of (.+?) i\.\s?e\.? Students will have to complete the program within (.+?) from session start date\.?$/i,
    (_m, _norm, limit) =>
      `You have up to ${plural(limit)} from the start of your session to finish.`,
  ],
  [
    /^The Program Duration for (.+?) will be (.+?) comprising\.?$/i,
    (_m, course, years) => `${course} runs for ${plural(years)}.`,
  ],
  [
    /^The Program Duration for (.+?) will be (.+?)\.?$/i,
    (_m, course, years) => `${course} runs for ${plural(years)}.`,
  ],
];

/**
 * Tidies whatever prose is left after the rewrites above: removes the dashes
 * that were asked to go, fixes the spacing and punctuation the original was
 * careless with, and leaves sentences that end properly.
 */
/**
 * A heading is a label, not a sentence, so it keeps the cleanup but never
 * gains closing punctuation.
 */
export function tidyHeading(heading) {
  return tidy(heading).replace(/[.:;,]+$/, '').trim();
}

export function tidy(line) {
  let out = line;

  // Em and en dashes out, as asked. A dash between clauses becomes a comma;
  // a dash acting as a bullet or a range becomes a plain word or a colon.
  out = out.replace(/\s+[—–]\s+/g, ', ');
  out = out.replace(/^[—–]\s*/, '');
  out = out.replace(/[—–]/g, '-');

  // Spacing the original got wrong in a lot of places.
  out = out.replace(/\s+([,.;:])/g, '$1');

  // A missing space after punctuation, but not after the full stop inside a
  // degree abbreviation: B.Com and M.Tech must not become "B. Com".
  out = out.replace(/(?<!\b[A-Z])([,.;:])(?=[A-Za-z])/g, '$1 ');

  // One page writes the length as a numeral while every other writes it out.
  out = out.replace(/\b2 years\b/g, 'two years');

  // Degree codes arrive lowercased in places: B.sc, M.com, B.tech.
  out = out.replace(
    /\b([BM])\.(sc|com|tech|ed|a|e)\b/g,
    (_m, level, name) => `${level}.${name[0].toUpperCase()}${name.slice(1)}`
  );

  // The source writes those abbreviations both ways; settle on the closed one.
  out = out.replace(/\b([A-Z])\.\s+(?=(?:Com|Sc|Tech|Ed|Arch|Pharm|Des|E|A)\b)/g, '$1.');

  out = out.replace(/\s{2,}/g, ' ');
  out = out.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');

  // Curly quotes and apostrophes, so the page is typographically consistent.
  out = out.replace(/'/g, '’');

  out = out.trim();

  // A sentence that trails off without punctuation reads as truncated.
  if (out && !/[.!?:;)\]"’]$/.test(out)) out += '.';

  return out;
}
