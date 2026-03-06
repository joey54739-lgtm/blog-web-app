from rest_framework import serializers
from .models import Category, Post, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__' 


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='user.username')
    category_name = serializers.ReadOnlyField(source='category.category_name')

    class Meta:
        model = Post
        fields = ['id', 'user', 'author_name', 'category', 'category_name', 'post_title', 'post_content', 'created_at', 'modified_at']