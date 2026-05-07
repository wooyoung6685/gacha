# 🎰 점심 가챠

일본 가챠폰 스타일의 점심 메뉴 랜덤 뽑기 웹앱

## 기술 스택

- React 19 + Vite 5 + TypeScript
- Tailwind CSS v4
- Framer Motion

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages 배포

### 1. 저장소 생성

GitHub에서 저장소 이름을 `roulette`으로 생성합니다.

### 2. 원격 저장소 연결

```bash
git remote add origin https://github.com/유저명/roulette.git
git push -u origin main
```

### 3. 배포 실행

```bash
npm run deploy
```

> `gh-pages` 브랜치가 자동으로 생성되고, GitHub Pages가 해당 브랜치에서 서빙됩니다.

### 4. GitHub Pages 설정

GitHub 저장소 → Settings → Pages → Branch: `gh-pages` / `/ (root)` 선택 후 저장

배포 주소: `https://유저명.github.io/roulette/`

## 주요 기능

- 가챠폰 머신 비주얼 (투명 돔 + 알록달록 캡슐)
- 동전 넣기 → 손잡이 당기기 → 캡슐 토출 플로우
- 캡슐 탭 시 쪼개지며 식당 공개 + confetti 효과
- localStorage로 식당 리스트 영속화
- 이미 뽑은 식당 제외 토글
- 햅틱 피드백 (모바일)
- 손잡이 스와이프 조작
