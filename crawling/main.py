import asyncio
import json
import re
import sys
from crawlers.kyobo import crawl_kyobo
from crawlers.aladin import crawl_aladin
from crawlers.yes24 import crawl_yes24
from supabase_client import upsert_books


def _normalize(text: str) -> str:
    return re.sub(r"[\s\W]", "", text).lower()


def merge_books(all_sources: list[list[dict]]) -> list[dict]:
    """
    여러 소스의 책 목록을 병합하고 중복 제거.
    정규화된 제목 + 저자 기준으로 같은 책이면 URL 필드를 병합.
    """
    merged: dict[str, dict] = {}

    for books in all_sources:
        for book in books:
            title = book.get("title")
            if not title:
                continue

            author = book.get("author") or ""
            key = _normalize(title) + "|" + _normalize(author)

            if key not in merged:
                merged[key] = {
                    "title": title,
                    "author": book.get("author"),
                    "price": book.get("price"),
                    "description": book.get("description"),
                    "image_url": book.get("image_url"),
                    "published_at": book.get("published_at"),
                    "is_preorder": book.get("is_preorder", False),
                    "kyobo_url": book.get("kyobo_url"),
                    "aladin_url": book.get("aladin_url"),
                    "yes24_url": book.get("yes24_url"),
                }
            else:
                existing = merged[key]
                for url_field in ("kyobo_url", "aladin_url", "yes24_url"):
                    if not existing.get(url_field) and book.get(url_field):
                        existing[url_field] = book[url_field]
                for field in ("author", "price", "description", "image_url", "published_at"):
                    if not existing.get(field) and book.get(field):
                        existing[field] = book[field]
                if book.get("is_preorder"):
                    existing["is_preorder"] = True

    result = list(merged.values())
    print(f"[병합] 중복 제거 후 총 {len(result)}권")
    return result


async def main(dry_run: bool = False) -> None:
    print("=" * 50)
    print("IT 신간 크롤링 시작" + (" (dry-run)" if dry_run else ""))
    print("=" * 50)

    # 교보문고(async) 실행, 알라딘+yes24(sync)는 to_thread로 병렬 실행
    kyobo_task = asyncio.create_task(crawl_kyobo())
    aladin_task = asyncio.to_thread(crawl_aladin, debug=True)
    yes24_task = asyncio.to_thread(crawl_yes24)

    print("\n[1-3/3] 교보문고 / 알라딘 / yes24 병렬 크롤링 중...")
    kyobo_books, aladin_books, yes24_books = await asyncio.gather(
        kyobo_task, aladin_task, yes24_task
    )

    print("\n[병합] 데이터 병합 및 중복 제거 중...")
    merged = merge_books([kyobo_books, aladin_books, yes24_books])

    if dry_run:
        print("\n" + "=" * 50)
        print(f"[dry-run 결과] 총 {len(merged)}권")
        print("=" * 50)

        print("\n--- 교보문고 ---")
        print(f"수집: {len(kyobo_books)}권")
        for b in kyobo_books[:3]:
            print(json.dumps(b, ensure_ascii=False, indent=2))

        print("\n--- 알라딘 ---")
        print(f"수집: {len(aladin_books)}권")
        for b in aladin_books[:3]:
            print(json.dumps(b, ensure_ascii=False, indent=2))

        print("\n--- yes24 ---")
        print(f"수집: {len(yes24_books)}권")
        for b in yes24_books[:3]:
            print(json.dumps(b, ensure_ascii=False, indent=2))

        print("\n--- 병합 결과 (상위 5권) ---")
        for b in merged[:5]:
            print(json.dumps(b, ensure_ascii=False, indent=2))
    else:
        print("\n[Supabase] 데이터 적재 중...")
        upsert_books(merged)
        print("\n" + "=" * 50)
        print(f"완료! 총 {len(merged)}권 적재")
        print("=" * 50)


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    asyncio.run(main(dry_run=dry_run))
