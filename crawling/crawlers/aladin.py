import os
import re
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from .utils import HEADERS, parse_price, is_current_month, parse_korean_date

load_dotenv()
BASE_URL = os.environ["ALADIN_BASE_URL"]
BOOKS_PER_PAGE = 50


def _build_url(page: int) -> str:
    return (
        f"{BASE_URL}?ViewRowsCount={BOOKS_PER_PAGE}&ViewType=Detail"
        f"&SortOrder=6&page={page}&BranchType=1&PublishDay=168"
        f"&CID=351&NewType=SpecialNew"
    )


def _find_book_containers(soup: BeautifulSoup):
    """
    a.bo3 링크에서 부모를 타고 올라가 책 전체 정보를 담는 컨테이너를 찾음.
    보통 <tr> 또는 class가 있는 <div>/<li>가 컨테이너.
    """
    title_links = soup.select("a.bo3[href*='wproduct']")
    containers = []
    seen_ids = set()

    for link in title_links:
        # tr → div(class 있는) → li 순으로 부모 탐색
        container = (
            link.find_parent("tr")
            or link.find_parent(lambda t: t.name == "div" and t.get("class"))
            or link.find_parent("li")
        )
        if container is None:
            continue
        cid = id(container)
        if cid not in seen_ids:
            seen_ids.add(cid)
            containers.append(container)

    return containers


def _parse_book(container) -> dict | None:
    """
    <tr> 컨테이너 구조:
      li[0] = 제목 (a.bo3)
      li[1] = 저자 | 출판사 | 출간일 (예: "신상묵 (지은이) | 카논 | 2026년 3월")
      li[2] = 가격 (예: "24,000원 → 21,600원")
    """
    try:
        lis = container.select(".ss_book_list ul li")

        # 제목
        title_el = container.select_one("a.bo3[href*='wproduct']")
        if not title_el:
            return None
        title = title_el.get_text(strip=True)
        aladin_url = title_el.get("href", "")
        if aladin_url and not aladin_url.startswith("http"):
            aladin_url = "https://www.aladin.co.kr" + aladin_url

        # 이미지
        img_el = container.select_one("img")
        image_url = img_el.get("src") if img_el else None

        # 저자 + 출간일: li[1] 텍스트에서만 추출
        author = None
        published_at = None
        if len(lis) > 1:
            info_li = lis[1]
            author_el = info_li.select_one("a[href*='AuthorSearch']")
            author = author_el.get_text(strip=True) if author_el else None
            published_at = parse_korean_date(info_li.get_text(" ", strip=True))

        # 가격: li[2]에서 할인가 우선
        price = None
        if len(lis) > 2:
            price_li = lis[2]
            price_el = price_li.select_one(".ss_p2") or price_li.select_one("span.ss_p2")
            if price_el:
                price = parse_price(price_el.get_text(strip=True))
            else:
                price_match = re.search(r"(\d{1,3}(?:,\d{3})+)원", price_li.get_text(" ", strip=True))
                price = parse_price(price_match.group(1)) if price_match else None

        # 설명
        desc_el = (
            container.select_one(".ss_book_list_cover_txt2")
            or container.select_one(".bo2")
            or container.select_one("p.ss_f_g2")
        )
        description = desc_el.get_text(strip=True) if desc_el else None

        return {
            "title": title,
            "author": author,
            "price": price,
            "description": description,
            "image_url": image_url,
            "published_at": published_at,
            "is_preorder": False,
            "aladin_url": aladin_url,
        }
    except Exception as e:
        print(f"[알라딘] 책 파싱 오류: {e}")
        return None


def _debug_html(soup: BeautifulSoup) -> None:
    """실제 HTML 구조를 파악하기 위한 디버그 출력"""
    first_link = soup.select_one("a.bo3[href*='wproduct']")
    if first_link:
        print("\n[알라딘 디버그] a.bo3 링크의 부모 체인:")
        el = first_link.parent
        for i in range(6):
            if el is None or el.name == "[document]":
                break
            classes = " ".join(el.get("class", []))
            print(f"  level {i+1}: <{el.name} class='{classes}'>")
            el = el.parent

        containers = _find_book_containers(soup)
        print(f"\n[알라딘 디버그] 감지된 컨테이너 수: {len(containers)}")
        if containers:
            print(f"[알라딘 디버그] 첫 번째 컨테이너 HTML (처음 800자):\n{str(containers[0])[:800]}")


def crawl_aladin(debug: bool = False) -> list[dict]:
    """알라딘 이번달 IT 신간 크롤링"""
    now = datetime.now()
    year = now.year
    month = now.month

    all_books: list[dict] = []
    current_page = 1

    while True:
        url = _build_url(current_page)
        print(f"[알라딘] {current_page}페이지 크롤링 중...")

        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
            response.encoding = "utf-8"
        except requests.RequestException as e:
            print(f"[알라딘] 요청 오류: {e}")
            break

        soup = BeautifulSoup(response.text, "lxml")

        if debug and current_page == 1:
            _debug_html(soup)

        containers = _find_book_containers(soup)

        if not containers:
            print(f"[알라딘] {current_page}페이지 데이터 없음 - 종료")
            break

        stop = False
        for container in containers:
            book = _parse_book(container)
            if not book:
                continue
            if is_current_month(book["published_at"], year, month):
                all_books.append(book)
            elif book["published_at"] and book["published_at"] < f"{year:04d}-{month:02d}-01":
                print(f"[알라딘] 이번달 이전 도서 발견 ({book['published_at']}) - 크롤링 종료")
                stop = True
                break

        if stop:
            break

        next_btn = (
            soup.select_one(".page_nav a.Npaging_next")
            or soup.select_one("a.Npaging_next")
            or soup.select_one(".paging a[title='다음']")
        )
        if not next_btn:
            break
        current_page += 1
        time.sleep(1)

    print(f"[알라딘] 총 {len(all_books)}권 수집 완료")
    return all_books


if __name__ == "__main__":
    books = crawl_aladin(debug=True)
    for b in books[:3]:
        print(b)
