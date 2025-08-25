// URLs de los Microservicios
const API_EMPLOYEES = 'http://localhost:8000/api/employees/';  // Microservicio A
const API_ATTENDANCE = 'http://localhost:8000/'; // Microservicio B

// Mostrar mensajes
function showMessage(message, type = 'success', elementId = 'message') {
    const messageDiv = document.getElementById(elementId);
    messageDiv.innerHTML = `
        <div class="alert ${type}">
            ${message}
        </div>
    `;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Validar campos en tiempo real
function setupFieldValidation() {
    // Validar campos de solo letras
    const textFields = document.querySelectorAll('input[type="text"]');
    textFields.forEach(field => {
        if (field.id === 'first_name' || field.id === 'last_name' || field.id === 'position' ||
            field.id === 'edit_first_name' || field.id === 'edit_last_name' || field.id === 'edit_position') {
            field.addEventListener('input', function() {
                const errorElement = document.getElementById(this.id + '_error');
                const isValid = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(this.value) || this.value === '';

                if (!isValid && this.value !== '') {
                    this.classList.add('invalid');
                    errorElement.textContent = 'Solo se permiten letras y espacios';
                    errorElement.style.display = 'block';
                } else {
                    this.classList.remove('invalid');
                    errorElement.style.display = 'none';
                }
            });
        }
    });

    // Validar teléfono
    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        field.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + '_error');
            const isValid = /^\d{0,10}$/.test(this.value);

            if (!isValid) {
                this.classList.add('invalid');
                errorElement.textContent = 'Solo se permiten números (máximo 10 dígitos)';
                errorElement.style.display = 'block';
            } else {
                this.classList.remove('invalid');
                errorElement.style.display = 'none';
            }
        });
    });

    // Validar salario
    const salaryFields = document.querySelectorAll('input[type="number"][name="salary"]');
    salaryFields.forEach(field => {
        field.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + '_error');
            const isValid = this.value.length <= 10;

            if (!isValid) {
                this.classList.add('invalid');
                errorElement.textContent = 'Máximo 10 dígitos permitidos';
                errorElement.style.display = 'block';
            } else {
                this.classList.remove('invalid');
                errorElement.style.display = 'none';
            }
        });
    });

    // Validar email
    const emailFields = document.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        field.addEventListener('blur', function() {
            const errorElement = document.getElementById(this.id + '_error');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = emailPattern.test(this.value);

            if (!isValid && this.value !== '') {
                this.classList.add('invalid');
                errorElement.textContent = 'Ingrese un email válido';
                errorElement.style.display = 'block';
            } else {
                this.classList.remove('invalid');
                errorElement.style.display = 'none';
            }
        });
    });
}

// Validar formulario antes de enviar
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = document.getElementById(input.id + '_error');

        if (!input.value.trim()) {
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = 'Este campo es obligatorio';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if ((input.id === 'first_name' || input.id === 'last_name' || input.id === 'position' ||
                   input.id === 'edit_first_name' || input.id === 'edit_last_name' || input.id === 'edit_position') &&
                   !/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(input.value)) {
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = 'Solo se permiten letras y espacios';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if (input.type === 'tel' && input.value.length > 0 && !/^\d{10}$/.test(input.value)) {
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = 'El teléfono debe tener 10 dígitos';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if (input.type === 'number' && input.value.length > 10) {
            input.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = 'Máximo 10 dígitos permitidos';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if (input.type === 'email' && input.value.length > 0) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                input.classList.add('invalid');
                if (errorElement) {
                    errorElement.textContent = 'Ingrese un email válido';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            }
        } else {
            input.classList.remove('invalid');
            if (errorElement) errorElement.style.display = 'none';
        }
    });

    return isValid;
}

