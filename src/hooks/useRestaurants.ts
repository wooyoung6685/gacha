import { useState, useEffect } from 'react'

const STORAGE_KEY = 'gacha_restaurants'

// 기본 제공 식당 목록 (처음 실행 시 로드)
const DEFAULT_RESTAURANTS = [
  '마이니치라멘',
  '소담식당 (닭곰탕)',
  '종쓰부',
  '철사장',
  '정해장 (순살 뼈해장국)',
  '마구로젠',
  '반미샌드위치',
  '뜸들이다',
  '맥도날드',
  '명동칼국수',
  '싸다김밥',
  '시골집 (쌈밥집)',
  '서브웨이',
  '막내픽',
]

export interface Restaurant {
  id: string
  name: string
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // localStorage 접근 실패 시 기본값 사용
    }
    return DEFAULT_RESTAURANTS.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }))
  })

  // 변경될 때마다 localStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants))
    } catch {
      // 저장 실패 시 무시
    }
  }, [restaurants])

  const addRestaurant = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    // 중복 체크
    if (restaurants.some((r) => r.name === trimmed)) return false
    setRestaurants((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }])
    return true
  }

  const removeRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
  }

  return { restaurants, addRestaurant, removeRestaurant }
}
