from django.contrib.auth import get_user_model, password_validation
from rest_framework import serializers
from .models import Subscription
from django.utils.translation import gettext_lazy as _ 

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'avatar', 'bio', 'date_joined', 'is_staff',)
        read_only_fields = ('date_joined',)

class UserCreateSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text=password_validation.password_validators_help_text_html(),
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label=_("Password confirmation")
    )
    email     = serializers.EmailField(
        required=True,
        help_text=_("Е-mail адрес, на который будет отправлено письмо для подтверждения")
    )
    phone     = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    avatar    = serializers.URLField(
        required=False, allow_blank=True, allow_null=True
    )
    bio       = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email',
            'password', 'password2',
            'phone', 'avatar', 'bio',
        )
        extra_kwargs = {
            'username': {
                'required': True,
                'help_text': _("Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.")
            }
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(_("Это имя пользователя уже занято."))
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("Такой email уже зарегистрирован."))
        return value

    def validate(self, attrs):
        # Проверка совпадения паролей
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": _("Пароли не совпадают.")})

        # Запуск стандартных валидаторов Django
        password_validation.validate_password(attrs['password'], self.instance)
        return attrs

    def create(self, validated_data):
        # Убираем password2
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'phone', 'avatar', 'bio')

class SubscriptionSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    follower_id = serializers.IntegerField(write_only=True)
    following_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Subscription
        fields = ('id', 'follower', 'following', 'follower_id', 'following_id', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        return Subscription.objects.create(
            follower_id=validated_data['follower_id'],
            following_id=validated_data['following_id']
        )
