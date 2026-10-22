import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from backend.app.models.source import Source
from backend.app.models.document import Document
from backend.app.models.processed_document import ProcessedDocument

from backend.app.services.preprocessing.text_normalizer import TextNormalizer
from backend.app.services.preprocessing.language_filter import LanguageDetector, LanguageDetectionResult
from backend.app.services.preprocessing.duplicate_detector import DuplicateDetector
from backend.app.services.preprocessing.validator import DocumentValidator
from backend.app.services.preprocessing.processor import DocumentProcessor
from backend.app.services.preprocessing.stats_service import DatasetStatsService


# =====================================================================
# 1. Field Validation & Missing Fields Tests
# =====================================================================

def test_missing_required_fields():
    """Verify validation detects missing source, title, content, and URL."""
    # Missing title on post
    rec_no_title = {
        "source_code": "demo",
        "document_type": "post",
        "title": "",
        "content": "Valid length content discussing serverless webhook issues.",
        "url": "https://example.com/p/1",
        "is_synthetic": True,
    }
    res = DocumentValidator.validate_raw_record(rec_no_title)
    assert not res.is_valid
    assert any("title" in e.lower() for e in res.errors)

    # Missing content
    rec_no_content = {
        "source_code": "demo",
        "document_type": "post",
        "title": "Webhook Reliability Issues",
        "content": "",
        "url": "https://example.com/p/2",
        "is_synthetic": True,
    }
    res2 = DocumentValidator.validate_raw_record(rec_no_content)
    assert not res2.is_valid
    assert any("content" in e.lower() for e in res2.errors)

    # Missing URL
    rec_no_url = {
        "source_code": "demo",
        "document_type": "post",
        "title": "Webhook Reliability Issues",
        "content": "Valid length content discussing serverless webhook issues.",
        "url": "",
        "is_synthetic": True,
    }
    res3 = DocumentValidator.validate_raw_record(rec_no_url)
    assert not res3.is_valid
    assert any("url" in e.lower() for e in res3.errors)


def test_invalid_records():
    """Verify handling of invalid URL schemes, malformed types, and future timestamps."""
    # Invalid URL scheme
    bad_url = {
        "source_code": "demo",
        "document_type": "post",
        "title": "Database Schema Drift",
        "content": "We have been encountering frequent database schema drift in production.",
        "url": "ftp://files.example.com/dump.sql",
        "is_synthetic": True,
    }
    res_url = DocumentValidator.validate_raw_record(bad_url)
    assert not res_url.is_valid
    assert any("scheme" in e.lower() for e in res_url.errors)

    # Future timestamp (beyond 15 min clock skew tolerance)
    future_time = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    bad_time = {
        "source_code": "demo",
        "document_type": "post",
        "title": "Future Bug Report",
        "content": "This bug report was mistakenly given a timestamp in the far future.",
        "url": "https://example.com/future",
        "published_at": future_time,
        "is_synthetic": True,
    }
    res_time = DocumentValidator.validate_raw_record(bad_time)
    assert not res_time.is_valid
    assert any("future" in e.lower() for e in res_time.errors)

    # Invalid document type
    bad_type = {
        "source_code": "demo",
        "document_type": "tweet_retweet",
        "title": "Social post",
        "content": "Some valid content that has an unsupported document type.",
        "url": "https://example.com/tweet",
        "is_synthetic": True,
    }
    res_type = DocumentValidator.validate_raw_record(bad_type)
    assert not res_type.is_valid
    assert any("document_type" in e.lower() for e in res_type.errors)


# =====================================================================
# 2. Text Normalization, HTML & Markdown Cleanup Tests
# =====================================================================

