-- Seed data for development and testing
-- This file is optional and only used for local development

-- Note: In production, users will be created through Supabase Auth
-- This seed assumes you have test users created in your local Supabase instance

-- Example: Insert test job (replace user_id with actual test user UUID)
-- INSERT INTO jobs (user_id, file_id, filename, document_type, status, progress)
-- VALUES (
--   'your-test-user-uuid',
--   gen_random_uuid(),
--   'test-document.pdf',
--   'pdf',
--   'completed',
--   100
-- );

-- Example: Insert test wordlist
-- INSERT INTO wordlists (user_id, job_id, filename, document_type, word_count, words)
-- VALUES (
--   'your-test-user-uuid',
--   'your-test-job-uuid',
--   'test-document.pdf',
--   'pdf',
--   5,
--   '[
--     {"en": "vocabulary", "zh": "词汇"},
--     {"en": "learning", "zh": "学习"},
--     {"en": "document", "zh": "文档"},
--     {"en": "translation", "zh": "翻译"},
--     {"en": "language", "zh": "语言"}
--   ]'::jsonb
-- );

-- You can add your own test data here for local development
