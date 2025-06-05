const valoresEntrada = [0, 100, 250, 400, 600, 800, 1000]; // Lecturas brutas del sensor
const valoresCalibrados = [0, 50, 130, 210, 300, 400, 500]; // Valores reales calibrados (por ejemplo, °C o PSI)

let chart = null;

function calibrar() {
  const x = parseFloat(document.getElementById("entradaSensor").value);
  const iteracionesDiv = document.getElementById("iteraciones");
  const conclusionDiv = document.getElementById("conclusion");

  if (isNaN(x) || x < 0 || x > 1000) {
    iteracionesDiv.innerHTML = "<span style='color:red'>Ingrese un valor entre 0 y 1000.</span>";
    conclusionDiv.innerHTML = "";
    if (chart) chart.destroy();
    return;
  }

  let y = null;
  let pasos = `<strong>Interpolación lineal por tramos:</strong><br><br>`;

  for (let i = 0; i < valoresEntrada.length - 1; i++) {
    const x0 = valoresEntrada[i];
    const x1 = valoresEntrada[i + 1];
    const y0 = valoresCalibrados[i];
    const y1 = valoresCalibrados[i + 1];

    if (x >= x0 && x <= x1) {
      const pendiente = (y1 - y0) / (x1 - x0);
      y = y0 + pendiente * (x - x0);

      pasos += `
        <ul>
          <li>Intervalo encontrado: [<strong>${x0}</strong>, <strong>${x1}</strong>]</li>
          <li>Valor calibrado en los extremos:
            <ul>
              <li>f(${x0}) = ${y0}</li>
              <li>f(${x1}) = ${y1}</li>
            </ul>
          </li>
          <li>
            Cálculo:
            <br>
            f(${x}) = ${y0} + ((${y1} - ${y0}) / (${x1} - ${x0})) × (${x} - ${x0})<br>
            f(${x}) = ${y0} + (${pendiente.toFixed(4)}) × (${(x - x0).toFixed(2)})<br>
            <strong>f(${x}) ≈ ${y.toFixed(2)}</strong>
          </li>
        </ul>
      `;
      break;
    }
  }

  iteracionesDiv.innerHTML = pasos;

  // Destruir gráfico anterior si existe
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafico"), {
    type: 'line',
    data: {
      labels: valoresEntrada,
      datasets: [
        {
          label: "Datos de calibración (valores reales)",
          data: valoresEntrada.map((x, i) => ({ x: x, y: valoresCalibrados[i] })),
          borderColor: "green",
          backgroundColor: "rgba(0, 255, 0, 0.1)",
          fill: false,
          tension: 0.2
        },
        {
          label: "Valor estimado",
          data: [{ x: x, y: y }],
          type: "scatter",
          backgroundColor: "red",
          pointRadius: 7,
          showLine: false
        }
      ]
    },
    options: {
      scales: {
        x: {
          type: "linear",
          title: { display: true, text: "Lectura del sensor (sin calibrar)" },
          min: 0,
          max: 1000
        },
        y: {
          title: { display: true, text: "Valor calibrado (ej. °C, PSI)" },
          min: 0,
          max: 550
        }
      },
      plugins: {
        legend: { position: "top" }
      }
    }
  });

  conclusionDiv.innerHTML = `
    <p>
      <strong>Resultado:</strong><br>
      Para una lectura bruta de <strong>${x}</strong> unidades del sensor, el valor calibrado estimado es 
      aproximadamente <strong>${y.toFixed(2)}</strong> unidades reales (por ejemplo, grados Celsius, presión en PSI, etc.).
    </p>

    <p>
      <strong>¿Por qué usar interpolación lineal por tramos?</strong><br>
      Este método es muy eficaz en sistemas de instrumentación porque:
      <ul>
        <li>Es simple de implementar y rápido computacionalmente.</li>
        <li>No genera oscilaciones ni sobreajustes entre puntos de medición.</li>
        <li>Se adapta perfectamente a la calibración basada en tablas de datos por segmentos.</li>
        <li>Permite actualizar o reemplazar tramos específicos sin recalcular toda la función.</li>
      </ul>
      Comparado con métodos como Newton o Lagrange, la interpolación lineal por tramos es ideal cuando los 
      sensores entregan datos discretos y se conoce con precisión el comportamiento entre ellos.
    </p>
  `;
}
