"""empty message

Revision ID: 3a067e07ecf7
Revises: None
Create Date: 2015-03-12 17:02:32.415466

"""

# revision identifiers, used by Alembic.
revision = '3a067e07ecf7'
down_revision = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###

    STAGES = sa.Enum('incoming', 'in_review', 'email_send',
                     'reply_received', 'skyped', 'accepted',
                     'rejected', 'grant_review', 'grant_accepted',
                     'grant_rejected', 'archived', 'inactive',
                     name="STAGES")

    op.create_table('role',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=True),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('password', sa.String(length=120), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('name')
    )
    op.create_table('roles_users',
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('role_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['role_id'], ['role.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], )
    )
    op.create_table('application',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('createdAt', sa.DateTime(), nullable=True),
    sa.Column('changedStageAt', sa.DateTime(), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('name', sa.String(length=120), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('anon_content', sa.Text(), nullable=True),
    sa.Column('fizzbuzz', sa.Text(), nullable=True),
    sa.Column('stage', STAGES, nullable=True),
    sa.Column('batch', sa.String(length=64), nullable=True),
    sa.Column('grant', sa.Boolean(), nullable=True),
    sa.Column('grant_content', sa.Text(), nullable=True),
    sa.Column('anonymizer', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['anonymizer'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('members',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('application_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['application_id'], ['application.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'application_id')
    )
    op.create_table('comment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('createdAt', sa.DateTime(), nullable=True),
    sa.Column('author', sa.Integer(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('stage', STAGES, nullable=True),
    sa.Column('question', sa.Boolean(), nullable=True),
    sa.Column('application', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['application'], ['application.id'], ),
    sa.ForeignKeyConstraint(['author'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('email',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('createdAt', sa.DateTime(), nullable=True),
    sa.Column('author', sa.Integer(), nullable=True),
    sa.Column('stage', STAGES, nullable=True),
    sa.Column('incoming', sa.Boolean(), nullable=True),
    sa.Column('application', sa.Integer(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('anon_content', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['application'], ['application.id'], ),
    sa.ForeignKeyConstraint(['author'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('email')
    op.drop_table('comment')
    op.drop_table('members')
    op.drop_table('application')
    op.drop_table('roles_users')
    op.drop_table('user')
    op.drop_table('role')
    ### end Alembic commands ###
