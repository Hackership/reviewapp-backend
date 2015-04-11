
from flask.ext.admin import Admin, BaseView, expose
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.admin.form import rules
from flask.ext.security import current_user
from flask import redirect, url_for, request
from app.models import User
from app import app, db

DISABLED = {'disabled': True}

class BaseAdminView(BaseView):

    def is_accessible(self):
        return current_user.is_authenticated() and current_user.can_admin()

    def _handle_view(self, name, **kwargs):
        if not self.is_accessible():
            return redirect(url_for('login', next=request.url))

class UserView(BaseAdminView, ModelView):
    can_create = False
    can_delete = False
    column_list = ('admin', 'moderator', 'email', 'name', 'current_login_at', 'login_count')

    form_widget_args = {
        'last_login_at': DISABLED,
        'last_login_ip': DISABLED,
        'current_login_at': DISABLED,
        'current_login_ip': DISABLED,
        'login_count': DISABLED,

    }

    form_excluded_columns = ('password', 'roles', 'timeslots', 'status',
                             'comments', 'calls', 'applications')

    # form_edit_rules = [
    #     rules.FieldSet( ('active', 'name', 'email', 'timezone'), 'Basics'),
    #     rules.FieldSet( ('login_count', 'current_login_at', 'current_login_ip','last_login_at', 'last_login_ip'), 'Login Stats' ),
    # ]

    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(UserView, self).__init__(User, session, **kwargs)

admin = Admin(app, name="User Administration")
admin.add_view(UserView(db.session, endpoint="users"))
