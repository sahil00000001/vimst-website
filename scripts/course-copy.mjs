/**
 * Plain-English rewrites for the long course descriptions.
 *
 * The programme pages were inherited as dense single paragraphs, several of
 * them 700 to 1,200 words long, written in the third person and in places
 * plainly machine-translated ("the ergonomic one", "a race in the engineering
 * of the automobile"). They are the last of the site's prose still in the old
 * voice, so they are rewritten here in the same register as the rest: short
 * sentences, everyday words, addressed to the person reading.
 *
 * Every fact is kept. Named employers, named specialisations, eligibility
 * percentages, subject lists and country names all survive the rewrite; only
 * the sentences around them change. Where the source was truncated mid-thought
 * ("in-depth knowledge of traditional.") the sentence is finished rather than
 * invented on.
 *
 * Each entry is `[pattern, replacement]` and is appended to SECTION_REWRITES,
 * where the first pattern that matches a line wins. Patterns are anchored at
 * the start of the line and are long enough to be unambiguous. Several
 * paragraphs appear on two or three programme pages with a spelling variant
 * between them ("analyse"/"analyze", "nanotechnology"/"nano technology"); one
 * entry covers all of them, which is why some patterns are loose in the middle.
 *
 * Order matters where one paragraph starts with another: the longer, more
 * specific pattern is listed first.
 */
