"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Box } from "@react-three/drei"
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

function Car({ color }: { color: string }) {
  return (
    <group>
      {/* 车身 */}
      <Box args={[2, 0.5, 4]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* 车顶 */}
      <Box args={[1.5, 1, 2]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* 车轮 */}
      <Box args={[0.4, 0.4, 0.4]} position={[-1, 0.2, -1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.4, 0.4, 0.4]} position={[1, 0.2, -1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.4, 0.4, 0.4]} position={[-1, 0.2, 1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.4, 0.4, 0.4]} position={[1, 0.2, 1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    </group>
  )
}

