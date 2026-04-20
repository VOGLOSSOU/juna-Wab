'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  readOnly?: boolean
  onChange?: (value: number) => void
  size?: number
}

export function StarRating({ value, max = 5, readOnly = true, onChange, size = 20 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const filled = readOnly ? starValue <= value : starValue <= (hovered || value)

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? '#F9A825' : 'none'}
            stroke={filled ? '#F9A825' : '#AAAAAA'}
            strokeWidth="1.5"
            className={cn(!readOnly && 'cursor-pointer transition-transform hover:scale-110')}
            onMouseEnter={() => !readOnly && setHovered(starValue)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange?.(starValue)}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      })}
    </div>
  )
}
