
from django.db import models
from django.utils.timezone import now

class AttendanceRecord(models.Model):
    ATTENDANCE_TYPES = [
        ('entry', 'Entrada'),
        ('exit', 'Salida'),
    ]

    employee_id = models.IntegerField()
    date = models.DateField(default=now)
    time = models.TimeField(default=now)
    type = models.CharField(max_length=5, choices=ATTENDANCE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']


    def __str__(self):
        return f"{self.get_type_display()} - Empleado {self.employee_id} - {self.date} {self.time}"