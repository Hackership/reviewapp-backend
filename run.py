#!flask/bin/python
from app import app
import os
app.run(port=int(os.environ.get('PORT', 5000)))
