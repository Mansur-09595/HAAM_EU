import os, ssl, certifi
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv
from corsheaders.defaults import default_headers

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-key-for-development')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
USE_S3 = os.getenv("USE_S3", "false").lower() == "true"

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'channels',
    'social_django',
    'drf_spectacular',

    # Local apps
    'users.apps.UsersConfig',
    'listings.apps.ListingsConfig',
    'chat.apps.ChatConfig',
    'notifications.apps.NotificationsConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Базовая секция DATABASES
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     os.getenv('DB_NAME', 'avito_clone'),
        'USER':     os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST':     os.getenv('DB_HOST', 'localhost'),
        'PORT':     os.getenv('DB_PORT', '5432'),
    }
}

# import dj_database_url
# if os.getenv('DATABASE_URL'):
#     DATABASES['default'] = dj_database_url.parse(os.getenv('DATABASE_URL'))

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)

if USE_S3 and os.getenv('AWS_STORAGE_BUCKET_NAME'):
    INSTALLED_APPS += ['storages']
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "us-east-1")  
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_QUERYSTRING_AUTH = False

    # Статика всё ещё можно отдавать белайтноизом
    STATIC_LOCATION = "staticfiles"
    STATIC_ROOT = BASE_DIR / "staticfiles"
    STATIC_URL = "https://haam-static.onrender.com/"
    STATICFILES_STORAGE = 'config.storage_backends.StaticStorage'

    # Медиаконтент в S3
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"
    DEFAULT_FILE_STORAGE = 'config.storage_backends.PublicMediaStorage'
else:
    STATIC_URL = "/staticfiles/"
    STATIC_ROOT = BASE_DIR / "staticfiles"
    MEDIA_URL = "/mediafiles/"
    MEDIA_ROOT = BASE_DIR / "mediafiles"

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'PAGE_SIZE_QUERY_PARAM': 'page_size',
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":       timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME":      timedelta(days=1),
    "ROTATE_REFRESH_TOKENS":       False,
    "BLACKLIST_AFTER_ROTATION":    False,
    "UPDATE_LAST_LOGIN":           False,
    "ALGORITHM":                   "HS256",
    "SIGNING_KEY":                 SECRET_KEY,
    "AUTH_HEADER_TYPES":           ("Bearer",),
    "AUTH_HEADER_NAME":            "HTTP_AUTHORIZATION",
    "USER_ID_FIELD":               "id",
    "USER_ID_CLAIM":               "user_id",
    "TOKEN_TYPE_CLAIM":            "token_type",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=60),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
    "TOKEN_OBTAIN_SERIALIZER": "users.token.CustomTokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'https://haam-db.onrender.com,http://localhost:3000'
).split(',')
CORS_ALLOW_HEADERS = list(default_headers) + [
  'authorization',
  'content-type',
]

#
# === SSL / TLS for Redis over rediss:// ===
#

# === Redis / Celery TLS ===
REDIS_URL = os.getenv('REDIS_URL')
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND')

# Use system CA bundle to trust Let's Encrypt
COMMON_SSL = {
    # если хочется отключить проверку сертификата,
    # можно оставить ssl.CERT_NONE, но чаще лучше требовать проверку:
    'ssl_cert_reqs': ssl.CERT_REQUIRED,
    'ssl_ca_certs': certifi.where(),
}

# Celery
# Отключаем SSL для локальной разработки
CELERY_BROKER_USE_SSL = False
CELERY_RESULT_BACKEND_USE_SSL = False

CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE          = TIME_ZONE

CELERY_BEAT_SCHEDULE = {
    'delete-old-listings-every-day': {
        'task':    'listings.tasks.delete_old_listings',
        'schedule': timedelta(days=1),
    },
}

# Channels layer over Redis
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [{
                'address': os.getenv('REDIS_URL', 'redis://redis:6379/0'),
            }],
        },
    },
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'channels':        {'handlers': ['console'], 'level': 'DEBUG'},
        'channels_redis':  {'handlers': ['console'], 'level': 'DEBUG'},
    },
}

# Email
EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST          = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT          = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER     = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = True     # включаем STARTTLS
EMAIL_USE_SSL = False    # SSL на порту 465 не используется
DEFAULT_FROM_EMAIL  = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@haam.be')

# URL фронтенда, куда мы даём ссылку
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Social Auth
AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.vk.VKOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY    = os.getenv('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', '')

SOCIAL_AUTH_VK_OAUTH2_KEY    = os.getenv('SOCIAL_AUTH_VK_OAUTH2_KEY', '')
SOCIAL_AUTH_VK_OAUTH2_SECRET = os.getenv('SOCIAL_AUTH_VK_OAUTH2_SECRET', '')

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

# API docs
SPECTACULAR_SETTINGS = {
    'TITLE':       'Avito Clone API',
    'DESCRIPTION': 'API for Avito Clone classified ads platform',
    'VERSION':     '1.0.0',
}

# Render proxy header
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Security
SECURE_SSL_REDIRECT   = False  # Отключаем для локальной разработки
SESSION_COOKIE_SECURE = False  # Отключаем для локальной разработки
CSRF_COOKIE_SECURE    = False  # Отключаем для локальной разработки

# Staticfiles via WhiteNoise
#STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Geonames username for Belgian cities API
GEONAMES_USERNAME = os.getenv("GEONAMES_USERNAME")