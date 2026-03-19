import type { ComponentProps } from "react"
import type { FieldError } from "react-hook-form"
import { Input } from "./input"
import { Label } from "./label"

type FormFieldProps = ComponentProps<typeof Input> & {
	label: string
	error?: FieldError
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
	return (
		<div className="relative space-y-2 pb-5">
			<Label htmlFor={id}>{label}</Label>
			<Input id={id} {...inputProps} />
			{error && (
				<p className="absolute bottom-0 left-0 text-xs text-destructive">{error.message}</p>
			)}
		</div>
	)
}
