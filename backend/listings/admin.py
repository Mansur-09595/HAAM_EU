# admin.py с jazzmin UI и улучшенными админ-классами
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Category, Listing, ListingImage, ListingVideo, Favorite


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "-"
    
    preview.short_description = "Превью"


class ListingVideoInline(admin.TabularInline):
    model = ListingVideo
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'slug')
    list_filter = ('parent',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'currency', 'location', 'owner', 'status', 'created_at')
    list_filter = ('status', 'category', 'is_featured', 'created_at')
    search_fields = ('title', 'description', 'location')
    readonly_fields = ('view_count', 'created_at', 'updated_at')
    inlines = [ListingImageInline, ListingVideoInline]


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'listing__title')