def test_html_cleanup():
    """Verify HTML entities are decoded and HTML tags are stripped without losing words."""
    raw_html = (
        "&quot;We don&apos;t have &lt;span class=\"badge\"&gt;automated&lt;/span&gt; "
        "reconciliation for &lt;b&gt;Stripe&lt;/b&gt; &amp; bank wires.&quot;"
    )
    cleaned = TextNormalizer.clean_html(raw_html)
    assert '"' in cleaned
    assert "'" in cleaned
    assert "<span>" not in cleaned
    assert "<b>" not in cleaned
    assert "&" in cleaned
    assert "automated reconciliation for Stripe & bank wires" in cleaned


def test_markdown_cleanup():
    """Verify Markdown links, headers, bold, italics, code fences, and backticks are cleaned."""
    raw_md = (
        "### Problem Summary\n"
        "We are **desperately** looking for a `PostgreSQL` connection pooler.\n"
        "Please check [our architecture docs](https://internal.wiki/arch).\n"
        "> Existing tools like *PgBouncer* do not support our `OAuth2` workflow.\n"
        "```python\n"
        "def connect():\n"
        "    pass\n"
        "```\n"
        "- Need sub-millisecond failover\n"
        "- Need native multi-region sync"
    )
    cleaned = TextNormalizer.clean_markdown(raw_md)
    # Markdown formatting syntax should be removed
    assert "###" not in cleaned
    assert "**" not in cleaned
    assert "*" not in cleaned
    assert "```" not in cleaned
    assert ">" not in cleaned
    # Text, technical terms, code, and punctuation must remain intact
    assert "Problem Summary" in cleaned
    assert "desperately" in cleaned
    assert "PostgreSQL" in cleaned
    assert "our architecture docs" in cleaned
    assert "https://internal.wiki/arch" not in cleaned
    assert "PgBouncer" in cleaned
    assert "OAuth2" in cleaned
    assert "def connect():" in cleaned
    assert "Need sub-millisecond failover" in cleaned


def test_technical_terms_and_negations_preserved():
    """Verify crucial technical terms, punctuation, and negations are never removed."""
    raw_text = "We did NOT deploy to C++ or Next.js because CI/CD failed, not AWS Lambda!"
    normalized = TextNormalizer.normalize(raw_text)
    assert "NOT" in normalized or "not" in normalized
    assert "C++" in normalized
    assert "Next.js" in normalized
    assert "CI/CD" in normalized
    assert "AWS Lambda" in normalized


def test_unicode_normalization():
    """Verify Unicode NFKC normalization, ligatures, and zero-width characters."""
    # String containing ligature 'fi' (U+FB01), non-breaking space (U+00A0), and zero-width space (U+200B)
    raw_unicode = "We\u00a0noticed\u200b a \ufb01rmware crash in our production pods."
    normalized = TextNormalizer.normalize_unicode(raw_unicode)
    assert "\u00a0" not in normalized  # Replaced with standard space
    assert "\u200b" not in normalized  # Stripped
    assert "firmware" in normalized     # Ligature decomposed via NFKC


def test_boilerplate_cleanup():
    """Verify removal of Reddit auto-moderator signatures."""
    raw_with_bot = (
        "We spent 12 hours debugging silent webhook timeouts.\n\n"
        "*I am a bot, and this action was performed automatically. "
        "Please contact the moderators of this subreddit if you have any questions or concerns.*"
    )
    cleaned = TextNormalizer.strip_boilerplate(raw_with_bot)
    assert "I am a bot" not in cleaned
    assert "We spent 12 hours debugging silent webhook timeouts." in cleaned


def test_empty_and_short_text():
    """Verify empty text and sub-threshold length detection."""
    assert TextNormalizer.is_empty_or_whitespace("") is True
    assert TextNormalizer.is_empty_or_whitespace("    \n\t  ") is True
    assert TextNormalizer.is_empty_or_whitespace("Valid text here") is False

    is_valid, reason = TextNormalizer.validate_text_length("Too short", min_length=20)
    assert is_valid is False
    assert "below minimum" in reason


# =====================================================================
# 3. Language Filtering Tests
# =====================================================================

