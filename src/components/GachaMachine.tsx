import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAPSULE_COLORS, FOOD_EMOJIS, MiniCapsule, ResultCapsule } from './Capsule'
import type { Restaurant } from '../hooks/useRestaurants'

// 머신 상태 타입
type MachineState = 'idle' | 'coin' | 'spinning' | 'ejecting' | 'result'

interface GachaMachineProps {
  restaurants: Restaurant[]
  excludeDrawn: boolean
  onExcludeToggle: () => void
}

// 랜덤 선택 유틸
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 돔 안 캡슐 위치 데이터 (미리 계산된 자연스러운 위치)
const DOME_CAPSULES = [
  { left: '15%', top: '35%', rotate: -20, colorIdx: 0, emojiIdx: 0 },
  { left: '55%', top: '20%', rotate: 15, colorIdx: 1, emojiIdx: 1 },
  { left: '30%', top: '55%', rotate: -10, colorIdx: 2, emojiIdx: 2 },
  { left: '65%', top: '45%', rotate: 25, colorIdx: 3, emojiIdx: 3 },
  { left: '45%', top: '65%', rotate: -30, colorIdx: 4, emojiIdx: 4 },
  { left: '20%', top: '70%', rotate: 10, colorIdx: 5, emojiIdx: 5 },
  { left: '72%', top: '68%', rotate: -15, colorIdx: 6, emojiIdx: 6 },
  { left: '38%', top: '38%', rotate: 5, colorIdx: 7, emojiIdx: 7 },
]

