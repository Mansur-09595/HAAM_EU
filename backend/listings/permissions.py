from rest_framework import permissions
from .models import Listing, ListingImage

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Разрешает запись (PUT/PATCH/DELETE) только владельцу или администратору.
    Для чтения (SAFE_METHODS) разрешает всем.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS (GET, HEAD, OPTIONS) — разрешаем
        if request.method in permissions.SAFE_METHODS:
            return True

        # Если это сам Listing:
        if isinstance(obj, Listing):
            return obj.owner == request.user or request.user.is_staff

        # Если это ListingImage (или любая другая модель, связанная с Listing):
        if isinstance(obj, ListingImage):
            return obj.listing.owner == request.user or request.user.is_staff

        # Для других случаев, чтобы не сломать код, по умолчанию можно запретить:
        return False
