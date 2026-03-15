# 줍줍 크롤러

교보문고 · 알라딘 · YES24에서 이번달 IT 신간 정보를 수집해 Supabase에 적재하는 크롤러입니다.

---

## 구조

```
crawling/
├── .env                  # 환경변수 (git 제외)
├── .env.example          # 환경변수 템플릿
├── requirements.txt
├── main.py               # 실행 진입점
├── supabase_client.py    # Supabase upsert 로직
└── crawlers/
    ├── utils.py          # 공통 유틸 (파싱 함수, User-Agent)
    ├── kyobo.py          # 교보문고 크롤러 (Playwright)
    ├── aladin.py         # 알라딘 크롤러 (requests + BeautifulSoup)
    └── yes24.py          # YES24 크롤러 (requests + BeautifulSoup)
```

---

## 수집 데이터

| 필드 | 설명 |
|------|------|
| `title` | 책 제목 |
| `author` | 저자 |
| `price` | 가격 (원) |
| `description` | 책 설명 |
| `image_url` | 표지 이미지 URL |
| `published_at` | 출간일 |
| `is_preorder` | 예약판매 여부 |
| `kyobo_url` | 교보문고 상세 페이지 URL |
| `aladin_url` | 알라딘 상세 페이지 URL |
| `yes24_url` | YES24 상세 페이지 URL |

중복 제거 기준: **제목 + 저자** 정규화 조합. 같은 책이 여러 사이트에 있으면 URL 필드를 병합해 단일 레코드로 저장합니다.

---

## 초기 세팅

**1. 가상환경 생성 및 활성화**

```bash
cd crawling
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

**2. 패키지 설치**

```bash
pip install -r requirements.txt
playwright install chromium
```

**3. 환경변수 설정**

```bash
cp .env.example .env
```

`.env` 파일을 열어 아래 값을 채워주세요:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key

KYOBO_BASE_URL=https://product.kyobobook.co.kr/new/
ALADIN_BASE_URL=https://www.aladin.co.kr/shop/common/wnew.aspx
YES24_BASE_URL=https://www.yes24.com/product/category/newproduct
```

> `SUPABASE_KEY`는 Supabase 프로젝트의 **service_role** 키를 사용하세요 (anon 키는 RLS 정책에 따라 쓰기가 제한될 수 있습니다).

---

## 실행 방법

**테스트 실행** (Supabase 적재 없이 콘솔 출력만)

```bash
python3 main.py --dry-run
```

**실제 실행** (Supabase에 데이터 적재)

```bash
python3 main.py
```

---

## 사이트별 크롤링 방식

| 사이트 | 방식 | 필터링 |
|--------|------|--------|
| **교보문고** | Playwright (SPA 렌더링) | 1~6주차 순회, 이번달 연도·월 파라미터 |
| **알라딘** | requests + BeautifulSoup | 출간일 기준 이번달만 필터링 |
| **YES24** | requests + BeautifulSoup | 최근 2개월치 중 이번달만 필터링 |

알라딘·YES24는 비동기(`asyncio.to_thread`)로 교보문고와 병렬 실행됩니다.
