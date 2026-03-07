from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth.models import User
from .models import Category, Post
from .serializers import CategorySerializer, PostSerializer, UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    
    # NEW: This allows anyone to READ, but only logged-in users to CREATE/UPDATE
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Automatically link the post to the currently logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # View for handling user registration
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Allow anyone to access the registration endpoint (no token required)
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer