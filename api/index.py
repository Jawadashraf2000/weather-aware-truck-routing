import os
import sys

BACKEND_ROOT = os.path.join(os.path.dirname(__file__), '..', 'backend')
BACKEND_ROOT = os.path.abspath(BACKEND_ROOT)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'routing_project.settings')

from routing_project.wsgi import application

app = application
