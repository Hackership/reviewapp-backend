from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Integer()
    name = fields.String()


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


# Schema instances
users_schema = UserSchema(many=True)
me_schema = MeUserSchema()
