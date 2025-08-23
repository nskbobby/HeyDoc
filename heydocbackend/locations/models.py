from django.db import models
from django.core.validators import RegexValidator

class Country(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=3, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations_country'
        verbose_name_plural = 'countries'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def states_count(self):
        """Return number of states in this country."""
        return self.states.count()

    @property
    def cities_count(self):
        """Return number of cities in this country."""
        return sum(state.cities.count() for state in self.states.all())

    def get_major_cities(self, limit=10):
        """Get major cities in this country."""
        cities = []
        for state in self.states.all():
            cities.extend(state.cities.all()[:limit//self.states.count() if self.states.count() else limit])
        return cities[:limit]

class State(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='states')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations_state'
        ordering = ['name']
        unique_together = ['name', 'country']

    def __str__(self):
        return f"{self.name}, {self.country.name}"

    @property
    def full_name(self):
        """Return full name with country."""
        return f"{self.name}, {self.country.name}"

    @property
    def cities_count(self):
        """Return number of cities in this state."""
        return self.cities.count()

    def get_major_cities(self, limit=5):
        """Get major cities in this state."""
        return self.cities.all()[:limit]

class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cities')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations_city'
        verbose_name_plural = 'cities'
        ordering = ['name']
        unique_together = ['name', 'state']

    def __str__(self):
        return f"{self.name}, {self.state.name}"

    @property
    def full_name(self):
        """Return full name with state and country."""
        return f"{self.name}, {self.state.name}, {self.state.country.name}"

    @property
    def areas_count(self):
        """Return number of areas in this city."""
        return self.areas.count()

    @property
    def coordinates(self):
        """Return coordinates as tuple."""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None

    def set_coordinates(self, lat, lng):
        """Set coordinates."""
        self.latitude = lat
        self.longitude = lng

class Area(models.Model):
    name = models.CharField(max_length=100)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='areas')
    postal_code = models.CharField(max_length=10, blank=True, 
                                  validators=[RegexValidator(regex=r'^\d{5,6}$', 
                                            message='Postal code must be 5-6 digits')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'locations_area'
        ordering = ['name']
        unique_together = ['name', 'city']

    def __str__(self):
        return f"{self.name}, {self.city.name}"

    @property
    def full_address(self):
        """Return full address."""
        return f"{self.name}, {self.city.full_name}"

    @property
    def doctors_count(self):
        """Return number of doctors in this area."""
        return self.clinics.values('doctor').distinct().count()

    @property
    def clinics_count(self):
        """Return number of clinics in this area."""
        return self.clinics.count()