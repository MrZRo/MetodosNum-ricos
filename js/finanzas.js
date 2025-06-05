const datos = [
  { monto: 1000, rendimiento: 1050 },
  { monto: 5000, rendimiento: 5300 },
  { monto: 10000, rendimiento: 11000 },
  { monto: 20000, rendimiento: 22500 },
  { monto: 50000, rendimiento: 60000 }
];

let grafico = null;

function calcularInteres() {
  const x = parseFloat(document.getElementById("monto").value);
  const iteracionesDiv = document.getElementById("detalleIteraciones");
  const conclusionDiv = document.getElementById("conclusionFinal");

  if (isNaN(x) || x < 1 || x > 100000) {
    alert("Por favor ingrese un monto válido entre $1 y $100,000.");
    return;
  }

  const n = datos.length;
  const diferencias = [];

  // Inicializar tabla de diferencias divididas
  for (let i = 0; i < n; i++) {
    diferencias[i] = new Array(n).fill(0);
    diferencias[i][0] = datos[i].rendimiento;
  }

  // Calcular diferencias divididas
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      const numerador = diferencias[i + 1][j - 1] - diferencias[i][j - 1];
      const denominador = datos[i + j].monto - datos[i].monto;
      diferencias[i][j] = numerador / denominador;
    }
  }

  // Mostrar iteraciones
  let detallesHTML = "Iteraciones usando Interpolación de Newton:\n\n";
  for (let i = 1; i < n; i++) {
    detallesHTML += `Dividida orden ${i}: ${diferencias[0][i].toFixed(6)}\n`;
  }

  // Calcular resultado usando la fórmula de Newton
  let resultado = diferencias[0][0];
  let producto = 1;
  for (let i = 1; i < n; i++) {
    producto *= (x - datos[i - 1].monto);
    resultado += diferencias[0][i] * producto;
  }

  detallesHTML += `\n🔎 Resultado estimado para inversión de $${x.toFixed(2)} ≈ $${resultado.toFixed(2)}\n`;
  iteracionesDiv.innerText = detallesHTML;

  // Conclusión ampliada
conclusionDiv.innerHTML = `
  <p>
    Con una inversión de <strong>$${x.toFixed(2)}</strong>, se estima que el rendimiento anual será de 
    aproximadamente <strong>$${resultado.toFixed(2)}</strong>.
  </p>
  <p>
    Este resultado se obtuvo utilizando el <strong>método de interpolación de Newton</strong> con cinco puntos 
    de datos reales. 
  </p>
  <p>
    <strong>¿Por qué Newton?</strong><br>
    Este método es especialmente eficiente para situaciones como esta donde:
    <ul>
      <li>Los puntos de inversión no están espaciados uniformemente.</li>
      <li>Se quiere añadir más datos sin recalcular toda la fórmula.</li>
      <li>Se busca una solución rápida con buena aproximación a partir de pocos datos.</li>
    </ul>
    A diferencia de métodos como el de Lagrange, Newton permite construir la interpolación de forma incremental 
    y mejora el rendimiento si se agregan nuevas observaciones. Esto lo hace ideal para el análisis financiero 
    donde los datos pueden crecer o cambiar con el tiempo.
  </p>
`;


  // Actualizar gráfico
  if (grafico) grafico.destroy();

  const ctx = document.getElementById("graficoFinanzas").getContext("2d");
  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.map(d => d.monto),
      datasets: [
        {
          label: "Rendimiento Real",
          data: datos.map(d => d.rendimiento),
          borderColor: "blue",
          fill: false,
          tension: 0.2,
        },
        {
          label: "Estimado",
          data: [{ x, y: resultado }],
          borderColor: "red",
          backgroundColor: "red",
          pointRadius: 6,
          type: "scatter",
          showLine: false
        }
      ]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Monto invertido ($)"
          },
          min: 0,
          max: 100000
        },
        y: {
          title: {
            display: true,
            text: "Rendimiento estimado ($)"
          }
        }
      },
      plugins: {
        legend: {
          position: "top"
        },
        tooltip: {
          mode: "nearest"
        }
      }
    }
  });
}
