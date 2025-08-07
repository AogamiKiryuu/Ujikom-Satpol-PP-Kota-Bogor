-- Insert sample exams
INSERT INTO "Exam" (id, title, subject, description, duration, "totalQuestions", "passingScore", "isActive", "startDate", "endDate", "createdAt", "updatedAt") VALUES
('exam-1', 'Ujian Matematika Dasar', 'Matematika', 'Ujian matematika untuk tingkat dasar', 90, 40, 70, true, '2025-08-01 00:00:00', '2025-08-15 23:59:59', NOW(), NOW()),
('exam-2', 'Ujian Bahasa Indonesia', 'Bahasa Indonesia', 'Ujian bahasa Indonesia', 60, 30, 75, true, '2025-08-02 00:00:00', '2025-08-12 23:59:59', NOW(), NOW()),
('exam-3', 'Ujian Fisika', 'Fisika', 'Ujian fisika dasar', 120, 50, 65, true, '2025-07-25 00:00:00', '2025-08-05 23:59:59', NOW(), NOW()),
('exam-4', 'Ujian Kimia', 'Kimia', 'Ujian kimia dasar', 100, 45, 70, true, '2025-07-20 00:00:00', '2025-08-03 23:59:59', NOW(), NOW());

-- Insert sample questions for each exam
INSERT INTO "Question" (id, "examId", "questionText", "optionA", "optionB", "optionC", "optionD", "correctAnswer", points, "createdAt", "updatedAt") VALUES
-- Math questions
('q1', 'exam-1', 'Berapakah hasil dari 2 + 2?', '3', '4', '5', '6', 'B', 1, NOW(), NOW()),
('q2', 'exam-1', 'Berapakah hasil dari 5 × 3?', '15', '13', '12', '18', 'A', 1, NOW(), NOW()),
('q3', 'exam-1', 'Berapakah hasil dari 10 ÷ 2?', '4', '5', '6', '3', 'B', 1, NOW(), NOW()),

-- Indonesian questions
('q4', 'exam-2', 'Apa ibu kota Indonesia?', 'Bandung', 'Surabaya', 'Jakarta', 'Medan', 'C', 1, NOW(), NOW()),
('q5', 'exam-2', 'Siapa pengarang novel Laskar Pelangi?', 'Pramoedya', 'Andrea Hirata', 'Habiburrahman', 'Dee Lestari', 'B', 1, NOW(), NOW()),

-- Physics questions  
('q6', 'exam-3', 'Satuan untuk gaya adalah?', 'Joule', 'Newton', 'Watt', 'Pascal', 'B', 1, NOW(), NOW()),
('q7', 'exam-3', 'Rumus energi kinetik adalah?', '½mv²', 'mgh', 'mc²', 'F = ma', 'A', 1, NOW(), NOW()),

-- Chemistry questions
('q8', 'exam-4', 'Lambang kimia untuk emas adalah?', 'Au', 'Ag', 'Fe', 'Cu', 'A', 1, NOW(), NOW()),
('q9', 'exam-4', 'Rumus kimia air adalah?', 'H2O2', 'H2O', 'HO2', 'H3O', 'B', 1, NOW(), NOW());
