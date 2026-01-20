from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Permission pour les administrateurs uniquement"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'ADMIN' or request.user.is_superuser
        )


class IsPastor(permissions.BasePermission):
    """Permission pour les pasteurs uniquement (stricte)"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'PASTOR'
        )


class IsPastorOrAdmin(permissions.BasePermission):
    """Permission pour les pasteurs et administrateurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['PASTOR', 'ADMIN'] or request.user.is_superuser
        )


class IsModerator(permissions.BasePermission):
    """Permission for Moderators, Pastors and Admins"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                   (request.user.role in ['MODERATOR', 'PASTOR'] or request.user.is_superuser))


class IsMember(permissions.BasePermission):
    """Permission pour les membres authentifiés"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission pour le propriétaire de l'objet ou l'admin"""
    
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        
        # Vérifier si l'objet a un attribut 'user' ou 'member'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'member'):
            return obj.member == request.user
        
        return False


class ReadOnlyOrPastorAdmin(permissions.BasePermission):
    """
    Permission lecture pour tous les authentifiés,
    création/modification/suppression pour pasteur et admin uniquement
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture seulement pour pasteur et admin
        return request.user.role in ['PASTOR', 'ADMIN'] or request.user.is_superuser

class IsAdminOrReadOnlyPublic(permissions.BasePermission):
    """
    Lecture pour tout le monde (public).
    Écriture pour Admin uniquement.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.role == 'ADMIN' or request.user.is_superuser
        )
