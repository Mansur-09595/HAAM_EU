from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Редактировать/удалять может владелец объявления или админ.
    """
    def has_object_permission(self, request, view, obj):
        # чтение разрешено всем аутентифицированным
        if request.method in permissions.SAFE_METHODS:
            return True
        # админ может всё
        if request.user.is_staff:
            return True
        # владелец — может
        return obj.owner == request.user
