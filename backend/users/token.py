from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from .serializers import UserSerializer  # Импортируем сериализатор пользователя

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # 🔑 Говорим, что логин — это email

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # 🧠 Проверяем пользователя
        user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError('Неверный email или пароль')

        # ✅ Получаем access + refresh
        data = super().validate(attrs)

        # 🔥 Добавляем пользователя в ответ
        data['user'] = UserSerializer(user, context=self.context).data

        return data
