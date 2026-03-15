import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

from .utils import parse_price

load_dotenv()
BASE_URL = os.environ["KYOBO_BASE_URL"]
BOOKS_PER_PAGE = 50
MAX_WEEKS = 6


def _parse_date(year: int, month: int, text: str) -> str:
    """
    '2026.03.05', '2026-03-05', '03/05' 등을 ISO 포맷으로 변환.
    파싱 실패 시 해당 월 1일 반환.
    """
    import re
    patterns = [
        r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})",
        r"(\d{1,2})[.\-/](\d{1,2})",
    ]
    for pattern in patterns:
        m = re.search(pattern, text or "")
        if m:
            groups = m.groups()
            if len(groups) == 3:
                return f"{int(groups[0]):04d}-{int(groups[1]):02d}-{int(groups[2]):02d}"
            else:
                return f"{year:04d}-{int(groups[0]):02d}-{int(groups[1]):02d}"
    return f"{year:04d}-{month:02d}-01"


async def _crawl_week(page, year: int, month: int, week: int) -> list[dict]:
    """특정 주차의 모든 페이지를 크롤링"""
    books = []
    current_page = 1

    while True:
        url = (
            f"{BASE_URL}#?page={current_page}&sort=new&year={year}&month={month:02d}"
            f"&week={week}&per={BOOKS_PER_PAGE}&saleCmdtDvsnCode=KOR"
            f"&gubun=newGubun&saleCmdtClstCode=33"
        )
        print(f"[교보문고] {year}년 {month}월 {week}주차 {current_page}페이지 크롤링 중...")

        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_selector(".prod_list", timeout=15000)
        except PlaywrightTimeoutError:
            print(f"[교보문고] {week}주차 {current_page}페이지 타임아웃 또는 데이터 없음 - 스킵")
            break

        items = await page.query_selector_all(".prod_list .prod_item")
        if not items:
            break

        for item in items:
            try:
                title_el = await item.query_selector(".prod_name")
                title = (await title_el.inner_text()).strip() if title_el else None
                if not title:
                    continue

                link_el = await item.query_selector("a.prod_link")
                href = await link_el.get_attribute("href") if link_el else None
                kyobo_url = f"https://product.kyobobook.co.kr{href}" if href and href.startswith("/") else href

                img_el = await item.query_selector(".prod_img img")
                image_url = await img_el.get_attribute("src") if img_el else None

                price_el = await item.query_selector(".prod_price .price strong")
                price_text = (await price_el.inner_text()).strip() if price_el else None
                price = parse_price(price_text)

                date_el = await item.query_selector(".prod_publish")
                date_text = (await date_el.inner_text()).strip() if date_el else None
                published_at = _parse_date(year, month, date_text)

                author_el = await item.query_selector(".prod_author")
                author = (await author_el.inner_text()).strip() if author_el else None

                desc_el = await item.query_selector(".prod_desc")
                description = (await desc_el.inner_text()).strip() if desc_el else None

                books.append({
                    "title": title,
                    "author": author,
                    "price": price,
                    "description": description,
                    "image_url": image_url,
                    "published_at": published_at,
                    "is_preorder": False,
                    "kyobo_url": kyobo_url,
                })
            except Exception as e:
                print(f"[교보문고] 책 파싱 오류: {e}")
                continue

        next_btn = await page.query_selector(".paging_wrap .btn_next:not(.disabled)")
        if not next_btn or len(items) < BOOKS_PER_PAGE:
            break

        current_page += 1
        await asyncio.sleep(1)

    return books


async def crawl_kyobo() -> list[dict]:
    """교보문고 이번달 전체 신간 크롤링 (1~6주차 순회)"""
    now = datetime.now()
    year = now.year
    month = now.month

    all_books: list[dict] = []
    seen_urls: set[str] = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_extra_http_headers({
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        })

        for week in range(1, MAX_WEEKS + 1):
            week_books = await _crawl_week(page, year, month, week)

            if not week_books:
                print(f"[교보문고] {week}주차 데이터 없음 - 이후 주차 스킵")
                break

            for book in week_books:
                key = book.get("kyobo_url")
                if key and key not in seen_urls:
                    seen_urls.add(key)
                    all_books.append(book)

            await asyncio.sleep(2)

        await browser.close()

    print(f"[교보문고] 총 {len(all_books)}권 수집 완료")
    return all_books


if __name__ == "__main__":
    books = asyncio.run(crawl_kyobo())
    for b in books[:3]:
        print(b)
