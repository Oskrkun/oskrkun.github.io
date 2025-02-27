// Configura Supabase
const supabaseUrl = 'https://hmuxfooqxceoocacmkiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdXhmb29xeGNlb29jYWNta2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzk2MTksImV4cCI6MjA1NjE1NTYxOX0.IsUfkP-R-T-jSTpR3UOiaGyWFunhknHXTASaH7w35QM';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Configurar el token de autenticación si está disponible
const supabaseAuthToken = localStorage.getItem('supabaseAuthToken');
if (supabaseAuthToken) {
    supabaseClient.auth.setAuth(supabaseAuthToken);
}

// Verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        // Si el usuario no está autenticado, redirigir al inicio de sesión
        window.location.href = 'Index.html';
    }
}

// Función para cargar laboratorios en el menú desplegable
async function cargarLaboratorios() {
    const { data, error } = await supabaseClient
        .from('laboratorios')
        .select('*');

    if (error) {
        console.error('Error al cargar laboratorios:', error);
    } else {
        const select = document.getElementById('laboratorio');
        select.innerHTML = '<option value="">Seleccione un laboratorio</option>';
        data.forEach(lab => {
            const option = document.createElement('option');
            option.value = lab.id;
            option.textContent = lab.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar tipos de lentes en el menú desplegable
async function cargarTiposLentes() {
    const { data, error } = await supabaseClient
        .from('tipos_lentes')
        .select('*');

    if (error) {
        console.error('Error al cargar tipos de lentes:', error);
    } else {
        const select = document.getElementById('tipo-cristal');
        select.innerHTML = '<option value="">Seleccione un tipo de cristal</option>';
        data.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar materiales en el menú desplegable
async function cargarMateriales() {
    const { data, error } = await supabaseClient
        .from('materiales')
        .select('*');

    if (error) {
        console.error('Error al cargar materiales:', error);
    } else {
        const select = document.getElementById('material');
        select.innerHTML = '<option value="">Seleccione un material</option>';
        data.forEach(material => {
            const option = document.createElement('option');
            option.value = material.id;
            option.textContent = material.nombre;
            select.appendChild(option);
        });
    }
}

// Función para cargar índices de refracción en el menú desplegable
async function cargarIndicesRefraccion() {
    const { data, error } = await supabaseClient
        .from('indices_refraccion')
        .select('*');

    if (error) {
        console.error('Error al cargar índices de refracción:', error);
    } else {
        const select = document.getElementById('indice-refraccion');
        select.innerHTML = '<option value="">Seleccione un índice de refracción</option>';
        data.forEach(indice => {
            const option = document.createElement('option');
            option.value = indice.id;
            option.textContent = indice.valor;
            select.appendChild(option);
        });
    }
}

// Función para cargar tratamientos como checkboxes
async function cargarTratamientos() {
    const { data, error } = await supabaseClient
        .from('tratamientos')
        .select('*');

    if (error) {
        console.error('Error al cargar tratamientos:', error);
    } else {
        const container = document.getElementById('tratamientos-container');
        container.innerHTML = '';
        data.forEach(tratamiento => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `tratamiento-${tratamiento.id}`;
            checkbox.value = tratamiento.id;
            const label = document.createElement('label');
            label.htmlFor = `tratamiento-${tratamiento.id}`;
            label.textContent = tratamiento.nombre;
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
}

// Función para cambiar entre pasos
function nextStep(step) {
    document.querySelectorAll('form > div').forEach(div => div.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
}

function prevStep(step) {
    document.querySelectorAll('form > div').forEach(div => div.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
}

// Función para mostrar la vista previa
function showPreview() {
    const laboratorio = document.getElementById('laboratorio').selectedOptions[0].text;
    const nombreCristal = document.getElementById('nombre-cristal').value;
    const material = document.getElementById('material').selectedOptions[0].text;
    const indiceRefraccion = document.getElementById('indice-refraccion').selectedOptions[0].text;
    const esfMin = document.getElementById('esf-min').value;
    const esfMax = document.getElementById('esf-max').value;
    const cilindrico = document.getElementById('cilindrico').value;
    const tratamientos = Array.from(document.querySelectorAll('#tratamientos-container input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.nextElementSibling.textContent)
        .join(', ');
    const precio = document.getElementById('precio').value;

    document.getElementById('preview-lab').textContent = laboratorio;
    document.getElementById('preview-nombre').textContent = nombreCristal;
    document.getElementById('preview-material').textContent = material;
    document.getElementById('preview-indice').textContent = indiceRefraccion;
    document.getElementById('preview-esf-min').textContent = esfMin;
    document.getElementById('preview-esf-max').textContent = esfMax;
    document.getElementById('preview-cilindrico').textContent = cilindrico;
    document.getElementById('preview-tratamientos').textContent = tratamientos;
    document.getElementById('preview-precio').textContent = precio;

    document.getElementById('preview').style.display = 'block';
}

function esMultiploDe025(valor) {
    // Verifica si el valor es un múltiplo de 0.25
    return (valor * 100) % 25 === 0;
}

function reiniciarFormulario() {
    // Limpiar todos los campos del formulario
    document.getElementById('laboratorio').value = '';
    document.getElementById('tipo-cristal').value = '';
    document.getElementById('nombre-cristal').value = '';
    document.getElementById('material').value = '';
    document.getElementById('indice-refraccion').value = '';
    document.getElementById('esf-min').value = '';
    document.getElementById('esf-max').value = '';
    document.getElementById('cilindrico').value = '';
    document.getElementById('precio').value = '';

    // Desmarcar todos los checkboxes de tratamientos
    document.querySelectorAll('#tratamientos-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Ocultar todos los pasos excepto el primero
    document.querySelectorAll('form > div').forEach(div => div.style.display = 'none');
    document.getElementById('step1').style.display = 'block';

    // Ocultar la vista previa
    document.getElementById('preview').style.display = 'none';
}

async function agregarProducto() {
    const laboratorioId = document.getElementById('laboratorio').value;
    const tipoLenteId = document.getElementById('tipo-cristal').value;
    const nombreCristal = document.getElementById('nombre-cristal').value;
    const materialId = document.getElementById('material').value;
    const indiceRefraccionId = document.getElementById('indice-refraccion').value;
    const esfMin = parseFloat(document.getElementById('esf-min').value);
    const esfMax = parseFloat(document.getElementById('esf-max').value);
    const cilindrico = parseFloat(document.getElementById('cilindrico').value);
    const precio = parseFloat(document.getElementById('precio').value);

    // Validar que los campos obligatorios no estén vacíos
    if (!laboratorioId) {
        alert('Por favor, seleccione un laboratorio.');
        return;
    }
    if (!tipoLenteId) {
        alert('Por favor, seleccione un tipo de cristal.');
        return;
    }
    if (!materialId) {
        alert('Por favor, seleccione un material.');
        return;
    }
    if (!indiceRefraccionId) {
        alert('Por favor, seleccione un índice de refracción.');
        return;
    }

    // Validar que los campos numéricos sean números válidos
    if (isNaN(esfMin)) {
        alert('Por favor, ingrese un valor válido para la esfera mínima.');
        return;
    }
    if (isNaN(esfMax)) {
        alert('Por favor, ingrese un valor válido para la esfera máxima.');
        return;
    }
    if (isNaN(cilindrico)) {
        alert('Por favor, ingrese un valor válido para el cilíndrico.');
        return;
    }
    if (isNaN(precio)) {
        alert('Por favor, ingrese un valor válido para el precio.');
        return;
    }

    // Validar que los valores estén en incrementos de 0.25
    if (!esMultiploDe025(esfMin)) {
        alert('La esfera mínima debe ser un múltiplo de 0.25 (ej: 0.00, 0.25, 0.50, etc.).');
        return;
    }
    if (!esMultiploDe025(esfMax)) {
        alert('La esfera máxima debe ser un múltiplo de 0.25 (ej: 0.00, 0.25, 0.50, etc.).');
        return;
    }
    if (!esMultiploDe025(cilindrico)) {
        alert('El cilíndrico debe ser un múltiplo de 0.25 (ej: 0.00, 0.25, 0.50, etc.).');
        return;
    }

    // Validar que la esfera mínima sea negativa
    if (esfMin >= 0) {
        alert('La esfera mínima debe ser un valor negativo (ej: -4.00, -2.25, etc.).');
        return;
    }

    // Validar que la esfera máxima sea positiva
    if (esfMax <= 0) {
        alert('La esfera máxima debe ser un valor positivo (ej: 4.00, 2.25, etc.).');
        return;
    }

    // Validar que el cilíndrico sea negativo
    if (cilindrico >= 0) {
        alert('El cilíndrico debe ser un valor negativo (ej: -2.00, -1.25, etc.).');
        return;
    }

    // Obtener los tratamientos seleccionados
    const tratamientos = Array.from(document.querySelectorAll('#tratamientos-container input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // Insertar el producto en la tabla 'productos'
    const { data: producto, error: productoError } = await supabaseClient
        .from('productos')
        .insert([{
            nombre: nombreCristal,
            tipo_lente_id: tipoLenteId,
            material_id: materialId,
            indice_refraccion_id: indiceRefraccionId,
            laboratorio_id: laboratorioId,
            esf_min: esfMin,
            esf_max: esfMax,
            cilindrico: cilindrico,
            precio: precio
        }])
        .select();

    if (productoError) {
        console.error('Error al agregar producto:', productoError);
        alert('Error al agregar producto. Verifique los datos e intente nuevamente.');
        return;
    }

    // Insertar los tratamientos en la tabla 'producto_tratamiento'
    const productoId = producto[0].id;
    for (const tratamientoId of tratamientos) {
        const { error: tratamientoError } = await supabaseClient
            .from('producto_tratamiento')
            .insert([{
                producto_id: productoId,
                tratamiento_id: tratamientoId
            }]);

        if (tratamientoError) {
            console.error('Error al agregar tratamiento:', tratamientoError);
            alert('Error al agregar tratamiento. Verifique los datos e intente nuevamente.');
            return;
        }
    }

    alert('Producto agregado correctamente');
    await cargarProductos(); // Recargar la lista de productos
    reiniciarFormulario(); // Reiniciar el formulario
}

function formatearNumeroConSigno(valor) {
    if (valor === null || valor === undefined) return ''; // Manejar valores nulos o indefinidos
    const numero = parseFloat(valor);
    if (numero >= 0) {
        return `+${numero.toFixed(2)}`; // Agregar + a números positivos
    } else {
        return numero.toFixed(2); // Conservar - en números negativos
    }
}

// Función para cargar y mostrar los productos
async function cargarProductos() {
    const { data, error } = await supabaseClient
        .from('productos')
        .select('*, laboratorios(nombre),