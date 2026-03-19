import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@hr-time/shared"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../hooks/useAuth"

const signUpFormSchema = signUpSchema
	.extend({
		passwordConfirm: z.string().min(1, "確認パスワードは必須です"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "パスワードが一致しません",
		path: ["passwordConfirm"],
	})

type SignUpFormValues = z.infer<typeof signUpFormSchema>

export function SignupForm() {
	const { signUp } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpFormSchema),
		mode: "onChange",
	})

	const onSubmit = async (data: SignUpFormValues) => {
		setIsSubmitting(true)
		await signUp(data.name, data.email, data.password)
		setIsSubmitting(false)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">サインアップ</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="relative pb-5">
						<Label htmlFor="name">表示名</Label>
						<Input id="name" type="text" placeholder="表示名を入力" {...register("name")} />
						{errors.name && (
							<p className="absolute bottom-0 left-0 text-xs text-destructive">
								{errors.name.message}
							</p>
						)}
					</div>

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
							placeholder="8文字以上"
							{...register("password")}
						/>
						{errors.password && (
							<p className="absolute bottom-0 left-0 text-xs text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<div className="relative pb-5">
						<Label htmlFor="passwordConfirm">確認パスワード</Label>
						<Input
							id="passwordConfirm"
							type="password"
							placeholder="パスワードを再入力"
							{...register("passwordConfirm")}
						/>
						{errors.passwordConfirm && (
							<p className="absolute bottom-0 left-0 text-xs text-destructive">
								{errors.passwordConfirm.message}
							</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
						{isSubmitting ? <Loader2 className="animate-spin" /> : "サインアップ"}
					</Button>
				</form>

				<p className="mt-4 text-center text-sm text-muted-foreground">
					アカウントをお持ちの方は{" "}
					<Link to="/login" className="text-primary underline">
						ログイン
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
