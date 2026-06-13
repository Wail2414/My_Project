import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables);
Chart.register(annotationPlugin);

const AreaChartComponent = ({ data = [], settings }) => {
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
    return <div>Aucune donnée valide</div>;
  }

  const chartData = {
    datasets: [
      {
        label: settings?.title || "MQTT Data",
        data: filteredData.map((d) => ({
          x: new Date(d.time),
          y: parseFloat(d.value),
        })),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.3)",
        fill: true,
        tension: 0.4,
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
          displayFormats: {
            minute: "HH:mm",
          },
        },
        title: {
          display: true,
          text: "Temps",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: "Valeur",
        },
        min: parseFloat(settings?.minValue) ?? 0,
        max: parseFloat(settings?.maxValue) ?? 100,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#ccc",
        },
      },
      annotation: {
        annotations: {
          limitLine: {
            type: "line",
            yMin: settings?.minLimit,
            yMax: settings?.minLimit,
            borderColor: "rgba(255,0,0,0.5)",
            borderWidth: 1,
            label: {
              display: true,
              content: "Min Limit",
              color: "red",
            },
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default AreaChartComponent;