def test_language_detection_and_filtering():
    """Verify English detection, non-English classification, and short-text handling."""
    # English text
    en_text = (
        "We have been experiencing silent webhook failures in production with Stripe and AWS. "
        "Nobody on our team has visibility into why transactions fail without error logs."
    )
    res_en = LanguageDetector.detect_language(en_text)
    assert res_en.language == "en"
    assert res_en.confidence >= 0.5
    assert res_en.is_reliable is True

    is_eligible, _ = LanguageDetector.check_eligibility(res_en, allowed_languages=["en"])
    assert is_eligible is True

    # Spanish text
    es_text = (
        "Tenemos muchos problemas con la conciliacion de facturas y pagos bancarios. "
        "Es muy dificil gestionar todas las transacciones sin una herramienta automatizada."
    )
    res_es = LanguageDetector.detect_language(es_text)
    assert res_es.language == "es"
    is_eligible_es, reason_es = LanguageDetector.check_eligibility(res_es, allowed_languages=["en"])
    assert is_eligible_es is False
    assert "not in allowed" in reason_es

    # French text
    fr_text = (
        "Nous avons des problemes avec notre passerelle de paiement et la synchronisation. "
        "Les developpeurs passent beaucoup de temps sur ces erreurs."
    )
    res_fr = LanguageDetector.detect_language(fr_text)
    assert res_fr.language == "fr"

    # Short text explicit handling
    res_short = LanguageDetector.detect_language("Quick question")
    assert res_short.is_reliable is False


# =====================================================================
# 4. Duplicate Detection Tests (Exact & Near)
# =====================================================================

def test_exact_duplicate_detection():
    """Verify exact duplicate detection using deterministic SHA-256."""
    title1 = "Serverless Webhook Drops"
    content1 = "We experienced silent webhook drops inside AWS Lambda with no error logs."

    # Identical content with slightly different outer whitespace and casing
    title2 = "  Serverless Webhook Drops  "
    content2 = "  We experienced silent webhook drops inside AWS Lambda with no error logs.  "

    existing_items = [
        {
            "id": "doc_canonical_1",
            "content_hash": DuplicateDetector.compute_exact_hash(title1, content1),
            "normalized_title": TextNormalizer.normalize(title1),
            "normalized_content": TextNormalizer.normalize(content1),
        }
    ]

    match = DuplicateDetector.check_duplicate(
        current_id="doc_new_2",
        normalized_title=TextNormalizer.normalize(title2),
        normalized_content=TextNormalizer.normalize(content2),
        existing_items=existing_items
    )

    assert match.is_duplicate is True
    assert match.duplicate_type == "exact"
    assert match.canonical_id == "doc_canonical_1"
    assert match.similarity_score == 1.0


def test_near_duplicate_detection():
    """Verify near-duplicate detection with Jaccard 3-shingling."""
    base_title = "Automated Stripe and Bank Wire Invoice Reconciliation"
    base_content = (
        "Bootstrapped SaaS companies lose ten hours monthly manually reconciling bank wire "
        "transfers and ACH payments with Stripe Billing subscriptions."
    )

    # Near-duplicate with a couple of synonymous or rephrased words
    near_title = "Automated Stripe and Bank Wire Invoice Reconciliation Hub"
    near_content = (
        "Bootstrapped SaaS companies lose ten hours each month manually reconciling bank wire "
        "transfers and ACH payments with Stripe Billing subscriptions."
    )

    existing_items = [
        {
            "id": "doc_canonical_base",
            "content_hash": DuplicateDetector.compute_exact_hash(base_title, base_content),
            "normalized_title": TextNormalizer.normalize(base_title),
            "normalized_content": TextNormalizer.normalize(base_content),
        }
    ]

    match = DuplicateDetector.check_duplicate(
        current_id="doc_near_test",
        normalized_title=TextNormalizer.normalize(near_title),
        normalized_content=TextNormalizer.normalize(near_content),
        existing_items=existing_items,
        threshold=0.70
    )

    assert match.is_duplicate is True
    assert match.duplicate_type == "near"
    assert match.canonical_id == "doc_canonical_base"
    assert match.similarity_score >= 0.70

    # Completely distinct document should NOT match
    distinct_title = "Kubernetes Cluster Auto-scaler Performance Tuning"
    distinct_content = "Optimizing AWS EKS node group scale down latency and pod disruption budgets."
    distinct_match = DuplicateDetector.check_duplicate(
        current_id="doc_distinct_test",
        normalized_title=TextNormalizer.normalize(distinct_title),
        normalized_content=TextNormalizer.normalize(distinct_content),
        existing_items=existing_items,
        threshold=0.70
    )
    assert distinct_match.is_duplicate is False
    assert distinct_match.canonical_id is None


