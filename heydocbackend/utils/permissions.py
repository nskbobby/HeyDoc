from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user

class IsPatientOrDoctor(permissions.BasePermission):
    """
    Custom permission to allow access to patients and doctors.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_patient or request.user.is_doctor
        )

class IsDoctorOnly(permissions.BasePermission):
    """
    Custom permission to only allow doctors.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_doctor

class IsPatientOnly(permissions.BasePermission):
    """
    Custom permission to only allow patients.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_patient