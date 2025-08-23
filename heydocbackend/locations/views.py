from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Country, State, City, Area
from .serializers import CountrySerializer, StateSerializer, CitySerializer, AreaSerializer

class CountryListView(generics.ListAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]

class StateListView(generics.ListAPIView):
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = State.objects.all()
        country_id = self.request.query_params.get('country_id')
        if country_id:
            queryset = queryset.filter(country_id=country_id)
        return queryset

class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = City.objects.all()
        state_id = self.request.query_params.get('state_id')
        if state_id:
            queryset = queryset.filter(state_id=state_id)
        return queryset

class AreaListView(generics.ListAPIView):
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Area.objects.all()
        city_id = self.request.query_params.get('city_id')
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        return queryset