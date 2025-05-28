from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from slugify import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    icon = models.CharField(max_length=50, blank=True)
    slug = models.SlugField(unique=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
    
    def __str__(self):
        return self.name

class Listing(models.Model):
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('pending', _('Pending Review')),
        ('sold', _('Sold')),
        ('archived', _('Archived')),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='RUB')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='listings')
    location = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('listing')
        verbose_name_plural = _('listings')
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1
            while Listing.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('listing image')
        verbose_name_plural = _('listing images')
    
    def __str__(self):
        return f"Image for {self.listing.title}"

class ListingVideo(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='videos')
    video = models.FileField(upload_to='listings/videos/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('listing video')
        verbose_name_plural = _('listing videos')
    
    def __str__(self):
        return f"Video for {self.listing.title}"

class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('favorite')
        verbose_name_plural = _('favorites')
        unique_together = ('user', 'listing')
    
    def __str__(self):
        return f"{self.user.username}'s favorite: {self.listing.title}"