export const COURSE_REWRITES = [
  /* ---------------- automobile ---------------- */

  // Master's page carries the diploma paragraph and the first half of the
  // careers paragraph joined together, so it has to be matched before the
  // shorter version below it.
  [
    /^Automobile engineering is one of the most challenging careers[\s\S]*Automobile engineer includes product design engineer/i,
    'Automobile engineering is one of the more demanding careers you can choose, and because people want vehicles and care about them, there is plenty of work in India and abroad. The subject covers designing a vehicle, manufacturing new vehicles and new products, and repairing and servicing what is already on the road. It asks for someone inventive who is willing to keep at a problem. The field breaks into several areas, and you will study motor systems, vehicle design and the technology behind both. Automobile engineers work as product design engineers, development engineers or manufacturing engineers. A manufacturing engineer plans the layout of the line and makes the safety components. A product designer designs the systems in the vehicle and tests them. A development engineer looks after delivery and after the customer, and improves the vehicle in response to what customers say.',
  ],
  [
    /^Automobile engineering is one of the most challenging careers/i,
    'Automobile engineering is one of the more demanding careers you can choose, and because people want vehicles and care about them, there is plenty of work in India and abroad. The subject covers designing a vehicle, manufacturing new vehicles and new products, and repairing and servicing what is already on the road. It asks for someone inventive who is willing to keep at a problem. The field breaks into several areas, and you will study motor systems, vehicle design and the technology behind both.',
  ],
  [
    /^Automobile engineer includes product design engineer/i,
    'Automobile engineers work as product design engineers, development engineers or manufacturing engineers. A manufacturing engineer plans the layout of the line and makes the safety components. A product designer designs the systems in the vehicle and tests them. A development engineer looks after delivery and after the customer, and improves the vehicle in response to what customers say. Later on you can specialise: aerodynamics, fuels, the chassis, electronics, emissions, ergonomics, manufacturing, materials, rapid prototyping, safety or management. Whichever you choose, the job is to keep the vehicle performing at its best, using both established methods and the newest technology. The motor industry in India has grown quickly in recent years and the demand for skilled people has risen with it, so the work is interesting and it pays well.',
  ],
  [
    /^The future engineers of the automobile can specialize/i,
    'Later on you can specialise: aerodynamics, fuels, the chassis, electronics, emissions, ergonomics, manufacturing, materials, rapid prototyping, safety or management. Whichever you choose, the job is to keep the vehicle performing at its best, using both established methods and the newest technology. The motor industry in India has grown quickly in recent years and the demand for skilled people has risen with it, so the work is interesting and it pays well.',
  ],
  [
    /^An automobile engineer can work in automobile-manufacturing unit/i,
    'An automobile engineer can work in a manufacturing plant or at a service station. Companies including TELCO, Bajaj Auto, L&T, Mahindra and Mahindra, Gabriel, Heldex India and Ashok Leyland recruit through campus drives at colleges and universities across the country. You can also work for yourself by setting up a garage or a workshop. Indian engineers are in demand abroad as well, particularly in the Middle East.',
  ],

  /* ---------------- chemical ---------------- */

  [
    /^Chemical engineering is the branch of engineering that deals with the application of physical science/i,
    'Chemical engineering applies physical science, chemistry and physics in particular, along with mathematics, to the job of turning raw materials and chemicals into something more useful or more valuable. It is not only about making what is already known. A large part of the work is research and development: finding new materials, and better ways of making them.',
  ],
  [
    /^Chemical engineering largely involves the design and maintenance of chemical processes/i,
    'Most chemical engineering is the design and upkeep of chemical processes for manufacturing at scale, and the usual job title for that work is process engineer. It means turning basic raw materials into finished products, and looking after both the plant and the equipment that does it. The work falls into three broad kinds. Chemical process engineers design, build and run the plants and machinery used in industrial chemical processes. Chemical product engineers develop new or improved substances, for everything from food and drink to cosmetics, cleaning products and pharmaceutical ingredients. A third group works on newer technology such as fuel cells, hydrogen power and nanotechnology, and in the fields that have grown out of chemical engineering, including materials science, polymer engineering and biomedical engineering.',
  ],
  [
    /^Chemical engineering is applied chemistry, concerned with the design/i,
    'Chemical engineering is applied chemistry. It covers the design, construction and running of the machines and plants that carry out chemical reactions, either to solve a practical problem or to make something useful. The work is about change: first understanding a substance properly, then using that understanding to build an answer to a real medical, mechanical or social need. Face cream and fuel both come out of the same science.',
  ],
  [
    /^Candidates who have acquired BE\/B\. ?Tech\/AMIE or equivalent degree/i,
    'You are eligible if you hold a BE, B.Tech, AMIE or equivalent degree in computer science, information science, electronics and communication engineering, telecommunication engineering, or electrical and electronics engineering, with at least 50% marks in aggregate. For candidates in the SC, ST and Group categories the requirement is at least 45%. Admission is through central counselling on merit in PGCET or GATE. A few seats are also available under the sponsored and management quotas. Candidates who have qualified in GATE are eligible for an AICTE scholarship.',
  ],

  /* ---------------- civil ---------------- */

  [
    /^Civil engineering is the term for the work of designing and building infrastructure/i,
    'Civil engineering is the work of designing and building infrastructure. Usually that means large structures: bridges, dams, buildings and tunnels. It also covers networks such as water supply, irrigation and sewerage, and the building of houses and homes. A civil engineer can be involved at every stage in the life of a structure, from planning and construction through to maintenance and demolition. The work often overlaps with architecture.',
  ],
  [
    /^Civil engineering is concerned with the design, construction and maintenance of structures/i,
    'Civil engineering covers the design, construction and maintenance of structures: bridges, roads, buildings, dams and waterways. For many years the job was mainly about designing and building new things, such as buildings, bridges and highways, water treatment and environmental works, foundations and tunnels. A civil engineer today still does that, but also has to judge how existing infrastructure is wearing out, how one system depends on another, and what a structure costs over its whole life, both to the environment and to the people who use it. That takes a deep grounding in the traditional subjects of the field.',
  ],
  [
    /^Civil Engineering is one of the broadest of the engineering disciplines/i,
    'Civil engineering is one of the broadest engineering subjects and reaches across many technical specialities. Civil engineers plan and design the facilities modern life depends on, and supervise their construction. Those facilities vary widely in kind, size and scope: space satellites and launch facilities, offshore drilling structures, bridges, buildings, highways and other transport systems, tunnels, airports, dams, harbours and much more besides. Because civil engineers design, develop and maintain projects of that size, the job asks for strong administrative and people management skills alongside the technical ones.',
  ],
  [
    /^Skilled professionals in this field are in high demand[\s\S]*Civil Diploma\/certificate holders/i,
    'Skilled people in this field are in demand in developed countries. Civil diploma and certificate holders work on the major building projects run by private construction firms, engineering services and consultancies. There is particular demand in the Middle East, and in Dubai above all, where a great deal of construction is under way. With a diploma or a certificate you can work as an assistant to a site manager, or as a supervisor.',
  ],
  [
    /^Skilled professionals in this field are in high demand/i,
    'Skilled people in this field are in demand in developed countries. Civil diploma holders work on the major building projects run by private construction firms, engineering services and consultancies. There is particular demand in the Middle East, and in Dubai above all, where a great deal of construction is under way. With a diploma you can work as an assistant to a site manager, or as a supervisor.',
  ],

  /* ---------------- computer ---------------- */

  [
    /^Computer Science and Engineering branch imparts education in hardware and software/i,
    'Computer science and engineering teaches both the hardware and the software side of computing, which now sits at the centre of almost every kind of work. The first three years cover a wide range of subjects, chosen to get you ready for industry. In the final year you put that theory into practice on a project, and the results of these projects are published in scientific journals and at conferences. The syllabus is built around what computing is actually used for in commercial, social and domestic life, so the work done in university departments and laboratories is of direct use to industry.',
  ],
  [
    /^They will be technically qualified for practice in the profession/i,
    'By the end of the course you will be qualified to practise. You will be able to specify, design and build software, and systems that combine software and hardware, either to meet what a customer has asked for or to take the field forward. You will be able to use current programming languages, tools and platforms for that work, and to bring science and mathematics to it. You will be able to explain technical work clearly, in speech and in writing, and to work well in a team on computing problems. You will be able to weigh your own choices against professional codes of ethics, and to see how your decisions affect you, your profession and the people around you. And you will know how to keep learning after you graduate, which is what keeps an engineer current. Graduates go into professional work in the private or public sector, or on to further study.',
  ],
  [
    /^Information Technology is the area of managing technology/i,
    'Information technology is the business of managing technology, and it covers a wide field: processes, computer software, information systems, computer hardware, programming languages and the way data is structured. Put simply, anything that presents data, information or knowledge in a visible form, through any medium, belongs to information technology.',
  ],
  [
    /^Information Technology professionals perform a variety of functions/i,
    'People working in IT do a wide range of jobs, from installing an application to designing a large computer network or an information database. The work can include managing data, networking, building computer hardware, designing databases and software, and running whole systems day to day. IT is also spreading well beyond the personal computer and the office network into mobile phones, televisions, cars and much else, and that is increasing the demand for people who can do this work.',
  ],

  /* ---------------- electrical ---------------- */

  [
    /^Electrical Engineering course deals with the different aspects/i,
    'The electrical engineering course covers the main parts of the subject. The syllabus takes in circuit analysis, electromagnetic machines and drive systems, power systems, control systems, power electronics and utilisation. It is built around what electrical engineering work actually calls for in industry.',
  ],
  [
    /^Electrical engineers have made remarkable contributions to our world/i,
    'Electrical engineers have changed everyday life. They helped invent the computer, DSL, the mobile phone, the microchip and the solar panel. DVD players, mobile phones, radio, television, computers, aeroplanes, spacecraft, cars, motorcycles, home appliances, life-saving medical equipment and computer games are all things electrical engineers made possible.',
  ],
  [
    /^Electrical Engineering is an exciting and dynamic field/i,
    'Electrical engineering is a fast-moving field. Electrical engineers are responsible for generating, transmitting and converting electrical power. Electronic engineers work on sending information by radio, on the design of electronic circuits and computer systems, and on control systems such as an aircraft autopilot. Both are sought after, and the career prospects are good.',
  ],
  [
    /^The objective of this course is to train students in Electrical Engineering/i,
    'The course trains you in electrical engineering. It covers the traditional areas of generating, transmitting and distributing electricity, alongside newer electronic applications from telecommunications through to computers and microprocessors. There is a great deal of well-paid work available once you finish.',
  ],
  [
    /^An Electrical engineer is required in most of industries/i,
    'An electrical engineer is needed in most industries: in manufacturing, and in the making of household and office equipment such as refrigerators, computers, microwave ovens, televisions, fans, motors and other consumer durables and white goods. After the course you can also work at nuclear, hydroelectric and thermal power plants, or anywhere else electricity is generated, transmitted, distributed or used.',
  ],
  [
    /^Electrical engineering may include electronic engineering/i,
    'Electrical engineering sometimes includes electronic engineering. Where the two are separated, which is usual outside the United States, electrical engineering deals with systems such as electric power transmission and electrical machines, while electronic engineering deals with electronic systems: computers, communication systems, integrated circuits and radar.',
  ],
  [
    /^From a different point-of-view, electrical engineers are usually concerned/i,
    'Another way to put it: electrical engineers use electricity to move power, and electronic engineers use electricity to handle information. The two overlap, as they do in power electronics, and in the study of how large electrical grids behave when digital computers and electronics are controlling them.',
  ],
  [
    /^Electrical engineering is a field of engineering that generally deals with the study and application of electricity/i,
    'Electrical engineering is the study and use of electricity, electronics and electromagnetism. It became a recognisable job in the second half of the nineteenth century, once the electric telegraph, the telephone and electric power distribution had been made commercial. It now covers a wide range of areas, including electronics, digital computers, power engineering, telecommunications, control systems, RF engineering and signal processing.',
  ],

  /* ---------------- electronics ---------------- */

  [
    /^Electronics engineering technicians help engineers design and develop/i,
    'Electronics engineering technicians help engineers design and develop electrical and electronic equipment. They also work on product evaluation and testing, on diagnostics, and on repair. Working to an engineer’s direction, a technician may design basic circuitry and draw sketches that fill in the detail of a design; build a prototype from a rough sketch or plan; assemble, test and maintain circuits and electronic components, following engineering instructions and technical manuals; adjust or replace faulty circuitry and components; trace and fix equipment faults; and carry out preventative maintenance and calibration on equipment and systems.',
  ],
  [
    /^Electronic engineering as a profession sprang from technological improvements/i,
    'Electronic engineering grew out of improvements in the telegraph industry in the late nineteenth century, and in the radio and telephone industries in the early twentieth. Radio drew people in because the technical side of it was fascinating, first receiving a signal and then transmitting one. Many of the people who went into broadcasting in the 1920s had been amateurs before the First World War.',
  ],
  [
    /^To make this institution a Center of Excellence in Electronics/i,
    'The aim is to make this a centre for electronics, with specialisations in telecommunication networks, VLSI circuit and system design, data structures, microwave theory and circuits, speech processing, digital signal processing, wireless, antenna theory and design, CMOS digital design technique, optical networks, error control coding, analogue VLSI design, biomedical signal processing, embedded system design, and information and network security.',
  ],
  [
    /^Electronics Engineering is a field of engineering that generally deals with the study of analog/i,
    'Electronics engineering is the study of sending and receiving data, voice and video, in both analogue and digital form. It covers basic electronics, solid state devices, microprocessors, microwave engineering, antennae and wave propagation. It also covers making electronic devices, circuits and communications equipment: transmitters, receivers, integrated circuits, microwaves and fibre among others. The aim is to give you a firm hold on the underlying ideas, so that you can analyse, build, run, produce and maintain the many things electronics engineering is used for.',
  ],

  /* ---------------- mechanical ---------------- */

  [
    /^Mechanical engineering is a discipline of engineering that applies the principles/i,
    'Mechanical engineering applies engineering, physics and materials science to the analysis, design, manufacture and maintenance of mechanical systems. It is the branch concerned with producing and using heat and mechanical power, and with designing, making and running machines and tools. It is one of the oldest and broadest engineering subjects.',
  ],
  [
    /^Mechanical engineering relates to the design and manufacture of mechanical systems/i,
    'Mechanical engineering is the design and manufacture of mechanical systems: the ones that power vehicles, industrial equipment and production lines, and the ones behind medical technology and military equipment. Within the field you can go further into robotics, thermodynamics, technical drawing, nanotechnology or structural analysis.',
  ],
  [
    /^The Diploma Programme in Mechanical Engineering seeks to provide/i,
    'The diploma in mechanical engineering exists to put good training within reach of people already working in manufacturing and production. It is built around what that work actually needs, and around the fact that techniques, technology, markets and jobs all keep changing. The point of the course is to make the people doing that work better at it, and more productive.',
  ],
  [
    /^The goal of this M\. ?E Course is to combine excellence and research/i,
    'This master’s course sets out to join good teaching and research to work that is useful to people, and to give you a balance of ideas and practice. Manufacturing is now spread across the world, and companies increasingly work closely with one another to stay competitive. Sharing information and knowledge well gives designers and manufacturing engineers better ground to make decisions on, so the systems that carry that information have to work across borders. That is what this course prepares you for.',
  ],
  [
    /^Mechanical engineering is one of the top most career choices/i,
    'Mechanical engineering is among the most popular subjects students in India choose, and there is a lot of work in it. Most graduates go into manufacturing firms, and there is work across private industry of many kinds. Electronics, chemicals, power plants, steel plants, agriculture and the motor industry all need mechanical engineers to design their machinery and keep it running.',
  ],

  /* ---------------- management and commerce ---------------- */

  [
    /^The goal of the bachelor of business administration \(BBA\) program/i,
    'The BBA prepares you for a career in business in a world economy. It does that by giving you the knowledge, the skills and the practical experience to handle a market that is complicated, uncertain and varied, and to make something of the openings it offers.',
  ],
  [
    /^Emphasis is given to skill development, competency development/i,
    'The course concentrates on building skills, competence, the ability to learn on the job, and a professional way of working. Alongside classroom theory about business and industry, you get a good deal of practical exposure. There is a wide choice of electives, and soft skills are worked on throughout. By the end you should be able to take charge of a full marketing function or the human resource function of a company, with particular attention to small and medium enterprises.',
  ],
  [
    /^The goal of the Bachelor in Hotel Management \(BHM\) program/i,
    'The BHM prepares you for a career in business in a world economy, by giving you the knowledge, the skills and the practical experience to handle a market that is complicated, uncertain and varied. Hotel management is the one professional course that opens up work straight after you finish. The course also encourages and supports research across the academic and practical sides of the hospitality industry.',
  ],
  [
    /^The objective of the Bachelor courses in Hotel Management/i,
    'The hotel management degree exists to meet the industry’s need for people who are good at the hospitality trade. It gives you the chance to improve both your technical and your management skills, to take proper pride in the work, and to build a firmer base for your career. The programme covers four main departments, and you specialise in one of them:',
  ],
  [
    /^The objective of the PGDBM in Business Management course/i,
    'The PGDBM in business management teaches the reasoning and the skills a manager needs: management and administration, corporate strategy, and planning for growth. With it you can work as a management or administrative executive, or as an assistant manager in administration, operations or management.',
  ],
  [
    /^The IMES MBA aims to familiarize with international business/i,
    'The IMES MBA introduces you to international business and to entrepreneurship, and builds your written communication. It shows where and how the theory is used in practice, and it puts you in touch with the rest of your year, a mix of students and working professionals spread across the country and from different backgrounds. Students form their own study groups and trade experience, which is a good part of how the international outlook is built.',
  ],
  [
    /^The program is designed to provide the knowledge and skills needed to become an effective manager/i,
    'The programme gives you the knowledge and the skills to manage well in many kinds of organisation. It is a broad degree meant to advance a career, not technical training for one particular job. The aim is to give you the grounding and the abilities that will keep making you a better manager wherever you work.',
  ],
  [
    /^The Programme of Computer Application \(DCA\/PGDCA\)/i,
    'The computer application programme (DCA and PGDCA) teaches how computers are used and what they can do. The aim is to prepare people for office automation and electronic data processing work. You are introduced to a range of application software, so that you learn both the practical use of it and the particular jobs computers are put to.',
  ],
  [
    /^This is an unique and innovative programme in many respects/i,
    'The B.Com is a broad and practical degree. It builds the knowledge and judgement industry asks for, and it teaches you to use computers and the accounting, quantitative and analytical tools that decisions are made with. The aim is a rounded education that leaves you ready to take on real responsibility at work. The course covers advanced accounting in principle and in practice, along with management, marketing, banking, auditing, company law, secretarial practice and related subjects. B.Com students can also take up ICWA or CA. The degree supplies financial institutions with people who can do financial analysis and accounting work, which the growing finance, insurance and related sectors need in large numbers. There is a wide choice of electives.',
  ],
  [
    /^The program is structured to ensure that post graduate commerce students/i,
    'The M.Com is built to give commerce postgraduates a proper footing, and to prepare you for work in a growing economy: merchant banking, credit rating analysis, insurance, and academic work. The course includes paper presentations, a summer internship and a project dissertation, and leaves room for part-time work alongside it. We also help with placement.',
  ],

  /* ---------------- science and arts ---------------- */

  [
    /^With the current boom in the bio-related industries/i,
    'The bio industries are growing quickly, and this is the option most science students are now looking at. New ground is being broken in molecular genetics and in related research around the world. Biotechnology has given rise to a number of subjects that cross disciplines, among them bioinformatics, pharmacogenomics and proteomics, and these are being used on real problems in agriculture, in health care and in the environmental sciences.',
  ],
  [
    /^B\. ?Sc programme imparts all the essential skill sets/i,
    'The B.Sc gives you the skills you need to follow higher-level ideas in modern biological science, and enough hands-on practice to tackle difficult problems at postgraduate level. One promising area of biotechnology is making pharmaceuticals in plants. Biotechnology is also behind a good deal of recent progress in medical treatment and in diagnostic equipment.',
  ],
  [
    /^Biotechnology is an interdisciplinary subject which gives in-? ?depth knowledge/i,
    'Biotechnology draws on several subjects at once and takes you deep into molecular biology, microbiology, biochemistry, genetics, cell biology and computing. It equips you to look into how life and nature work, and to put what you find to use. There is a great deal happening in genomics in particular. A postgraduate degree in biotechnology is one of the main routes open to graduates of the subjects listed below, and it leads to work in diagnostic laboratories, fermentation industries, food processing, the research and development arms of pharmaceutical companies, agricultural biotechnology and many other places where life science expertise is needed.',
  ],
  [
    /^\(a\) Microbiology \(b\) Biotechnology \(c\) Botany/i,
    'Microbiology, biotechnology, botany, applied botany, zoology, applied zoology, industrial microbiology, environmental science, genetics, applied genetics, sericulture, home science, life science, biological science, agricultural science, biochemistry, dairy sciences, horticulture, forestry and fisheries.',
  ],
  [
    /^The Bachelor of Arts is a flexible three-year degree/i,
    'The BA is a flexible three-year degree. You study a wide range of subjects while specialising in two of them, as a major and a minor or as a double major. Graduates go into tourism, the media, government, museums, libraries, banking, publishing and teaching. The subject combinations offered here are journalism, psychology, marketing and English.',
  ],
];
