# 🎬 Netflix Clone (Vue 3 + TypeScript)

TMDB API를 기반으로 인기 영화, 검색, 위시리스트 등을 제공하는 Netflix 스타일 SPA입니다. Vue 3의 Composition API와 Vite를 사용해 구현했으며, GitHub Pages 자동 배포까지 구성했습니다.

## 📦 Tech Stack
- Vue 3 / Vite / TypeScript
- Axios (TMDB API 연동)
- LocalStorage (회원/추천 데이터 저장)
- GitHub Actions + GitHub Pages (CI/CD)

## 🚀 Getting Started
```bash
npm install
npm run dev
# http://localhost:5173
```

## 📜 Scripts
| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 번들 생성 |
| `npm run preview` | 빌드 결과 미리보기 |

## 🔑 Environment Variables
`.env.local` 파일에 다음 값을 설정해야 합니다.
```
VITE_TMDB_API_KEY=<TMDB_API_KEY>
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

## 📁 주요 기능
- **홈**: 4개 이상의 TMDB 카테고리를 호출해 섹션별 카드로 렌더링.
- **대세 콘텐츠**: 테이블/무한 스크롤 전환, 무한 스크롤 시 IntersectionObserver 사용.
- **검색**: 장르·평점·정렬 필터와 키워드 검색 지원.
- **위시리스트**: 로컬스토리지 기반 저장/통계, Grid/Table 뷰 전환.
- **로그인/회원가입**: LocalStorage 기반 사용자 관리 + Remember me.

## 🧱 Folder Structure
```
src
 ├─ components
 │   ├─ layout/AppHeader.vue
 │   ├─ movies/MovieCard.vue
 │   └─ movies/MovieList.vue
 ├─ composables
 │   ├─ useAuth.ts
 │   ├─ useTmdb.ts
 │   └─ useWishlist.ts
 ├─ views
 │   ├─ HomeView.vue
 │   ├─ PopularView.vue
 │   ├─ SearchView.vue
 │   └─ WishlistView.vue
 └─ router
     └─ index.ts
```

## 🌳 Git Flow
- `main`: 배포 브랜치
- `develop`: 통합 개발 브랜치
- `feature/*`: 기능 단위 브랜치 (예: `feature/wishlist`, `feature/action`)

## ⚙️ Deployment
- `.github/workflows/deploy.yml`에서 GitHub Actions를 설정해 `main` 브랜치 푸시 시 자동으로 `npm run build` 후 GitHub Pages에 업로드합니다.

## 📄 License
MIT
