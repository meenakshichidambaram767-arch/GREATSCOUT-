"""Initial GreatScout Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-18 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from backend.app.db.custom_types import VectorType

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Sources table
    op.create_table(
        'sources',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('base_url', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_sources_code', 'sources', ['code'])

    # 2. Documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('source_id', sa.String(length=36), sa.ForeignKey('sources.id', ondelete='CASCADE'), nullable=False),
        sa.Column('external_id', sa.String(length=100), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=100), nullable=True),
        sa.Column('url', sa.String(length=1000), nullable=False),
        sa.Column('upvotes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('comment_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('validation_status', sa.String(length=20), nullable=False, server_default='valid'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ingested_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_documents_content_hash', 'documents', ['content_hash'])
    op.create_index('ix_documents_external_id', 'documents', ['external_id'])
    op.create_index('ix_documents_is_synthetic', 'documents', ['is_synthetic'])
    op.create_index('idx_doc_source_published', 'documents', ['source_id', 'published_at'])

    # 3. Signal Clusters table
    op.create_table(
        'signal_clusters',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('label', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('signal_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('coherence_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('centroid_embedding', VectorType(384), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_signal_clusters_category', 'signal_clusters', ['category'])

    # 4. Signals table
    op.create_table(
        'signals',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('document_id', sa.String(length=36), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('cluster_id', sa.String(length=36), sa.ForeignKey('signal_clusters.id', ondelete='SET NULL'), nullable=True),
        sa.Column('signal_type', sa.String(length=50), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=False),
        sa.Column('raw_quote', sa.Text(), nullable=False),
        sa.Column('severity', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('sentiment_score', sa.Float(), nullable=False, server_default='-0.5'),
        sa.Column('urgency_score', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('commercial_intent_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('competitor_mentioned', sa.String(length=255), nullable=True),
        sa.Column('embedding', VectorType(384), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_signals_signal_type', 'signals', ['signal_type'])
    op.create_index('ix_signals_cluster_id', 'signals', ['cluster_id'])
    op.create_index('idx_signal_type_severity', 'signals', ['signal_type', 'severity'])

    # 5. Opportunities table
    op.create_table(
        'opportunities',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('cluster_id', sa.String(length=36), sa.ForeignKey('signal_clusters.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('target_audience', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False, server_default='General SaaS'),
        sa.Column('problem_thesis', sa.Text(), nullable=False),
        sa.Column('why_current_solutions_fail', sa.Text(), nullable=False),
        sa.Column('suggested_solution', sa.Text(), nullable=False),
        sa.Column('demand_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('pain_intensity_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('willingness_to_pay_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('competitive_vacuum_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('overall_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('confidence_level', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_opportunities_overall_score', 'opportunities', ['overall_score'])
    op.create_index('ix_opportunities_status', 'opportunities', ['status'])
    op.create_index('ix_opportunities_category', 'opportunities', ['category'])
    op.create_index('idx_opp_score_status', 'opportunities', ['overall_score', 'status'])

    # 6. Opportunity Evidence table
    op.create_table(
        'opportunity_evidence',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('opportunity_id', sa.String(length=36), sa.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('signal_id', sa.String(length=36), sa.ForeignKey('signals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('highlight_quote', sa.Text(), nullable=False),
        sa.Column('relevance_score', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_opportunity_evidence_opp_id', 'opportunity_evidence', ['opportunity_id'])
    op.create_index('ix_opportunity_evidence_sig_id', 'opportunity_evidence', ['signal_id'])

    # 7. Ingestion Jobs table
    op.create_table(
        'ingestion_jobs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('source_id', sa.String(length=36), sa.ForeignKey('sources.id', ondelete='SET NULL'), nullable=True),
        sa.Column('job_type', sa.String(length=50), nullable=False, server_default='full_pipeline'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('documents_processed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('signals_extracted', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('opportunities_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('logs', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_ingestion_jobs_status', 'ingestion_jobs', ['status'])


def downgrade() -> None:
    op.drop_table('ingestion_jobs')
    op.drop_table('opportunity_evidence')
    op.drop_table('opportunities')
    op.drop_table('signals')
    op.drop_table('signal_clusters')
    op.drop_table('documents')
    op.drop_table('sources')
