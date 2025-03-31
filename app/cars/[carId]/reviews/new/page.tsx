import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import ReviewForm from "@/components/reviews/review-form"
import { getCarById } from "@/lib/car-data"

interface NewReviewPageProps {
  params: {
    carId: string
  }
}

export default async function NewReviewPage({ params }: NewReviewPageProps) {
  const car = await getCarById(params.carId)

  if (!car) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={`/cars/${params.carId}/reviews`}>
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回评价列表
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{car.name} - 写评价</h1>
        <p className="text-muted-foreground">分享您对这款车型的真实体验和感受</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <ReviewForm carId={params.carId} />
      </div>
    </div>
  )
}

