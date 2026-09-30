"""003_site_assets

Revision ID: 003_site_assets
Revises: 002_content_management
Create Date: 2026-09-30

Phase 9 Migration:
- site_assets table (id, asset_type, year, storage_path, original_filename, mime_type, file_size, width, height, is_active, created_by, created_at, updated_at)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_site_assets'
down_revision: Union[str, None] = '002_content_management'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'site_assets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('asset_type', sa.String(length=50), nullable=False),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('storage_path', sa.String(length=500), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=True),
        sa.Column('mime_type', sa.String(length=50), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_site_assets_id'), 'site_assets', ['id'], unique=False)
    op.create_index(op.f('ix_site_assets_asset_type'), 'site_assets', ['asset_type'], unique=False)
    op.create_index(op.f('ix_site_assets_year'), 'site_assets', ['year'], unique=False)
    op.create_index(op.f('ix_site_assets_is_active'), 'site_assets', ['is_active'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_site_assets_is_active'), table_name='site_assets')
    op.drop_index(op.f('ix_site_assets_year'), table_name='site_assets')
    op.drop_index(op.f('ix_site_assets_asset_type'), table_name='site_assets')
    op.drop_index(op.f('ix_site_assets_id'), table_name='site_assets')
    op.drop_table('site_assets')