# =====================================================================
# 5. Database Integration & Idempotency Tests
# =====================================================================

@pytest.mark.asyncio
async def test_raw_to_processed_traceability_and_idempotency(db_session):
    """
    Verifies:
    1. Raw Document is created with untouched original content.
    2. ProcessedDocument links 1-to-1 to raw_document_id.
    3. ProcessedDocument contains normalized text while preserving raw text snapshot.
    4. Rerunning processing updates the existing record without duplicating.
    """
    # 1. Create Source
    source = Source(code="demo_test", name="Synthetic Demo", is_active=True)
    db_session.add(source)
    await db_session.flush()

    # 2. Create raw Document with HTML & Markdown
    raw_content = (
        "We are **struggling** with &lt;b&gt;Stripe webhook latency&lt;/b&gt;. "
        "Please check [our ticket](https://tracker.internal/123) for details."
    )
    raw_doc = Document(
        source_id=source.id,
        external_id="ext_test_001",
        document_type="post",
        title="Stripe Webhook Latency Issues",
        content=raw_content,  # Original untouched text
        author="founder_alice",
        url="https://greatscout.internal/discussions/1",
        content_hash="dummy_hash_001",
        validation_status="valid",
        is_synthetic=True
    )
    db_session.add(raw_doc)
    await db_session.flush()

    # 3. First Processing Run
    proc1 = await DocumentProcessor.process_document(doc=raw_doc, db=db_session)
    await db_session.commit()

    # Verify Traceability
    assert proc1.raw_document_id == raw_doc.id
    assert proc1.is_eligible is True
    assert proc1.validation_status == "valid"
    assert "<b>" not in proc1.normalized_content
    assert "**" not in proc1.normalized_content
    assert "Stripe webhook latency" in proc1.normalized_content
    # Original raw text snapshot is preserved verbatim
    assert proc1.original_content_snapshot == raw_content
    assert raw_doc.content == raw_content

    # 4. Second Processing Run (Idempotency test)
    proc2 = await DocumentProcessor.process_document(doc=raw_doc, db=db_session)
    await db_session.commit()

    # Must be the exact same database record ID
    assert proc2.id == proc1.id

    # Count total records in processed_documents
    stmt_count = select(ProcessedDocument).where(ProcessedDocument.raw_document_id == raw_doc.id)
    all_proc = (await db_session.execute(stmt_count)).scalars().all()
    assert len(all_proc) == 1, "Duplicate processed record was erroneously created!"


