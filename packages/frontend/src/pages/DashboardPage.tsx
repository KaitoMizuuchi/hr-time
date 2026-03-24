import { LayoutDashboard } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"

export const DashboardPage = () => {
	const navigate = useNavigate()

	return (
		<div className="flex flex-1 flex-col items-center justify-center p-8">
			<LayoutDashboard className="mb-4 size-12 text-muted-foreground/50" />
			<h1 className="text-xl font-semibold">ダッシュボード</h1>
			<p className="mt-2 text-muted-foreground">
				まだデータがありません。タスク画面で記録を始めましょう
			</p>
			<Button variant="outline" className="mt-4" onClick={() => navigate("/tasks")}>
				タスク画面へ
			</Button>
		</div>
	)
}
