import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PenLine } from "lucide-react"
import ReviewList from "@/components/reviews/review-list"
import { getCarById } from "@/lib/car-data"

interface ReviewsPageProps {
  params: {
    carId: string
  }
}

export default function ReviewsPage({ params }: ReviewsPageProps) {
  const car = getCarById(params.carId)

  if (!car) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href={`/configure/${params.carId}`}>
            <Button variant="ghost" className="pl-0">
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回车型
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{car.name} 用户评价</h1>
          <p className="text-muted-foreground">查看其他用户的真实体验和评价</p>
        </div>

        <Link href={`/cars/${params.carId}/reviews/new`}>
          <Button>
            <PenLine className="mr-2 h-4 w-4" />
            写评价
          </Button>
        </Link>
      </div>

      <ReviewList carId={params.carId} showViewAll={false} />
    </div>
  )
}

