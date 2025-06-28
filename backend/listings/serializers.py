from slugify import slugify
from rest_framework import serializers
from .models import Category, Listing, ListingImage, ListingVideo, Favorite
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'icon', 'slug', 'children')
    
    def get_children(self, obj):
        children = Category.objects.filter(parent=obj)
        return CategorySerializer(children, many=True).data if children.exists() else []

# Базовый сериализатор для чтения (и удаления/специальных случаев)
class ListingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source='category', read_only=True)
    images = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    slug = serializers.ReadOnlyField()
    
    class Meta:
        model = Listing
        fields = (
            'id', 'slug', 'title', 'description', 'price', 'currency', 'category', 
            'category_detail', 'location', 'owner', 'status', 'is_featured',
            'view_count', 'created_at', 'updated_at', 'images', 'videos',
            'is_favorited'
        )
        read_only_fields = ('owner', 'view_count', 'created_at', 'updated_at')
    
    def get_images(self, obj):
        return ListingImageSerializer(obj.images.all(), many=True).data

    def get_videos(self, obj):
        return ListingVideoSerializer(obj.videos.all(), many=True).data

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, listing=obj).exists()
        return False

    def validate(self, attrs):
        request = self.context.get('request')
        # Очищаем is_featured для не-админов
        if 'is_featured' in attrs and not (request and request.user.is_staff):
            attrs.pop('is_featured')
        return super().validate(attrs)

    def create(self, validated_data):
        # owner ставим автоматически
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # если пришёл is_featured и это не админ — убираем его
        if 'is_featured' in validated_data and not self.context['request'].user.is_staff:
            validated_data.pop('is_featured')
        return super().update(instance, validated_data)


class ListingCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    videos = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )
    slug = serializers.ReadOnlyField()
    is_featured = serializers.BooleanField(required=False)  # админ может выставлять

    class Meta:
        model = Listing
        fields = (
            'title', 'description', 'price', 'currency', 'category',
            'location', 'status', 'is_featured', 'images', 'videos', 'slug',
        )
        read_only_fields = ['status']  # статус модерации

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        # блокируем is_featured для не-админов
        if not (request and request.user.is_staff):
            self.fields['is_featured'].read_only = True

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        videos_data = validated_data.pop('videos', [])
        validated_data['owner'] = self.context['request'].user

        listing = Listing.objects.create(**validated_data)

        for i, image_data in enumerate(images_data):
            ListingImage.objects.create(
                listing=listing,
                image=image_data,
                is_primary=(i == 0)
            )
        for video_data in videos_data:
            ListingVideo.objects.create(
                listing=listing,
                video=video_data
            )
        return listing


class ListingUpdateSerializer(serializers.ModelSerializer):
    is_featured = serializers.BooleanField(required=False)  # админ может менять
    class Meta:
        model = Listing
        fields = (
            'title', 'description', 'price', 'currency', 'category',
            'location', 'status', 'is_featured',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        # блокируем is_featured для не-админов
        if not (request and request.user.is_staff):
            self.fields['is_featured'].read_only = True

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ('id', 'image', 'is_primary', 'created_at')

class ListingVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingVideo
        fields = ('id', 'video', 'created_at')

class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    listing = ListingSerializer(read_only=True)
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=Listing.objects.all(),
        write_only=True,
        source='listing'
    )
    class Meta:
        model = Favorite
        fields = ('id', 'user', 'listing', 'listing_id', 'created_at')
        read_only_fields = ('user', 'created_at')

class CitySerializer(serializers.Serializer):
    name = serializers.CharField()
    admin = serializers.CharField()