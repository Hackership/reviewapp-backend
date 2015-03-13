#!flask/bin/python
from app import app
import os
app.run(host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)))
