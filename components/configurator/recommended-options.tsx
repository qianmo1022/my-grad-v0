"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConfigOption } from "@/lib/car-data"

interface RecommendedOptionsProps {
  options: ConfigOption[]
  selectedOption: ConfigOption
  onOptionSelect: (option: ConfigOption | null) => void
}

export default function RecommendedOptions({ options, selectedOption, onOptionSelect }: RecommendedOptionsProps) {
  const [expanded, setExpanded] = useState(false)

  // 只显示前3个推荐选项
  const displayOptions = expanded ? options : options.slice(0, 3)

  return (
    <Card className="mt-4 bg-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              推荐选项
            </CardTitle>
            <CardDescription>基于您的偏好和历史选择</CardDescription>
          </div>
          {options.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "收起" : "查看全部"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "p-3 rounded-md cursor-pointer transition-all",
                option.id === selectedOption.id
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-background hover:bg-muted",
              )}
              onClick={() => {
                // 如果点击的是当前已选中的选项，则取消选择
                if (option.id === selectedOption.id) {
                  onOptionSelect(null)
                } else {
                  onOptionSelect(option)
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{option.name}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div className="text-right">
                  {option.price > 0 ? (
                    <span className="text-sm font-medium">+¥{option.price.toLocaleString()}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">标配</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

