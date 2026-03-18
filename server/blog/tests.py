from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Category, Post, Comment, Profile

class ITBlogComprehensiveTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='password123')
        self.category = Category.objects.create(category_name='Frontend', category_code='frontend')
        self.post = Post.objects.create(
            user=self.user, 
            category=self.category, 
            post_title='Test Post', 
            post_content='Content'
        )

    # M1: Registration
    def test_user_registration(self):
        data = {
            'username': 'newuser', 
            'password': 'newpassword123', 
            'email': 'test@test.com'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # M3 & M4: Post Lifecycle (Create, Edit, Delete)
    def test_post_lifecycle(self):
        self.client.force_authenticate(user=self.user)
        
        # Create
        create_resp = self.client.post('/api/posts/', {
            'post_title': 'New', 
            'post_content': 'Text', 
            'category': self.category.id
        })
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        post_id = create_resp.data['id']
        
        # Edit
        edit_resp = self.client.put(f'/api/posts/{post_id}/', {
            'post_title': 'Updated Title', 
            'post_content': 'Updated Text', 
            'category': self.category.id
        })
        self.assertEqual(edit_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_resp.data['post_title'], 'Updated Title')
        
        # Delete
        delete_resp = self.client.delete(f'/api/posts/{post_id}/')
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)

    # S2: Profile Update
    def test_update_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.put('/api/profile/update/', {
            'displayName': 'Test Name', 
            'bio': 'Test Bio'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # S3 & S4: Comment Creation and Retrieval
    def test_commenting_and_retrieval(self):
        self.client.force_authenticate(user=self.user)
        
        # Create comment
        response = self.client.post('/api/comments/', {
            'post': self.post.id, 
            'comment_content': 'Nice!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Retrieve comments by post ID
        get_resp = self.client.get(f'/api/comments/?post={self.post.id}')
        self.assertEqual(len(get_resp.data), 1)
        self.assertEqual(get_resp.data[0]['comment_content'], 'Nice!')

    # C1: Search Functionality (Posts and Users)
    def test_search_functions(self):
        # Search posts
        post_resp = self.client.get('/api/posts/?search=Test')
        self.assertEqual(len(post_resp.data), 1)
        
        # Search users
        user_resp = self.client.get('/api/users/search/?q=tester')
        self.assertEqual(user_resp.status_code, status.HTTP_200_OK)