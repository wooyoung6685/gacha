import { useState } from 'react'
import GachaMachine from './components/GachaMachine'
import RestaurantManager from './components/RestaurantManager'
import { useRestaurants } from './hooks/useRestaurants'

function App() {
  const { restaurants, addRestaurant, removeRestaurant } = useRestaurants()
  const [excludeDrawn, setExcludeDrawn] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: 'linear-gradient(160deg, #fff1f2 0%, #fef3c7 50%, #ecfdf5 100%)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* 상단 헤더 */}
      <header className="w-full text-center pt-6 pb-2 px-4">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
          🎰 점심 가챠
        </h1>
        <p className="text-gray-500 text-xs mt-1">오늘 뭐 먹지? 운명에 맡겨봐!</p>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="w-full max-w-sm px-4 flex flex-col gap-6 pb-8">
        {/* 가챠 머신 */}
        <section>
          <GachaMachine
            restaurants={restaurants}
            excludeDrawn={excludeDrawn}
            onExcludeToggle={() => setExcludeDrawn((v) => !v)}
          />
        </section>

        {/* 식당 관리 */}
        <section>
          <RestaurantManager
            restaurants={restaurants}
            onAdd={addRestaurant}
            onRemove={removeRestaurant}
          />
        </section>
      </main>
    </div>
  )
}

export default App
