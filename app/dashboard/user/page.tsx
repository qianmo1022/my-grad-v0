"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import StatsCard from "@/components/dashboard/stats-card"
import RecentOrders from "@/components/dashboard/recent-orders"
import SavedConfigs from "@/components/dashboard/saved-configs"
import RecommendedCars from "@/components/dashboard/recommended-cars"
import { Car, ShoppingCart, Heart, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export default function UserDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // 状态管理
  const [stats, setStats] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("用户");

  // 获取用户姓名
  useEffect(() => {
    if (session?.user) {
      // 使用会话中的姓名，或从姓名中提取姓氏
      const name = session.user.name || "";
      setUserName(name.split(' ')[0] || "用户");
    }
  }, [session]);

  // 获取统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('获取统计数据失败');
          // 设置默认统计数据
          setStats([
            {
              title: "已保存配置",
              value: "0",
              icon: <Car className="h-4 w-4" />,
              trend: { value: 0, isPositive: true },
            },
            {
              title: "订单总数",
              value: "0",
              icon: <ShoppingCart className="h-4 w-4" />,
              trend: { value: 0, isPositive: true },
            },
            {
              title: "最近浏览",
              value: "0",
              icon: <Clock className="h-4 w-4" />,
              description: "过去30天内",
              trend: { value: 0, isPositive: true },
            },
          ]);
        }
      } catch (error) {
        console.error('获取统计数据错误:', error);
        toast({
          title: "数据加载失败",
          description: "无法加载统计数据，请稍后重试",
          variant: "destructive",
        });
      }
    }

    fetchStats();
  }, [toast]);

  // 获取订单数据
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/user/orders?limit=3');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error('获取订单数据失败');
          setOrders([]);
        }
      } catch (error) {
        console.error('获取订单数据错误:', error);
        setOrders([]);
      }
    }

    fetchOrders();
  }, []);

  // 获取保存的配置
  useEffect(() => {
    async function fetchSavedConfigs() {
      try {
        const response = await fetch('/api/user/configurations?limit=4');
        if (response.ok) {
          const data = await response.json();
          setSavedConfigs(data);
        } else {
          console.error('获取保存的配置失败');
          setSavedConfigs([]);
        }
      } catch (error) {
        console.error('获取保存的配置错误:', error);
        setSavedConfigs([]);
      }
    }

    fetchSavedConfigs();
  }, []);

  // 获取推荐车型
  useEffect(() => {
    async function fetchRecommendedCars() {
      try {
        const response = await fetch('/api/cars/recommended?limit=3');
        if (response.ok) {
          const data = await response.json();
          setRecommendedCars(data);
        } else {
          console.error('获取推荐车型失败');
          setRecommendedCars([]);
        }
      } catch (error) {
        console.error('获取推荐车型错误:', error);
        setRecommendedCars([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendedCars();
  }, []);

  // 添加图标到统计数据
  const statsWithIcons = stats.map(stat => {
    let icon;
    switch(stat.title) {
      case "已保存配置":
        icon = <Car className="h-4 w-4" />;
        break;
      case "订单总数":
        icon = <ShoppingCart className="h-4 w-4" />;
        break;
      case "最近浏览":
        icon = <Clock className="h-4 w-4" />;
        break;
      default:
        icon = null;
    }
    return { ...stat, icon };
  });

  return (
    <DashboardLayout userType="user">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">欢迎回来，{userName}先生</h2>
          <p className="text-muted-foreground">这是您的用户面板，您可以在这里管理您的汽车配置和订单。</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">加载数据中...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsWithIcons.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                  trend={stat.trend}
                />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SavedConfigs configs={savedConfigs} />
              <RecentOrders orders={orders} userType="user" />
            </div>

            <div className="mt-6">
              <RecommendedCars cars={recommendedCars} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

