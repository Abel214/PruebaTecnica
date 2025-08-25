from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Employee
from .serializers import EmployeeSerializer
from django.utils.timezone import now


class EmployeeTests(APITestCase):

    def setUp(self):
        self.employee_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone_number': '+1234567890',
            'position': 'Software Developer',
            'salary': '50000.00',
            'hire_date': now().date()
        }
        self.employee = Employee.objects.create(**self.employee_data)

    def test_get_all_employees(self):
        url = reverse('employee-list')
        response = self.client.get(url)
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_create_employee(self):
        url = reverse('employee-list')
        data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@example.com',
            'phone_number': '+0987654321',
            'position': 'HR Manager',
            'salary': '45000.00',
            'hire_date': '2024-01-15'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)

    def test_get_single_employee(self):
        url = reverse('employee-detail', kwargs={'pk': self.employee.pk})
        response = self.client.get(url)
        serializer = EmployeeSerializer(self.employee)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_update_employee(self):
        url = reverse('employee-detail', kwargs={'pk': self.employee.pk})
        data = {
            'first_name': 'John Updated',
            'last_name': 'Doe',
            'email': 'john.updated@example.com',
            'phone_number': '+1234567890',
            'position': 'Senior Developer',
            'salary': '60000.00',
            'hire_date': str(self.employee.hire_date)
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.first_name, 'John Updated')
        self.assertEqual(self.employee.position, 'Senior Developer')

    def test_delete_employee(self):
        url = reverse('employee-detail', kwargs={'pk': self.employee.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Employee.objects.count(), 0)