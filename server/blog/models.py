from django.db import models

class Category(models.Model):

    category_name = models.CharField(max_length=128)
    category_code = models.CharField(max_length=128, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.category_name
