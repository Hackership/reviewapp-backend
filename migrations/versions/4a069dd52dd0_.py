"""empty message

Revision ID: 4a069dd52dd0
Revises: 14442d4dd6ce
Create Date: 2015-03-23 00:07:58.221257

"""

# revision identifiers, used by Alembic.
revision = '4a069dd52dd0'
down_revision = '14442d4dd6ce'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('scheduled_call', sa.Column('skype_name', sa.String(length=255), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('scheduled_call', 'skype_name')
    ### end Alembic commands ###
