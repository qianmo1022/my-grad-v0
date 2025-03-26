"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface CarViewerProps {
  carColor: string
}

export default function CarViewer({ carColor }: CarViewerProps) {
  const [zoom, setZoom] = useState(5)

  return (
    <div className="relative h-full w-full">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 1, zoom]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Car color={carColor} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        </Suspense>
      </Canvas>

      {/* 控制按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="secondary" size="icon" onClick={() => setZoom((prev) => Math.min(prev + 1, 8))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setZoom((prev) => Math.max(prev - 1, 3))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={() => setZoom(5)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// 3D车辆模型组件
function Car({ color }: { color: string }) {
  // 使用示例模型 - 在实际应用中应替换为真实的汽车模型
  const { scene } = useGLTF("/assets/3d/duck.glb")
  const previousColor = useRef(color)

  useEffect(() => {
    // 只在颜色真正变化时更新材质，避免不必要的更新
    if (previousColor.current !== color) {
      // 在实际应用中，这里应该更新汽车模型的材质颜色
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // 这里只是示例，实际应用中应该根据模型结构来更新特定部分的颜色
          if (child.material.name === "body" || child.name.includes("body")) {
            child.material.color.set(color)
          }
        }
      })
      previousColor.current = color
    }
  }, [color, scene])

  return <primitive object={scene} scale={2} position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />
}

// 预加载模型
useGLTF.preload("/assets/3d/duck.glb")

