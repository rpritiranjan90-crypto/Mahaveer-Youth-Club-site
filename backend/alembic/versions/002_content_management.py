"""002_content_management

Revision ID: 002_content_management
Revises: 001_phase3_auth
Create Date: 2026-09-30

Phase 4 Migration:
- updates table (slug, title, excerpt, content, status, timestamps)
- activities table (slug, title, description, date, category, status, timestamps)
- gallery_items table (title, image_url, thumbnail_url, year, category, alt_text, status, timestamps)
- members table (display_name, role, sort_order, is_visible, timestamps)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_content_management'
down_revision: Union[str, None] = '001_phase3_auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. updates table
    op.create_table(
        'updates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='Official Notice', nullable=False),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('featured_image', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_updates_id'), 'updates', ['id'], unique=False)
    op.create_index(op.f('ix_updates_slug'), 'updates', ['slug'], unique=True)
    op.create_index(op.f('ix_updates_status'), 'updates', ['status'], unique=False)
    op.create_index(op.f('ix_updates_published_at'), 'updates', ['published_at'], unique=False)

    # 2. activities table
    op.create_table(
        'activities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('date', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='Puja & Rituals', nullable=False),
        sa.Column('image', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activities_id'), 'activities', ['id'], unique=False)
    op.create_index(op.f('ix_activities_slug'), 'activities', ['slug'], unique=True)
    op.create_index(op.f('ix_activities_status'), 'activities', ['status'], unique=False)
    op.create_index(op.f('ix_activities_category'), 'activities', ['category'], unique=False)
    op.create_index(op.f('ix_activities_published_at'), 'activities', ['published_at'], unique=False)

    # 3. gallery_items table
    op.create_table(
        'gallery_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('year', sa.String(length=10), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='Ganesh Puja', nullable=False),
        sa.Column('alt_text', sa.String(length=255), server_default='', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gallery_items_id'), 'gallery_items', ['id'], unique=False)
    op.create_index(op.f('ix_gallery_items_year'), 'gallery_items', ['year'], unique=False)
    op.create_index(op.f('ix_gallery_items_category'), 'gallery_items', ['category'], unique=False)
    op.create_index(op.f('ix_gallery_items_status'), 'gallery_items', ['status'], unique=False)

    # 4. members table
    op.create_table(
        'members',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=100), server_default='Club Youth Member', nullable=True),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_visible', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_members_id'), 'members', ['id'], unique=False)
    op.create_index(op.f('ix_members_sort_order'), 'members', ['sort_order'], unique=False)
    op.create_index(op.f('ix_members_is_visible'), 'members', ['is_visible'], unique=False)


def downgrade() -> None:
    op.drop_table('members')
    op.drop_table('gallery_items')
    op.drop_table('activities')
    op.drop_table('updates')
