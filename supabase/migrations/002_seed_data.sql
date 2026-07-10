-- ============================================
-- MDCAT Pro Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================

-- ============================================
-- SUBJECTS
-- ============================================
insert into public.subjects (id, name, icon, description, color, total_topics, sort_order) values
  ('biology', 'Biology', 'Dna', 'Cell biology, genetics, evolution, and human physiology', '#10b981', 24, 1),
  ('chemistry', 'Chemistry', 'FlaskConical', 'Organic, inorganic, and physical chemistry fundamentals', '#2563eb', 20, 2),
  ('physics', 'Physics', 'Atom', 'Mechanics, thermodynamics, waves, and electromagnetism', '#8b5cf6', 18, 3),
  ('english', 'English', 'BookOpen', 'Grammar, comprehension, and vocabulary mastery', '#f59e0b', 15, 4),
  ('logical-reasoning', 'Logical Reasoning', 'Brain', 'Critical thinking, patterns, and analytical skills', '#ec4899', 12, 5)
on conflict (id) do nothing;

-- ============================================
-- BIOLOGY QUIZZES
-- ============================================
insert into public.quizzes (id, title, subject_id, question_count, duration_minutes, difficulty) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Cell Biology Basics', 'biology', 30, 30, 'Easy'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Genetics & Heredity', 'biology', 30, 30, 'Medium'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Human Physiology', 'biology', 40, 40, 'Hard')
on conflict (id) do nothing;

-- ============================================
-- CHEMISTRY QUIZZES
-- ============================================
insert into public.quizzes (id, title, subject_id, question_count, duration_minutes, difficulty) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Organic Chemistry', 'chemistry', 30, 30, 'Medium'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Chemical Bonding', 'chemistry', 25, 25, 'Easy'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Thermochemistry', 'chemistry', 35, 35, 'Hard')
on conflict (id) do nothing;

-- ============================================
-- PHYSICS QUIZZES
-- ============================================
insert into public.quizzes (id, title, subject_id, question_count, duration_minutes, difficulty) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Mechanics', 'physics', 30, 30, 'Medium'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Waves & Optics', 'physics', 25, 25, 'Easy'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Electromagnetism', 'physics', 35, 35, 'Hard')
on conflict (id) do nothing;

-- ============================================
-- ENGLISH QUIZZES
-- ============================================
insert into public.quizzes (id, title, subject_id, question_count, duration_minutes, difficulty) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'English Grammar', 'english', 20, 20, 'Easy'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Reading Comprehension', 'english', 25, 30, 'Medium')
on conflict (id) do nothing;

-- ============================================
-- LOGICAL REASONING QUIZ
-- ============================================
insert into public.quizzes (id, title, subject_id, question_count, duration_minutes, difficulty) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Critical Thinking', 'logical-reasoning', 20, 20, 'Medium')
on conflict (id) do nothing;

-- ============================================
-- QUESTIONS FOR: Cell Biology Basics
-- ============================================
insert into public.questions (quiz_id, question_text, options, correct_answer_index, explanation, sort_order) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801',
   'Which organelle is known as the powerhouse of the cell?',
   '["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"]'::jsonb,
   1,
   'Mitochondria are called the powerhouse of the cell because they generate most of the cell supply of ATP through oxidative phosphorylation.',
   1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801',
   'What is the primary function of ribosomes?',
   '["Energy production", "Protein synthesis", "Cell division", "DNA replication"]'::jsonb,
   1,
   'Ribosomes are responsible for protein synthesis. They translate mRNA into polypeptide chains.',
   2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801',
   'Which type of bond involves the sharing of electron pairs between atoms?',
   '["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"]'::jsonb,
   1,
   'Covalent bonds involve the sharing of electron pairs between atoms to achieve stable electron configurations.',
   3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801',
   'What is the SI unit of force?',
   '["Joule", "Watt", "Newton", "Pascal"]'::jsonb,
   2,
   'The Newton (N) is the SI unit of force, defined as the force needed to accelerate a mass of 1 kg at 1 m/s2.',
   4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801',
   'Which gas is most abundant in Earth atmosphere?',
   '["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"]'::jsonb,
   2,
   'Nitrogen makes up approximately 78% of Earth atmosphere, making it the most abundant gas.',
   5);

-- ============================================
-- QUESTIONS FOR: Genetics & Heredity
-- ============================================
insert into public.questions (quiz_id, question_text, options, correct_answer_index, explanation, sort_order) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802',
   'What is the basic unit of heredity?',
   '["Chromosome", "Gene", "DNA", "Allele"]'::jsonb,
   1,
   'A gene is the basic physical and functional unit of heredity. Genes are made up of DNA.',
   1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802',
   'Which blood type is known as the universal donor?',
   '["A+", "B+", "AB+", "O-"]'::jsonb,
   3,
   'O- blood type can be transfused to patients of any blood type because it lacks A, B antigens and Rh factor.',
   2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802',
   'What is the term for traits that are expressed when two alleles are different?',
   '["Homozygous", "Heterozygous", "Dominant", "Recessive"]'::jsonb,
   1,
   'Heterozygous means having two different alleles for a particular gene. The dominant trait is expressed.',
   3);

-- ============================================
-- QUESTIONS FOR: Organic Chemistry
-- ============================================
insert into public.questions (quiz_id, question_text, options, correct_answer_index, explanation, sort_order) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804',
   'What is the general formula for alkanes?',
   '["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"]'::jsonb,
   1,
   'Alkanes are saturated hydrocarbons with the general formula CnH2n+2, where n is the number of carbon atoms.',
   1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804',
   'Which functional group is present in alcohols?',
   '["-COOH", "-OH", "-CHO", "-NH2"]'::jsonb,
   1,
   'Alcohols contain the hydroxyl (-OH) functional group bonded to a carbon atom.',
   2);

-- ============================================
-- QUESTIONS FOR: Mechanics
-- ============================================
insert into public.questions (quiz_id, question_text, options, correct_answer_index, explanation, sort_order) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807',
   'What is Newton second law of motion?',
   '["F = mv", "F = ma", "F = mg", "F = md"]'::jsonb,
   1,
   'Newton second law states that force equals mass times acceleration (F = ma).',
   1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807',
   'What is the unit of work?',
   '["Newton", "Joule", "Watt", "Pascal"]'::jsonb,
   1,
   'The Joule (J) is the SI unit of work, equal to one Newton-meter.',
   2);

-- ============================================
-- QUESTIONS FOR: English Grammar
-- ============================================
insert into public.questions (quiz_id, question_text, options, correct_answer_index, explanation, sort_order) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810',
   'Which sentence is grammatically correct?',
   '["He go to school", "He goes to school", "He going to school", "He gone to school"]'::jsonb,
   1,
   'Third person singular subjects (he, she, it) require the verb to take an -s or -es ending.',
   1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810',
   'What is the past tense of "run"?',
   '["Runned", "Ran", "Running", "Runs"]'::jsonb,
   1,
   '"Ran" is the irregular past tense form of "run".',
   2);
