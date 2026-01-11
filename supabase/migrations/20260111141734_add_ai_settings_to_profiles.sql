-- Add ai_settings column to profiles table
-- This stores user-specific AI personality and tone preferences

ALTER TABLE public.profiles
ADD COLUMN ai_settings JSONB DEFAULT '{
  "tone": "professional",
  "language": "ja",
  "custom_instructions": ""
}'::jsonb;

COMMENT ON COLUMN public.profiles.ai_settings IS 'User-specific AI personality settings: tone (professional/concise/english/enthusiastic), language, and custom instructions';
