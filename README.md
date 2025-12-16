# 🎬 Movie (Vite + Vue 3 + TypeScript)

Netflix 스타일의 SPA로 TMDB API를 활용해 홈/인기/검색/위시리스트/인증 흐름을 제공하며, Vue 3 Composition API와 Vite를 기반으로 한 프로젝트입니다. GitHub Actions에서 자동 빌드/배포를 거쳐 GitHub Pages에 호스팅됩니다.

## ✅ 핵심 항목
- **기술 스택**: Vue 3, Vite, TypeScript, Axios, Composition API, Vue Router
- **배포**: GitHub Actions → GitHub Pages (`main` 브랜치)
- **인증/저장**: LocalStorage 기반 사용자·세션·위시리스트 관리
- **데이터**: TMDB REST API + 이미지 URL, 다중 카테고리 및 절약된 API 키 이용
- **UI/UX**: 반응형 layout, 헤더/카드/테이블 트랜지션, 모바일 햄버거·스크롤 토글

## 🚀 시작하기

```bash
npm install
npm run dev
```

- **개발 서버**: `http://localhost:5173`
- **빌드**: `npm run build`
- **미리보기**: `npm run preview`

## 🔑 환경 변수
`.env.local`에 다음 값을 넣어주세요:

```env
VITE_TMDB_API_KEY=<TMDB_API_KEY>
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

## 🌍 주요 뷰 & 기능

| 라우트 | 설명 |
| --- | --- |
| `/` | TMDB 인기·현재상영·개봉예정·평점 8.0+ 4개 섹션, 히어로 배너, 추천 버튼 & statistics |
| `/popular` | 테이블 vs 무한 스크롤 전환, 페이징, 상세 토글, Top 버튼, 무한 로딩 |
| `/search` | 검색 입력 + 장르/평점/정렬 필터, 필터 초기화, Grid/List 결과 |
| `/wishlist` | LocalStorage 기반 위시리스트, Grid/Table 뷰 전환, 필터/정렬/검색 |
| `/signin` | 로그인/회원가입 플립 UI, 이메일/비밀번호/약관/Remember me, toasts |

## 🔧 프로젝트 구조

```
src
 ├─ components
 │   ├─ layout/AppHeader.vue        # 반응형 헤더/햄버거 메뉴
 │   ├─ movies/MovieCard.vue        # 카드 hover 효과, 찜 버튼
 │   └─ movies/MovieList.vue        # 인기 컬렉션/테이블 뷰
 ├─ composables
 │   ├─ useAuth.ts                  # 인증, LocalStorage, remember me
 │   ├─ useTmdb.ts                  # TMDB API 호출 & 이미지 URL
 │   └─ useWishlist.ts              # 로컬 위시리스트 토글/통계
 ├─ views
 │   ├─ HomeView.vue                # 메인 홈
 │   ├─ PopularView.vue             # Table/Infinite 뷰
 │   ├─ SearchView.vue              # 검색/필터 UI
 │   ├─ WishlistView.vue            # 위시리스트 매니저
 │   └─ SignInView.vue              # 로그인/회원가입 플립
 └─ router
     └─ index.ts                    # SPA 라우팅
```

## 🧭 Git Flow & 협업

- **브랜치 전략**
  - `main`: 배포용(직접 푸시 금지 권장)
  - `develop`: 통합 개발 브랜치
  - `feature/*`: 기능 단위 (예: `feature/trending`, `feature/auth`)
  - Optional: `release/*`, `hotfix/*`
- **커밋/PR**
  - 커밋 메시지는 의미 있는 문장(예: `feat: add wishlist filters`, `fix: align header spacing`)
  - PR 템플릿 + 리뷰 요구가 설정되어 테스트 · 코드 리뷰를 거치도록 함

## ⚙️ CI/CD & 배포

- `.github/workflows/deploy.yml`은 `main` 브랜치 푸시/수동 워크플로에서 `npm ci`, `npm run build`, `deploy-pages`를 실행하도록 구성돼 있으며, 결과는 GitHub Pages로 자동 반영됩니다.
- 빌드 로그/페이지 URL은 GitHub Actions → Deploy to GitHub Pages job에서 확인할 수 있고, `dist/` 산출물이 업로드됩니다.
- 현재 배포 주소: `https://ansangah.github.io/BP_Netflix/`

## 📝 추가 자료

- README: 이 파일
- `.github/workflows/deploy.yml`: 자동 배포 정의
- `.env.local`: TMDB API 키 구성
- `public/vite.svg`: 기본 favicon (필요 시 교체)

## 📌 제출 팁

1. `develop`에 PR 후 리뷰/CI 통과 확인
2. `main`으로 머지 → GitHub Pages 자동 배포
3. 배포된 URL/모바일 테스트해서 기능 검증

## 🧾 License
MIT
