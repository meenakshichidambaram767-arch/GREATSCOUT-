import sys
import argparse
import asyncio
import json
import logging
from pathlib import Path

# Silence verbose ORM engine logging for CLI stdout
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.services.preprocessing.processor import DocumentProcessor
from backend.app.services.preprocessing.stats_service import DatasetStatsService


async def run_stats(output_json: bool = False):
    """Outputs dataset health and preprocessing statistics."""
    await init_db()
    async with AsyncSessionLocal() as db:
        report = await DatasetStatsService.compute_db_stats(db)
        if output_json:
            print(report.model_dump_json(indent=2))
        else:
            print(DatasetStatsService.format_cli_report(report))


async def run_process(source_code: str = None, limit: int = None, output_json: bool = False):
    """Executes validation and preprocessing on raw documents and prints summary."""
    await init_db()
    async with AsyncSessionLocal() as db:
        print("[GreatScout CLI] Initiating Phase 3 Data Validation & Preprocessing...")
        source_id = None
        if source_code:
            from backend.app.models.source import Source
            from sqlalchemy import select
            res = await db.execute(select(Source).where(Source.code == source_code))
            src = res.scalar_one_or_none()
            if src:
                source_id = src.id

        processed_docs = await DocumentProcessor.process_all_documents(
            db=db,
            source_id=source_id,
            limit=limit
        )
        print(f"[GreatScout CLI] Processed {len(processed_docs)} records.")

        report = await DatasetStatsService.compute_db_stats(db)
        if output_json:
            print(report.model_dump_json(indent=2))
        else:
            print(DatasetStatsService.format_cli_report(report))


def main():
    parser = argparse.ArgumentParser(
        description="GreatScout Phase 3 -- Data Validation & Preprocessing CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run: 'stats' or 'process'")

    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Report comprehensive dataset health and distribution statistics")
    stats_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Process command
    proc_parser = subparsers.add_parser("process", help="Execute validation, text normalization, and duplicate detection")
    proc_parser.add_argument("--source", type=str, default=None, help="Optional source code filter (e.g. demo, reddit, product_hunt)")
    proc_parser.add_argument("--limit", type=int, default=None, help="Optional document processing limit")
    proc_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    # Also support flags --stats or --process at root level
    parser.add_argument("--stats", action="store_true", help="Display dataset statistics")
    parser.add_argument("--process", action="store_true", help="Run document preprocessing pipeline")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    args = parser.parse_args()

    if args.command == "stats" or args.stats:
        asyncio.run(run_stats(output_json=args.json))
    elif args.command == "process" or args.process:
        source = getattr(args, "source", None)
        limit = getattr(args, "limit", None)
        asyncio.run(run_process(source_code=source, limit=limit, output_json=args.json))
    else:
        # Default behavior: run stats
        asyncio.run(run_stats(output_json=args.json))


if __name__ == "__main__":
    main()
