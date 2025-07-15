from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from django.views.generic import TemplateView
from django.views import View
from django.shortcuts import render
from rest_framework.response import Response
from django.utils import timezone
from .models import Subscription, User
from .permissions import IsSelfOrAdmin, IsSuperUser
from .token import CustomTokenObtainPairSerializer
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, SubscriptionSerializer, ConfirmEmailSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin]
    
    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated(), IsSuperUser()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        if self.action in ['create', 'token', 'token_refresh']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        data = {
            'follower_id': request.user.id,
            'following_id': request.data.get('user_id')
        }
        serializer = SubscriptionSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        following_id = request.data.get('user_id')
        subscription = Subscription.objects.filter(
            follower=request.user,
            following_id=following_id
        ).first()
        
        if not subscription:
            return Response(
                {'detail': 'Subscription not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        subscription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def followers(self, request):
        subscriptions = Subscription.objects.filter(following=request.user)
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def following(self, request):
        subscriptions = Subscription.objects.filter(follower=request.user)
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    

class ConfirmEmailTemplateView(View):
    template_name = 'users/confirm_email.html'

    def get(self, request):
        token = request.GET.get('token')
        context = {}
        if not token:
            context['status'] = 'error'
            context['message'] = 'Отсутствует токен подтверждения'
        else:
            try:
                user = User.objects.get(email_confirm_token=token)
                # проверка истечения
                if timezone.now() - user.email_confirm_sent_at > timezone.timedelta(hours=24): # type: ignore
                    context['status'] = 'error'
                    context['message'] = 'Срок действия токена истёк'
                else:
                    user.is_active = True
                    user.email_confirm_token = None # type: ignore
                    user.email_confirm_sent_at = None # type: ignore
                    user.save(update_fields=['is_active','email_confirm_token','email_confirm_sent_at'])
                    context['status'] = 'success'
                    context['message'] = 'Email успешно подтверждён'
            except User.DoesNotExist:
                context['status'] = 'error'
                context['message'] = 'Неверный или уже использованный токен'
        return render(request, self.template_name, context)