/* frontend/src/app/signup/actions.ts */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function signUpAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('companyName') as string

    // 1. 通常のクライアントでサインアップ（Authユーザー作成）
    const supabase = await createClient()

    // メタデータとしてフルネームを入れたい場合は追加の入力欄が必要ですが、
    // 今回は仮でメールアドレスのローカルパートなどを設定
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: email.split('@')[0], // 仮の名前
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'ユーザー作成に失敗しました' }
    }

    // 2. Adminクライアントを使ってテナント作成と紐付けを行う
    // (RLSをバイパスして、他テーブルへの書き込み権限を持つ操作のため)
    const supabaseAdmin = createAdminClient()

    try {
        // A. テナントの作成
        const { data: tenantData, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({ name: companyName })
            .select()
            .single()

        if (tenantError || !tenantData) {
            console.error('Tenant creation failed:', tenantError)
            // ロールバック処理が必要な場合はここに記述（ユーザー削除など）
            return { error: 'チームの作成に失敗しました' }
        }

        const newTenantId = tenantData.id

        // B. プロフィールの更新 (tenant_id と role を設定)
        // トリガーによって profiles レコードは既に作成されているはずなので update する
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                tenant_id: newTenantId,
                role: 'admin' // 最初のユーザーは管理者にする
            })
            .eq('id', authData.user.id)

        if (profileError) {
            console.error('Profile update failed:', profileError)
            return { error: 'プロフィールの設定に失敗しました' }
        }

    } catch (err) {
        console.error('Unexpected error:', err)
        return { error: 'システムエラーが発生しました' }
    }

    // 3. 完了後のリダイレクト
    revalidatePath('/', 'layout')
    redirect('/')
}