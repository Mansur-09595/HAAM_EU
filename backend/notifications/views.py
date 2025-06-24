from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        )
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='mark_read', url_name='mark-read')
    def mark_read(self, request, pk=None):
        """
        POST /api/notifications/{id}/mark_read/
        Помечает конкретное уведомление как прочитанное.
        """
        notification = self.get_object()
        # проверяем, что это ваш notification
        if notification.recipient != request.user:
            return Response(
                {'detail': 'Запрещено'},
                status=status.HTTP_403_FORBIDDEN
            )
        notification.is_read = True
        notification.save()
        # возвращаем нужный вам формат
        return Response(
            {'is_read': True},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})