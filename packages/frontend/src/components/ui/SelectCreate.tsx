import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useState } from "react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils/cn"

type SelectCreateItem = {
	value: string
	label: string
}

type SelectCreateProps = {
	items: SelectCreateItem[]
	value: string | null
	onSelect: (value: string) => void
	onCreate: (name: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyMessage?: string
	isCreating?: boolean
}

export const SelectCreate = ({
	items,
	value,
	onSelect,
	onCreate,
	placeholder = "選択...",
	searchPlaceholder = "検索...",
	emptyMessage = "見つかりません",
	isCreating = false,
}: SelectCreateProps) => {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState("")

	const selectedItem = items.find((item) => item.value === value)
	const hasExactMatch = items.some((item) => item.label.toLowerCase() === search.toLowerCase())

	const handleSelect = (itemValue: string) => {
		onSelect(itemValue)
		setOpen(false)
		setSearch("")
	}

	const handleCreate = () => {
		if (!search.trim()) return
		onCreate(search.trim())
		setSearch("")
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
				<span className={cn(!selectedItem && "text-muted-foreground")}>
					{selectedItem ? selectedItem.label : placeholder}
				</span>
				<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
			</PopoverTrigger>
			<PopoverContent className="w-(--anchor-width) p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
								<CommandItem
									key={item.value}
									value={item.label}
									onSelect={() => handleSelect(item.value)}
								>
									<Check
										className={cn(
											"mr-2 size-4",
											value === item.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{item.label}
								</CommandItem>
							))}
						</CommandGroup>
						{search.trim() && !hasExactMatch && (
							<CommandGroup>
								<CommandItem onSelect={handleCreate} disabled={isCreating}>
									<Plus className="mr-2 size-4" />「{search.trim()}」を作成
								</CommandItem>
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
