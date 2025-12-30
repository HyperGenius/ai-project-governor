-- subject (件名) カラムを追加
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS subject text;

-- politeness_level (丁寧さレベル) カラムを追加
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS politeness_level integer DEFAULT 5;

-- カラムの説明（コメント）を追加
COMMENT ON COLUMN public.daily_reports.subject IS 'AIが生成した日報の件名';
COMMENT ON COLUMN public.daily_reports.politeness_level IS '丁寧さレベル(1-5)';
