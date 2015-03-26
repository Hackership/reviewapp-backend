from app import db
from app.models import User, Timeslot
from datetime import datetime, timedelta

now = datetime.utcnow()

tomorrow = now + timedelta(hours=25)

for counter in [1,2,3]:

    user = User.query.filter(User.email=="skypee{}@example.org".format(counter)).first()
    for x in xrange(25):
        db.session.add(Timeslot(user=user.id, datetime=(now + timedelta(hours=x* (counter + 2)))))

user = User.query.filter(User.email=="skypelead@example.org").first()

for x in xrange(25):
    db.session.add(Timeslot(user=user.id, datetime=(now + timedelta(hours=x*2.5))))

db.session.commit()
