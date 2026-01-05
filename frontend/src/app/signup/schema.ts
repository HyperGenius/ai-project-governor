/* frontend/src/app/signup/schema.ts */
export type SignupFormData = {
    fullName: string
    email: string
    password: string
    companyName?: string // 新規作成時のみ
    inviteCode?: string  // 参加時のみ
}