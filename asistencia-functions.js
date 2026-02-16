// ========== FUNCIONES DE PASE DE LISTA ==========

function updateListNamePreview() {
    const grado = document.getElementById('listGrade').value.trim().toUpperCase();
    const grupo = document.getElementById('listGroup').value.trim().toUpperCase();
    const materia = document.getElementById('listSubject').value.trim().toUpperCase().replace(/\s+/g, '_');
    const escuela = document.getElementById('listSchool').value.trim().toUpperCase().replace(/\s+/g, '_');
    
    if (grado && grupo && materia && escuela) {
        const nombre = `${grado}_${grupo}_${materia}_${escuela}`;
        document.getElementById('listNamePreview').value = nombre;
    } else {
        document.getElementById('listNamePreview').value = '';
    }
}

function createNewListAuto() {
    const grado = document.getElementById('listGrade').value.trim().toUpperCase();
    const grupo = document.getElementById('listGroup').value.trim().toUpperCase();
    const materia = document.getElementById('listSubject').value.trim().toUpperCase().replace(/\s+/g, '_');
    const escuela = document.getElementById('listSchool').value.trim().toUpperCase().replace(/\s+/g, '_');
    
    if (!grado || !grupo || !materia || !escuela) {
        showAlert('❌ Completa todos los campos', 'error');
        return;
    }
    
    const listName = `${grado}_${grupo}_${materia}_${escuela}`;
    
    if (savedLists[listName]) {
        showAlert('❌ Ya existe una lista con ese nombre', 'error');
        return;
    }
    
    savedLists[listName] = [];
    currentList = listName;
    currentListStudents = [];
    
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    
    // Sincronizar con Firebase
    syncListsToFirebase();
    
    // Limpiar formulario
    document.getElementById('listGrade').value = '';
    document.getElementById('listGroup').value = '';
    document.getElementById('listSubject').value = '';
    document.getElementById('listSchool').value = '';
    document.getElementById('listNamePreview').value = '';
    
    loadListOptions();
    showAlert(`✅ Lista "${listName}" creada exitosamente`, 'success');
    
    document.getElementById('listSelectContainer').style.display = 'block';
    document.getElementById('listScannerSection').style.display = 'block';
    document.getElementById('currentListName').textContent = listName;
}

function loadListOptions() {
    const select = document.getElementById('listSelect');
    select.innerHTML = '<option value="">-- Selecciona una lista --</option>';
    
    Object.keys(savedLists).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
    
    if (Object.keys(savedLists).length > 0) {
        document.getElementById('listSelectContainer').style.display = 'block';
    }
}

function loadSelectedList() {
    const listName = document.getElementById('listSelect').value;
    if (!listName) {
        document.getElementById('listScannerSection').style.display = 'none';
        return;
    }
    
    currentList = listName;
    currentListStudents = savedLists[listName] || [];
    
    document.getElementById('currentListName').textContent = listName;
    document.getElementById('listScannerSection').style.display = 'block';
    displayListStudents();
}

function deleteCurrentList() {
    if (!currentList) {
        showAlert('❌ Selecciona una lista primero', 'error');
        return;
    }
    
    if (!confirm(`¿Eliminar la lista "${currentList}" y todos sus alumnos?`)) {
        return;
    }
    
    delete savedLists[currentList];
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    
    // Eliminar de Firebase
    if (isFirebaseEnabled) {
        db.collection('listas').doc(currentList).delete();
    }
    
    currentList = '';
    currentListStudents = [];
    
    loadListOptions();
    document.getElementById('listScannerSection').style.display = 'none';
    showAlert('✅ Lista eliminada', 'success');
}

