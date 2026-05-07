import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Restaurant } from '../hooks/useRestaurants'

interface RestaurantManagerProps {
  restaurants: Restaurant[]
  onAdd: (name: string) => boolean
  onRemove: (id: string) => void
}

export default function RestaurantManager({ restaurants, onAdd, onRemove }: RestaurantManagerProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) {
      setError('식당 이름을 입력해주세요')
      return
    }
    const success = onAdd(trimmed)
    if (success) {
      setInput('')
      setError('')
      inputRef.current?.focus()
    } else {
      setError('이미 등록된 식당이에요 😅')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    else if (error) setError('')
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 px-5 py-4">
        <h2 className="text-white font-black text-lg">🍽️ 식당 리스트</h2>
        <p className="text-orange-100 text-xs mt-0.5">
          {restaurants.length === 0
            ? '식당을 추가해서 가챠를 시작해보세요!'
            : `${restaurants.length}개의 식당이 등록되어 있어요`}
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* 입력 영역 */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (error) setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="식당 이름 입력 (Enter로 추가)"
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: error ? '#ef4444' : undefined,
                  minHeight: '44px',
                  fontSize: '16px', // iOS 자동 확대 방지
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                onBlur={(e) => (e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb')}
              />
              <motion.button
                className="px-4 rounded-xl text-white font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  minWidth: '64px',
                  minHeight: '44px',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
              >
                추가
              </motion.button>
            </div>
            {error && (
              <motion.p
                className="text-xs text-red-500 pl-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>
        </div>

        {/* 식당 목록 */}
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
            <div className="text-5xl">🍽️</div>
            <div className="text-sm font-medium">아직 등록된 식당이 없어요</div>
            <div className="text-xs">위에서 식당을 추가해보세요!</div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {restaurants.map((r) => (
                <motion.li
                  key={r.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{ minHeight: '44px' }}
                >
                  {/* 순번 */}
                  <span className="text-gray-400 text-xs font-bold w-5 text-center flex-shrink-0">
                    {restaurants.indexOf(r) + 1}
                  </span>

                  {/* 식당 이름 */}
                  <span className="flex-1 text-gray-800 text-sm font-medium truncate">{r.name}</span>

                  {/* 삭제 버튼 */}
                  <motion.button
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg"
                    style={{ minWidth: '36px', minHeight: '36px' }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onRemove(r.id)}
                    aria-label={`${r.name} 삭제`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
