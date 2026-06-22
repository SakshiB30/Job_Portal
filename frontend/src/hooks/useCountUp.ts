import { useEffect, useRef, useState } from "react"

interface UseCountUpOptions {
  end: number
  duration?: number
  startOnVisible?: boolean
}

export function useCountUp({ end, duration = 2000, startOnVisible = true }: UseCountUpOptions) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startOnVisible) {
      animateCount()
      return
    }

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animateCount()
          observer.unobserve(element)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [end, duration, startOnVisible])

  function animateCount() {
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }

  return { count, ref }
}
