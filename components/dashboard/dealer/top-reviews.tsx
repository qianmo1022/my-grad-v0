import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp } from "lucide-react";
import { type Review } from "@/lib/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function TopReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const response = await fetch("/api/dealer/reviews/top");
        if (!response.ok) {
          throw new Error("获取热门评价失败");
        }
        const data = await response.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error("获取热门评价失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopReviews();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">热门评价</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          // 加载骨架屏
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link 
                href={`/dashboard/dealer/reviews/${review.id}`} 
                key={review.id}
                className="block"
              >
                <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.userAvatar || ""} alt={review.userName} />
                    <AvatarFallback>{review.userName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{review.userName}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        {review.helpful}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{review.title}</p>
                    <div className="flex mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">暂无热门评价</p>
        )}
      </CardContent>
    </Card>
  );
} 