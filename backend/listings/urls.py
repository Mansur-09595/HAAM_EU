from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'images', views.ListingImageViewSet)
router.register(r'videos', views.ListingVideoViewSet)
router.register(r'', views.ListingViewSet)

urlpatterns = [
    path('belgian-cities/', views.BelgianCitiesView.as_view(), name='belgian-cities'),
    path('', include(router.urls)),
]
