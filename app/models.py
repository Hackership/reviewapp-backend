from app import db
from flask.ext.security import UserMixin, RoleMixin
from sqlalchemy.sql.expression import text

from app.utils import send_email

import datetime


stages = ('incoming', 'in_review',
          'email_send', 'reply_received', 'review_reply', 'skyped',
          'accepted', 'rejected', 'grant_review',
          'grant_accepted', 'grant_rejected', 'archived',
          'inactive')

REVIEW_STAGES = ('in_review', 'email_send', 'reply_received',
                 'skyped', 'accepted', 'rejected')


roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(),
                                 db.ForeignKey('role.id')))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(120))
    status = db.Column(db.String)
    active = db.Column(db.Boolean())
    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))

    def can_admin(self):
        return self.has_role("admin")

    def can_moderate(self):
        return self.has_role("moderator") or self.has_role("admin")

    def __repr__(self):
        return '<User: {}>'.format(self.email)


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime, default=datetime.datetime.now)
    changedStageAt = db.Column(db.DateTime)
    email = db.Column(db.String(120), unique=True)
    name = db.Column(db.String(120))
    content = db.Column(db.Text)
    anon_content = db.Column(db.Text)
    fizzbuzz = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    batch = db.Column(db.String(64))
    grant = db.Column(db.Boolean)
    grant_content = db.Column(db.Text)
    anonymizer = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # backref from comments and emails come automatically
    members = db.relationship('User', secondary=lambda: members_table,
                              backref='applications')

    comments = db.relationship('Comment')
    emails = db.relationship('Email')

    def send_email(self, subject, content, recipients=None):
        if recipients is None:
            recipients = [self.email]
        send_email(subject, content, recipients, self.from_email)

    @property
    def from_email(self):
        return 'appl-15{}@review.hackership.org'.format(self.id)

    def __repr__(self):
        return '<Application: {}, {}>'.format(self.createdAt, self.id)


members_table = db.Table('members',
    db.Column('user_id', db.Integer, db.ForeignKey("user.id"),
           primary_key=True),
    db.Column('application_id', db.Integer, db.ForeignKey("application.id"),
           primary_key=True)
)


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime, default=datetime.datetime.now)
    author = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    question = db.Column(db.Boolean, default=False)
    application = db.Column(db.Integer, db.ForeignKey('application.id'))

    def __repr__(self):
        return '<Comment: {}, {}>'.format(self.createdAt, self.id)


class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime, default=datetime.datetime.now)
    author = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    stage = db.Column(db.Enum(*stages))
    incoming = db.Column(db.Boolean, default=False)
    application = db.Column(db.Integer, db.ForeignKey('application.id'))
    content = db.Column(db.Text)
    anon_content = db.Column(db.Text)

    def __repr__(self):
        return '<Email: {}, {}>'.format(self.createdAt, self.id)
