"use client"

import type { ConfigCategory, ConfigOption } from "@/lib/car-data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ConfigOptionsProps {
  category: ConfigCategory
  selectedOption: ConfigOption
  onOptionChange: (option: ConfigOption) => void
}

export default function ConfigOptions({ category, selectedOption, onOptionChange }: ConfigOptionsProps) {
  // 确保selectedOption存在，避免undefined错误
  const selectedOptionId = selectedOption?.id || ""

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{category.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

      <RadioGroup
        value={selectedOptionId}
        onValueChange={(value) => {
          const option = category.options.find((opt) => opt.id === value)
          if (option) onOptionChange(option)
        }}
        className="space-y-3"
      >
        {category.options.map((option) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center space-x-3 space-y-0 border rounded-md p-4 cursor-pointer transition-all",
              selectedOptionId === option.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/20",
            )}
            onClick={() => {
              // 只有当选项变化时才触发更新，避免不必要的状态更新
              if (selectedOptionId !== option.id) {
                onOptionChange(option)
              }
            }}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                  {option.name}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>

              <div className="flex items-center gap-4">
                {option.price > 0 ? (
                  <span className="text-sm font-medium">+¥{option.price.toLocaleString()}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">标配</span>
                )}

                {option.colorCode ? (
                  <div
                    className="w-8 h-8 rounded-full border shadow-sm"
                    style={{ backgroundColor: option.colorCode }}
                    aria-label={option.name}
                  />
                ) : option.thumbnail ? (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden">
                    <Image
                      src={option.thumbnail || "/placeholder.svg"}
                      alt={option.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

