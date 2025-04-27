from django.utils import timezone
from datetime import timedelta

def get_date_range(date_param='today'):
    """
    Convertit un paramètre de date en plage de dates.
    
    Args:
        date_param (str): 'today', 'week', 'month' ou date au format YYYY-MM-DD
        
    Returns:
        tuple: (start_datetime, end_datetime) en format timezone aware
    """
    # Définir la plage de dates pour le filtrage
    today = timezone.now().date()
    start_date = today
    end_date = today + timedelta(days=1)
    
    # Gérer les paramètres de période
    if date_param == 'week':
        # Pour la semaine, commencer 7 jours avant aujourd'hui
        start_date = today - timedelta(days=6)  # 7 jours incluant aujourd'hui
        end_date = today + timedelta(days=1)    # Jusqu'à la fin d'aujourd'hui
        print(f"Paramètre 'week' détecté: filtrage du {start_date} au {end_date}")
    elif date_param == 'month':
        # Pour le mois, commencer 30 jours avant aujourd'hui
        start_date = today - timedelta(days=29)  # 30 jours incluant aujourd'hui
        end_date = today + timedelta(days=1)     # Jusqu'à la fin d'aujourd'hui
        print(f"Paramètre 'month' détecté: filtrage du {start_date} au {end_date}")
    elif date_param != 'today':
        try:
            # Format attendu: YYYY-MM-DD
            start_date = timezone.datetime.strptime(date_param, '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=1)
        except ValueError:
            # En cas d'erreur de format, utiliser la date d'aujourd'hui
            print(f"Format de date invalide: {date_param}, utilisation de la date d'aujourd'hui")
    
    # Convertir les dates en datetime avec timezone
    start_datetime = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
    end_datetime = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.min.time()))
    
    return start_datetime, end_datetime