export default function GachaMachine({ restaurants, excludeDrawn, onExcludeToggle }: GachaMachineProps) {
  const [state, setState] = useState<MachineState>('idle')
  const [hasCoin, setHasCoin] = useState(false)
  const [capsuleShaking, setCapsuleShaking] = useState(false)
  const [result, setResult] = useState<{ restaurant: Restaurant; color: typeof CAPSULE_COLORS[0]; emoji: string } | null>(null)
  const [drawnIds, setDrawnIds] = useState<Set<string>>(new Set())
  const [showCoinAnim, setShowCoinAnim] = useState(false)

  // 손잡이 드래그 상태
  const handleRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  // 사용 가능한 식당 목록 계산
  const availableRestaurants = excludeDrawn
    ? restaurants.filter((r) => !drawnIds.has(r.id))
    : restaurants

  const canInsertCoin = state === 'idle' && !hasCoin && availableRestaurants.length > 0
  const canTurnHandle = state === 'idle' && hasCoin && availableRestaurants.length > 0

  // 동전 넣기
  const insertCoin = useCallback(() => {
    if (!canInsertCoin) return
    setState('coin')
    setShowCoinAnim(true)
    vibrate(50)

    setTimeout(() => {
      setShowCoinAnim(false)
      setHasCoin(true)
      setState('idle')
    }, 500)
  }, [canInsertCoin])

  // 가챠 뽑기 실행
  const pullHandle = useCallback(() => {
    if (!canTurnHandle) return

    setState('spinning')
    vibrate([30, 50, 30, 50, 30])

    // 캡슐 흔들기
    setCapsuleShaking(true)
    setTimeout(() => setCapsuleShaking(false), 600)

    // 결과 선택
    const picked = pickRandom(availableRestaurants)
    const color = pickRandom(CAPSULE_COLORS)
    const emoji = pickRandom(FOOD_EMOJIS)

    // 배출 → 결과
    setTimeout(() => {
      setState('ejecting')
      setHasCoin(false)

      if (excludeDrawn) {
        setDrawnIds((prev) => new Set([...prev, picked.id]))
      }

      setTimeout(() => {
        setResult({ restaurant: picked, color, emoji })
        setState('result')
      }, 800)
    }, 800)
  }, [canTurnHandle, availableRestaurants, excludeDrawn])

  // 결과 닫기 (다시 뽑기)
  const handleClose = () => {
    setResult(null)
    setState('idle')
  }

  // 손잡이 드래그 핸들러 (스와이프로 뽑기)
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return
    const delta = e.clientY - dragStartY.current
    // 아래로 40px 이상 드래그 = 손잡이 당기기
    if (delta > 40) pullHandle()
    dragStartY.current = null
  }

  // 배출구 위치에 캡슐 이미지 (토출 애니메이션)
  const ejectColor = result?.color || CAPSULE_COLORS[0]

  return (
    <div className="flex flex-col items-center gap-4 no-select">
      {/* 결과 모달 오버레이 */}
      <AnimatePresence>
        {state === 'result' && result && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ResultCapsule
                color={result.color}
                emoji={result.emoji}
                restaurantName={result.restaurant.name}
                onClose={handleClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 가챠 머신 본체 */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={state === 'spinning' ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* 상단 타이틀 패널 */}
        <div className="relative z-10 bg-red-700 rounded-t-2xl px-8 py-2 shadow-lg">
          <div className="text-yellow-300 font-black text-lg tracking-widest text-center" style={{ fontFamily: 'serif' }}>
            🍽️ LUNCH GACHA
          </div>
          <div className="text-yellow-500 text-xs text-center font-bold">ランチ ガチャ</div>
        </div>

        {/* 머신 본체 */}
        <div className="relative bg-red-600 rounded-2xl px-4 pb-4 pt-2 shadow-2xl"
          style={{ width: '260px', boxShadow: '4px 8px 0 #991b1b, inset 0 2px 4px rgba(255,255,255,0.2)' }}>

          {/* 투명 돔 */}
          <div
            className="relative mx-auto rounded-full overflow-hidden border-4 border-white/50"
            style={{
              width: '200px',
              height: '200px',
              background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.6) 0%, rgba(200,230,255,0.3) 40%, rgba(150,200,240,0.4) 100%)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {/* 돔 광택 */}
            <div
              className="absolute rounded-full"
              style={{
                top: '10%',
                left: '15%',
                width: '30%',
                height: '25%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 100%)',
                transform: 'rotate(-20deg)',
              }}
            />

            {/* 돔 안 미니 캡슐들 */}
            {DOME_CAPSULES.map((cap, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: cap.left, top: cap.top, rotate: `${cap.rotate}deg` }}
                animate={
                  capsuleShaking
                    ? {
                        y: [0, -8, 4, -6, 2, 0],
                        x: [0, 3, -2, 4, -1, 0],
                        rotate: [cap.rotate, cap.rotate + 15, cap.rotate - 10, cap.rotate + 5, cap.rotate],
                      }
                    : {
                        y: [0, -3, 1, 0],
                        rotate: [cap.rotate, cap.rotate + 2, cap.rotate - 1, cap.rotate],
                      }
                }
                transition={{
                  duration: capsuleShaking ? 0.5 : 2 + i * 0.3,
                  repeat: capsuleShaking ? 0 : Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              >
                <MiniCapsule
                  color={CAPSULE_COLORS[cap.colorIdx % CAPSULE_COLORS.length]}
                  emoji={FOOD_EMOJIS[cap.emojiIdx % FOOD_EMOJIS.length]}
                  isActive={true}
                />
              </motion.div>
            ))}
          </div>

          {/* 손잡이 영역 (우측) + 동전 투입구 (좌측) */}
          <div className="flex items-center justify-between mt-3 px-1">
            {/* 동전 투입구 */}
            <div className="relative flex flex-col items-center">
              <div className="text-xs text-yellow-200 font-bold mb-1">COIN</div>
              <div
                className="relative bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ width: '48px', height: '48px' }}
              >
                {/* 슬롯 */}
                <div className="absolute w-8 h-1.5 bg-gray-600 rounded-full" />
                <div className="absolute bottom-0 w-full h-3 bg-gray-900 rounded-b-lg" />

                {/* 동전 투입 애니메이션 */}
                <AnimatePresence>
                  {showCoinAnim && (
                    <motion.div
                      className="absolute text-xl z-10"
                      initial={{ y: -30, opacity: 1 }}
                      animate={{ y: 20, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.4, ease: 'easeIn' }}
                    >
                      🪙
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 동전 있음 표시 */}
                {hasCoin && (
                  <motion.div
                    className="absolute bottom-1 text-xs text-yellow-400 font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    OK
                  </motion.div>
                )}
              </div>
            </div>

            {/* 토출구 (중앙 하단) */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-yellow-200 font-bold mb-1">OUTPUT</div>
              <div
                className="relative bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ width: '60px', height: '48px', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)' }}
              >
                {/* 토출 캡슐 애니메이션 */}
                <AnimatePresence>
                  {state === 'ejecting' && (
                    <motion.div
                      className="absolute"
                      initial={{ y: -60, scale: 0.5, rotate: -180 }}
                      animate={{ y: 0, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-5 rounded-t-full" style={{ backgroundColor: ejectColor.bg }} />
                        <div className="w-8 h-5 rounded-b-full" style={{ backgroundColor: ejectColor.shadow }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 손잡이 */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-yellow-200 font-bold mb-1">TURN</div>
              <motion.div
                ref={handleRef}
                className="cursor-pointer select-none"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onClick={pullHandle}
                animate={state === 'spinning' ? { rotate: [0, 180, 360] } : {}}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ filter: canTurnHandle ? 'none' : 'grayscale(0.6) brightness(0.7)' }}
              >
                {/* 손잡이 기둥 */}
                <div
                  className="w-3 h-8 mx-auto rounded-full"
                  style={{ background: 'linear-gradient(to right, #d97706, #fbbf24, #d97706)' }}
                />
                {/* 손잡이 구 */}
                <div
                  className="w-10 h-10 rounded-full border-4 border-yellow-600 flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #fde68a, #d97706)',
                    boxShadow: '2px 4px 0 #92400e',
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-yellow-200/60" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* 머신 하단 발판 */}
          <div
            className="absolute -bottom-3 left-2 right-2 h-4 rounded-b-xl"
            style={{ background: 'linear-gradient(to bottom, #991b1b, #7f1d1d)' }}
          />
        </div>

        {/* 동전 넣기 버튼 */}
        <div className="mt-6 flex flex-col items-center gap-2 w-full px-4">
          {availableRestaurants.length === 0 ? (
            <div className="text-center text-red-500 font-semibold text-sm bg-red-50 rounded-xl px-4 py-3 w-full">
              {excludeDrawn && drawnIds.size > 0
                ? '모든 식당을 다 뽑았어요! 🎉\n토글을 끄거나 식당을 추가해주세요.'
                : '식당을 먼저 추가해주세요! 🍽️'}
            </div>
          ) : !hasCoin ? (
            <motion.button
              className="w-full py-3 rounded-2xl font-black text-lg text-white shadow-lg"
              style={{
                background: canInsertCoin ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#9ca3af',
                boxShadow: canInsertCoin ? '0 4px 0 #92400e' : '0 4px 0 #6b7280',
                minHeight: '48px',
              }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={insertCoin}
              disabled={!canInsertCoin}
            >
              🪙 동전 넣기
            </motion.button>
          ) : (
            <motion.button
              className="w-full py-3 rounded-2xl font-black text-lg text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 0 #991b1b',
                minHeight: '48px',
              }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={pullHandle}
              disabled={state !== 'idle'}
            >
              {state === 'spinning' ? '🎰 뽑는 중...' : '🎰 손잡이 당기기!'}
            </motion.button>
          )}

          {/* 상태 안내 */}
          <div className="text-xs text-gray-400 text-center">
            {hasCoin ? '손잡이를 당기거나 버튼을 눌러주세요' : '동전을 넣으면 시작됩니다'}
            {availableRestaurants.length > 0 && (
              <span className="ml-1">({availableRestaurants.length}개 등록)</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* 이미 뽑은 식당 제외 토글 */}
      <div
        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 cursor-pointer"
        style={{ minHeight: '44px' }}
        onClick={onExcludeToggle}
      >
        <div
          className="relative w-10 h-6 rounded-full transition-colors duration-200"
          style={{ backgroundColor: excludeDrawn ? '#10b981' : '#d1d5db' }}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
            animate={{ left: excludeDrawn ? '50%' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          />
        </div>
        <span className="text-sm text-gray-700 font-medium">이미 뽑은 식당 제외</span>
        {excludeDrawn && drawnIds.size > 0 && (
          <span className="text-xs text-green-600 font-semibold ml-auto">
            {drawnIds.size}/{restaurants.length}
          </span>
        )}
      </div>
    </div>
  )
}
