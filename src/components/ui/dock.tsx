import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface DockProps {
  children: React.ReactNode
  className?: string
  iconSize?: number
  iconMagnification?: number
  iconDistance?: number
  direction?: 'top' | 'bottom' | 'middle'
}

export function Dock({
  children,
  className = '',
  iconSize = 40,
  iconMagnification = 60,
  iconDistance = 140,
  direction = 'middle',
}: DockProps) {
  const mouseX = useMotionValue(Infinity)

  const getDirection = () => {
    switch (direction) {
      case 'top':
        return 'mb-2'
      case 'bottom':
        return 'mt-2'
      case 'middle':
      default:
        return 'my-auto'
    }
  }

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex items-end gap-1 rounded-2xl bg-[#1a1a2e] px-4 pb-2 pt-2 ${getDirection()} ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            mouseX,
            iconSize,
            iconMagnification,
            iconDistance,
          })
        }
        return child
      })}
    </motion.div>
  )
}

interface DockIconProps {
  children: React.ReactNode
  mouseX?: any
  iconSize?: number
  iconMagnification?: number
  iconDistance?: number
  className?: string
}

export function DockIcon({
  children,
  mouseX,
  iconSize = 40,
  iconMagnification = 60,
  iconDistance = 140,
  className = '',
}: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val: number) => {
    if (!ref.current) return 0
    const bounds = ref.current.getBoundingClientRect()
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distance,
    [-iconDistance, 0, iconDistance],
    [iconSize, iconMagnification, iconSize]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={`flex items-center justify-center rounded-full bg-[#2a2a4a] cursor-pointer transition-colors hover:bg-[#3a3a5a] ${className}`}
    >
      {children}
    </motion.div>
  )
}
