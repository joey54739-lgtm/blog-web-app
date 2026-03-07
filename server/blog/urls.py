from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import CategoryViewSet, PostViewSet, RegisterView


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = [
    # Include all router-generated URLs
    path('', include(router.urls)),
    
    # Custom Authentication URLs
    path('register/', RegisterView.as_view(), name='api_register'),
    
    # Built-in DRF view that accepts username/password and returns a Token
    path('login/', obtain_auth_token, name='api_login'), 
]