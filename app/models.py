from app import db
from flask.ext.security import UserMixin, RoleMixin
from sqlalchemy.sql.expression import text

from app.utils import send_email, generate_fancy_name

import datetime
import hashlib

def hasher(self):
    return hashlib.md5(self.email).hexdigest()





stages = ('incoming', 'in_review',
          'email_send', 'reply_received', 'review_reply',
          'schedule_skype',
          'skype_scheduled', 'skyped',
          'accepted', 'rejected', 'grant_review',
          'grant_accepted', 'grant_rejected', 'archived',
          'inactive')

REVIEW_STAGES = ('in_review', 'email_send', 'review_reply',
                 'skyped', 'accepted', 'rejected')

MOD_STAGES = ('in_review', 'email_send', 'review_reply', 'reply_received',
              'skyped', 'accepted', 'rejected')

roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(),
                                 db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(),
                                 db.ForeignKey('role.id')))


class User(db.Model, UserMixin):
    # miniamal basics
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True)
    email = db.Column(db.String(120), unique=True)

    # security features
    password = db.Column(db.String(120))
    status = db.Column(db.String)
    active = db.Column(db.Boolean())

    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))

    # Security: Tracking
    last_login_at = db.Column(db.DateTime)
    current_login_at = db.Column(db.DateTime)
    last_login_ip = db.Column(db.String)
    current_login_ip = db.Column(db.String)
    login_count = db.Column(db.Integer)

    # Tool features
    timezone = db.Column(db.String)
    timeslots = db.relationship('Timeslot')

    comments = db.relationship('Comment', backref='user')
    calls = db.relationship('ScheduledCall',  secondary=lambda: user_calls_table)

    def is_skypelead(self):
        return self.has_role("skypelead")

    def can_admin(self):
        return self.has_role("admin")

    def can_moderate(self):
        return self.has_role("moderator") or self.has_role("admin")

    @property
    def admin(self):
        return self.can_admin()

    @property
    def moderator(self):
        return self.can_moderate()

    @property
    def gravatar(self):
        return hasher(self)

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
    anon_name = db.Column(db.String(20), unique=True, default=generate_fancy_name)
    content = db.Column(db.Text)
    anon_content = db.Column(db.Text)
    fizzbuzz = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    batch = db.Column(db.String(64))
    grant = db.Column(db.Boolean)
    grant_content = db.Column(db.Text)
    anonymizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    anonymizer = db.relationship('User')

    # backref from comments and emails come automatically
    members = db.relationship('User', secondary=lambda: members_table,
                              backref='applications')

    calls = db.relationship('ScheduledCall')

    comments = db.relationship('Comment')
    emails = db.relationship('Email')

    def send_email(self, subject, content, recipients=None):
        if recipients is None:
            recipients = [self.email]
        send_email(subject, content, recipients, self.from_email)

    @property
    def from_email(self):
        return 'appl-15{}@review.hackership.org'.format(self.id)

    @property
    def gravatar(self):
        return hasher(self)

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
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    question = db.Column(db.Boolean, default=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'))
    application = db.relationship('Application')
    author = db.relationship('User')

    def __repr__(self):
        return '<Comment: {}, {}>'.format(self.createdAt, self.id)


class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime, default=datetime.datetime.now)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    author = db.relationship('User')
    stage = db.Column(db.Enum(*stages))
    incoming = db.Column(db.Boolean, default=False)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'))
    application = db.relationship('Application')
    content = db.Column(db.Text)
    anon_content = db.Column(db.Text)

    def __repr__(self):
        return '<Email: {}, {}>'.format(self.createdAt, self.id)


## conference call management

class Timeslot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    once = db.Column(db.Boolean, default=False)
    # we extract date and hour from that.
    datetime = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    user = db.relationship('User')


class ScheduledCall(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'))
    application = db.relationship('Application')
    scheduledAt = db.Column(db.DateTime)
    failed = db.Column(db.Boolean, default=False)
    skype_name = db.Column(db.String(255))
    calendar_id = db.Column(db.String(255))

    callers = db.relationship('User',  secondary=lambda: user_calls_table)


user_calls_table = db.Table('user_calls',
    db.Column('user_id', db.Integer, db.ForeignKey("user.id"),
           primary_key=True),
    db.Column('scheduled_call_id', db.Integer, db.ForeignKey("scheduled_call.id"),
           primary_key=True)
)

