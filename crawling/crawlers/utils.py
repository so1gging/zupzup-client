import re
from datetime import datetime

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def parse_price(text: str) -> int | None:
    """'23,000원' 형태의 문자열에서 숫자만 추출"""
    if not text:
        return None
    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else None


def is_current_month(published_at: str | None, year: int, month: int) -> bool:
    if not published_at:
        return False
    try:
        date = datetime.strptime(published_at, "%Y-%m-%d")
        return date.year == year and date.month == month
    except ValueError:
        return False


def parse_korean_date(text: str) -> str | None:
    """'2026년 3월 5일', '2026년 03월' 등 한국어 날짜를 ISO 포맷으로 변환"""
    if not text:
        return None
    m = re.search(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})?일?", text)
    if not m:
        return None
    y = int(m.group(1))
    mo = int(m.group(2))
    d = int(m.group(3)) if m.group(3) else 1
    return f"{y:04d}-{mo:02d}-{d:02d}"
