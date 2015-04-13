from marshmallow import Schema, fields


class UserSchema(Schema):
    class Meta:
        fields = ('id', 'name', 'gravatar')


class TimeslotSchema(Schema):
    class Meta:
        fields = ('id', 'once', 'datetime')


class Call(Schema):
    class Meta:
        fields = ('id', 'scheduledAt', 'failed', 'application',
                  'skype_name', 'callers')

    callers = fields.Nested(UserSchema, many=True)


class MeUserSchema(Schema):
    class Meta:
        fields = ('id', 'name', 'email', 'can_moderate', 'timezone',
                  'can_admin', 'can_skype', 'timeslots', 'calls', 'gravatar')
        exclude = ('password',)

    can_admin = fields.Method("check_admin")
    can_moderate = fields.Method("check_moderate")
    can_skype = fields.Method("check_skypee")

    timeslots = fields.Nested(TimeslotSchema, many=True)
    calls = fields.Nested(Call, many=True)

    def check_skypee(self, obj):
        return obj.has_role("skypee") or obj.has_role("skypelead")

    def check_moderate(self, obj):
        return obj.can_moderate()

    def check_admin(self, obj):
        return obj.can_admin()


class CommentSchema(Schema):
    class Meta:
        fields = ('id', 'author', 'createdAt',
                  'content', 'stage', 'question')

    author = fields.Nested(UserSchema)


class EmailSchema(Schema):
    class Meta:
        fields = ('id', 'createdAt', 'author', 'stage',
                  'incoming', 'anon_content', 'content')

    author = fields.Nested(UserSchema)


class AnonEmailSchema(EmailSchema):
    class Meta(EmailSchema.Meta):
        exclude = ('content',)


# restricted Access
class AnonymousApplicationSchema(Schema):
    class Meta:
        fields = ('id', 'createdAt', 'changedStageAt', 'anon_content',
                  'members', 'fizzbuzz', 'stage', 'batch', 'comments',
                  'emails', 'gravatar', 'anon_name')

    members = fields.Nested(UserSchema, many=True)
    comments = fields.Nested(CommentSchema, many=True)
    emails = fields.Nested(AnonEmailSchema, many=True)


# this only goes to Admins
class ApplicationSchema(Schema):
    class Meta:
        fields = ('id', 'createdAt', 'changedStageAt', 'content',
                  'name', 'email', 'anon_content', 'members',
                  'fizzbuzz', 'stage', 'batch', 'comments', 'emails',
                  'gravatar', 'anon_name')

    members = fields.Nested(UserSchema, many=True)
    comments = fields.Nested(CommentSchema, many=True)
    emails = fields.Nested(EmailSchema, many=True)


class ScheduledCallSchema(Schema):
    class Meta:
        fields = ('id', 'scheduledAt', 'failed', 'calendar_id', 'callers')

    callers = fields.Nested(UserSchema, many=True)


class ExternalApplicationSchema(Schema):
    class Meta:
        fields = ('id', 'createdAt', 'changedStageAt', 'name',
                  'stage', 'calls')

    calls = fields.Nested(ScheduledCallSchema, many=True)


class AppStateSchema(Schema):
    user = fields.Nested(MeUserSchema)
    applications = fields.Nested(ApplicationSchema, many=True)


class AdminAppStateSchema(Schema):
    user = fields.Nested(MeUserSchema)
    applications = fields.Nested(ApplicationSchema, many=True)


# Schema instances
users_schema = UserSchema(many=True)
me_schema = MeUserSchema()
admin_app_state = AdminAppStateSchema()
app_state = AppStateSchema()
