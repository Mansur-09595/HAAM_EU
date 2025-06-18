from rest_framework import permissions

class IsSelfOrAdmin(permissions.BasePermission):
    """
    Разрешаем редактировать/удалять только свой профиль или если пользователь — админ.
    """

    def has_object_permission(self, request, view, obj):
        # Чтение разрешено любому аутентифицированному
        if request.method in permissions.SAFE_METHODS:
            return True
        # Аутентифицированный админ может всё
        if request.user.is_staff:
            return True
        # Обычный пользователь может изменять только свой профиль
        return obj.id == request.user.id

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser