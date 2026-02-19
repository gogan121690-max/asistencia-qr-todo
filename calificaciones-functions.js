// ========== FUNCIONES DE LISTAS ==========

function displayListas() {
    const container = document.getElementById('listasContainer');
    
    if (Object.keys(listas).length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 No hay listas disponibles</p><p style="font-size:0.9em; margin-top:10px;">Las listas se sincronizan desde la App de Asistencia</p></div>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    Object.keys(listas).sort().forEach(listaName => {
        const alumnos = listas[listaName];
        const numAlumnos = alumnos.length;
        
        html += `
            <div class="activity-card">
                <h4>${listaName}</h4>
                <p>👥 ${numAlumnos} alumno${numAlumnos !== 1 ? 's' : ''}</p>
                <p style="margin-top: 5px;">
                    <button class="btn btn-small" onclick="verDetallesLista('${listaName}')">👁️ Ver Detalles</button>
                </p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function verDetallesLista(listaName) {
    const alumnos = listas[listaName];
    
    if (!alumnos || alumnos.length === 0) {
        alert('Esta lista no tiene alumnos');
        return;
    }
    
    let html = `<h3>${listaName}</h3>`;
    html += '<div class="table-wrapper"><table><thead><tr>';
    html += '<th>No.</th><th>Nombre Completo</th><th>Grado</th><th>Grupo</th>';
    html += '</tr></thead><tbody>';
    
    // Ordenar alfabéticamente
    const alumnosOrdenados = [...alumnos].sort((a, b) => {
        const nameA = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`;
        const nameB = `${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`;
        return nameA.localeCompare(nameB, 'es');
    });
    
    alumnosOrdenados.forEach((alumno, idx) => {
        html += `<tr>
            <td>${idx + 1}</td>
            <td>${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}</td>
            <td>${alumno.grado}°</td>
            <td>${alumno.grupo}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    const container = document.getElementById('listasContainer');
    container.innerHTML = html;
}

function loadListaSelects() {
    const selects = [
        'actividadListaSelect',
        'calificarListaSelect',
        'promediosListaSelect'
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">-- Selecciona una lista --</option>';
        
        Object.keys(listas).sort().forEach(listaName => {
            const option = document.createElement('option');
            option.value = listaName;
            option.textContent = listaName;
            select.appendChild(option);
        });
    });
}

// ========== FUNCIONES DE ACTIVIDADES ==========

function loadActividades() {
    const listaName = document.getElementById('actividadListaSelect').value;
    
    if (!listaName) {
        document.getElementById('actividadesSection').style.display = 'none';
        return;
    }
    
    currentLista = listaName;
    document.getElementById('actividadesSection').style.display = 'block';
    
    const actividadesLista = actividades[listaName] || [];
    const container = document.getElementById('actividadesList');
    
    if (actividadesLista.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📭 No hay actividades creadas</p></div>';
        return;
    }
    
    let html = '';
    actividadesLista.forEach((actividad, idx) => {
        html += `
            <div class="activity-card">
                <h4>${actividad.titulo}</h4>
                <p>${actividad.descripcion || 'Sin descripción'}</p>
                <p><strong>Fecha:</strong> ${actividad.fecha} | <strong>Valor:</strong> ${actividad.valor} pts</p>
                <div style="margin-top: 10px;">
                    <button class="btn btn-small" onclick="editarActividad(${idx})">✏️ Editar</button>
                    <button class="btn btn-secondary btn-small" onclick="eliminarActividad(${idx})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showNuevaActividadModal() {
    if (!currentLista) {
        showAlert('❌ Selecciona una lista primero', 'error');
        return;
    }
    
    document.getElementById('nuevaActividadModal').style.display = 'block';
    document.getElementById('actividadFecha').valueAsDate = new Date();
}

function closeNuevaActividadModal() {
    document.getElementById('nuevaActividadModal').style.display = 'none';
    document.getElementById('actividadTitulo').value = '';
    document.getElementById('actividadDescripcion').value = '';
    document.getElementById('actividadFecha').value = '';
    document.getElementById('actividadValor').value = '100';
}

function crearActividad() {
    const titulo = document.getElementById('actividadTitulo').value.trim();
    const descripcion = document.getElementById('actividadDescripcion').value.trim();
    const fecha = document.getElementById('actividadFecha').value;
    const valor = parseInt(document.getElementById('actividadValor').value);
    
    if (!titulo || !fecha) {
        showAlert('❌ Completa título y fecha', 'error');
        return;
    }
    
    if (!actividades[currentLista]) {
        actividades[currentLista] = [];
    }
    
    const nuevaActividad = {
        id: Date.now().toString(),
        titulo,
        descripcion,
        fecha,
        valor,
        fechaCreacion: new Date().toISOString()
    };
    
    actividades[currentLista].push(nuevaActividad);
    localStorage.setItem('actividades', JSON.stringify(actividades));
    syncActividadesToFirebase();
    
    closeNuevaActividadModal();
    loadActividades();
    showAlert('✅ Actividad creada', 'success');
}

function eliminarActividad(index) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    
    actividades[currentLista].splice(index, 1);
    localStorage.setItem('actividades', JSON.stringify(actividades));
    syncActividadesToFirebase();
    
    loadActividades();
    showAlert('✅ Actividad eliminada', 'success');
}

// ========== FUNCIONES DE CALIFICACIÓN ==========

function loadActividadesParaCalificar() {
    const listaName = document.getElementById('calificarListaSelect').value;
    
    if (!listaName) {
        document.getElementById('calificarSection').style.display = 'none';
        return;
    }
    
    currentLista = listaName;
    document.getElementById('calificarSection').style.display = 'block';
    
    const actividadesLista = actividades[listaName] || [];
    const select = document.getElementById('actividadSelect');
    select.innerHTML = '<option value="">-- Selecciona una actividad --</option>';
    
    actividadesLista.forEach(actividad => {
        const option = document.createElement('option');
        option.value = actividad.id;
        option.textContent = `${actividad.titulo} (${actividad.fecha})`;
        select.appendChild(option);
    });
}

function loadCalificacionesTable() {
    const actividadId = document.getElementById('actividadSelect').value;
    
    if (!actividadId) {
        document.getElementById('calificacionesTable').innerHTML = '';
        return;
    }
    
    const alumnos = listas[currentLista];
    const actividad = actividades[currentLista].find(a => a.id === actividadId);
    
    // Ordenar alfabéticamente
    const alumnosOrdenados = [...alumnos].sort((a, b) => {
        const nameA = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`;
        const nameB = `${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`;
        return nameA.localeCompare(nameB, 'es');
    });
    
    let html = `<h3 style="margin: 20px 0;">${actividad.titulo}</h3>`;
    html += '<div class="table-wrapper"><table><thead><tr>';
    html += '<th>No.</th><th>Alumno</th><th>Calificación</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';
    
    alumnosOrdenados.forEach((alumno, idx) => {
        const key = `${currentLista}_${actividadId}_${alumno.nombre}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`;
        const calificacion = calificaciones[key] || { valor: '' };
        
        html += `<tr>
            <td>${idx + 1}</td>
            <td>${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}</td>
            <td>
                <input type="number" 
                       class="grade-input" 
                       id="grade_${idx}" 
                       value="${calificacion.valor}" 
                       min="0" 
                       max="${actividad.valor}"
                       placeholder="0-${actividad.valor}">
            </td>
            <td>
                <button class="btn btn-small" onclick="guardarCalificacion(${idx}, '${actividadId}')">💾 Guardar</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    html += '<div style="margin-top: 20px; text-align: center;">';
    html += '<button class="btn" onclick="guardarTodasCalificaciones()">💾 Guardar Todas</button>';
    html += '</div>';
    
    document.getElementById('calificacionesTable').innerHTML = html;
}

function guardarCalificacion(index, actividadId) {
    const alumnos = listas[currentLista];
    const alumno = alumnos[index];
    const gradeInput = document.getElementById(`grade_${index}`);
    const valor = parseFloat(gradeInput.value);
    
    if (isNaN(valor)) {
        showAlert('❌ Valor inválido', 'error');
        return;
    }
    
    const actividad = actividades[currentLista].find(a => a.id === actividadId);
    
    if (valor < 0 || valor > actividad.valor) {
        showAlert(`❌ La calificación debe estar entre 0 y ${actividad.valor}`, 'error');
        return;
    }
    
    const key = `${currentLista}_${actividadId}_${alumno.nombre}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`;
    
    calificaciones[key] = {
        lista: currentLista,
        actividad: actividadId,
        alumno: `${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}`,
        valor,
        maxValor: actividad.valor,
        fecha: new Date().toISOString()
    };
    
    localStorage.setItem('calificaciones', JSON.stringify(calificaciones));
    syncCalificacionesToFirebase();
    
    showAlert('✅ Calificación guardada', 'success');
}

function guardarTodasCalificaciones() {
    const actividadId = document.getElementById('actividadSelect').value;
    const alumnos = listas[currentLista];
    
    let guardadas = 0;
    
    alumnos.forEach((alumno, idx) => {
        const gradeInput = document.getElementById(`grade_${idx}`);
        const valor = parseFloat(gradeInput.value);
        
        if (!isNaN(valor)) {
            const actividad = actividades[currentLista].find(a => a.id === actividadId);
            
            if (valor >= 0 && valor <= actividad.valor) {
                const key = `${currentLista}_${actividadId}_${alumno.nombre}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`;
                
                calificaciones[key] = {
                    lista: currentLista,
                    actividad: actividadId,
                    alumno: `${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}`,
                    valor,
                    maxValor: actividad.valor,
                    fecha: new Date().toISOString()
                };
                
                guardadas++;
            }
        }
    });
    
    localStorage.setItem('calificaciones', JSON.stringify(calificaciones));
    syncCalificacionesToFirebase();
    
    showAlert(`✅ ${guardadas} calificaciones guardadas`, 'success');
}

// ========== FUNCIONES DE PROMEDIOS ==========

function loadPromedios() {
    const listaName = document.getElementById('promediosListaSelect').value;
    
    if (!listaName) {
        document.getElementById('promediosSection').style.display = 'none';
        return;
    }
    
    currentLista = listaName;
    document.getElementById('promediosSection').style.display = 'block';
    
    const alumnos = listas[listaName];
    const actividadesLista = actividades[listaName] || [];
    
    if (actividadesLista.length === 0) {
        document.getElementById('promediosTable').innerHTML = '<div class="empty-state"><p>📭 No hay actividades para calcular promedios</p></div>';
        return;
    }
    
    let html = '<table><thead><tr>';
    html += '<th>No.</th><th style="min-width: 200px;">Alumno</th>';
    
    actividadesLista.forEach(actividad => {
        html += `<th>${actividad.titulo}<br><small>(${actividad.valor} pts)</small></th>`;
    });
    
    html += '<th class="average-cell">Promedio</th>';
    html += '</tr></thead><tbody>';
    
    // Ordenar alfabéticamente
    const alumnosOrdenados = [...alumnos].sort((a, b) => {
        const nameA = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`;
        const nameB = `${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`;
        return nameA.localeCompare(nameB, 'es');
    });
    
    alumnosOrdenados.forEach((alumno, idx) => {
        html += '<tr>';
        html += `<td>${idx + 1}</td>`;
        html += `<td><strong>${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombre}</strong></td>`;
        
        let suma = 0;
        let count = 0;
        
        actividadesLista.forEach(actividad => {
            const key = `${listaName}_${actividad.id}_${alumno.nombre}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`;
            const calificacion = calificaciones[key];
            
            if (calificacion) {
                const porcentaje = (calificacion.valor / calificacion.maxValor) * 100;
                html += `<td style="text-align: center;">${calificacion.valor}/${calificacion.maxValor}</td>`;
                suma += porcentaje;
                count++;
            } else {
                html += '<td style="text-align: center; color: #999;">-</td>';
            }
        });
        
        const promedio = count > 0 ? (suma / count).toFixed(1) : 0;
        html += `<td class="average-cell">${promedio}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('promediosTable').innerHTML = html;
}

function exportPromediosToExcel() {
    if (!currentLista) {
        showAlert('❌ Selecciona una lista primero', 'error');
        return;
    }
    
    const alumnos = listas[currentLista];
    const actividadesLista = actividades[currentLista] || [];
    
    if (actividadesLista.length === 0) {
        showAlert('❌ No hay actividades para exportar', 'error');
        return;
    }
    
    const data = alumnos.map((alumno, idx) => {
        const row = {
            'No.': idx + 1,
            'Apellido Paterno': alumno.apellidoPaterno,
            'Apellido Materno': alumno.apellidoMaterno,
            'Nombre': alumno.nombre,
            'Grado': alumno.grado,
            'Grupo': alumno.grupo
        };
        
        let suma = 0;
        let count = 0;
        
        actividadesLista.forEach(actividad => {
            const key = `${currentLista}_${actividad.id}_${alumno.nombre}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`;
            const calificacion = calificaciones[key];
            
            if (calificacion) {
                row[actividad.titulo] = `${calificacion.valor}/${calificacion.maxValor}`;
                const porcentaje = (calificacion.valor / calificacion.maxValor) * 100;
                suma += porcentaje;
                count++;
            } else {
                row[actividad.titulo] = '-';
            }
        });
        
        row['Promedio'] = count > 0 ? (suma / count).toFixed(1) : '0.0';
        
        return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Promedios');
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Promedios_${currentLista}_${fecha}.xlsx`);
    
    showAlert('✅ Promedios exportados a Excel', 'success');
}

// ========== FUNCIONES PARA CALIFICAR ==========

function loadActividadesParaCalificar() {
    const listaName = document.getElementById('calificarListaSelect').value;
    
    if (!listaName) {
        document.getElementById('calificarSection').style.display = 'none';
        return;
    }
    
    currentCalificarLista = listaName;
    
    const actividadesLista = actividades[listaName] || [];
    const select = document.getElementById('actividadSelect');
    
    select.innerHTML = '<option value="">-- Selecciona una actividad --</option>';
    
    if (actividadesLista.length === 0) {
        select.innerHTML = '<option value="">No hay actividades creadas</option>';
        document.getElementById('calificarSection').style.display = 'block';
        return;
    }
    
    actividadesLista.forEach(actividad => {
        const option = document.createElement('option');
        option.value = actividad.id;
        option.textContent = `${actividad.titulo} - ${actividad.fecha}`;
        select.appendChild(option);
    });
    
    document.getElementById('calificarSection').style.display = 'block';
}