// ========== MICROSERVICIO B - ASISTENCIAS ==========
// Registrar asistencia
async function registerAttendance(type) {
    const employeeIdInput = document.getElementById('attendanceEmployeeId');
    const employeeId = employeeIdInput.value;

    if (!employeeId) {
        employeeIdInput.classList.add('invalid');
        document.getElementById('attendance_employee_error').textContent = 'Por favor ingresa el ID del empleado';
        document.getElementById('attendance_employee_error').style.display = 'block';
        showMessage('❌ Por favor ingresa el ID del empleado', 'error', 'attendanceMessage');
        return;
    }

    const attendanceData = {
        employee_id: parseInt(employeeId),
        type: type,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-ES', { hour12: false })
    };

    try {
        const response = await fetch(`${API_ATTENDANCE}attendance/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attendanceData)
        });

        const data = await response.json();

        if (response.ok) {
            const action = type === 'entry' ? 'entrada' : 'salida';
            showMessage(`✅ ${action} registrada exitosamente para empleado ${employeeId}`, 'success', 'attendanceMessage');
            employeeIdInput.value = '';
            employeeIdInput.classList.remove('invalid');
            document.getElementById('attendance_employee_error').style.display = 'none';
            loadAttendanceRecords();
        } else {
            let errorMsg = 'Error al registrar asistencia';
            if (data.detail) {
                errorMsg = data.detail;
            } else if (data.error) {
                errorMsg = data.error;
            } else if (data.message) {
                errorMsg = data.message;
            }
            showMessage(`❌ ${errorMsg}`, 'error', 'attendanceMessage');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de asistencias', 'error', 'attendanceMessage');
    }
}

// Cargar historial de asistencias
async function loadAttendanceRecords() {
    try {
        const response = await fetch(`${API_ATTENDANCE}attendance/list/`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar las asistencias`);
        }

        const records = await response.json();
        const tbody = document.getElementById('attendanceBody');

        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros de asistencia</td></tr>';
            return;
        }

        records.forEach(record => {
            const row = `
                <tr>
                    <td>${record.employee_id}</td>
                    <td>${record.type === 'entry' ? '✅ Entrada' : '🚪 Salida'}</td>
                    <td>${record.date}</td>
                    <td>${record.time}</td>
                    <td>${new Date(record.created_at).toLocaleString('es-ES')}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        showMessage(`❌ ${error.message}`, 'error', 'attendanceMessage');
    }
}

// ========== MICROSERVICIO A - EMPLEADOS ==========
// Cargar empleados
async function loadEmployees() {
    try {
        const response = await fetch(API_EMPLOYEES);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los empleados`);
        }

        const employees = await response.json();
        const tbody = document.getElementById('employeesBody');

        tbody.innerHTML = '';

        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay empleados registrados</td></tr>';
            return;
        }

        employees.forEach(employee => {
            const row = `
                <tr>
                    <td>${employee.id}</td>
                    <td>${employee.first_name} ${employee.last_name}</td>
                    <td>${employee.email}</td>
                    <td>${employee.position}</td>
                    <td>$${parseFloat(employee.salary).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                    <td>${new Date(employee.hire_date).toLocaleDateString('es-ES')}</td>
                    <td class="actions">
                        <button class="btn-edit" onclick="editEmployee(${employee.id})">✏️ Editar</button>
                        <button class="btn-delete" onclick="deleteEmployee(${employee.id})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        showMessage(`❌ ${error.message}`, 'error');
    }
}

// Crear empleado
document.getElementById('employeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm('employeeForm')) {
        showMessage('❌ Por favor corrige los errores en el formulario', 'error');
        return;
    }

    const formData = new FormData(this);
    const employeeData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone_number: formData.get('phone_number'),
        position: formData.get('position'),
        salary: formData.get('salary'),
        hire_date: formData.get('hire_date')
    };

    try {
        const response = await fetch(API_EMPLOYEES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Empleado creado exitosamente!');
            this.reset();
            loadEmployees();
        } else {
            let errorMsg = 'Error al crear empleado';
            if (data.detail) {
                errorMsg = data.detail;
            } else if (data.error) {
                errorMsg = data.error;
            } else if (data.message) {
                errorMsg = data.message;
            } else if (typeof data === 'object') {
                errorMsg = JSON.stringify(data);
            }
            showMessage(`❌ ${errorMsg}`, 'error');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error');
    }
});

// Eliminar empleado
async function deleteEmployee(id) {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) return;

    try {
        const response = await fetch(`${API_EMPLOYEES}${id}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('✅ Empleado eliminado exitosamente!');
            loadEmployees();
        } else {
            const data = await response.json();
            let errorMsg = 'Error al eliminar empleado';

            if (data.detail) {
                errorMsg = data.detail;
            } else if (data.error) {
                errorMsg = data.error;
            }

            showMessage(`❌ ${errorMsg}`, 'error');
        }
    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error');
    }
}

// Editar empleado - Abrir modal con datos
async function editEmployee(id) {
    try {
        const response = await fetch(`${API_EMPLOYEES}${id}/`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los datos del empleado`);
        }

        const employee = await response.json();

        // Llenar el formulario de edición con los datos del empleado
        document.getElementById('edit_id').value = employee.id;
        document.getElementById('edit_first_name').value = employee.first_name;
        document.getElementById('edit_last_name').value = employee.last_name;
        document.getElementById('edit_email').value = employee.email;
        document.getElementById('edit_phone_number').value = employee.phone_number || '';
        document.getElementById('edit_position').value = employee.position;
        document.getElementById('edit_salary').value = employee.salary;
        document.getElementById('edit_hire_date').value = employee.hire_date;

        // Ocultar mensajes de error
        const errorMessages = document.querySelectorAll('#editEmployeeForm .error-message');
        errorMessages.forEach(msg => msg.style.display = 'none');

        const inputs = document.querySelectorAll('#editEmployeeForm input');
        inputs.forEach(input => input.classList.remove('invalid'));

        // Mostrar el modal
        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        showMessage(`❌ ${error.message}`, 'error');
    }
}

// Guardar cambios del empleado editado
document.getElementById('editEmployeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm('editEmployeeForm')) {
        showMessage('❌ Por favor corrige los errores en el formulario', 'error', 'editMessage');
        return;
    }

    const formData = new FormData(this);
    const employeeId = formData.get('id');
    const employeeData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone_number: formData.get('phone_number'),
        position: formData.get('position'),
        salary: formData.get('salary'),
        hire_date: formData.get('hire_date')
    };

    try {
        const response = await fetch(`${API_EMPLOYEES}${employeeId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Empleado actualizado exitosamente!', 'success', 'editMessage');
            // Cerrar el modal después de un breve tiempo
            setTimeout(() => {
                document.getElementById('editModal').style.display = 'none';
                loadEmployees();
            }, 1500);
        } else {
            let errorMsg = 'Error al actualizar empleado';
            if (data.detail) {
                errorMsg = data.detail;
            } else if (data.error) {
                errorMsg = data.error;
            } else if (data.message) {
                errorMsg = data.message;
            }
            showMessage(`❌ ${errorMsg}`, 'error', 'editMessage');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error', 'editMessage');
    }
});

// Cerrar el modal al hacer clic en la X
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});

// Cerrar el modal al hacer clic fuera de él
window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Cargar datos al iniciar y configurar validaciones
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadAttendanceRecords();
    setupFieldValidation();
});