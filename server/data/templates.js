/**
 * Built-in Document Templates for Google Docs Clone
 * Each template includes: id, name, category, description, previewType, defaultTitle, and pre-formatted HTML content.
 */

export const TEMPLATES = [
  {
    id: 'resume',
    name: 'Resume',
    category: 'Personal',
    description: 'Modern clean resume with experience, education, and skills.',
    previewType: 'resume',
    defaultTitle: 'Resume',
    content: `<h1>[Your Name]</h1>
<p><strong>Email:</strong> your.name@example.com | <strong>Phone:</strong> (555) 123-4567 | <strong>Location:</strong> City, State | <strong>LinkedIn:</strong> linkedin.com/in/yourprofile</p>
<hr />
<h2>Professional Summary</h2>
<p>Dedicated and results-driven professional with 5+ years of experience in driving innovation, leading cross-functional teams, and delivering high-impact solutions. Proven track record in problem solving and strategic execution.</p>
<hr />
<h2>Work Experience</h2>
<h3><strong>Senior Role Title</strong> | Company Name</h3>
<p><em>Jan 2022 – Present | Location</em></p>
<ul>
  <li>Led a high-performing team of 8 engineers and designers to launch the flagship product 2 months ahead of schedule.</li>
  <li>Architected and optimized mission-critical workflows, improving system throughput by 35%.</li>
  <li>Mentored junior team members and fostered best practices in collaboration and code quality.</li>
</ul>
<h3><strong>Role Title</strong> | Previous Company</h3>
<p><em>June 2019 – Dec 2021 | Location</em></p>
<ul>
  <li>Spearheaded development of responsive user-facing features used by over 50,000 active users.</li>
  <li>Collaborated closely with product managers and stakeholders to align technical strategy with user goals.</li>
</ul>
<hr />
<h2>Education</h2>
<h3><strong>Bachelor of Science in Computer Science</strong> | University Name</h3>
<p><em>Graduated May 2019 | GPA: 3.8 / 4.0</em></p>
<hr />
<h2>Skills &amp; Technologies</h2>
<p><strong>Languages:</strong> JavaScript, TypeScript, Python, HTML5, CSS3</p>
<p><strong>Frameworks &amp; Tools:</strong> React, Node.js, Express, MongoDB, Tailwind CSS, Git, Docker</p>`
  },
  {
    id: 'proposal',
    name: 'Project Proposal',
    category: 'Work',
    description: 'Executive project proposal covering objectives, scope, timeline, and budget.',
    previewType: 'proposal',
    defaultTitle: 'Project Proposal',
    content: `<h1>Project Proposal: [Project Title]</h1>
<p><strong>Prepared For:</strong> [Client / Executive Name] | <strong>Prepared By:</strong> [Your Name or Organization] | <strong>Date:</strong> [Current Date]</p>
<hr />
<h2>1. Executive Summary</h2>
<p>This proposal outlines the strategy, architecture, timeline, and investment required to successfully deploy the <strong>[Project Title]</strong> initiative. Our mission is to accelerate digital transformation while maximizing organizational efficiency.</p>
<h2>2. Project Objectives</h2>
<ul>
  <li>Deliver a secure, scalable, and responsive application meeting modern architectural standards.</li>
  <li>Enhance team collaboration with seamless real-time syncing and intuitive authoring tools.</li>
  <li>Achieve a 99.9% uptime reliability across all service tiers.</li>
</ul>
<h2>3. Scope of Work</h2>
<p>The project will be executed across four distinct phases: Requirements &amp; Architecture Design, Core Development &amp; Integrations, Quality Assurance &amp; Security Audits, and Production Deployment &amp; Staff Training.</p>
<h2>4. Proposed Timeline</h2>
<ul>
  <li><strong>Phase 1 (Weeks 1–3):</strong> Architecture blueprint and design specifications.</li>
  <li><strong>Phase 2 (Weeks 4–9):</strong> Frontend, API backend, and real-time database implementation.</li>
  <li><strong>Phase 3 (Weeks 10–12):</strong> End-to-end testing, user acceptance, and load verification.</li>
  <li><strong>Phase 4 (Week 13):</strong> Global launch, live monitoring, and knowledge handover.</li>
</ul>
<h2>5. Estimated Budget</h2>
<p>The total investment for the complete delivery of this project is projected at <strong>$45,000 – $60,000</strong>, including engineering, infrastructure provisioning, and initial 90-day post-launch support.</p>
<h2>6. Key Team Members</h2>
<ul>
  <li><strong>[Lead Architect]:</strong> Technical Direction &amp; Infrastructure</li>
  <li><strong>[Senior Product Designer]:</strong> UX Research &amp; Interactive Design</li>
  <li><strong>[Full-Stack Engineer]:</strong> Application Implementation &amp; API Integration</li>
</ul>`
  },
  {
    id: 'report',
    name: 'Report',
    category: 'Work',
    description: 'Formal business or academic report with structured findings.',
    previewType: 'report',
    defaultTitle: 'Business Report',
    content: `<h1>Annual Performance &amp; Research Report</h1>
<p><em>Prepared by: [Author Name] | Department: Strategy &amp; Operations | Date: [Current Date]</em></p>
<hr />
<h2>Table of Contents</h2>
<ol>
  <li>Executive Summary</li>
  <li>Introduction &amp; Objectives</li>
  <li>Key Findings &amp; Analysis</li>
  <li>Recommendations</li>
  <li>Conclusion &amp; Next Steps</li>
</ol>
<hr />
<h2>1. Executive Summary</h2>
<p>This report presents an overview of the key operational milestones, quantitative metrics, and strategic outcomes achieved over the past fiscal period. The objective is to provide stakeholders with actionable insights.</p>
<h2>2. Introduction &amp; Objectives</h2>
<p>Over the past twelve months, our primary initiative focused on enhancing system efficiency and expanding customer engagement across digital touchpoints.</p>
<h2>3. Key Findings &amp; Analysis</h2>
<p>Based on comprehensive data gathered from internal analytics and external market assessments:</p>
<ul>
  <li><strong>User Engagement:</strong> Increased by 42% following the deployment of real-time collaborative workflows.</li>
  <li><strong>Operational Efficiency:</strong> Latency reduced by 28% across document processing pipelines.</li>
  <li><strong>Customer Satisfaction:</strong> Net Promoter Score (NPS) improved from +48 to +64.</li>
</ul>
<h2>4. Recommendations</h2>
<p>We propose immediate prioritization of cloud infrastructure scaling, automated test coverage expansion, and enhanced team training.</p>
<h2>5. Conclusion &amp; Next Steps</h2>
<p>The outcomes demonstrate consistent positive momentum. Detailed tactical roadmaps for Phase 2 will be shared during the upcoming quarterly review.</p>`
  },
  {
    id: 'brochure',
    name: 'Brochure',
    category: 'Work',
    description: 'Multi-section marketing brochure featuring headline, features, and call to action.',
    previewType: 'brochure',
    defaultTitle: 'Product Brochure',
    content: `<h1>[Product or Service Name]</h1>
<p><em>Empowering Teams to Collaborate Faster, Smarter, and Seamlessly.</em></p>
<hr />
<h2>Welcome to the Next Generation</h2>
<p>Discover an intuitive platform designed from the ground up for modern teams. Whether you are drafting documents, sharing feedback, or analyzing data, our platform gives you the power and flexibility to excel.</p>

<h2>Key Features</h2>
<h3>1. Real-Time Collaboration</h3>
<p>Work synchronously with your colleagues from anywhere in the world. Enjoy zero-latency cursor tracking and real-time updates across desktop and mobile.</p>

<h3>2. Enterprise Security</h3>
<p>Your data is secured with industry-standard encryption, role-based access control, and comprehensive audit logs designed to protect your sensitive materials.</p>

<h3>3. Seamless Integrations &amp; Export</h3>
<p>Effortlessly import existing Word documents and export in high-fidelity PDF, DOCX, TXT, or HTML formats with a single click.</p>

<hr />
<h2>What Our Clients Say</h2>
<p><em>"This solution completely revolutionized our daily editorial workflow. Team turnaround time dropped by half."</em> — <strong>Jane Doe, VP of Technology</strong></p>

<h2>Get Started Today</h2>
<p>Ready to supercharge your team's productivity? Visit <strong>www.example.com</strong> or contact us at <strong>hello@example.com</strong> to book an interactive demo.</p>`
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: 'Work',
    description: 'Meeting notes with attendees, agenda items, discussion points, and action items.',
    previewType: 'meeting',
    defaultTitle: 'Meeting Notes',
    content: `<h1>Team Sync &amp; Sprint Planning Notes</h1>
<p><strong>Date &amp; Time:</strong> [Meeting Date, 10:00 AM – 11:00 AM]</p>
<p><strong>Attendees:</strong> [Jane Doe, John Smith, Alex Johnson, Taylor Swift]</p>
<p><strong>Facilitator:</strong> [Your Name] | <strong>Note Taker:</strong> [Note Taker Name]</p>
<hr />
<h2>Meeting Agenda</h2>
<ol>
  <li>Review of Previous Action Items (10 mins)</li>
  <li>Key Project Milestones &amp; Product Demo (25 mins)</li>
  <li>Blockers &amp; Technical Discussion (15 mins)</li>
  <li>Next Steps &amp; Action Item Assignments (10 mins)</li>
</ol>
<hr />
<h2>Discussion &amp; Key Decisions</h2>
<h3>1. Milestone Progress</h3>
<p>The team successfully deployed Phase 4 and completed integration tests. Positive feedback was noted regarding editor stability and document export responsiveness.</p>

<h3>2. Technical Blockers</h3>
<p>Identified a minor optimization opportunity in initial document seeding over slow cellular networks; scheduled for patch during next sprint.</p>

<hr />
<h2>Action Items</h2>
<ul>
  <li>[ ] <strong>Jane Doe:</strong> Finalize API documentation and publish developer guides by Friday.</li>
  <li>[ ] <strong>John Smith:</strong> Run automated load benchmarks for 50+ concurrent users on Monday.</li>
  <li>[ ] <strong>Alex Johnson:</strong> Review pull requests and schedule usability interviews for Wednesday.</li>
</ul>`
  },
  {
    id: 'letter',
    name: 'Letter',
    category: 'Personal',
    description: 'Formal business or personal correspondence letter format.',
    previewType: 'letter',
    defaultTitle: 'Formal Letter',
    content: `<p>[Your Name]<br />
[Your Street Address]<br />
[City, State, ZIP Code]<br />
[Your Email Address] | [Your Phone Number]</p>

<p>[Current Date]</p>

<p>[Recipient Name]<br />
[Recipient Title]<br />
[Company or Organization Name]<br />
[Street Address]<br />
[City, State, ZIP Code]</p>

<p><strong>Dear [Recipient Name],</strong></p>

<p>I am writing to formally present our proposal regarding the upcoming strategic partnership between our respective organizations. Over the past several months, our teams have had the privilege of exploring mutual opportunities that align with our shared vision of technological innovation.</p>

<p>As discussed during our preliminary meetings, we believe that combining our expertise will significantly enhance the value delivered to our users while optimizing operational efficiency. We have structured our proposed approach to ensure transparency, accountability, and measurable results at every phase.</p>

<p>Enclosed with this letter is the complete technical documentation and timeline for your review. I would welcome the opportunity to schedule a follow-up conversation at your earliest convenience to address any questions and discuss next steps.</p>

<p>Thank you for your consideration and partnership. I look forward to working together.</p>

<p>Sincerely,</p>
<br />
<p><strong>[Your Full Name]</strong><br />
[Your Professional Title]</p>`
  }
];