@pytest.mark.asyncio
async def test_post_and_comment_thread_hierarchy(db_session):
    """Verifies posts and comments preserve parent/thread links without losing relationships."""
    source = Source(code="reddit_test", name="Reddit Test", is_active=True)
    db_session.add(source)
    await db_session.flush()

    # Top-level post
    post_doc = Document(
        source_id=source.id,
        external_id="post_root_999",
        document_type="post",
        parent_external_id=None,
        thread_id="post_root_999",
        title="Why does AWS NAT gateway cost so much?",
        content="We just paid $4,000 for unexpected NAT gateway bandwidth fees last month.",
        url="https://reddit.com/r/SaaS/comments/post_root_999",
        author="cloud_architect",
        content_hash="hash_root_999",
        is_synthetic=True
    )
    db_session.add(post_doc)
    await db_session.flush()

    # Nested comment on post
    comment_doc = Document(
        source_id=source.id,
        external_id="comment_child_888",
        document_type="comment",
        parent_external_id="post_root_999",
        thread_id="post_root_999",
        title="",  # Comments typically have no title
        content="Same here. We switched to an open-source fck-nat instance on EC2 and cut fees by 80%.",
        url="https://reddit.com/r/SaaS/comments/post_root_999/comment/888",
        author="devops_ninja",
        content_hash="hash_comment_888",
        is_synthetic=True
    )
    db_session.add(comment_doc)
    await db_session.flush()

    proc_post = await DocumentProcessor.process_document(doc=post_doc, db=db_session)
    proc_comment = await DocumentProcessor.process_document(doc=comment_doc, db=db_session)
    await db_session.commit()

    assert proc_post.document_type == "post"
    assert proc_post.thread_id == "post_root_999"

    assert proc_comment.document_type == "comment"
    assert proc_comment.parent_external_id == "post_root_999"
    assert proc_comment.thread_id == "post_root_999"
    assert proc_comment.normalized_title.startswith("Comment:")


# =====================================================================
# 6. Dataset Statistics Service Tests
# =====================================================================

def test_dataset_stats_in_memory():
    """Verify DatasetStatsService computes accurate quality distributions and counts."""
    synthetic_records = [
        # Valid post 1 (English)
        {
            "id": "1",
            "source_code": "demo",
            "document_type": "post",
            "title": "Serverless Webhook Reliability",
            "content": "Developers waste hours debugging silent webhook drops in serverless functions.",
            "url": "https://example.com/1",
        },
        # Valid comment on post 1 (English)
        {
            "id": "2",
            "source_code": "demo",
            "document_type": "comment",
            "parent_external_id": "1",
            "thread_id": "1",
            "title": "",
            "content": "We had the exact same issue when migrating our payment webhooks to AWS Lambda.",
            "url": "https://example.com/1/comment/2",
        },
        # Exact duplicate of post 1
        {
            "id": "3",
            "source_code": "reddit",
            "document_type": "post",
            "title": "Serverless Webhook Reliability",
            "content": "Developers waste hours debugging silent webhook drops in serverless functions.",
            "url": "https://reddit.com/r/SaaS/3",
        },
        # Spanish post (filtered language)
        {
            "id": "4",
            "source_code": "reddit",
            "document_type": "post",
            "title": "Problemas de sincronizacion",
            "content": "Tenemos muchos problemas con la conciliacion de facturas y pagos bancarios de los clientes.",
            "url": "https://reddit.com/r/SaaS/4",
        },
        # Invalid post (empty content)
        {
            "id": "5",
            "source_code": "product_hunt",
            "document_type": "post",
            "title": "Invalid Empty Post",
            "content": "",
            "url": "https://producthunt.com/posts/empty",
        }
    ]

    report = DatasetStatsService.compute_in_memory_stats(synthetic_records)

    assert report.total_raw_documents == 5
    assert report.posts_count == 4
    assert report.comments_count == 1
    assert report.exact_duplicates_count == 1
    assert report.empty_or_unusable_text_count >= 1
    assert "en" in report.language_distribution
    assert "es" in report.language_distribution
    assert report.documents_eligible_for_processing == 2  # Post 1 and Comment 2

    # Verify CLI report formatting string
    cli_output = DatasetStatsService.format_cli_report(report)
    assert "DATASET HEALTH & PREPROCESSING REPORT" in cli_output
    assert "Total Raw Documents:" in cli_output
    assert "Exact Duplicates" in cli_output
