import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@hr-time/shared"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
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
		<Card className="w-full max-w-md p-5">
			<CardHeader>
				<CardTitle className="text-2xl">サインアップ</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						id="name"
						label="表示名"
						type="text"
						placeholder="表示名を入力"
						error={errors.name}
						{...register("name")}
					/>
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
						placeholder="8文字以上"
						error={errors.password}
						{...register("password")}
					/>
					<FormField
						id="passwordConfirm"
						label="確認パスワード"
						type="password"
						placeholder="パスワードを再入力"
						error={errors.passwordConfirm}
						{...register("passwordConfirm")}
					/>
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
