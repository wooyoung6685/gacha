import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 캡슐 색상 팔레트 (파스텔 + 비비드 혼합)
export const CAPSULE_COLORS = [
  { bg: '#FF6B6B', shadow: '#cc3333' },
  { bg: '#4ECDC4', shadow: '#2a9d8f' },
  { bg: '#FFE66D', shadow: '#f0c30f' },
  { bg: '#A8E6CF', shadow: '#52b788' },
  { bg: '#FF8B94', shadow: '#e05a6a' },
  { bg: '#C7B3FF', shadow: '#9b72ef' },
  { bg: '#FFB347', shadow: '#e08a1e' },
  { bg: '#87CEEB', shadow: '#4a90d9' },
  { bg: '#DDA0DD', shadow: '#c45fbd' },
  { bg: '#98FB98', shadow: '#4caf50' },
]

// 음식 이모지 목록
export const FOOD_EMOJIS = ['🍕', '🍜', '🍱', '🍔', '🌮', '🍣', '🍙', '🥟', '🍝', '🌭', '🥗', '🍛', '🍲', '🥘', '🍚']

// 컨페티 조각 컴포넌트
function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C7B3FF', '#FFB347']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 1.5 + Math.random() * 1

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: index % 3 === 0 ? '12px' : '8px',
        height: index % 3 === 0 ? '8px' : '12px',
        backgroundColor: color,
        borderRadius: index % 2 === 0 ? '50%' : '2px',
      }}
      initial={{ y: -10, opacity: 1, rotate: 0 }}
      animate={{
        y: '110vh',
        opacity: [1, 1, 0],
        rotate: 720 * (index % 2 === 0 ? 1 : -1),
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
      }}
    />
  )
}

interface CapsuleProps {
  color: { bg: string; shadow: string }
  emoji: string
  restaurantName: string
  onClose: () => void
}

// 결과 캡슐 (열리는 애니메이션 포함)
export function ResultCapsule({ color, emoji, restaurantName, onClose }: CapsuleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // 햅틱 피드백
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  // 탭 시 열리기
  const handleTap = () => {
    if (isOpen) return
    setIsOpen(true)
    setShowConfetti(true)
    vibrate([100, 50, 200])
    // 컨페티 제거
    setTimeout(() => setShowConfetti(false), 2500)
  }

  // 등장 후 자동으로 탭 유도
  useEffect(() => {
    // 자동으로 약간 늦게 열기
    const timer = setTimeout(handleTap, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 no-select">
      {/* 컨페티 */}
      {showConfetti && Array.from({ length: 40 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* 닫힌 캡슐 */
          <motion.div
            key="closed"
            className="cursor-pointer flex flex-col items-center"
            initial={{ scale: 0, y: -80 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            onTap={handleTap}
          >
            <div className="text-center text-gray-500 text-sm mb-3 animate-bounce">탭해서 열기 👆</div>
            {/* 캡슐 상단 */}
            <div
              className="w-24 h-14 rounded-t-full relative"
              style={{ backgroundColor: color.bg, boxShadow: `0 4px 0 ${color.shadow}` }}
            >
              <div className="absolute inset-2 rounded-t-full bg-white/30" />
            </div>
            {/* 캡슐 하단 */}
            <div
              className="w-24 h-14 rounded-b-full relative"
              style={{ backgroundColor: color.shadow, boxShadow: `0 4px 8px rgba(0,0,0,0.3)` }}
            >
              <div className="absolute inset-2 rounded-b-full bg-black/10" />
            </div>
          </motion.div>
        ) : (
          /* 열린 캡슐 + 결과 */
          <motion.div
            key="open"
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            {/* 열린 캡슐 두 조각 */}
            <div className="flex items-end gap-2 mb-2">
              <motion.div
                className="w-16 h-10 rounded-tl-full rounded-bl-full"
                style={{ backgroundColor: color.bg }}
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -30, rotate: -30, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
              />
              <motion.div
                className="w-16 h-10 rounded-tr-full rounded-br-full"
                style={{ backgroundColor: color.shadow }}
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: 30, rotate: 30, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
              />
            </div>

            {/* 이모지 */}
            <motion.div
              className="text-7xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.3 }}
            >
              {emoji}
            </motion.div>

            {/* 식당 이름 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-sm text-gray-500 mb-1">오늘의 점심</div>
              <div
                className="text-3xl font-bold px-6 py-2 rounded-2xl"
                style={{ backgroundColor: color.bg + '40', color: color.shadow }}
              >
                {restaurantName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 버튼 */}
      {isOpen && (
        <motion.div
          className="flex gap-3 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className="flex-1 px-5 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: '#6B7280', minHeight: '44px' }}
            onClick={onClose}
          >
            🎉 다시 뽑기
          </button>
          <button
            className="flex-1 px-5 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: '#10B981', minHeight: '44px' }}
            onClick={onClose}
          >
            ✅ 여기로 결정!
          </button>
        </motion.div>
      )}
    </div>
  )
}

// 돔 안 장식용 미니 캡슐
interface MiniCapsuleProps {
  color: { bg: string; shadow: string }
  emoji: string
  style?: React.CSSProperties
  isActive?: boolean
}

export function MiniCapsule({ color, emoji, style, isActive }: MiniCapsuleProps) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ ...style }}
    >
      {/* 캡슐 상단 */}
      <div
        className="w-8 h-5 rounded-t-full relative overflow-hidden"
        style={{ backgroundColor: color.bg }}
      >
        <div className="absolute inset-1 rounded-t-full bg-white/30" />
      </div>
      {/* 캡슐 하단 */}
      <div
        className="w-8 h-5 rounded-b-full flex items-center justify-center text-xs"
        style={{ backgroundColor: color.shadow }}
      >
        {isActive ? emoji : ''}
      </div>
    </div>
  )
}
