## DB設計のポイント

### A. profiles テーブルの分離
Supabaseでは、ユーザー認証情報は auth スキーマ（直接編集不可）に保存されます。アプリ独自のデータ（tenant_id や role）を持たせるために、public.profiles テーブルを作り、Triggerで自動同期させるパターンが鉄板です。

### B. tenant_id の役割
すべてのデータテーブル（daily_reports, weekly_summaries）に tenant_id を持たせています。 
将来的にRLSポリシーを書く際、以下のように一行書くだけでセキュリティが担保できます。
このように設計しておけば、FastAPI側で複雑なフィルタリング条件を書く必要がなくなります。

```sql

-- RLSポリシーのイメージ（今回は定義まで含めていませんが、次のステップで実装します）
create policy "Users can only see their team's reports"
on daily_reports
for select
using (
  tenant_id in (
    select tenant_id from profiles where id = auth.uid()
  )
);
```

### C. RawデータとPolishedデータの分離
content_raw（事実）と content_polished（AI生成文）を分けています。 
AIのプロンプトを改良したくなった時、Rawデータさえあれば、過去の全データに対して「再生成（Re-polish）」をかけることが可能になります。
