from app import db
from flask.ext.login import UserMixin

stages = ('processing', 'to_anon', 'in_review',
          'email_send', 'reply_received', 'skyped',
          'accepted', 'rejected', 'grant_review',
          'grant_accepted', 'grant_rejected', 'archived',
          'inactive')

roles = ('admin', 'moderator', 'reviewer')


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.Enum(*roles))
    status = db.Column(db.String)
    
    def is_admin(self):
        if self.role == 'admin':
            return True
        else:
            return False

    def is_reviewer(self):
        if self.role == 'reviewer':
            return True
        else:
            return False

    def is_moderator(self):
        if self.role == 'moderator':
            return True
        else:
            return False

    def __repr__(self):
        return '<User: {}>'.format(self.email)


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime)
    changedStageAt = db.Column(db.DateTime)
    email = db.Column(db.String(120), unique=True)
    name = db.Column(db.String(120))
    content = db.Column(db.Text, unique=True)
    anon_content = db.Column(db.Text, unique=True)
    fizzbuzz = db.Column(db.Text, unique=True)
    stage = db.Column(db.Enum(*stages))
    batch = db.Column(db.String(64), unique=False)
    grant = db.Column(db.Boolean, unique=False)
    grant_content = db.Column(db.Text, unique=False)
    comments = db.relationship('Comment', backref='application')
    members = db.relationship('User', secondary=lambda: members_table,
                              backref='applications')
    emails = db.relationship('Email', backref='application')

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
    author = db.Column(db.String(120), unique=True)
    content = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    question = db.Column(db.Boolean, unique=False)
    application_id = db.Column(db.String, db.ForeignKey('application.id'))

    def __repr__(self):
        return '<Comment: {}, {}>'.format(self.createdAt, self.id)


class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    createdAt = db.Column(db.DateTime)
    author = db.Column(db.String(120), unique=True)
    stage = db.Column(db.Enum(*stages))
    incoming = db.Column(db.Boolean, unique=False)
    application_id = db.Column(db.String, db.ForeignKey('application.id'))
    content = db.Column(db.Text, unique=True)
    anon_content = db.Column(db.Text, unique=True)

    def __repr__(self):
        return '<Email: {}, {}>'.format(self.createdAt, self.id)
