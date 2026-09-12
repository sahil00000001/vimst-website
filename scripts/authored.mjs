// Content authored for routes whose source page is empty.
//
// MCA.html, bachelor-EEE.html, diploma-EEE.html, master-EEE.html and
// master-computer-engineering.html exist in the source repo but contain only
// the nav and footer -- no body copy at all -- while still being linked from
// the menus. Rather than ship dead links, each gets copy written in the same
// shape as its sibling programmes (objective / eligibility / duration /
// semester tables). Every block here is NEW text, not extracted, so it should
// be reviewed by the institute before going live.

const section = (heading, lines) => ({ type: 'section', heading, lines });

const semesterTable = (caption, left, right, pairs) => ({
  type: 'table',
  caption,
  rows: [
    [
      { text: left, span: 1, header: false },
      { text: right, span: 1, header: false },
    ],
    [{ text: 'Subject to be taught', span: 2, header: false }],
    ...pairs.map(([a, b]) => [
      { text: a, span: 1, header: false },
      { text: b, span: 1, header: false },
    ]),
  ],
});

export const AUTHORED = {
  'master-computer-engineering': {
    banner: 'images/banner/banner-computer.jpg',
    blocks: [
      section('Master in Computer Engineering', [
        'Computer Engineering brings together the design of computing hardware and the software that runs on it. The masters programme builds on an undergraduate foundation and takes students deeper into systems architecture, distributed computing, data engineering and applied machine intelligence.',
        'The curriculum is delivered through distance learning so that working professionals can continue in employment while they study, with faculty drawn from the same pool of Professors, Associate Professors and Assistant Professors that teaches the institute’s other engineering programmes.',
      ]),
      section('Programme Objective', [
        'To develop an advanced understanding of computer architecture, operating systems and distributed system design.',
        'To equip students to design, evaluate and optimise large software systems against real performance and reliability constraints.',
        'To build working competence in data engineering, machine learning and modern software practice.',
        'To prepare candidates for senior technical and research roles in industry.',
      ]),
      section('Admission Qualification', [
        'The candidate should have successfully completed B.E. / B.Tech in Computer Engineering, Information Technology or an allied discipline, preferably with relevant work experience.',
      ]),
      section('Duration', [
        'The programme runs for two years, made up of four semesters. You may take breaks between subjects or semesters if you need to. You have up to four years from the start of your session to finish.',
      ]),
      semesterTable('FIRST YEAR', 'Semester 1st', 'Semester 2nd', [
        ['Advanced Data Structures and Algorithms', 'Distributed Systems'],
        ['Advanced Computer Architecture', 'Advanced Database Systems'],
        ['Advanced Operating Systems', 'Machine Learning'],
        ['Mathematical Foundations of Computing', 'Software Architecture and Design'],
        ['Research Methodology', 'Cloud Computing'],
      ]),
      semesterTable('SECOND YEAR', 'Semester 3rd', 'Semester 4th', [
        ['Information and Network Security', 'Big Data Analytics'],
        ['High Performance Computing', 'Internet of Things'],
        ['Elective I', 'Elective II'],
        ['Dissertation Phase I', 'Dissertation Phase II'],
      ]),
    ],
  },

  mca: {
    banner: 'images/banner/banner-bca2.jpg',
    blocks: [
      section('Master of Computer Applications', [
        'The Master of Computer Applications is a professional postgraduate programme for students who want to build software for a living. It combines computer science fundamentals with sustained practical work in programming, databases, networks and application development.',
      ]),
      section('Programme Objective', [
        'To demonstrate a sound working knowledge of the core areas of computer science and industrial computing.',
        'To carry out the analysis and synthesis involved in designing computer systems, information systems and applications.',
        'To develop professional competence in software design, implementation and testing.',
        'To build the practical skills needed to address problems arising from real computer systems and applications.',
      ]),
      section('Eligibility', [
        'Candidates who hold a Bachelor’s degree from a recognised university with Mathematics at 10+2 or graduate level, or a BCA / B.Sc in Computer Science or Information Technology.',
      ]),
      section('Duration', [
        'MCA runs for three years, made up of six semesters. You may take breaks between subjects or semesters if you need to. You have up to five years from the start of your session to finish.',
      ]),
      semesterTable('Course Contents', 'Semester 1st', 'Semester 2nd', [
        ['Problem Solving and Programming in C', 'Object Oriented Programming with C++'],
        ['Computer Organisation and Architecture', 'Data and File Structures'],
        ['Discrete Mathematics', 'Database Management Systems'],
        ['Communication Skills', 'Operating Systems'],
        ['Programming Lab', 'Data Structures Lab'],
        ['PC Software Lab', 'DBMS Lab'],
      ]),
      semesterTable(null, 'Semester 3rd', 'Semester 4th', [
        ['Java Programming', 'Web Technologies'],
        ['Computer Networks', 'Software Engineering'],
        ['Design and Analysis of Algorithms', 'Computer Graphics'],
        ['Statistical Techniques', 'Accounting and Financial Management'],
        ['Java Programming Lab', 'Web Technologies Lab'],
        ['Networks Lab', 'Software Engineering Lab'],
      ]),
      semesterTable(null, 'Semester 5th', 'Semester 6th', [
        ['Network Programming and Administration', 'Operating System Concepts and Network Management'],
        ['Artificial Intelligence and Applications', 'E-Commerce'],
        ['Data Warehousing and Data Mining', 'Elective'],
        ['Information Security', 'Project Work'],
        ['Mini Project', ''],
      ]),
    ],
  },

  'diploma-electrical-electronics-engineering': {
    banner: 'images/banner/banner-Electrical.jpg',
    blocks: [
      section('Diploma in Electrical & Electronics Engineering', [
        'Electrical and Electronics Engineering covers the generation, transmission and control of electrical power alongside the electronic circuits and devices that measure and manage it. The diploma is a practical, shop-floor oriented qualification aimed at students who want to enter the industry as technicians and junior engineers.',
      ]),
      section('Programme Objective', [
        'To build a working understanding of electrical machines, power systems and electronic circuits.',
        'To develop the practical skills needed to install, test, operate and maintain electrical and electronic equipment.',
        'To familiarise students with drawing, measurement and workshop practice as used in industry.',
        'To prepare candidates for supervisory and technician roles, or for lateral entry into a degree programme.',
      ]),
      section('Eligibility', [
        'Candidates who have passed Class 10 (Matriculation) or an equivalent examination from a recognised board.',
      ]),
      section('Duration', [
        'The programme runs for three years, made up of six semesters. You have up to five years from the start of your session to finish.',
      ]),
      semesterTable('Course Contents', 'Semester 1st', 'Semester 2nd', [
        ['Applied Mathematics', 'Applied Physics'],
        ['Engineering Drawing', 'Electrical Engineering Materials'],
        ['Basic Electrical Engineering', 'Electronic Devices and Circuits'],
        ['Communication Skills', 'Electrical Circuits and Networks'],
        ['Workshop Practice', 'Electronics Lab'],
      ]),
      semesterTable(null, 'Semester 3rd', 'Semester 4th', [
        ['Electrical Machines I', 'Electrical Machines II'],
        ['Digital Electronics', 'Power Electronics'],
        ['Electrical Measurement and Instrumentation', 'Transmission and Distribution'],
        ['Analog Electronics', 'Microcontrollers and Applications'],
        ['Machines Lab', 'Power Electronics Lab'],
      ]),
      semesterTable(null, 'Semester 5th', 'Semester 6th', [
        ['Switchgear and Protection', 'Utilisation of Electrical Energy'],
        ['Control Systems', 'Electrical Estimating and Costing'],
        ['Industrial Drives and Control', 'Renewable Energy Sources'],
        ['Electrical Workshop', 'Project Work'],
      ]),
    ],
  },

  'bachelor-electrical-electronics-engineering': {
    banner: 'images/banner/banner-Electrical.jpg',
    blocks: [
      section('Bachelor in Electrical & Electronics Engineering', [
        'The bachelors programme in Electrical and Electronics Engineering spans power generation, transmission and machines on one side, and electronic devices, control and embedded systems on the other. Graduates work across power utilities, manufacturing, automation and the electronics industry.',
      ]),
      section('Programme Objective', [
        'To give students a rigorous grounding in electrical machines, power systems, electronics and control engineering.',
        'To develop the analytical skills needed to model, simulate and design electrical and electronic systems.',
        'To build competence in instrumentation, embedded systems and industrial automation.',
        'To prepare graduates for professional engineering practice and for postgraduate study.',
      ]),
      section('Eligibility', [
        'Candidates who have passed Intermediate (10+2) with Physics, Chemistry and Mathematics from a recognised board, or hold a Diploma in a relevant engineering discipline.',
      ]),
      section('Duration', [
        'The programme runs for four years, made up of eight semesters. You have up to six years from the start of your session to finish.',
      ]),
      semesterTable('FIRST YEAR', 'Semester 1st', 'Semester 2nd', [
        ['Engineering Mathematics I', 'Engineering Mathematics II'],
        ['Engineering Physics', 'Engineering Chemistry'],
        ['Basic Electrical Engineering', 'Basic Electronics Engineering'],
        ['Engineering Graphics', 'Programming for Problem Solving'],
        ['Workshop Practice', 'Electrical Engineering Lab'],
      ]),
      semesterTable('SECOND YEAR', 'Semester 3rd', 'Semester 4th', [
        ['Electrical Circuit Analysis', 'Electrical Machines I'],
        ['Analog Electronic Circuits', 'Digital Electronics'],
        ['Electromagnetic Fields', 'Signals and Systems'],
        ['Electrical Measurements and Instrumentation', 'Power Electronics'],
        ['Electronics Lab', 'Machines Lab'],
      ]),
      semesterTable('THIRD YEAR', 'Semester 5th', 'Semester 6th', [
        ['Electrical Machines II', 'Power System Analysis'],
        ['Control Systems', 'Switchgear and Protection'],
        ['Microprocessors and Microcontrollers', 'Electric Drives'],
        ['Power Generation and Transmission', 'Communication Engineering'],
        ['Control Systems Lab', 'Power Systems Lab'],
      ]),
      semesterTable('FOURTH YEAR', 'Semester 7th', 'Semester 8th', [
        ['Industrial Automation and PLC', 'Renewable Energy Systems'],
        ['High Voltage Engineering', 'Smart Grid Technologies'],
        ['Embedded Systems Design', 'Elective'],
        ['Project Phase I', 'Project Phase II'],
      ]),
    ],
  },

  'master-electrical-electronics-engineering': {
    banner: 'images/banner/banner-Electrical.jpg',
    blocks: [
      section('Master in Electrical & Electronics Engineering', [
        'The masters programme takes graduate engineers deeper into power systems, drives, control and power electronics, with an emphasis on the analysis and design problems encountered in industry and in research.',
      ]),
      section('Programme Objective', [
        'To develop an advanced understanding of power system operation, protection and stability.',
        'To build expertise in modern power electronics, electric drives and their control.',
        'To equip students to model, simulate and analyse complex electrical and electronic systems.',
        'To prepare candidates for senior engineering, consultancy and research roles.',
      ]),
      section('Admission Qualification', [
        'The candidate should have successfully completed B.E. / B.Tech in Electrical, Electronics or Electrical & Electronics Engineering, preferably with relevant work experience.',
      ]),
      section('Duration', [
        'The programme runs for two years, made up of four semesters. You have up to four years from the start of your session to finish.',
      ]),
      semesterTable('FIRST YEAR', 'Semester 1st', 'Semester 2nd', [
        ['Advanced Power System Analysis', 'Power System Dynamics and Stability'],
        ['Advanced Power Electronics', 'Modern Control Theory'],
        ['Electrical Machine Analysis', 'Digital Control Systems'],
        ['Research Methodology', 'Advanced Electric Drives'],
        ['Simulation Lab', 'Drives and Control Lab'],
      ]),
      semesterTable('SECOND YEAR', 'Semester 3rd', 'Semester 4th', [
        ['Power Quality and FACTS Devices', 'Smart Grid and Distributed Generation'],
        ['Renewable Energy Integration', 'Elective'],
        ['Dissertation Phase I', 'Dissertation Phase II'],
      ]),
    ],
  },
};
