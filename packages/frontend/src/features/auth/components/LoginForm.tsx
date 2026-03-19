import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@hr-time/shared"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { useAuth } from "../hooks/useAuth"

type SignInFormValues = z.infer<typeof signInSchema>

export function LoginForm() {
	const { signIn } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

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
		await signIn(data.email, data.password)
		setIsSubmitting(false)
	}

	return (
		<Card className="w-full max-w-md p-5">
			<CardHeader>
				<CardTitle className="text-2xl">ログイン</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						id="email"
						label="メールアドレス"
						type="email"
						placeholder="mail@example.com"
						error={errors.email}
						{...register("email")}
					/>
					<FormField
						id="password"
						label="パスワード"
						type="password"
						placeholder="パスワードを入力"
						error={errors.password}
						{...register("password")}
					/>
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
