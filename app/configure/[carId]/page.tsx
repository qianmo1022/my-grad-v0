import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCarById } from "@/lib/car-data"
import Configurator from "@/components/configurator/configurator"
import ReviewList from "@/components/reviews/review-list"
import { Skeleton } from "@/components/ui/skeleton"

interface ConfigurePageProps {
  params: {
    carId: string
  }
}

export default async function ConfigurePage({ params }: ConfigurePageProps) {
  const car = await getCarById(params.carId)

  if (!car) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<ConfigureSkeleton />}>
        <Configurator carId={params.carId} />
      </Suspense>

      <div className="container mx-auto py-8 px-4">
        <ReviewList carId={params.carId} limit={3} showViewAll={true} />
      </div>
    </div>
  )
}

function ConfigureSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-[500px] col-span-2" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

