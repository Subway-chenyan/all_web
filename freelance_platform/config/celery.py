import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Beat Schedule
app.conf.beat_schedule = {
    # Example: Check for pending orders every 5 minutes
    'check-pending-orders': {
        'task': 'apps.orders.tasks.check_pending_orders',
        'schedule': crontab(minute='*/5'),
    },
    # Example: Send daily digest emails
    'send-daily-digest': {
        'task': 'apps.accounts.tasks.send_daily_digest',
        'schedule': crontab(hour=8, minute=0),
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')