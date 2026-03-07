from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Category, Post, Comment
from .serializers import CategorySerializer, PostSerializer, UserSerializer, CommentSerializer

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

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Default: return all comments, ordered chronologically (oldest first, natural for reading)
        queryset = Comment.objects.all().order_by('created_at')
        
        # Smart filtering: If the URL contains '?post=1', only return comments for post ID 1
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        # Automatically link the new comment to the currently logged-in user
        serializer.save(user=self.request.user)