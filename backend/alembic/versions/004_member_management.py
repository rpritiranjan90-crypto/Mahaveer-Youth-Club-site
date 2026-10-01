"""004_member_management

Revision ID: 004_member_management
Revises: 003_site_assets
Create Date: 2026-09-30

Phase 10 Migration:
- Upgrade members table with full member management and photo fields:
  (name, designation, bio, photo_storage_path, photo_original_filename, photo_mime_type, photo_file_size, photo_width, photo_height, display_order, is_active, created_by, updated_by)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_member_management'
down_revision: Union[str, None] = '003_site_assets'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns to members table
    with op.batch_alter_table('members', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=150), server_default='', nullable=False))
        batch_op.add_column(sa.Column('designation', sa.String(length=150), server_default='Member', nullable=False))
        batch_op.add_column(sa.Column('bio', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('photo_storage_path', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('photo_original_filename', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('photo_mime_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('photo_file_size', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('photo_width', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('photo_height', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('display_order', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False))
        batch_op.add_column(sa.Column('created_by', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('updated_by', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_members_created_by', 'users', ['created_by'], ['id'], ondelete='SET NULL')
        batch_op.create_foreign_key('fk_members_updated_by', 'users', ['updated_by'], ['id'], ondelete='SET NULL')
        batch_op.create_index(batch_op.f('ix_members_display_order'), ['display_order'], unique=False)
        batch_op.create_index(batch_op.f('ix_members_is_active'), ['is_active'], unique=False)

    # 2. Sync existing rows if any existed
    op.execute(
        "UPDATE members SET "
        "name = COALESCE(display_name, ''), "
        "designation = COALESCE(role, 'Member'), "
        "display_order = COALESCE(sort_order, 0), "
        "is_active = COALESCE(is_visible, true)"
    )


def downgrade() -> None:
    with op.batch_alter_table('members', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_members_is_active'))
        batch_op.drop_index(batch_op.f('ix_members_display_order'))
        batch_op.drop_constraint('fk_members_updated_by', type_='foreignkey')
        batch_op.drop_constraint('fk_members_created_by', type_='foreignkey')
        batch_op.drop_column('updated_by')
        batch_op.drop_column('created_by')
        batch_op.drop_column('is_active')
        batch_op.drop_column('display_order')
        batch_op.drop_column('photo_height')
        batch_op.drop_column('photo_width')
        batch_op.drop_column('photo_file_size')
        batch_op.drop_column('photo_mime_type')
        batch_op.drop_column('photo_original_filename')
        batch_op.drop_column('photo_storage_path')
        batch_op.drop_column('bio')
        batch_op.drop_column('designation')
        batch_op.drop_column('name')
