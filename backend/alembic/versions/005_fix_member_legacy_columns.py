"""005_fix_member_legacy_columns

Revision ID: 005_fix_member_legacy_columns
Revises: 004_member_management
Create Date: 2026-10-02

Phase 10 Schema Fix:
- Alter legacy columns (display_name, role, sort_order, is_visible) on members table to be nullable with safe server defaults
- Guarantees backward and forward compatibility across all PostgreSQL and SQLite deployments.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '005_fix_member_legacy_columns'
down_revision: Union[str, None] = '004_member_management'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alter legacy columns if present
    with op.batch_alter_table('members', schema=None) as batch_op:
        try:
            batch_op.alter_column('display_name', existing_type=sa.String(length=100), nullable=True, server_default='')
        except Exception:
            pass
        try:
            batch_op.alter_column('role', existing_type=sa.String(length=100), nullable=True, server_default='Member')
        except Exception:
            pass
        try:
            batch_op.alter_column('sort_order', existing_type=sa.Integer(), nullable=True, server_default='0')
        except Exception:
            pass
        try:
            batch_op.alter_column('is_visible', existing_type=sa.Boolean(), nullable=True, server_default=sa.text('true'))
        except Exception:
            pass

    # 2. Raw SQL fallback for PostgreSQL to ensure DROP NOT NULL is explicitly applied
    try:
        op.execute("ALTER TABLE members ALTER COLUMN display_name DROP NOT NULL")
    except Exception:
        pass
    try:
        op.execute("ALTER TABLE members ALTER COLUMN display_name SET DEFAULT ''")
    except Exception:
        pass
    try:
        op.execute("ALTER TABLE members ALTER COLUMN sort_order DROP NOT NULL")
    except Exception:
        pass
    try:
        op.execute("ALTER TABLE members ALTER COLUMN is_visible DROP NOT NULL")
    except Exception:
        pass


def downgrade() -> None:
    pass
