"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Box } from "@react-three/drei"

interface Car3DSceneProps {
  zoom: number
  carColor: string
  interiorColor: string
  wheelSize: 'small' | 'medium' | 'large'
}

export default function Car3DScene({ zoom, carColor, interiorColor, wheelSize }: Car3DSceneProps) {
  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1, zoom]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Car color={carColor} interiorColor={interiorColor} wheelSize={wheelSize} />
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
  )
}

interface CarProps {
  color: string
  interiorColor: string
  wheelSize: 'small' | 'medium' | 'large'
}

export function Car({ color, interiorColor, wheelSize }: CarProps) {
  // 根据轮毂尺寸设置车轮大小
  const wheelSizeMap = {
    small: 0.35,
    medium: 0.4,
    large: 0.45
  }
  
  const wheelRadius = wheelSizeMap[wheelSize]
  
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
      
      {/* 内饰 - 座椅 */}
      <Box args={[1.4, 0.4, 0.6]} position={[0.4, 0.7, 0.2]}>
        <meshStandardMaterial color={interiorColor} />
      </Box>
      <Box args={[1.4, 0.4, 0.6]} position={[-0.4, 0.7, 0.2]}>
        <meshStandardMaterial color={interiorColor} />
      </Box>
      <Box args={[1.4, 0.4, 0.6]} position={[0.4, 0.7, -1]}>
        <meshStandardMaterial color={interiorColor} />
      </Box>
      <Box args={[1.4, 0.4, 0.6]} position={[-0.4, 0.7, -1]}>
        <meshStandardMaterial color={interiorColor} />
      </Box>
      
      {/* 内饰 - 仪表盘 */}
      <Box args={[1.4, 0.2, 0.3]} position={[0, 0.9, 1.5]}>
        <meshStandardMaterial color={interiorColor} />
      </Box>
      
      {/* 车轮 - 根据wheelSize动态调整大小 */}
      <Box args={[wheelRadius, wheelRadius, wheelRadius]} position={[-1, 0.2, -1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[wheelRadius, wheelRadius, wheelRadius]} position={[1, 0.2, -1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[wheelRadius, wheelRadius, wheelRadius]} position={[-1, 0.2, 1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[wheelRadius, wheelRadius, wheelRadius]} position={[1, 0.2, 1.5]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    </group>
  )
}