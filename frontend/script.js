
const API_EMPLOYEES = 'http://localhost:8000/api/employees/';
const API_ATTENDANCE = 'http://localhost:8000/';
// Mostrar mnesjaes de error
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

function processServerErrors(errorData, formPrefix = '') {
    let errorMessages = [];

    if (typeof errorData === 'string') {
        return errorData;
    }

    if (errorData.detail) return errorData.detail;
    if (errorData.error) return errorData.error;
    if (errorData.message) return errorData.message;

    if (typeof errorData === 'object') {
        const fieldNames = {
            'first_name': 'Nombre',
            'last_name': 'Apellido',
            'email': 'Email',
            'phone_number': 'Teléfono',
            'position': 'Puesto',
            'salary': 'Salario',
            'hire_date': 'Fecha de contratación',
            'employee_id': 'ID del empleado'
        };

        clearFieldErrors(formPrefix);

        for (const [field, errors] of Object.entries(errorData)) {
            const fieldName = fieldNames[field] || field;

            if (Array.isArray(errors)) {

                showFieldError(field, errors[0], formPrefix);
                errorMessages.push(`${fieldName}: ${errors[0]}`);
            } else if (typeof errors === 'string') {
                showFieldError(field, errors, formPrefix);
                errorMessages.push(`${fieldName}: ${errors}`);
            }
        }

        return errorMessages.length > 0 ?
               `Se encontraron los siguientes errores:\n• ${errorMessages.join('\n• ')}` :
               'Error desconocido en el servidor';
    }

    return 'Error desconocido en el servidor';
}

function showFieldError(fieldName, errorMessage, formPrefix = '') {
    const fieldId = formPrefix ? `${formPrefix}_${fieldName}` : fieldName;
    const inputElement = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}_error`);

    if (inputElement && errorElement) {
        inputElement.classList.add('invalid');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
    }
}

function clearFieldErrors(formPrefix = '') {
    const fields = ['first_name', 'last_name', 'email', 'phone_number', 'position', 'salary', 'hire_date', 'employee_id'];

    fields.forEach(field => {
        const fieldId = formPrefix ? `${formPrefix}_${field}` : field;
        const inputElement = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}_error`);

        if (inputElement && errorElement) {
            inputElement.classList.remove('invalid');
            errorElement.style.display = 'none';
        }
    });
}


function setupInputRestrictions() {

    const textOnlyFields = document.querySelectorAll('input[type="text"]');
    textOnlyFields.forEach(field => {
        if (field.id === 'first_name' || field.id === 'last_name' || field.id === 'position' ||
            field.id === 'edit_first_name' || field.id === 'edit_last_name' || field.id === 'edit_position') {

            field.addEventListener('keypress', function(e) {
                // Permitir letras, espacios, acentos, ñ y teclas de control
                const allowedChars = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]$/;
                const char = String.fromCharCode(e.which);

                if (e.which === 0 || e.which === 8 || e.which === 9 || e.which === 13 || e.which === 27) {
                    return true;
                }

                if (!allowedChars.test(char)) {
                    e.preventDefault();
                    return false;
                }
            });

            field.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const filteredText = pastedText.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, '');
                this.value = filteredText;
                this.dispatchEvent(new Event('input'));
            });
        }
    });

    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        // Prevenir escritura de letras y caracteres especiales en el teléfono
        field.addEventListener('keypress', function(e) {

            const char = String.fromCharCode(e.which);
            if (e.which === 0 || e.which === 8 || e.which === 9 || e.which === 13 || e.which === 27) {
                return true;
            }
            if (!/^\d$/.test(char)) {
                e.preventDefault();
                return false;
            }

            // Limitar a 10 dígitos
            if (this.value.length >= 10) {
                e.preventDefault();
                return false;
            }
        });
        field.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const filteredText = pastedText.replace(/\D/g, '').substring(0, 10);
            this.value = filteredText;
            this.dispatchEvent(new Event('input'));
        });
    });
}


function setupFieldValidation() {

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
            const value = parseFloat(this.value);

            let isValid = true;
            let errorMsg = '';

            if (this.value && value < 0) {
                isValid = false;
                errorMsg = 'El salario no puede ser negativo';
            } else if (this.value.length > 10) {
                isValid = false;
                errorMsg = 'Máximo 10 dígitos permitidos';
            }

            if (!isValid) {
                this.classList.add('invalid');
                errorElement.textContent = errorMsg;
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
        } else if (input.name === 'salary' && input.value.length > 0) {
            const value = parseFloat(input.value);
            if (value < 0) {
                input.classList.add('invalid');
                if (errorElement) {
                    errorElement.textContent = 'El salario no puede ser negativo';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            } else if (input.value.length > 10) {
                input.classList.add('invalid');
                if (errorElement) {
                    errorElement.textContent = 'Máximo 10 dígitos permitidos';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            }
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
            const errorMsg = processServerErrors(data);
            showMessage(`❌ ${errorMsg}`, 'error', 'attendanceMessage');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de asistencias', 'error', 'attendanceMessage');
    }
}

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
            clearFieldErrors();
            loadEmployees();
        } else {
            const errorMsg = processServerErrors(data);
            showMessage(`❌ ${errorMsg}`, 'error');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error');
    }
});

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
            const errorMsg = processServerErrors(data);
            showMessage(`❌ ${errorMsg}`, 'error');
        }
    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error');
    }
}

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

        clearFieldErrors('edit');

        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        showMessage(`❌ ${error.message}`, 'error');
    }
}

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
            const errorMsg = processServerErrors(data, 'edit');
            showMessage(`❌ ${errorMsg}`, 'error', 'editMessage');
        }

    } catch (error) {
        showMessage('❌ Error de conexión con el servidor de empleados', 'error', 'editMessage');
    }
});


document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});


window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadAttendanceRecords();
    setupFieldValidation();
    setupInputRestrictions();
});