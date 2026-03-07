from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Category, Post
from .serializers import CategorySerializer, PostSerializer, UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    # allows anyone to READ, but only logged-in users to CREATE/UPDATE
    permission_classes = [IsAuthenticatedOrReadOnly]
    # Automatically link the post to the currently logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        my_posts = Post.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(my_posts, many=True)
        return Response(serializer.data)

    # View for handling user registration
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Allow anyone to access the registration endpoint (no token required)
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer