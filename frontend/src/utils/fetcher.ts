/* frontend/src/utils/fetcher.ts */

/**
 * SWR用のデータ取得関数 (認証対応版)
 * @param args [url, token] の配列
 */
export const fetcher = async ([url, token]: [string, string]) => {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.')
        // エラーレスポンスの内容を付加情報として持たせることも可能
        throw error
    }

    return res.json()
}