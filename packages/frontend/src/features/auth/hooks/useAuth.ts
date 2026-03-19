import { useNavigate } from "react-router"
import { toast } from "sonner"
import { authClient } from "@/lib/authClient"

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
			toast.error(result.error.message || "サインアップに失敗しました")
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
			toast.error(result.error.message || "ログインに失敗しました")
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
