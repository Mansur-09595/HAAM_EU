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
    

class ConfirmEmailPageView(TemplateView):
    template_name = 'users/confirm_email.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        token = self.request.GET.get('token')
        if not token:
            ctx.update({
                'status': 'error',
                'message': 'Токен для подтверждения не передан.'
            })
            return ctx

        # Валидация формата
        serializer = ConfirmEmailSerializer(data={'token': token})
        if not serializer.is_valid():
            ctx.update({
                'status': 'error',
                'message': 'Неверный формат токена.'
            })
            return ctx

        token = serializer.validated_data['token']
        try:
            user = User.objects.get(email_confirm_token=token)
        except User.DoesNotExist:
            ctx.update({
                'status': 'error',
                'message': 'Неверный или уже использованный токен.'
            })
            return ctx

        # Проверка устаревания
        if timezone.now() - user.email_confirm_sent_at > timezone.timedelta(hours=24):
            ctx.update({
                'status': 'error',
                'message': 'Срок действия токена истёк.'
            })
            return ctx

        # Всё ок — активируем
        user.is_active = True
        user.email_confirm_token = None
        user.email_confirm_sent_at = None
        user.save(update_fields=['is_active','email_confirm_token','email_confirm_sent_at'])
        ctx.update({
            'status': 'success',
            'message': 'Email успешно подтверждён!'
        })
        return ctx
    
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
                if timezone.now() - user.email_confirm_sent_at > timezone.timedelta(hours=24):
                    context['status'] = 'error'
                    context['message'] = 'Срок действия токена истёк'
                else:
                    user.is_active = True
                    user.email_confirm_token = None
                    user.email_confirm_sent_at = None
                    user.save(update_fields=['is_active','email_confirm_token','email_confirm_sent_at'])
                    context['status'] = 'success'
                    context['message'] = 'Email успешно подтверждён'
            except User.DoesNotExist:
                context['status'] = 'error'
                context['message'] = 'Неверный или уже использованный токен'
        return render(request, self.template_name, context)
    
class ConfirmEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ConfirmEmailSerializer

    def post(self, request, *args, **kwargs):
        print(f"Request headers: {request.headers}")
        print(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(email_confirm_token=token)
        except User.DoesNotExist:
            return Response({'detail': 'Неверный или уже использованный токен'},
                            status=status.HTTP_400_BAD_REQUEST)
        if timezone.now() - user.email_confirm_sent_at > timezone.timedelta(hours=24):
            return Response({'detail': 'Срок действия токена истёк'},
                            status=status.HTTP_400_BAD_REQUEST)
        user.is_active = True
        user.email_confirm_token = None
        user.email_confirm_sent_at = None
        user.save(update_fields=['is_active', 'email_confirm_token', 'email_confirm_sent_at'])
        return Response({'detail': 'Email успешно подтверждён'}, status=status.HTTP_200_OK)