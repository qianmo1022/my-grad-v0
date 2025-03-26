import type { ReactNode } from "react"

interface FeatureSectionProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureSection({ icon, title, description }: FeatureSectionProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

