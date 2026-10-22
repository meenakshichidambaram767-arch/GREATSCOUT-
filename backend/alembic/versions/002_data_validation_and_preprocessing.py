"""Phase 3 Data Validation and Preprocessing Schema

Revision ID: 002_data_validation_and_preprocessing
Revises: 001_initial_schema
Create Date: 2026-10-22 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_data_validation_and_preprocessing'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add post/comment hierarchy and metadata columns to documents table
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    with op.batch_alter_table('documents') as batch_op:
        batch_op.add_column(sa.Column('document_type', sa.String(length=20), server_default='post', nullable=False))
        batch_op.add_column(sa.Column('parent_external_id', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('thread_id', sa.String(length=100), nullable=True))
        batch_op.create_index('ix_documents_document_type', ['document_type'])
        batch_op.create_index('ix_documents_parent_external_id', ['parent_external_id'])
        batch_op.create_index('ix_documents_thread_id', ['thread_id'])

    # 2. Create processed_documents table
    op.create_table(
        'processed_documents',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('raw_document_id', sa.String(length=36), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_type', sa.String(length=20), server_default='post', nullable=False),
        sa.Column('parent_external_id', sa.String(length=100), nullable=True),
        sa.Column('thread_id', sa.String(length=100), nullable=True),
        sa.Column('normalized_title', sa.String(length=500), nullable=False),
        sa.Column('normalized_content', sa.Text(), nullable=False),
        sa.Column('original_content_snapshot', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=20), server_default='en', nullable=False),
        sa.Column('language_confidence', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('is_eligible', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('validation_status', sa.String(length=30), server_default='valid', nullable=False),
        sa.Column('validation_reason', sa.String(length=255), nullable=True),
        sa.Column('validation_errors', sa.JSON(), nullable=True),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('is_exact_duplicate', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('is_near_duplicate', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('canonical_document_id', sa.String(length=36), sa.ForeignKey('processed_documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('similarity_score', sa.Float(), nullable=True),
        sa.Column('word_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('char_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('source_metadata', sa.JSON(), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('is_synthetic', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('raw_document_id', name='uq_processed_documents_raw_doc')
    )

    op.create_index('ix_processed_documents_raw_doc_id', 'processed_documents', ['raw_document_id'])
    op.create_index('ix_processed_documents_doc_type', 'processed_documents', ['document_type'])
    op.create_index('ix_processed_documents_language', 'processed_documents', ['language'])
    op.create_index('ix_processed_documents_is_eligible', 'processed_documents', ['is_eligible'])
    op.create_index('ix_processed_documents_validation_status', 'processed_documents', ['validation_status'])
    op.create_index('ix_processed_documents_content_hash', 'processed_documents', ['content_hash'])
    op.create_index('ix_processed_documents_is_exact_dup', 'processed_documents', ['is_exact_duplicate'])
    op.create_index('ix_processed_documents_is_near_dup', 'processed_documents', ['is_near_duplicate'])
    op.create_index('ix_processed_documents_canonical_id', 'processed_documents', ['canonical_document_id'])
    op.create_index('idx_proc_doc_type_status', 'processed_documents', ['document_type', 'validation_status'])
    op.create_index('idx_proc_lang_eligible', 'processed_documents', ['language', 'is_eligible'])


def downgrade() -> None:
    op.drop_table('processed_documents')
    with op.batch_alter_table('documents') as batch_op:
        batch_op.drop_index('ix_documents_thread_id')
        batch_op.drop_index('ix_documents_parent_external_id')
        batch_op.drop_index('ix_documents_document_type')
        batch_op.drop_column('thread_id')
        batch_op.drop_column('parent_external_id')
        batch_op.drop_column('document_type')
