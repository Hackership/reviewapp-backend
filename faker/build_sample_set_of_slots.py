import os.path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))



from app import db
from app.models import User, Timeslot
from datetime import datetime, timedelta
import random

now = datetime.utcnow()

tomorrow = now + timedelta(hours=25)

MINUTES = [0, 0, 0, 0, 30]
ONCE = [False, False, False, False, False, True]


def _clear():
    db.session.query(Timeslot).delete()
    db.session.commit()


def make_time(**delta):
    return (now + timedelta(**delta)).replace(second=0, minute=random.choice(MINUTES), microsecond=0);

for counter in [1,2,3]:

    user = User.query.filter(User.email=="skypee{}@example.org".format(counter)).first()
    for x in xrange(25):
        db.session.add(Timeslot(user=user, once=random.choice(ONCE), datetime=make_time(hours=x* (counter + 2))))

user = User.query.filter(User.email=="skypelead@example.org").first()

for x in xrange(25):
    db.session.add(Timeslot(user=user, once=random.choice(ONCE), datetime=make_time(hours=x*2.5)))

db.session.commit()
