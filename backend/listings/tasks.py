from datetime import timedelta
from django.utils import timezone
from celery import shared_task

from .models import Listing

@shared_task
def delete_old_listings():
    """
    Задача, которая ежедневно удаляет все объявления, старше 60 дней.
    """
    # Считаем дату 60 дней назад от сейчас
    cutoff_date = timezone.now() - timedelta(days=60)
    
    # Выбираем все объекты Listing, у которых created_at меньше cutoff_date
    old_items = Listing.objects.filter(created_at__lt=cutoff_date)
    
    # Если нужно, можно сначала сохранить их идентификаторы в лог или статистику:
    old_count = old_items.count()
    
    # Удаляем все сразу (bulk delete)
    old_items.delete()
    
    return f'Deleted {old_count} listings older than {cutoff_date.isoformat()}'
