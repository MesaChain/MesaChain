import { Button } from "../ui/button"
import { cn } from "@/lib/utils";


export default function RangeButton({
    label,
    active,
    onClick
}:{
   label: "7d" | "30d" | "90d"
   active?: boolean
   onClick?: () => void 
}) {
  return (
   <Button
   variant={active? "default": "outline"}
   size="sm"
   className={cn("h-8 rounded-full px-3 ")}
   aria-pressed={active ? "true" : "false"}
   onClick={onClick}
   >
    <span className="sr-only">
        Show last
    </span>
    {label}
   </Button>
  )
}

 