function displayListStudents() {
    const container = document.getElementById('listStudentsContainer');
    
    if (!currentListStudents || currentListStudents.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 No hay alumnos en esta lista</p></div>';
        return;
    }
    
    // Ordenar alfabéticamente
    const sorted = [...currentListStudents].sort((a, b) => {
        const nameA = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`.toLowerCase();
        const nameB = `${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`.toLowerCase();
        return nameA.localeCompare(nameB, 'es');
    });
    
    let html = '<div class="table-wrapper"><table><thead><tr>';
    html += '<th>Posición</th>';
    html += '<th>Nombre Completo</th>';
    html += '<th>Grado</th>';
    html += '<th>Grupo</th>';
    html += '<th>Fecha Registro</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';
    
    sorted.forEach((student, idx) => {
        html += '<tr>';
        html += `<td>
            ${idx + 1}
            <div style="display:inline-block; margin-left:5px;">
                <button onclick="moveStudentUp(${idx})" class="btn btn-small" ${idx === 0 ? 'disabled' : ''} title="Subir">⬆️</button>
                <button onclick="moveStudentDown(${idx})" class="btn btn-small" ${idx === sorted.length - 1 ? 'disabled' : ''} title="Bajar">⬇️</button>
            </div>
        </td>`;
        html += `<td><strong>${student.apellidoPaterno} ${student.apellidoMaterno} ${student.nombre}</strong></td>`;
        html += `<td>${student.grado}°</td>`;
        html += `<td>${student.grupo}</td>`;
        html += `<td>${student.fechaAgregado || 'N/A'}</td>`;
        html += `<td><button onclick="removeStudentFromList(${idx})" class="btn btn-secondary btn-small">🗑️</button></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function moveStudentUp(index) {
    if (index === 0) return;
    
    const temp = currentListStudents[index];
    currentListStudents[index] = currentListStudents[index - 1];
    currentListStudents[index - 1] = temp;
    
    savedLists[currentList] = currentListStudents;
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    syncListsToFirebase();
    displayListStudents();
}

function moveStudentDown(index) {
    if (index === currentListStudents.length - 1) return;
    
    const temp = currentListStudents[index];
    currentListStudents[index] = currentListStudents[index + 1];
    currentListStudents[index + 1] = temp;
    
    savedLists[currentList] = currentListStudents;
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    syncListsToFirebase();
    displayListStudents();
}

function removeStudentFromList(index) {
    if (!confirm('¿Eliminar este alumno de la lista?')) return;
    
    currentListStudents.splice(index, 1);
    savedLists[currentList] = currentListStudents;
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    syncListsToFirebase();
    displayListStudents();
    showAlert('✅ Alumno eliminado de la lista', 'success');
}

function exportListToExcel() {
    if (!currentListStudents || currentListStudents.length === 0) {
        showAlert('❌ No hay alumnos en la lista', 'error');
        return;
    }
    
    const data = currentListStudents.map((student, idx) => ({
        'No.': idx + 1,
        'Apellido Paterno': student.apellidoPaterno,
        'Apellido Materno': student.apellidoMaterno,
        'Nombre': student.nombre,
        'Grado': student.grado,
        'Grupo': student.grupo,
        'Escuela': student.escuela,
        'Fecha Registro': student.fechaAgregado || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista');
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Lista_${currentList}_${fecha}.xlsx`);
    
    showAlert('✅ Lista exportada a Excel', 'success');
}

// ========== ESCÁNER DE LISTA ==========

function startListScanner() {
    if (!currentList) {
        showAlert('❌ Selecciona una lista primero', 'error');
        return;
    }
    
    if (!html5QrCodeList) {
        html5QrCodeList = new Html5Qrcode("readerList");
    }
    
    html5QrCodeList.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (text) => {
            const data = text.split(',');
            if (data.length === 6) {
                const [apellidoPaterno, apellidoMaterno, nombre, grado, grupo, escuela] = data;
                
                const exists = currentListStudents.some(s => 
                    s.nombre === nombre && 
                    s.apellidoPaterno === apellidoPaterno && 
                    s.apellidoMaterno === apellidoMaterno
                );
                
                if (exists) {
                    showAlert('⚠️ Ya está en la lista', 'error');
                    return;
                }
                
                currentListStudents.push({
                    nombre,
                    apellidoPaterno,
                    apellidoMaterno,
                    grado,
                    grupo,
                    escuela,
                    fechaAgregado: new Date().toLocaleDateString('es-MX')
                });
                
                savedLists[currentList] = currentListStudents;
                localStorage.setItem('savedLists', JSON.stringify(savedLists));
                syncListsToFirebase();
                
                showAlert(`✅ ${apellidoPaterno} ${apellidoMaterno} ${nombre}`, 'success');
                displayListStudents();
            }
        }
    ).then(() => {
        document.getElementById('startListBtn').disabled = true;
        document.getElementById('stopListBtn').disabled = false;
    });
}

function stopListScanner() {
    if (html5QrCodeList) {
        html5QrCodeList.stop().then(() => {
            document.getElementById('startListBtn').disabled = false;
            document.getElementById('stopListBtn').disabled = true;
        });
    }
}

// ========== ESCÁNER DE ASISTENCIA ==========

function updateGroupFilter() {
    const select = document.getElementById('scannerGroupFilter');
    
    select.innerHTML = '<option value="">Todas las listas</option>';
    
    if (Object.keys(savedLists).length === 0) {
        return;
    }
    
    Object.keys(savedLists).sort().forEach(listName => {
        const option = document.createElement('option');
        option.value = listName;
        option.textContent = listName;
        select.appendChild(option);
    });
}

function startScanner() {
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }
    
    const selectedGroup = document.getElementById('scannerGroupFilter').value;
    
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (text) => {
            const data = text.split(',');
            if (data.length === 6) {
                const [apellidoPaterno, apellidoMaterno, nombre, grado, grupo, escuela] = data;
                
                const groupKey = `${grado}°${grupo}`;
                if (selectedGroup && selectedGroup !== groupKey) {
                    showAlert(`❌ Este alumno es de ${groupKey}, no de ${selectedGroup}`, 'error');
                    return;
                }
                
                const now = new Date();
                const record = {
                    nombre,
                    apellidoPaterno,
                    apellidoMaterno,
                    grado,
                    grupo,
                    escuela,
                    fecha: now.toLocaleDateString('es-MX'),
                    hora: now.toLocaleTimeString('es-MX')
                };
                
                attendanceRecords.push(record);
                localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
                syncAttendanceToFirebase();
                
                showAlert(`✅ ${apellidoPaterno} ${apellidoMaterno} ${nombre} - ${groupKey}`, 'success');
                updateGroupFilter();
                displayRecords();
            }
        }
    ).then(() => {
        document.getElementById('startScanBtn').disabled = true;
        document.getElementById('stopScanBtn').disabled = false;
    });
}

function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById('startScanBtn').disabled = false;
            document.getElementById('stopScanBtn').disabled = true;
        });
    }
}

// ========== REGISTROS ==========

function displayRecords() {
    // Actualizar selector de listas
    const select = document.getElementById('recordsListFilter');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Todos los registros</option>';
        
        Object.keys(savedLists).sort().forEach(listName => {
            const option = document.createElement('option');
            option.value = listName;
            option.textContent = listName;
            if (listName === currentValue) option.selected = true;
            select.appendChild(option);
        });
    }
    
    displayRecordsByList();
}

function displayRecordsByList() {
    const container = document.getElementById('recordsTable');
    const selectedList = document.getElementById('recordsListFilter')?.value;
    
    if (!selectedList) {
        // Mostrar todos los registros (tabla simple)
        displayAllRecords();
        return;
    }
    
    // Obtener alumnos de la lista
    const alumnos = savedLists[selectedList] || [];
    
    if (alumnos.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 Esta lista no tiene alumnos</p></div>';
        return;
    }
    
    // Obtener todas las fechas únicas de asistencia para esta lista
    const fechas = new Set();
    const asistenciasPorAlumnoYFecha = {};
    
    attendanceRecords.forEach(record => {
        // Verificar si el alumno pertenece a esta lista
        const alumnoEnLista = alumnos.find(a => 
            a.nombre === record.nombre &&
            a.apellidoPaterno === record.apellidoPaterno &&
            a.apellidoMaterno === record.apellidoMaterno
        );
        
        if (alumnoEnLista) {
            fechas.add(record.fecha);
            const alumnoKey = `${record.apellidoPaterno}_${record.apellidoMaterno}_${record.nombre}`;
            if (!asistenciasPorAlumnoYFecha[alumnoKey]) {
                asistenciasPorAlumnoYFecha[alumnoKey] = {};
            }
            asistenciasPorAlumnoYFecha[alumnoKey][record.fecha] = true;
        }
    });
    
    const fechasOrdenadas = Array.from(fechas).sort((a, b) => {
        const [dA, mA, yA] = a.split('/');
        const [dB, mB, yB] = b.split('/');
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    });
    
    if (fechasOrdenadas.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 No hay registros de asistencia para esta lista</p></div>';
        return;
    }
    
    // Crear tabla
    let html = '<table><thead><tr>';
    html += '<th>Nombre del alumno</th>';
    
    fechasOrdenadas.forEach(fecha => {
        html += `<th style="text-align: center;">${fecha}</th>`;
    });
    
    html += '<th style="text-align: center; background: #fff3cd;">Total de Faltas</th>';
    html += '</tr></thead><tbody>';
    
    // Ordenar alumnos alfabéticamente
    const alumnosOrdenados = [...alumnos].sort((a, b) => {
        const nameA = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`;
        const nameB = `${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`;
        return nameA.localeCompare(nameB);
    });
    
    alumnosOrdenados.forEach(alumno => {
        const alumnoKey = `${alumno.apellidoPaterno}_${alumno.apellidoMaterno}_${alumno.nombre}`;
        const nombreCompleto = `${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}`;
        
        html += '<tr>';
        html += `<td><strong>${nombreCompleto}</strong></td>`;
        
        let totalFaltas = 0;
        
        fechasOrdenadas.forEach(fecha => {
            const asistio = asistenciasPorAlumnoYFecha[alumnoKey]?.[fecha];
            
            if (asistio) {
                html += '<td style="text-align: center; color: #28a745; font-size: 1.5em;">✅</td>';
            } else {
                html += '<td style="text-align: center; color: #dc3545; font-size: 1.5em;">❌</td>';
                totalFaltas++;
            }
        });
        
        html += `<td style="text-align: center; font-weight: bold; font-size: 1.2em; background: #fff3cd;">${totalFaltas}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function displayAllRecords() {
    const container = document.getElementById('recordsTable');
    
    if (attendanceRecords.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 No hay registros de asistencia</p></div>';
        return;
    }
    
    // Tabla simple con todos los registros
    let html = '<table><thead><tr>';
    html += '<th>Fecha</th><th>Hora</th><th>Nombre</th><th>Grado</th><th>Grupo</th><th>Escuela</th>';
    html += '</tr></thead><tbody>';
    
    const sortedRecords = [...attendanceRecords].sort((a, b) => {
        const [dA, mA, yA] = a.fecha.split('/');
        const [dB, mB, yB] = b.fecha.split('/');
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        return dateB - dateA;
    });
    
    sortedRecords.forEach(record => {
        const nombreCompleto = `${record.apellidoPaterno} ${record.apellidoMaterno} ${record.nombre}`;
        html += `<tr>
            <td>${record.fecha}</td>
            <td>${record.hora}</td>
            <td><strong>${nombreCompleto}</strong></td>
            <td>${record.grado}°</td>
            <td>${record.grupo}</td>
            <td>${record.escuela}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function removeDuplicates() {
    const before = attendanceRecords.length;
    const seen = new Set();
    
    attendanceRecords = attendanceRecords.filter(record => {
        const key = `${record.nombre}_${record.apellidoPaterno}_${record.apellidoMaterno}_${record.fecha}_${record.hora}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
    
    const removed = before - attendanceRecords.length;
    
    if (removed > 0) {
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        syncAttendanceToFirebase();
        displayRecords();
        showAlert(`✅ ${removed} duplicados eliminados`, 'success');
    } else {
        showAlert('✅ No hay duplicados', 'success');
    }
}

function clearAllRecords() {
    if (!confirm('¿Eliminar TODOS los registros de asistencia? Esta acción no se puede deshacer.')) {
        return;
    }
    
    attendanceRecords = [];
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    
    // Limpiar Firebase
    if (isFirebaseEnabled) {
        db.collection('asistencias').get().then((snapshot) => {
            snapshot.forEach((doc) => {
                doc.ref.delete();
            });
        });
    }
    
    displayRecords();
    updateGroupFilter();
    showAlert('✅ Todos los registros eliminados', 'success');
}

function exportToExcel() {
    if (attendanceRecords.length === 0) {
        showAlert('❌ No hay registros para exportar', 'error');
        return;
    }
    
    const data = attendanceRecords.map((record, idx) => ({
        'No.': idx + 1,
        'Apellido Paterno': record.apellidoPaterno,
        'Apellido Materno': record.apellidoMaterno,
        'Nombre': record.nombre,
        'Grado': record.grado,
        'Grupo': record.grupo,
        'Escuela': record.escuela,
        'Fecha': record.fecha,
        'Hora': record.hora
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Asistencias_${fecha}.xlsx`);
    
    showAlert('✅ Registros exportados a Excel', 'success');
}

// ========== BÚSQUEDA ==========

function startSearchScanner() {
    if (!html5QrCodeSearch) {
        html5QrCodeSearch = new Html5Qrcode("readerSearch");
    }
    
    html5QrCodeSearch.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (text) => {
            const data = text.split(',');
            if (data.length === 6) {
                const [apellidoPaterno, apellidoMaterno, nombre] = data;
                
                const records = attendanceRecords.filter(r =>
                    r.nombre === nombre &&
                    r.apellidoPaterno === apellidoPaterno &&
                    r.apellidoMaterno === apellidoMaterno
                );
                
                const results = document.getElementById('searchResults');
                
                if (records.length === 0) {
                    results.innerHTML = `<div class="empty-state"><p>❌ Sin registros para ${apellidoPaterno} ${apellidoMaterno} ${nombre}</p></div>`;
                } else {
                    let html = `<h3 style="text-align:center; color:#667eea;">${apellidoPaterno} ${apellidoMaterno} ${nombre}</h3>`;
                    html += `<p style="text-align:center; font-size:1.5em; color:#28a745;">Total: ${records.length} asistencias</p>`;
                    html += '<div class="table-wrapper"><table><thead><tr><th>No.</th><th>Fecha</th><th>Hora</th><th>Grado</th><th>Grupo</th></tr></thead><tbody>';
                    
                    records.forEach((r, i) => {
                        html += `<tr>
                            <td>${i + 1}</td>
                            <td>${r.fecha}</td>
                            <td>${r.hora}</td>
                            <td>${r.grado}°</td>
                            <td>${r.grupo}</td>
                        </tr>`;
                    });
                    
                    html += '</tbody></table></div>';
                    results.innerHTML = html;
                }
            }
        }
    ).then(() => {
        document.getElementById('startSearchBtn').disabled = true;
        document.getElementById('stopSearchBtn').disabled = false;
    });
}

function stopSearchScanner() {
    if (html5QrCodeSearch) {
        html5QrCodeSearch.stop().then(() => {
            document.getElementById('startSearchBtn').disabled = false;
            document.getElementById('stopSearchBtn').disabled = true;
        });
    }
}
