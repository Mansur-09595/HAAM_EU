from io import BytesIO

from PIL import Image
from django.core.files.base import ContentFile
from django_filters import rest_framework as filters
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response

from .models import Category, Listing, ListingImage, ListingVideo, Favorite
from .permissions import IsOwnerOrAdmin
from .serializers import (
    CategorySerializer,
    ListingSerializer,
    ListingCreateSerializer,
    ListingUpdateSerializer,
    ListingImageSerializer,
    ListingVideoSerializer,
    FavoriteSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Для небезопасных методов (POST/PUT/PATCH/DELETE) — только владелец.
    Для SAFE_METHODS — разрешено всем.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class ListingFilter(filters.FilterSet):
    price_min = filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = filters.ModelMultipleChoiceFilter(
        queryset=Category.objects.all(),
        field_name='category'
    )
    category_slug = filters.CharFilter(field_name="category__slug", lookup_expr="iexact")

    class Meta:
        model = Listing
        fields = [
            'price_min', 'price_max',
            'category', 'category_slug',
            'location', 'status'
        ]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Только чтение категорий верхнего уровня
    """
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ListingViewSet(viewsets.ModelViewSet):
    """
    CRUD по объявлениям + кастомные экшены favorite, unfavorite, my_listings, favorites
    """
    queryset = Listing.objects.all()
    lookup_field = "slug"
    filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ListingFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'price', 'view_count']

    def get_serializer_class(self):
        if self.action == 'create':
            return ListingCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ListingUpdateSerializer
        return ListingSerializer

    def get_permissions(self):
        # публично доступно только чтение списка и деталей
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]

        # создание и просмотр собственных/избранных — только для залогиненных
        if self.action in ['create', 'my_listings', 'favorites', 'favorite', 'unfavorite']:
            return [permissions.IsAuthenticated()]

        # изменение и удаление — только владелец или админ
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

        # по умолчанию — требуем авторизацию
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        # при просмотре детали увеличиваем счетчик
        instance = self.get_object()
        instance.view_count = instance.view_count + 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        listing = self.get_object()
        fav, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({'status': 'added' if created else 'already in favorites'}, status=code)

    @action(detail=True, methods=['post'])
    def unfavorite(self, request, pk=None):
        listing = self.get_object()
        try:
            fav = Favorite.objects.get(user=request.user, listing=listing)
            fav.delete()
            return Response({'status': 'removed'}, status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response({'status': 'not in favorites'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        qs = Listing.objects.filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favs = Favorite.objects.filter(user=request.user)
        listings = [f.listing for f in favs]
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)


class ListingImageViewSet(viewsets.ModelViewSet):
    """
    CRUD по картинкам, только для владельца объявления
    """
    queryset = ListingImage.objects.all()
    serializer_class = ListingImageSerializer

    def get_permissions(self):
        # чтение (list/retrieve) доступно всем, но мы фильтруем в get_queryset()
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # создание/изменение/удаление — только владелец или админ
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        # показываем только свои картинки
        if self.action in ['list', 'retrieve']:
            return ListingImage.objects.all()
        return ListingImage.objects.filter(listing__owner=self.request.user)

    def perform_create(self, serializer):
        listing_id = self.request.data.get('listing')
        listing = Listing.objects.get(id=listing_id)

        if listing.owner != self.request.user:
            raise permissions.PermissionDenied("Можно добавлять фото только к своим объявлениям")

        image_file = self.request.FILES.get('image')
        if image_file:
            img = Image.open(image_file).convert('RGB').resize((150, 150))
            buf = BytesIO()
            img.save(buf, format='JPEG')
            content = ContentFile(buf.getvalue(), name=image_file.name)
            serializer.save(image=content)
        else:
            serializer.save()


class ListingVideoViewSet(viewsets.ModelViewSet):
    """
    CRUD по видео, только для владельца объявления
    """
    queryset = ListingVideo.objects.all()
    serializer_class = ListingVideoSerializer

    def get_permissions(self):
        # как и для картинок: чтение — всем, запись — только владелец/админ
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        # показываем только видео своих объявлений
        if self.action in ['list', 'retrieve']:
            return ListingVideo.objects.all()
        return ListingVideo.objects.filter(listing__owner=self.request.user)

    def perform_create(self, serializer):
        listing_id = self.request.data.get('listing')
        listing = Listing.objects.get(id=listing_id)

        if listing.owner != self.request.user:
            raise permissions.PermissionDenied("Можно добавлять видео только к своим объявлениям")

        serializer.save()
