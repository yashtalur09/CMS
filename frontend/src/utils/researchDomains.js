/**
 * Predefined research domains for reviewer expertise and conference tracks.
 * Organized by category for easy browsing in the multi-select dropdown.
 * 
 * IMPORTANT: All entries must be full, unabbreviated names.
 */

const RESEARCH_DOMAINS = [
  // ─── Artificial Intelligence & Machine Learning ────────────────────
  { label: 'Artificial Intelligence', category: 'AI & Machine Learning' },
  { label: 'Machine Learning', category: 'AI & Machine Learning' },
  { label: 'Deep Learning', category: 'AI & Machine Learning' },
  { label: 'Natural Language Processing', category: 'AI & Machine Learning' },
  { label: 'Computer Vision', category: 'AI & Machine Learning' },
  { label: 'Reinforcement Learning', category: 'AI & Machine Learning' },
  { label: 'Generative AI', category: 'AI & Machine Learning' },
  { label: 'Large Language Models', category: 'AI & Machine Learning' },
  { label: 'Neural Networks', category: 'AI & Machine Learning' },
  { label: 'Speech Recognition', category: 'AI & Machine Learning' },
  { label: 'Robotics and Autonomous Systems', category: 'AI & Machine Learning' },
  { label: 'Knowledge Representation and Reasoning', category: 'AI & Machine Learning' },
  { label: 'Explainable AI', category: 'AI & Machine Learning' },
  { label: 'Federated Learning', category: 'AI & Machine Learning' },
  { label: 'Transfer Learning', category: 'AI & Machine Learning' },
  { label: 'AI Ethics and Fairness', category: 'AI & Machine Learning' },

  // ─── Data Science & Analytics ──────────────────────────────────────
  { label: 'Data Science', category: 'Data Science & Analytics' },
  { label: 'Data Mining', category: 'Data Science & Analytics' },
  { label: 'Big Data Analytics', category: 'Data Science & Analytics' },
  { label: 'Information Retrieval', category: 'Data Science & Analytics' },
  { label: 'Database Systems', category: 'Data Science & Analytics' },
  { label: 'Data Visualization', category: 'Data Science & Analytics' },
  { label: 'Statistical Learning', category: 'Data Science & Analytics' },
  { label: 'Predictive Analytics', category: 'Data Science & Analytics' },
  { label: 'Text Mining', category: 'Data Science & Analytics' },
  { label: 'Business Intelligence', category: 'Data Science & Analytics' },

  // ─── Systems, Networks & Security ──────────────────────────────────
  { label: 'Cloud Computing', category: 'Systems & Security' },
  { label: 'Cybersecurity', category: 'Systems & Security' },
  { label: 'Network Security', category: 'Systems & Security' },
  { label: 'Distributed Systems', category: 'Systems & Security' },
  { label: 'Internet of Things', category: 'Systems & Security' },
  { label: 'Edge Computing', category: 'Systems & Security' },
  { label: 'Blockchain Technology', category: 'Systems & Security' },
  { label: 'Computer Networks', category: 'Systems & Security' },
  { label: 'Operating Systems', category: 'Systems & Security' },
  { label: 'Parallel Computing', category: 'Systems & Security' },
  { label: 'High Performance Computing', category: 'Systems & Security' },
  { label: 'Cryptography', category: 'Systems & Security' },
  { label: 'Digital Forensics', category: 'Systems & Security' },
  { label: 'Wireless Sensor Networks', category: 'Systems & Security' },

  // ─── Software & Web ────────────────────────────────────────────────
  { label: 'Software Engineering', category: 'Software & Web' },
  { label: 'Web Technologies', category: 'Software & Web' },
  { label: 'Mobile Application Development', category: 'Software & Web' },
  { label: 'DevOps and CI/CD', category: 'Software & Web' },
  { label: 'Software Architecture', category: 'Software & Web' },
  { label: 'Software Testing and Quality Assurance', category: 'Software & Web' },
  { label: 'Microservices Architecture', category: 'Software & Web' },
  { label: 'API Design and Development', category: 'Software & Web' },
  { label: 'Programming Languages', category: 'Software & Web' },

  // ─── Human-Computer Interaction & Design ───────────────────────────
  { label: 'Human-Computer Interaction', category: 'HCI & Design' },
  { label: 'User Experience Design', category: 'HCI & Design' },
  { label: 'Augmented Reality', category: 'HCI & Design' },
  { label: 'Virtual Reality', category: 'HCI & Design' },
  { label: 'Accessibility and Inclusive Design', category: 'HCI & Design' },
  { label: 'Information Systems', category: 'HCI & Design' },

  // ─── Hardware, Electronics & Signal Processing ─────────────────────
  { label: 'VLSI Design', category: 'Hardware & Electronics' },
  { label: 'Embedded Systems', category: 'Hardware & Electronics' },
  { label: 'Signal Processing', category: 'Hardware & Electronics' },
  { label: 'Image Processing', category: 'Hardware & Electronics' },
  { label: 'Digital Electronics', category: 'Hardware & Electronics' },
  { label: 'Control Systems', category: 'Hardware & Electronics' },
  { label: 'Communication Systems', category: 'Hardware & Electronics' },
  { label: 'Microcontrollers and Microprocessors', category: 'Hardware & Electronics' },
  { label: 'Power Electronics', category: 'Hardware & Electronics' },
  { label: 'Antenna Design', category: 'Hardware & Electronics' },
  { label: 'Photonics and Optics', category: 'Hardware & Electronics' },

  // ─── Theoretical CS & Mathematics ──────────────────────────────────
  { label: 'Algorithms and Complexity', category: 'Theory & Mathematics' },
  { label: 'Computational Theory', category: 'Theory & Mathematics' },
  { label: 'Graph Theory', category: 'Theory & Mathematics' },
  { label: 'Optimization', category: 'Theory & Mathematics' },
  { label: 'Formal Methods', category: 'Theory & Mathematics' },
  { label: 'Quantum Computing', category: 'Theory & Mathematics' },
  { label: 'Computational Geometry', category: 'Theory & Mathematics' },

  // ─── Interdisciplinary / Applied ───────────────────────────────────
  { label: 'Bioinformatics', category: 'Interdisciplinary' },
  { label: 'Computational Biology', category: 'Interdisciplinary' },
  { label: 'Health Informatics', category: 'Interdisciplinary' },
  { label: 'Medical Image Analysis', category: 'Interdisciplinary' },
  { label: 'Smart Cities', category: 'Interdisciplinary' },
  { label: 'Green Computing and Sustainability', category: 'Interdisciplinary' },
  { label: 'Autonomous Vehicles', category: 'Interdisciplinary' },
  { label: 'E-Learning and Educational Technology', category: 'Interdisciplinary' },
  { label: 'Social Network Analysis', category: 'Interdisciplinary' },
  { label: 'Computational Social Science', category: 'Interdisciplinary' },
  { label: 'FinTech', category: 'Interdisciplinary' },
  { label: 'Digital Twin', category: 'Interdisciplinary' },
  { label: 'Computer Graphics and Multimedia', category: 'Interdisciplinary' },
  { label: 'Geographic Information Systems', category: 'Interdisciplinary' },
  { label: 'Renewable Energy Systems', category: 'Interdisciplinary' },
];

// Extract unique categories in order
const DOMAIN_CATEGORIES = [...new Set(RESEARCH_DOMAINS.map(d => d.category))];

// Flat list of just labels (for quick validation)
const DOMAIN_LABELS = RESEARCH_DOMAINS.map(d => d.label);

export { RESEARCH_DOMAINS, DOMAIN_CATEGORIES, DOMAIN_LABELS };
export default RESEARCH_DOMAINS;
