"""empty message

Revision ID: 488e110c559f
Revises: 2d25928d01fb
Create Date: 2015-03-25 12:06:04.999466

"""

# revision identifiers, used by Alembic.
revision = '488e110c559f'
down_revision = '2d25928d01fb'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    # op.drop_constraint(u'comment_author_fkey', 'comment', type_='foreignkey')
    # op.alter_column('comment', 'author', new_column_name='author_id')
    # op.create_foreign_key(None, 'comment', 'user', ['author_id'], ['id'])

    op.execute("""
ALTER TABLE comment RENAME COLUMN author TO author_id
""")
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.execute("""
ALTER TABLE comment RENAME COLUMN author_id TO author
""")
    ### end Alembic commands ###

 