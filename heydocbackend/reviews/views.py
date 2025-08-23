from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            return Review.objects.filter(doctor_id=doctor_id, is_approved=True)
        return Review.objects.filter(patient=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateReviewSerializer
        return ReviewSerializer

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(patient=self.request.user)