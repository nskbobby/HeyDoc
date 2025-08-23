from django.urls import path
from . import views

urlpatterns = [
    path('', views.AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:appointment_id>/cancel/', views.cancel_appointment, name='cancel-appointment'),
    path('available-slots/', views.available_slots, name='available-slots'),
    path('check-date-availability/', views.check_date_availability, name='check-date-availability'),
]