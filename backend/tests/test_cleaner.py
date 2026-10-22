import pytest
from backend.app.services.preprocessing.cleaner import DocumentCleaner


def test_clean_text():
    raw = "   This  is   a   test\n\n\n\nwith extra   lines.  "
    cleaned = DocumentCleaner.clean_text(raw)
    assert cleaned == "This is a test\n\nwith extra lines."


def test_content_hash_deterministic():
    h1 = DocumentCleaner.compute_content_hash("Title Here", "Some content for testing.")
    h2 = DocumentCleaner.compute_content_hash("  Title Here  ", "  some content for testing.  ")
    assert h1 == h2
    assert len(h1) == 64  # SHA-256


def test_validate_document_valid():
    is_valid, reason = DocumentCleaner.validate_document(
        title="Why does serverless webhook fail?",
        content="We experienced silent webhook drops inside AWS Lambda with no error logs.",
        url="https://reddit.com/r/SaaS/comments/123"
    )
    assert is_valid is True
    assert reason == "valid"


def test_validate_document_too_short():
    is_valid, reason = DocumentCleaner.validate_document(
        title="Hi",
        content="Short",
        url="https://example.com"
    )
    assert is_valid is False
    assert "too short" in reason


def test_validate_document_spam():
    is_valid, reason = DocumentCleaner.validate_document(
        title="Buy Crypto Now For Easy Millions",
        content="Join the casino online and make quick crypto profits today right now.",
        url="https://spam.com"
    )
    assert is_valid is False
    assert "Spam" in reason
