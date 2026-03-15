import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("SUPABASE_URL과 SUPABASE_KEY 환경변수를 설정해주세요.")

client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def upsert_books(books: list[dict]) -> None:
    """
    책 목록을 Supabase에 upsert합니다.
    title + published_at 기준으로 중복 제거하며,
    같은 책이면 URL 필드를 병합(업데이트)합니다.
    """
    if not books:
        print("적재할 데이터가 없습니다.")
        return

    now = datetime.now(timezone.utc).isoformat()
    records = [
        {
            "title": book.get("title"),
            "author": book.get("author"),
            "price": book.get("price"),
            "description": book.get("description"),
            "image_url": book.get("image_url"),
            "published_at": book.get("published_at"),
            "is_preorder": book.get("is_preorder", False),
            "kyobo_url": book.get("kyobo_url"),
            "aladin_url": book.get("aladin_url"),
            "yes24_url": book.get("yes24_url"),
            "created_at": now,
            "updated_at": now,
        }
        for book in books
    ]

    client.table("books").upsert(
        records, on_conflict="title,author", ignore_duplicates=False
    ).execute()

    print(f"[Supabase] {len(records)}건 upsert 완료")
