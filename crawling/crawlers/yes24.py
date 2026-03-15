import os
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from .utils import HEADERS, parse_price, is_current_month, parse_korean_date

load_dotenv()
BASE_URL = os.environ["YES24_BASE_URL"]
BOOKS_PER_PAGE = 120


def _build_url(page: int) -> str:
    return (
        f"{BASE_URL}?pageNumber={page}&pageSize={BOOKS_PER_PAGE}"
        f"&categoryNumber=001001003"
    )


def _parse_book(item) -> dict | None:
    try:
        title_el = item.select_one(".info_name a.gd_name") or item.select_one("a.gd_name")
        if not title_el:
            return None

        title = title_el.get_text(strip=True)
        href = title_el.get("href", "")
        yes24_url = f"https://www.yes24.com{href}" if href.startswith("/") else href

        img_el = item.select_one("img.lazy") or item.select_one("img")
        image_url = img_el.get("data-original") or img_el.get("src") if img_el else None

        price_el = item.select_one(".info_price .yes_b") or item.select_one(".info_price em")
        price = parse_price(price_el.get_text(strip=True)) if price_el else None

        published_at = parse_korean_date(item.get_text(" ", strip=True))

        # 예약판매 여부: 발견 즉시 중단
        is_preorder = False
        for selector in (".tag_list .tag", ".ico_list span", "em.ico_pre"):
            for badge in item.select(selector):
                if "예약" in badge.get_text():
                    is_preorder = True
                    break
            if is_preorder:
                break
        if not is_preorder:
            btn_el = item.select_one(".btn_basket") or item.select_one("a.btnBasket")
            if btn_el and "예약" in btn_el.get_text():
                is_preorder = True

        author_el = item.select_one(".info_auth a") or item.select_one(".info_auth")
        author = author_el.get_text(strip=True) if author_el else None

        desc_el = item.select_one(".info_desc") or item.select_one(".gd_desc")
        description = desc_el.get_text(strip=True) if desc_el else None

        return {
            "title": title,
            "author": author,
            "price": price,
            "description": description,
            "image_url": image_url,
            "published_at": published_at,
            "is_preorder": is_preorder,
            "yes24_url": yes24_url,
        }
    except Exception as e:
        print(f"[yes24] 책 파싱 오류: {e}")
        return None


def crawl_yes24() -> list[dict]:
    """yes24 이번달 IT 신간 크롤링 (최근 2개월치 중 이번달만 필터링)"""
    now = datetime.now()
    year = now.year
    month = now.month

    all_books: list[dict] = []
    current_page = 1

    while True:
        url = _build_url(current_page)
        print(f"[yes24] {current_page}페이지 크롤링 중...")

        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
            response.encoding = "utf-8"
        except requests.RequestException as e:
            print(f"[yes24] 요청 오류: {e}")
            break

        soup = BeautifulSoup(response.text, "lxml")
        items = soup.select(".itemUnit") or soup.select(".item_unit") or soup.select("li.item_li")

        if not items:
            print(f"[yes24] {current_page}페이지 데이터 없음 - 종료")
            break

        for item in items:
            book = _parse_book(item)
            if book and is_current_month(book["published_at"], year, month):
                all_books.append(book)

        next_btn = soup.select_one(".pageBtnArea a.next") or soup.select_one(".paging_area a.next")
        if not next_btn:
            break

        current_page += 1
        time.sleep(1)

    print(f"[yes24] 총 {len(all_books)}권 수집 완료")
    return all_books


if __name__ == "__main__":
    books = crawl_yes24()
    for b in books[:3]:
        print(b)
