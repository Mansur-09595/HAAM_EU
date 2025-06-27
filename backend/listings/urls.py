from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'images', views.ListingImageViewSet)
router.register(r'', views.ListingViewSet)
router.register(r'videos', views.ListingVideoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('belgian-cities/', views.BelgianCitiesView.as_view(), name='belgian-cities'),
]
