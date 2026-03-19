import { useNavigate } from "react-router"
import { toast } from "sonner"
import { authClient } from "@/lib/authClient"

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "メールアドレスまたはパスワードが正しくありません",
	USER_ALREADY_EXISTS: "このメールアドレスは既に登録されています",
	INVALID_EMAIL: "無効なメールアドレスです",
	INVALID_PASSWORD: "パスワードが正しくありません",
	USER_NOT_FOUND: "ユーザーが見つかりません",
	TOO_MANY_REQUESTS: "リクエストが多すぎます。しばらくしてから再度お試しください",
}

function getAuthErrorMessage(error: { code?: string; message?: string }, fallback: string): string {
	if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
		return AUTH_ERROR_MESSAGES[error.code]
	}
	return fallback
}

export function useAuth() {
	const navigate = useNavigate()
	const { data: session, isPending } = authClient.useSession()

	const signUp = async (name: string, email: string, password: string) => {
		const result = await authClient.signUp.email({
			name,
			email,
			password,
		})
		if (result.error) {
			toast.error(getAuthErrorMessage(result.error, "サインアップに失敗しました"))
			return false
		}
		navigate("/tasks")
		return true
	}

	const signIn = async (email: string, password: string) => {
		const result = await authClient.signIn.email({
			email,
			password,
		})
		if (result.error) {
			toast.error(getAuthErrorMessage(result.error, "ログインに失敗しました"))
			return false
		}
		navigate("/tasks")
		return true
	}

	const signOut = async () => {
		await authClient.signOut()
		navigate("/login")
	}

	return {
		user: session?.user ?? null,
		isAuthenticated: !!session?.user,
		isPending,
		signUp,
		signIn,
		signOut,
	}
}
