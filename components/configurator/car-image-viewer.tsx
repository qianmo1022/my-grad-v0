"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface CarImageViewerProps {
  carId: string
  carColor: string
}

export default function CarImageViewer({ carId, carColor }: CarImageViewerProps) {
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'rear'>('front')
  
  // 在实际应用中，这里应该根据carId和carColor获取对应的图片
  // 现在使用占位图片和CSS背景色来模拟不同颜色的车
  
  const getImageUrl = () => {
    // 在实际应用中，这里应该返回真实的车辆图片URL
    // 例如：`/assets/cars/${carId}/${viewAngle}_${carColor}.jpg`
    return '/placeholder.jpg'
  }
  
  const handleRotate = () => {
    // 切换视角
    if (viewAngle === 'front') setViewAngle('side')
    else if (viewAngle === 'side') setViewAngle('rear')
    else setViewAngle('front')
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div 
        className="h-full w-full bg-cover bg-center" 
        style={{
          backgroundImage: `url(${getImageUrl()})`,
          backgroundColor: carColor, // 使用背景色模拟车辆颜色
          backgroundBlendMode: 'multiply',
        }}
      />
      
      {/* 视角控制按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setViewAngle('front')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setViewAngle('side')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* 当前视角指示 */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md">
        {viewAngle === 'front' ? '前视图' : viewAngle === 'side' ? '侧视图' : '后视图'}
      </div>
    </div>
  )
}