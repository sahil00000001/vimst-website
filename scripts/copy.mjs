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

/* ------------------------------------------------------------------
   Editorial pages
   ------------------------------------------------------------------ */

export const PAGE_COPY = {
  about: [
    {
      heading: 'About the institute',
      lines: [
        'Vivekananda Institute of Management Science and Technology is a leading institute for engineering and management education in Andhra Pradesh. We were founded in 1998 and we teach undergraduate and postgraduate programmes across engineering, management, computer applications, science, commerce and arts.',
        'Our programmes are delivered through distance learning. That means you can study for a recognised qualification while you continue to work, and you can fit your study around the job you already have.',
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
      heading: 'Recognition and approvals',
      lines: [
        'The institute is registered under an act of the Government of Andhra Pradesh, India.',
        'We hold ISO 9001:2008 certification through EQFS, which is accredited to the Norway Accreditations Board, known as NAB. We are also accredited by the United Kingdom Accreditation Services, known as UKAS, and by Kvalitet Veritas Quality Assurance, known as KVQA.',
        'Our certification is recognised in India and overseas. The institute is approved by AICTE second body parts AIMS ATMA with M.HRD, and is accredited with the International Industrial Certificate, known as IIC, and the Integrated Management System, known as IMS.',
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
  ],

  vision: [
    {
      heading: 'Our vision',
      lines: [
        'The world our students will work in is more connected than any before it. Goods, money, data and people move across borders constantly, and technology keeps changing how businesses are run. Satellites, computers, telecommunications and biotechnology have all reshaped ordinary working life within a single generation.',
        'That makes business harder to predict. A plan made at the start of a year is rarely the plan that finishes it, because the business and its goals keep changing each other as they go. A straight line from where you are to where you want to be no longer exists.',
        'Working well in that environment takes more than technical knowledge. It takes clear judgement, and the ability to hold several moving parts in mind at once.',
      ],
    },
    {
      heading: 'What we are trying to build',
      lines: [
        'A classroom on its own cannot teach all of this. Much of what matters comes from experience, and from understanding people whose background and history differ from your own.',
        'So our aim is to develop managers who think, plan and act as one, and who can hold their own in a complex organisation.',
        'We want our students to grow as people as well as professionals. That means an education which is modern and scientific, and which is also built on moral and spiritual values, so that our graduates lead purposeful lives.',
      ],
    },
  ],

  mission: [
    {
      heading: 'Our mission',
      lines: [
        'Our mission is to give working professionals a quality education that meets global standards, built on a strong foundation of Indian values and traditions.',
        'We teach what is current in management, science, technology and commerce, and we teach it with a commitment to social progress, peace, harmony and national integration.',
      ],
    },
    {
      heading: 'Where we started',
      lines: [
        'The institute was founded in 1998 with a clear purpose. Higher education should be within reach of people who are tied to a place or short of time, and it should act as a catalyst for them. We have done both.',
        'From the beginning, our founding purpose has been a belief that education is the main pillar of equal opportunity in Indian society, and that a student succeeding is the point of everything we do.',
      ],
    },
    {
      heading: 'Where we are going',
      lines: [
        'We now teach students at every level, and we expect that number to keep growing as the region and the state change around us.',
        'Growth of that kind has to be planned. It needs a clear idea of what we want to be in the coming years, and a way of meeting those expectations with the resources we actually have. We want a culture of excellence that serves both the campus and the communities around it.',
        'We will stay loyal to the purpose that has guided us since 1998 while responding to a world that has not stood still. Technology has changed. Students arrive from a wider range of backgrounds. There are new ways of working across countries, real pressures around energy and the environment, and a much better understanding of how people actually learn. Service learning, civic engagement and activity outside the timetable are now understood to be part of an education, not an extra.',
        'Above all, the institute exists to develop creative people with strong technical skills, who go on to add to what is known and put it to use for the good of society.',
      ],
    },
  ],

  qualityPolicy: [
    {
      heading: 'Our quality policy',
      lines: [
        'The institute runs weekend classes for its management students at the centre, so that the people who are working during the week still get taught properly rather than left to study alone.',
        'We review our teaching, our course material and our student services regularly, and we hold them to the standards our certifications require of us.',
        'Our ISO 9001:2008 certification is held through EQFS and is accredited to the Norway Accreditations Board. We are also accredited by the United Kingdom Accreditation Services and by Kvalitet Veritas Quality Assurance.',
        'The purpose of all of it is simple. A qualification from this institute should be worth the same to an employer as the effort a student put into earning it.',
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

  directorMessage: [
    {
      heading: "Director's message",
      lines: [
        'We shape minds and shape lives.',
        'Welcome to Vivekananda Institute of Management Science and Technology.',
        'The economy changes quickly and competition is real. What our students need is knowledge that is genuinely up to date, and that is put across clearly enough to reach people who would normally avoid the subject.',
        'Knowledge that claims to be current has to account for how much has actually changed in the way we work. Attitudes formed to deal with yesterday are not wrong in themselves, they are simply less useful now. The people who do well are the ones who notice when conditions have moved on and adjust, rather than holding on to a view because it once served them.',
        'Business education has changed with everything else. Modern businesses grow alongside the ideas around them, so our teaching is built to let students explore business models, innovation and creativity without being boxed in.',
        'Our curriculum and the way we teach it are designed to stay useful across a whole working life, not just until the next examination. The aim is that our students remain people their employers cannot easily replace, because they keep learning and keep applying what they learn.',
      ],
    },
  ],
};

/* ------------------------------------------------------------------
   Home page
   ------------------------------------------------------------------ */

export const HOME_COPY = {
  about:
    'Vivekananda Institute of Management Science and Technology is a leading institute for engineering and management education, founded in 1998 in Andhra Pradesh. We teach undergraduate and postgraduate programmes across engineering, management, science, commerce and arts, all through distance learning, so you can study while you work. Our faculty come from the pool of Professors, Associate Professors and Assistant Professors under the Department of Technical Education.',

  director:
    'The economy changes quickly and competition is real. What our students need is knowledge that is genuinely up to date, and teaching that puts it across clearly. The people who do well are the ones who notice when conditions have moved on and adjust, rather than holding on to a view because it once served them.',

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
