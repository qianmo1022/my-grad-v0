"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

// 动态导入整个3D场景组件，确保只在客户端渲染
const Car3DScene = dynamic(
  () => import("./three-components"),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center">加载中...</div> }
)

interface CarViewerProps {
  carColor: string
  interiorColor?: string
  wheelSize?: 'small' | 'medium' | 'large'
}

export default function CarViewer({ carColor, interiorColor = '#8B4513', wheelSize = 'medium' }: CarViewerProps) {
  const [zoom, setZoom] = useState(5)

  return (
    <div className="relative h-full w-full">
      <Car3DScene 
        zoom={zoom} 
        carColor={carColor} 
        interiorColor={interiorColor} 
        wheelSize={wheelSize} 
      />

      {/* 控制按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setZoom((prev) => Math.min(prev + 1, 8))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setZoom((prev) => Math.max(prev - 1, 3))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setZoom(5)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
