from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('confirm-email/', views.ConfirmEmailView.as_view(), name='confirm_email'),
]
