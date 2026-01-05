/* frontend/src/app/signup/actions.ts */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { SignupFormData } from '@/app/signup/schema'

export async function signUpAction(formData: SignupFormData) {
    const { email, password, companyName, fullName, inviteCode } = formData

    // 1. 通常のクライアントでサインアップ（Authユーザー作成）
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 入力チェック
    if (!inviteCode && !companyName) {
        return { error: '会社名または招待コードが必要です' }
    }

    // --- 1. 招待コードの事前検証（参加モードの場合） ---
    let targetTenantId = inviteCode
    let role = 'admin' // デフォルトは管理者

    if (inviteCode) {
        // 招待コード（テナントID）が存在するか確認
        // RLS回避のため adminSupabase を使用
        const { data: tenant, error: checkError } = await supabaseAdmin
            .from('tenants')
            .select('id')
            .eq('id', inviteCode)
            .single()

        if (checkError || !tenant) {
            return { error: '無効な招待コードです' }
        }

        targetTenantId = tenant.id
        role = 'member' // 参加者は一般メンバー
    }

    // --- 2. ユーザー作成 ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'ユーザー作成に失敗しました' }
    }

    // --- 3. 新規テナント作成（新規作成モードの場合） ---
    if (!inviteCode && companyName) {
        const { data: newTenant, error: createError } = await supabaseAdmin
            .from('tenants')
            .insert({ name: companyName })
            .select()
            .single()

        if (createError || !newTenant) {
            // ※本当はAuthUserも削除すべきだが、MVPなので省略
            return { error: '組織の作成に失敗しました' }
        }
        targetTenantId = newTenant.id
    }

    // --- 4. プロフィールの更新（テナント紐付け） ---
    // トリガーで作成されたプロフィールの tenant_id を更新
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
            tenant_id: targetTenantId,
            role: role
        })
        .eq('id', authData.user.id)

    if (profileError) {
        console.error('Profile update failed:', profileError)
        return { error: 'プロフィールの更新に失敗しました' }
    }

    // 完了
    revalidatePath('/', 'layout')
    redirect('/')
}