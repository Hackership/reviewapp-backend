from app import db

stages = ('processing', 'to_anon', 'in_review',
          'email_send', 'reply_received', 'skyped',
          'accepted', 'rejected', 'grant_review',
          'grant_accepted', 'grant_rejected', 'archived',
          'inactive')


Base = db.make_declarative_base()


class User(Base):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(120), unique=False)
    isActive = db.Column(db.Boolean)

    def __repr__(self):
        return '<User: {}>'.format(self.email)


class Application(Base):
    __tablename__ = 'application'
    id = db.Column(db.String(255), primary_key=True)
    createdAt = db.Column(db.DateTime)
    changedStageAt = db.Column(db.DateTime)
    email = db.Column(db.String(120), unique=True)
    name = db.Column(db.String(120), unique=True)
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


members_table = db.Table('members', Base.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey("user.id"),
           primary_key=True),
    db.Column('application_id', db.String, db.ForeignKey("application.id"),
           primary_key=True)
)


class Comment(Base):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(120), unique=True)
    content = db.Column(db.Text)
    stage = db.Column(db.Enum(*stages))
    question = db.Column(db.Boolean, unique=False)
    application_id = db.Column(db.String, db.ForeignKey('application.id'))

    def __repr__(self):
        return '<Comment: {}, {}>'.format(self.createdAt, self.id)


class Email(Base):
    __tablename__ = 'email'
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
