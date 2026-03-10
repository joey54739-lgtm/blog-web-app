from rest_framework import serializers
from .models import Category, Post, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        # Ensure password is only written, never read or returned to the frontend
        extra_kwargs = {'password': {'write_only': True}}

    # safely hash the password
    def create(self, validated_data):
        user = User(
            email=validated_data.get('email', ''),
            username=validated_data['username']
        )
        # set_password hashes the password securely before saving
        user.set_password(validated_data['password'])
        user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__' 


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='user.username')
    category_name = serializers.ReadOnlyField(source='category.category_name')
    author_bio = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'author_name', 'author_bio', 'category', 'category_name', 'post_title', 'post_content', 'created_at', 'modified_at', 'likes_count', 'comments_count']
        read_only_fields = ['user']

    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_comments_count(self, obj):
        return obj.comments.count()
    def get_author_bio(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.bio:
            return obj.user.profile.bio
        return "This author hasn't written a bio yet."

class CommentSerializer(serializers.ModelSerializer):
    # allows us to display the commenter's username in React
    author_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'author_name', 'parent', 'comment_content', 'created_at', 'modified_at']
        # The 'user' is automatically assigned by the backend, so we don't ask the frontend for it
        read_only_fields = ['user']