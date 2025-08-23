from django.contrib import admin
from .models import Country, State, City, Area

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'created_at')
    list_filter = ('country',)
    search_fields = ('name', 'code')

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'state', 'created_at')
    list_filter = ('state__country', 'state')
    search_fields = ('name',)

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'postal_code', 'created_at')
    list_filter = ('city__state__country', 'city__state', 'city')
    search_fields = ('name', 'postal_code')