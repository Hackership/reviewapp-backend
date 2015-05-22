from unittest import TestCase
from datetime import datetime

from app.views import _find_slots, _find_available_slots


class autoSetter(object):
    def __init__(self, *args, **kwargs):
        for x, v in kwargs.iteritems():
            setattr(self, x, v)

        if self.ARGS:
            for idx, k in enumerate(self.ARGS):
                setattr(self, k, args[idx] if len(args) > idx else None)

    def __repr__(self):
        return "<{0} {1}>".format(self.__class__.__name__, " ".join(["{0}={1}".format(*x) for x in self.__dict__.iteritems()]))


class TestTimeSlots(TestCase):

    class fakeUser(autoSetter):
        ARGS = ["id", "name", "lead"]

        def is_skypelead(self):
            return self.lead

    class fakeTimeSlot(autoSetter):
        ARGS = ["once", "datetime", "user_id"]

    class fakeScheduledCall(autoSetter):
        ARGS = ["scheduledAt", "failed", "callers"]

    def complex_test(self):
        users = [self.fakeUser(*args) for args in [
            (2, "Ben", True),
            (6, "Anouk", True),
            (7, "Charlotte", True),
            (12, "Patty", False),
            (15, "Ethan", False)
        ]]

        users_map = dict([(x.id, x) for x in users])

        timeslots = [self.fakeTimeSlot(*args) for args in [
            (False, datetime(2014,12,30,19, 0, 0), 2),
            (False, datetime(2014,12,30,19,30, 0), 2),
            (False, datetime(2014,12,30,20, 0, 0), 2),
            (False, datetime(2014,12,30,20,30, 0), 2),
            (False, datetime(2014,12,30,21, 0, 0), 2),
            (False, datetime(2014,12,30,21,30, 0), 2),
            (False, datetime(2014,12,30,23, 0, 0), 2),
            (False, datetime(2014,12,30,23,30, 0), 2),
            (False, datetime(2014,12,31, 0, 0, 0), 2),
            (False, datetime(2014,12,31, 0,30, 0), 2),
            (False, datetime(2014,12,31, 3, 0, 0), 2),
            (False, datetime(2014,12,31, 3,30, 0), 2),
            (False, datetime(2014,12,31,19, 0, 0), 2),
            (False, datetime(2014,12,31,19,30, 0), 2),
            (False, datetime(2014,12,31,20, 0, 0), 2),
            (False, datetime(2014,12,31,20,30, 0), 2),
            (False, datetime(2014,12,31,21, 0, 0), 2),
            (False, datetime(2014,12,31,21,30, 0), 2),
            (False, datetime(2014,12,31,23, 0, 0), 2),
            (False, datetime(2014,12,31,23,30, 0), 2),
            (False, datetime(2015, 1, 1, 0, 0, 0), 2),
            (False, datetime(2015, 1, 1, 0,30, 0), 2),
            (False, datetime(2015, 1, 1, 3, 0, 0), 2),
            (False, datetime(2015, 1, 1, 3,30, 0), 2),
            (False, datetime(2015, 1, 1,19, 0, 0), 2),
            (False, datetime(2015, 1, 1,19,30, 0), 2),
            (False, datetime(2015, 1, 1,20, 0, 0), 2),
            (False, datetime(2015, 1, 1,20,30, 0), 2),
            (False, datetime(2015, 1, 1,21, 0, 0), 2),
            (False, datetime(2015, 1, 1,21,30, 0), 2),
            (False, datetime(2015, 1, 1,23, 0, 0), 2),
            (False, datetime(2015, 1, 1,23,30, 0), 2),
            (False, datetime(2015, 1, 2, 0, 0, 0), 2),
            (False, datetime(2015, 1, 2, 0,30, 0), 2),
            (False, datetime(2015, 1, 2, 3, 0, 0), 2),
            (False, datetime(2015, 1, 2, 3,30, 0), 2),
            (True, datetime(2015, 5,13,17, 0, 0), 2),
            (True, datetime(2015, 5,12,12,30, 0), 2),
            (True, datetime(2015, 5,13,16,30, 0), 2),
            (True, datetime(2015, 5,13,14, 0, 0), 2),
            (True, datetime(2015, 5,15,14,30, 0), 2),
            (True, datetime(2015, 5,19,13, 0, 0), 6),
            (False, datetime(2014,12,30, 0, 0, 0), 15),
            (False, datetime(2014,12,30, 0,30, 0), 15),
            (False, datetime(2014,12,30, 1, 0, 0), 15),
            (False, datetime(2014,12,30, 1,30, 0), 15),
            (False, datetime(2014,12,30, 5, 0, 0), 15),
            (False, datetime(2014,12,30, 5,30, 0), 15),
            (False, datetime(2014,12,30, 6, 0, 0), 15),
            (False, datetime(2015, 1, 1, 0, 0, 0), 15),
            (False, datetime(2015, 1, 1, 0,30, 0), 15),
            (False, datetime(2015, 1, 1, 1, 0, 0), 15),
            (False, datetime(2015, 1, 1, 1,30, 0), 15),
            (False, datetime(2015, 1, 1, 5, 0, 0), 15),
            (False, datetime(2015, 1, 1, 5,30, 0), 15),
            (False, datetime(2015, 1, 1, 6, 0, 0), 15),
            (True, datetime(2015, 4,23,14,30, 0), 7),
            (True, datetime(2015, 4,22,17, 0, 0), 7),
            (True, datetime(2015, 5, 7,16,30, 0), 7),
            (True, datetime(2015, 5, 8,12,30, 0), 7),
            (True, datetime(2015, 5, 7,15, 0, 0), 7),
            (False, datetime(2014,12,29,12,30, 0), 12),
            (False, datetime(2014,12,29,13, 0, 0), 12),
            (False, datetime(2014,12,29,13,30, 0), 12),
            (False, datetime(2014,12,29,14, 0, 0), 12),
            (False, datetime(2014,12,29,15, 0, 0), 12),
            (False, datetime(2014,12,29,14,30, 0), 12),
            (False, datetime(2014,12,29,15,30, 0), 12),
            (False, datetime(2014,12,29,16, 0, 0), 12),
            (False, datetime(2014,12,29,16,30, 0), 12),
            (False, datetime(2014,12,29,17, 0, 0), 12),
            (False, datetime(2014,12,30,12,30, 0), 12),
            (False, datetime(2014,12,30,13, 0, 0), 12),
            (False, datetime(2014,12,30,13,30, 0), 12),
            (False, datetime(2014,12,30,14, 0, 0), 12),
            (False, datetime(2014,12,30,14,30, 0), 12),
            (False, datetime(2014,12,30,15, 0, 0), 12),
            (False, datetime(2014,12,30,15,30, 0), 12),
            (False, datetime(2014,12,30,16, 0, 0), 12),
            (False, datetime(2014,12,30,16,30, 0), 12),
            (False, datetime(2014,12,30,17, 0, 0), 12),
            (False, datetime(2014,12,31,12,30, 0), 12),
            (False, datetime(2014,12,31,13, 0, 0), 12),
            (False, datetime(2014,12,31,13,30, 0), 12),
            (False, datetime(2014,12,31,14, 0, 0), 12),
            (False, datetime(2014,12,31,14,30, 0), 12),
            (False, datetime(2014,12,31,15, 0, 0), 12),
            (False, datetime(2014,12,31,15,30, 0), 12),
            (False, datetime(2014,12,31,16, 0, 0), 12),
            (False, datetime(2014,12,31,16,30, 0), 12),
            (False, datetime(2014,12,31,17, 0, 0), 12),
            (False, datetime(2015, 1, 1,12,30, 0), 12),
            (False, datetime(2015, 1, 1,13, 0, 0), 12),
            (False, datetime(2015, 1, 1,13,30, 0), 12),
            (False, datetime(2015, 1, 1,14, 0, 0), 12),
            (False, datetime(2015, 1, 1,14,30, 0), 12),
            (False, datetime(2015, 1, 1,15, 0, 0), 12),
            (False, datetime(2015, 1, 1,15,30, 0), 12),
            (False, datetime(2015, 1, 1,16, 0, 0), 12),
            (False, datetime(2015, 1, 1,16,30, 0), 12),
            (False, datetime(2015, 1, 1,17, 0, 0), 12),
            (False, datetime(2015, 1, 2,12,30, 0), 12),
            (False, datetime(2015, 1, 2,13, 0, 0), 12),
            (False, datetime(2015, 1, 2,13,30, 0), 12),
            (False, datetime(2015, 1, 2,14, 0, 0), 12),
            (False, datetime(2015, 1, 2,14,30, 0), 12),
            (False, datetime(2015, 1, 2,15, 0, 0), 12),
            (False, datetime(2015, 1, 2,15,30, 0), 12),
            (False, datetime(2015, 1, 2,16, 0, 0), 12),
            (False, datetime(2015, 1, 2,16,30, 0), 12),
            (False, datetime(2015, 1, 2,17, 0, 0), 12),
            (False, datetime(2014,12,29, 9, 0, 0), 7),
            (False, datetime(2014,12,29, 9,30, 0), 7),
            (False, datetime(2014,12,29,10, 0, 0), 7),
            (False, datetime(2014,12,29,10,30, 0), 7),
            (False, datetime(2014,12,29,11, 0, 0), 7),
            (False, datetime(2014,12,29,11,30, 0), 7),
            (False, datetime(2014,12,30, 9, 0, 0), 7),
            (False, datetime(2014,12,30, 9,30, 0), 7),
            (False, datetime(2014,12,30,10, 0, 0), 7),
            (False, datetime(2014,12,30,10,30, 0), 7),
            (False, datetime(2014,12,30,11, 0, 0), 7),
            (False, datetime(2014,12,30,11,30, 0), 7),
            (False, datetime(2014,12,31, 9, 0, 0), 7),
            (False, datetime(2014,12,31, 9,30, 0), 7),
            (False, datetime(2014,12,31,10, 0, 0), 7),
            (False, datetime(2014,12,31,10,30, 0), 7),
            (False, datetime(2014,12,31,11, 0, 0), 7),
            (False, datetime(2014,12,31,11,30, 0), 7),
            (False, datetime(2015, 1, 1, 9, 0, 0), 7),
            (False, datetime(2015, 1, 1, 9,30, 0), 7),
            (False, datetime(2015, 1, 1,10, 0, 0), 7),
            (False, datetime(2015, 1, 1,10,30, 0), 7),
            (False, datetime(2015, 1, 1,11, 0, 0), 7),
            (False, datetime(2015, 1, 1,11,30, 0), 7),
            (False, datetime(2015, 1, 2, 9, 0, 0), 7),
            (False, datetime(2015, 1, 2, 9,30, 0), 7),
            (False, datetime(2015, 1, 2,10, 0, 0), 7),
            (False, datetime(2015, 1, 2,10,30, 0), 7),
            (False, datetime(2015, 1, 2,11, 0, 0), 7),
            (False, datetime(2015, 1, 2,11,30, 0), 7),
            (True, datetime(2015, 4,22,15,30, 0), 7),
            (True, datetime(2015, 4,22,13, 0, 0), 7),
            (True, datetime(2015, 4,27,15,30, 0), 7),
            (True, datetime(2015, 5, 5,17,30, 0), 7),
            (True, datetime(2015, 4,27,17, 0, 0), 7),
            (True, datetime(2015, 4,28,12,30, 0), 7),
            (True, datetime(2015, 4,29,15, 0, 0), 7),
            (True, datetime(2015, 4,27,16, 0, 0), 7),
            (True, datetime(2015, 4,30,13, 0, 0), 7),
            (True, datetime(2015, 4,21,17, 0, 0), 7),
            (True, datetime(2015, 4,27,13,30, 0), 7),
            (True, datetime(2015, 4,27,16,30, 0), 7),
            (True, datetime(2015, 5, 6,12,30, 0), 7),
            (True, datetime(2015, 4,28, 5,30, 0), 7),
            (True, datetime(2015, 5, 8,14, 0, 0), 7),
            (True, datetime(2015, 4,29,12,30, 0), 7),
            (True, datetime(2015, 4,21,14, 0, 0), 7),
            (True, datetime(2015, 4,28,16, 0, 0), 7),
            (True, datetime(2015, 5, 7,13, 0, 0), 7),
            (True, datetime(2015, 4,20,15,30, 0), 7),
            (True, datetime(2015, 4,24,16, 0, 0), 7),
            (True, datetime(2015, 4,28,17,30, 0), 7),
            (True, datetime(2015, 5, 8,16, 0, 0), 7),
            (True, datetime(2015, 4,21,13,30, 0), 7),
            (True, datetime(2015, 4,23,13,30, 0), 7),
            (True, datetime(2015, 4,21,12,30, 0), 7),
            (True, datetime(2015, 4,20,13,30, 0), 7),
            (True, datetime(2015, 4,30,17, 0, 0), 7),
            (True, datetime(2015, 4,22,14, 0, 0), 7),
            (True, datetime(2015, 4,22,17,30, 0), 7),
            (True, datetime(2015, 4,30,15,30, 0), 7)
        ]]


        scheduled = [self.fakeScheduledCall(*args) for args in [

            (datetime(2015, 4,16,20,30, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,29,19, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,15,19, 0, 0), True, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,14,18, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,13,18, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,15,18, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,14,19, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,17,20,30, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 4,28,12,30, 0), False, (users_map[7], users_map[12]) ),
            (datetime(2015, 4,29,15, 0, 0), False, (users_map[7], users_map[12]) ),
            (datetime(2015, 5, 5,14,30, 0), True, (users_map[7], users_map[12]) ),
            (datetime(2015, 5,12,18, 0, 0), False, (users_map[12], users_map[2]) ),
            (datetime(2015, 5, 1,18, 0, 0), False, (users_map[12], users_map[2]) ),
            (datetime(2015, 5, 4,18,30, 0), False, (users_map[6], users_map[12]) ),
            (datetime(2015, 5,26, 1,30, 0), False, (users_map[15], users_map[2]) ),
            (datetime(2015, 5, 6,20, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 5, 7,16,30, 0), False, (users_map[7], users_map[12]) ),
            (datetime(2015, 5,12,18,30, 0), False, (users_map[6], users_map[12]) ),
            (datetime(2015, 5,20,19, 0, 0), False, (users_map[6], users_map[2]) ),
            (datetime(2015, 5,11,18, 0, 0), False, (users_map[6], users_map[12]) ),
            (datetime(2015, 5,13,17, 0, 0), False, (users_map[12], users_map[2]) ),
            (datetime(2015, 5,19,13, 0, 0), False, (users_map[6], users_map[12]) ),
            (datetime(2015, 5,21, 0, 0, 0), False, (users_map[15], users_map[2]) ),
            (datetime(2015, 5,28, 0,30, 0), False, (users_map[15], users_map[2]) )
        ]]



        self.assertEquals(0, dict(_find_available_slots(tomorrow=datetime(2015, 4, 1),
                                                   users_map=users_map,
                                                   slots_query=timeslots,
                                                   scheduled_query=scheduled)))


