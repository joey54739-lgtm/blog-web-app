from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Category(models.Model):

    category_name = models.CharField(max_length=128)
    category_code = models.CharField(max_length=128, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.category_name

class Post(models.Model):
    # Foreign key 1: connects the post to a Django User (the author)
    # on_delete=models.CASCADE means: if the user is deleted, all their posts are deleted too
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Foreign key 2: connects the post to a Category
    # on_delete=models.SET_NULL means: if the category is deleted, the post stays but the category becomes null
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    
    post_title = models.CharField(max_length=128)
    post_content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True) # time when the post was created
    modified_at = models.DateTimeField(auto_now=True)    # time when the post was last updated

    def __str__(self):
        return self.post_title
    
class Comment(models.Model):
    # connects the comment to a specific post
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    # connects the comment to the user who wrote it
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    comment_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # shows something like: "Comment by joey on My First Blog"
        return f"Comment by {self.user.username} on {self.post.post_title}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=160, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
