from marshmallow import Schema, fields


class UserSchema(Schema):
    class Meta:
        fields = ('id', 'name')
        

class MeUserSchema(Schema):
    class Meta:
        fields = ('id', 'name', 'email', 'can_moderate', 'can_admin')
        exclude = ('password',)

    can_admin = fields.Method("check_admin")
    can_moderate = fields.Method("check_moderate")

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
                  'emails')

    members = fields.Nested(UserSchema, many=True)
    comments = fields.Nested(CommentSchema, many=True)
    emails = fields.Nested(AnonEmailSchema, many=True)


# this only goes to Admins
class ApplicationSchema(Schema):
    class Meta:
        fields = ('id', 'createdAt', 'changedStageAt', 'content',
                  'name', 'email', 'anon_content', 'members',
                  'fizzbuzz', 'stage', 'batch', 'comments', 'emails')

    members = fields.Nested(UserSchema, many=True)
    comments = fields.Nested(CommentSchema, many=True)
    emails = fields.Nested(EmailSchema, many=True)


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
