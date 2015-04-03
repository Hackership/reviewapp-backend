"""empty message

Revision ID: 138abff72a80
Revises: 432c40f9d1de
Create Date: 2015-04-02 18:35:16.524500

"""

# revision identifiers, used by Alembic.
revision = '138abff72a80'
down_revision = '432c40f9d1de'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('timezone', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'timezone')
    ### end Alembic commands ###