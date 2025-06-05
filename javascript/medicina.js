const pesos = [3, 10, 20, 40, 60, 80, 100, 150, 200, 300, 400, 500, 600];
const dosis = [50, 100, 200, 400, 600, 800, 1000, 1000, 1000, 1000, 1000, 1000, 1000];

let chart = null;

function calcularDosis() {
  const pesoInput = document.getElementById("pesoInput");
  const x = parseFloat(pesoInput.value);
  const iteracionesDiv = document.getElementById("iteraciones");
  const conclusionDiv = document.getElementById("conclusion");
  const canvas = document.getElementById("grafico");

  if (isNaN(x) || x < 3 || x > 600) {
    iteracionesDiv.innerHTML = "<span style='color:red'>Por favor ingresa un peso entre 3 y 600 kg.</span>";
    conclusionDiv.innerHTML = "";
    if (chart) chart.destroy();
    return;
  }

  let resultado = 0;
  let pasosHTML = `<ul>`;

  for (let i = 0; i < pesos.length; i++) {
    let term = dosis[i];
    let subPasos = [];

    for (let j = 0; j < pesos.length; j++) {
      if (j !== i) {
        const numerador = x - pesos[j];
        const denominador = pesos[i] - pesos[j];
        term *= numerador / denominador;
        subPasos.push(`(( ${x} - ${pesos[j]} ) / (${pesos[i]} - ${pesos[j]}))`);
      }
    }

    resultado += term;
    pasosHTML += `
      <li>
        <strong>Término ${i + 1}:</strong> ${term.toFixed(4)} mg<br>
        <code>L<sub>${i}</sub>(x) = ${subPasos.join(" × ")}</code>
      </li><br>`;
  }

  pasosHTML += `</ul><p><strong>Dosis total estimada:</strong> ${resultado.toFixed(2)} mg</p>`;
  iteracionesDiv.innerHTML = pasosHTML;

  // Calcular presentación en tabletas de 500 mg
  const tabletas = Math.ceil(resultado / 500);

  // Destruir gráfico anterior si existe
  if (chart) chart.destroy();

  // Preparar datos para gráfico (filtrar planos lejanos)
  const datosGrafico = pesos
    .map((p, i) => ({ x: p, y: dosis[i] }))
    .filter(p => !(p.y === 1000 && Math.abs(p.x - x) > 60));

  const margenX = 20;
  const margenY = 100;
  const minX = Math.max(0, x - margenX);
  const maxX = Math.min(620, x + margenX);
  const minY = Math.max(0, resultado - margenY);
  const maxY = resultado + margenY;

  chart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Dosis conocida (mg)',
          data: datosGrafico,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          tension: 0.3,
          fill: false,
          pointStyle: 'circle',
          pointRadius: 4,
        },
        {
          label: 'Dosis estimada',
          data: [{ x: x, y: resultado }],
          type: 'scatter',
          backgroundColor: 'red',
          pointRadius: 7,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: {
          title: { display: true, text: 'Peso (kg)' },
          type: 'linear',
          min: minX,
          max: maxX
        },
        y: {
          title: { display: true, text: 'Dosis (mg)' },
          min: minY,
          max: maxY
        }
      }
    }
  });

  // Mostrar conclusión y recomendación con método correcto (Lagrange)
  conclusionDiv.innerHTML = `
  <p>
    <strong>Conclusión:</strong><br>
    Para un paciente de <strong>${x} kg</strong>, la dosis estimada de <strong>Paracetamol</strong> es 
    aproximadamente <strong>${resultado.toFixed(2)} mg</strong>, calculada mediante interpolación clínica 
    usando el <strong>método de Lagrange</strong>.
  </p>

  <p>
    <strong>Sugerencia terapéutica:</strong><br>
    Administrar aproximadamente <strong>${tabletas} ${tabletas === 1 ? 'tableta' : 'tabletas'}</strong> de 500 mg, 
    ajustando siempre con criterio médico según la condición clínica del paciente.
  </p>

  <p>
    <strong>¿Por qué usar Lagrange?</strong><br>
    El método de Lagrange es especialmente útil en contextos médicos donde:
    <ul>
      <li>Se dispone de un número limitado de datos discretos de referencia.</li>
      <li>Se requiere una solución rápida sin necesidad de recalcular estructuras previas.</li>
      <li>La precisión puntual importa más que la eficiencia en series largas.</li>
    </ul>
    Aunque no es el más eficiente para grandes volúmenes de datos, Lagrange es directo y preciso para estimar 
    dosis intermedias a partir de datos clínicos conocidos, ideal en escenarios donde no se requiere añadir 
    dinámicamente más puntos.
  </p>
`;
}
