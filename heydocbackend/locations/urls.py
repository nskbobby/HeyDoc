from django.urls import path
from . import views

urlpatterns = [
    path('countries/', views.CountryListView.as_view(), name='countries'),
    path('states/', views.StateListView.as_view(), name='states'),
    path('cities/', views.CityListView.as_view(), name='cities'),
    path('areas/', views.AreaListView.as_view(), name='areas'),
]