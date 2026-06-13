import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables);
Chart.register(annotationPlugin);

const ChartComponent = ({ data = [], settings }) => {
  const filteredData = Array.isArray(data)
    ? data.filter(
        (d) =>
          d &&
          typeof d === "object" &&
          d.time &&
          !isNaN(new Date(d.time)) &&
          !isNaN(parseFloat(d.value))
      )
    : [];

  if (filteredData.length === 0) {
    console.warn("❌ Données invalides reçues pour ChartComponent:", data);
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1e1e1e",
          color: "#888",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        Aucune donnée valide
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: settings?.title || "MQTT Data",
        data: filteredData.map((d) => ({
          x: new Date(d.time),
          y: parseFloat(d.value),
        })),
        borderColor: "#00b5ff",
        backgroundColor: "rgba(0, 181, 255, 0.1)",
        borderWidth: 2,
        tension: 0.3, // courbe lissée
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            minute: "HH:mm",
          },
        },
        ticks: {
          color: "#ccc",
          autoSkip: true,
        },
        grid: {
          color: "#444",
        },
        title: {
          display: true,
          text: "Time",
          color: "#ccc",
        },
      },
      y: {
        min: parseFloat(settings?.minValue) ?? 0,
        max: parseFloat(settings?.maxValue) ?? 100,
        ticks: {
          color: "#ccc",
        },
        grid: {
          color: "#444",
        },
        title: {
          display: true,
          text: "Value",
          color: "#ccc",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#ccc",
        },
      },
      annotation: {
        annotations: {
          limitLine: {
            type: "line",
            yMin: 5,
            yMax: 5,
            borderColor: "rgb(255,99,132)",
            borderWidth: 2,
            label: {
              enabled: true,
              content: "Limite",
              color: "#fff",
              backgroundColor: "rgba(255,99,132,0.7)",
            },
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ChartComponent;
