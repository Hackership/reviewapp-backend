"""empty message

Revision ID: 2c8531376b77
Revises: 2e857a13e0d1
Create Date: 2015-04-10 15:11:16.119498

"""

# revision identifiers, used by Alembic.
revision = '2c8531376b77'
down_revision = '2e857a13e0d1'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('current_login_at', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('current_login_ip', sa.String(), nullable=True))
    op.add_column('user', sa.Column('last_login_at', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('last_login_ip', sa.String(), nullable=True))
    op.add_column('user', sa.Column('login_count', sa.Integer(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'login_count')
    op.drop_column('user', 'last_login_ip')
    op.drop_column('user', 'last_login_at')
    op.drop_column('user', 'current_login_ip')
    op.drop_column('user', 'current_login_at')
    ### end Alembic commands ###