import { type ReactNode, type CSSProperties } from "react"
import { useScrollAnimation } from "../hooks/useScrollAnimation"

type AnimationType =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "fade-in-bottom"
  | "none"

interface AnimatedSectionProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
  style?: CSSProperties
}

const animationMap: Record<AnimationType, string> = {
  "fade-in": "animate-on-scroll fade-in",
  "slide-up": "animate-on-scroll slide-up",
  "slide-down": "animate-on-scroll slide-down",
  "slide-left": "animate-on-scroll slide-left",
  "slide-right": "animate-on-scroll slide-right",
  "scale-in": "animate-on-scroll scale-in",
  "fade-in-bottom": "animate-on-scroll fade-in-bottom",
  none: "",
}

export default function AnimatedSection({
  children,
  animation = "slide-up",
  delay = 0,
  duration = 0.5,
  threshold,
  rootMargin,
  triggerOnce = true,
  className = "",
  style,
}: AnimatedSectionProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
  })

  const animClass = animationMap[animation] || animationMap["slide-up"]

  const combinedStyle: CSSProperties = {
    ...style,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}s`,
  }

  return (
    <div
      ref={ref}
      className={`${animClass} ${isVisible ? "is-visible" : ""} ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  )
}

export function StaggerGroup({
  children,
  baseDelay = 0,
  staggerDelay = 80,
  animation = "slide-up",
  className = "",
}: {
  children: ReactNode[]
  baseDelay?: number
  staggerDelay?: number
  animation?: AnimationType
  className?: string
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <AnimatedSection
          key={i}
          animation={animation}
          delay={baseDelay + i * staggerDelay}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  )
}
