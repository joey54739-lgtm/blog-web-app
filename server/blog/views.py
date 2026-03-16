import re
from django.db.models import Q
from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Category, Post, Comment, Profile
from .serializers import CategorySerializer, PostSerializer, UserSerializer, CommentSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            word_regex = r'\b' + re.escape(search_query) + r'\b'
            queryset = queryset.filter(
                Q(post_title__iregex=word_regex) | 
                Q(post_content__iregex=word_regex) |
                Q(user__username__icontains=search_query)
            )
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        my_posts = Post.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(my_posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({
            'likes_count': post.likes.count(),
            'liked': liked
        })

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all().order_by('created_at')
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this comment."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data
    
    try:
        if 'username' in data and data['username'].strip():
            user.username = data['username'].strip()
            
        if 'displayName' in data:
            user.first_name = data['displayName'].strip()
        
        if 'email' in data:
            user.email = data['email'].strip()
            
        user.save()
        
        profile, created = Profile.objects.get_or_create(user=user)
        if 'bio' in data:
            profile.bio = data['bio'].strip()
            profile.save()
        
        return Response({
            "username": user.username,
            "displayName": user.first_name,
            "email": user.email,
            "bio": profile.bio,
            "detail": "Profile updated successfully!"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": "This username is already taken or invalid."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)
    
    return Response({
        "username": user.username,
        "displayName": user.first_name,
        "email": user.email,
        "bio": profile.bio if profile.bio else ""
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_users(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])
    users_by_name = User.objects.filter(username__icontains=query)
    word_regex = r'\b' + re.escape(query) + r'\b'
    relevant_posts = Post.objects.filter(
        Q(post_title__iregex=word_regex) | 
        Q(post_content__iregex=word_regex)
    )
    authors_of_posts = User.objects.filter(post__in=relevant_posts)
    final_users = (users_by_name | authors_of_posts).distinct()[:4]
    
    user_data = []
    for u in final_users:
        bio = u.profile.bio if hasattr(u, 'profile') and u.profile.bio else "This author hasn't written a bio yet."
        user_data.append({
            "username": u.username,
            "displayName": u.first_name,
            "bio": bio
        })
        
    return Response(user_data, status=status.HTTP_200_OK)