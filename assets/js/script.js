document.addEventListener('DOMContentLoaded', function() {
    cargarMonedas().then(moneda => {
        const selectorMoneda = document.getElementById('moneda');
        Object.entries(moneda).forEach(([clave, datos]) => {
            if (datos.codigo && datos.unidad_medida === 'Pesos') {
                let opcion = document.createElement('option');
                opcion.value = clave;
                opcion.textContent = datos.nombre;
                selectorMoneda.appendChild(opcion);
            }
        });
    });

    const botonConvertir = document.getElementById('botonConvertir');
    botonConvertir.addEventListener('click', convertirMoneda);
});

let grafico;

async function cargarMonedas() {
    const respuesta = await fetch('https://mindicador.cl/api');
    return await respuesta.json();
}

async function convertirMoneda() {
    const cantidad = document.getElementById('monto').value;
    const moneda = document.getElementById('moneda').value;
    const url = `https://mindicador.cl/api/${moneda}`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const tasa = datos.serie[0].valor;
        const resultado = (cantidad / tasa).toFixed(2);
        document.getElementById('resultado').textContent = `Resultado: $${resultado}`;
        actualizarGrafico(datos.serie.map(x => x.valor).slice(0, 10));
    } catch (error) {
        document.getElementById('resultado').textContent = 'Error: ' + error.message;
    }
}

function actualizarGrafico(data) {
    const ctx = document.getElementById('graficoHistorial').getContext('2d');

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: data.length}, (_, i) => `Día ${i + 1}`),
            datasets: [{
                label: 'Valor Moneda Últimos 10 Días',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
                       }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
