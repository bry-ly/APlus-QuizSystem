import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CardData {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  description?: string
  trend?: "up" | "down"
}

interface SectionCardsProps {
  cards?: CardData[]
  role?: "student" | "teacher" | "admin"
}

const defaultCards: CardData[] = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    change: 12.5,
    changeLabel: "Trending up this month",
    description: "Revenue for the last period",
    trend: "up",
  },
  {
    title: "New Customers",
    value: "1,234",
    change: -20,
    changeLabel: "Down this period",
    description: "Acquisition needs attention",
    trend: "down",
  },
  {
    title: "Active Accounts",
    value: "45,678",
    change: 12.5,
    changeLabel: "Strong user retention",
    description: "Engagement exceed targets",
    trend: "up",
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    change: 4.5,
    changeLabel: "Steady performance increase",
    description: "Meets growth projections",
    trend: "up",
  },
]

export function SectionCards({ cards = defaultCards, role = "student" }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => {
        const isPositive = (card.change ?? 0) >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown
        
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </CardTitle>
              {card.change !== undefined && (
                <CardAction>
                  <Badge variant="outline">
                    <TrendIcon className="size-3" />
                    {isPositive ? "+" : ""}
                    {card.change.toFixed(1)}%
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {card.changeLabel && (
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {card.changeLabel} <TrendIcon className="size-4" />
                </div>
              )}
              {card.description && (
                <div className="text-muted-foreground">{card.description}</div>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
