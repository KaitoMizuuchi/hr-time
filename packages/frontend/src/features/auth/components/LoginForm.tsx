import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@hr-time/shared"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../hooks/useAuth"

type SignInFormValues = z.infer<typeof signInSchema>

export function LoginForm() {
	const { signIn } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		mode: "onChange",
	})

	const onSubmit = async (data: SignInFormValues) => {
		setIsSubmitting(true)
		setLoginError(null)
		const success = await signIn(data.email, data.password)
		if (!success) {
			setLoginError("メールアドレスまたはパスワードが正しくありません")
		}
		setIsSubmitting(false)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">ログイン</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{loginError && <p className="text-sm text-destructive">{loginError}</p>}

					<div className="relative pb-5">
						<Label htmlFor="email">メールアドレス</Label>
						<Input id="email" type="email" placeholder="mail@example.com" {...register("email")} />
						{errors.email && (
							<p className="absolute bottom-0 left-0 text-xs text-destructive">
								{errors.email.message}
							</p>
						)}
					</div>

					<div className="relative pb-5">
						<Label htmlFor="password">パスワード</Label>
						<Input
							id="password"
							type="password"
							placeholder="パスワードを入力"
							{...register("password")}
						/>
						{errors.password && (
							<p className="absolute bottom-0 left-0 text-xs text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
						{isSubmitting ? <Loader2 className="animate-spin" /> : "ログイン"}
					</Button>
				</form>

				<p className="mt-4 text-center text-sm text-muted-foreground">
					アカウントをお持ちでない方は{" "}
					<Link to="/signup" className="text-primary underline">
						サインアップ
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
