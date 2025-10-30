from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid
from django.core.validators import RegexValidator
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract base model with created and updated timestamps"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """Abstract base model for soft delete functionality"""
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class UUIDModel(models.Model):
    """Abstract base model with UUID primary key"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel):
    """Combined base model with UUID, timestamps, and soft delete"""

    class Meta:
        abstract = True


# Country/Region choices for Chinese market
PROVINCE_CHOICES = [
    ('beijing', 'Beijing'),
    ('shanghai', 'Shanghai'),
    ('guangdong', 'Guangdong'),
    ('zhejiang', 'Zhejiang'),
    ('jiangsu', 'Jiangsu'),
    ('sichuan', 'Sichuan'),
    ('hubei', 'Hubei'),
    ('hunan', 'Hunan'),
    ('fujian', 'Fujian'),
    ('shandong', 'Shandong'),
    ('henan', 'Henan'),
    ('anhui', 'Anhui'),
    ('chongqing', 'Chongqing'),
    ('tianjin', 'Tianjin'),
    ('liaoning', 'Liaoning'),
    ('jilin', 'Jilin'),
    ('heilongjiang', 'Heilongjiang'),
    ('shaanxi', 'Shaanxi'),
    ('shanxi', 'Shanxi'),
    ('hebei', 'Hebei'),
    ('xinjiang', 'Xinjiang'),
    ('tibet', 'Tibet'),
    ('qinghai', 'Qinghai'),
    ('gansu', 'Gansu'),
    ('ningxia', 'Ningxia'),
    ('yunnan', 'Yunnan'),
    ('guizhou', 'Guizhou'),
    ('guangxi', 'Guangxi'),
    ('hainan', 'Hainan'),
    ('inner_mongolia', 'Inner Mongolia'),
    ('taiwan', 'Taiwan'),
    ('hong_kong', 'Hong Kong'),
    ('macau', 'Macau'),
]

# Chinese phone number validator
chinese_phone_validator = RegexValidator(
    regex=r'^1[3-9]\d{9}$',
    message='Please enter a valid Chinese mainland mobile number'
)

# WeChat ID validator
wechat_id_validator = RegexValidator(
    regex=r'^[a-zA-Z][a-zA-Z0-9_-]{5,19}$',
    message='Invalid WeChat ID format'
)