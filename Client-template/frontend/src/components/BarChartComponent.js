import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables);
Chart.register(annotationPlugin);

const BarChartComponent = ({ data = [], settings }) => {
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
    labels: filteredData.map((d) => new Date(d.time)),
    datasets: [
      {
        label: settings?.title || "Barres",
        data: filteredData.map((d) => parseFloat(d.value)),
        backgroundColor: "#00b5ff",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
        },
        ticks: { color: "#ccc" },
        grid: { color: "#444" },
        title: { display: true, text: "Temps", color: "#ccc" },
      },
      y: {
        min: parseFloat(settings?.minValue) ?? 0,
        max: parseFloat(settings?.maxValue) ?? 100,
        ticks: { color: "#ccc" },
        grid: { color: "#444" },
        title: { display: true, text: "Valeur", color: "#ccc" },
      },
    },
    plugins: {
      legend: { labels: { color: "#ccc" } },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1e1e1e" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChartComponent;
