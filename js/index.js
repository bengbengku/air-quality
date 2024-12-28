const API_URL = "http://127.0.0.1:5000/api/data";

const ctx = document.getElementById("environmentChart").getContext("2d");

let myChart = null;

function fetchData() {
	return fetch(API_URL)
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error fetching data:", error);
			throw error;
		});
}

function getLatestData(data) {
	const sortedData = data.sort((a, b) => new Date(b.timestamps) - new Date(a.timestamps));
	return sortedData[0];
}

function updateSummary() {
	fetchData()
		.then((data) => {
			const latestData = getLatestData(data);

			const { airQualityText, color, fontSize } = getAirQuality(latestData.pm25);

			document.getElementById("result-main").textContent = airQualityText;
			document.getElementById("result-main").style.color = color;
			document.getElementById("result-main").style.fontSize = fontSize;

			document.getElementById("air-index").textContent = `AQI: ${latestData.pm25}`;
			document.getElementById("air-index").style.fontSize = fontSize;

			document.getElementById("humidity").textContent = latestData.humidity + "%";
			document.getElementById("temp").textContent = latestData.temperature + "°C";
			document.getElementById("no2").textContent = latestData.no2;
			document.getElementById("co2").textContent = latestData.co2;
		})
		.catch((error) => {
			console.error("Error updating air quality information:", error);
		});
}

function getAirQuality(aqi) {
	let airQualityText = "";
	let color = "";
	let fontSize = "16px";

	if (aqi <= 50) {
		airQualityText = "Baik";
		color = "green";
		fontSize = "1rem";
	} else if (aqi <= 100) {
		airQualityText = "Sedang";
		color = "yellow";
		fontSize = "1rem";
	} else if (aqi <= 200) {
		airQualityText = "Tidak Sehat";
		fontSize = "1rem";
		color = "orange";
	} else if (aqi <= 300) {
		airQualityText = "Sangat Tidak Sehat";
		color = "purple";
		fontSize = "16px";
	} else if (aqi > 300) {
		airQualityText = "Berbahaya";
		color = "red";
		fontSize = "1rem";
	} else {
		airQualityText = "N/A";
		color = "black";
		fontSize = "1rem";
	}
	return { airQualityText, color, fontSize };
}

function filterDataByDays(data, days) {
	const now = new Date();
	let filteredData = [];

	if (days === "semua") {
		filteredData = data
			.sort((a, b) => new Date(b.timestamps) - new Date(a.timestamps))
			.slice(0, 12);
	} else {
		filteredData = data.filter((entry) => {
			const entryDate = new Date(entry.timestamps);
			const diffTime = now - entryDate;
			const diffDays = diffTime / (1000 * 3600 * 24);
			return diffDays <= days;
		});
	}

	return filteredData;
}

function prepareChartData(data, days) {
	const filteredData = filterDataByDays(data, days);

	filteredData.sort((a, b) => new Date(a.timestamps) - new Date(b.timestamps));

	const labels = filteredData.map((entry) => entry.timestamps.substring(0, 11));

	return {
		labels: labels,
		datasets: [
			createDataset(
				"PM2.5",
				filteredData.map((entry) => entry.pm25),
				"rgba(255, 99, 132, 0.2)",
				"rgba(255, 99, 132, 1)"
			),
			createDataset(
				"Kelembapan (%)",
				filteredData.map((entry) => entry.humidity),
				"rgba(54, 162, 235, 0.2)",
				"rgba(54, 162, 235, 1)"
			),
			createDataset(
				"Suhu (°C)",
				filteredData.map((entry) => entry.temperature),
				"rgba(255, 159, 64, 0.2)",
				"rgba(255, 159, 64, 1)"
			),
			createDataset(
				"NO₂",
				filteredData.map((entry) => entry.no2),
				"rgba(75, 192, 192, 0.2)",
				"rgba(75, 192, 192, 1)"
			),
			createDataset(
				"CO₂",
				filteredData.map((entry) => entry.co2),
				"rgba(153, 102, 255, 0.2)",
				"rgba(153, 102, 255, 1)"
			),
		],
	};
}

function createDataset(label, data, backgroundColor, borderColor) {
	return {
		label: label,
		data: data,
		backgroundColor: backgroundColor,
		borderColor: borderColor,
		borderWidth: 1,
	};
}

function destroyChart() {
	if (myChart) {
		myChart.destroy();
		myChart = null;
	}
}

function createChart(chartData) {
	const ctx = document.getElementById("environmentChart").getContext("2d");

	const config = {
		type: "bar",
		data: chartData,
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
					labels: {
						font: {
							size: 10,
						},
						usePointStyle: true,
						pointStyle: "circle",
						pointRadius: 5,
					},
				},
				tooltip: {
					mode: "index",
					intersect: false,
				},
			},
			scales: {
				x: {
					ticks: {
						autoSkip: true,
						maxTicksLimit: 12,
						font: {
							size: 8,
						},
					},
				},
				y: {
					beginAtZero: false,
				},
			},
		},
	};

	destroyChart();
	myChart = new Chart(ctx, config);
}

function loadChartData(days) {
	fetchData()
		.then((data) => {
			const chartData = prepareChartData(data, days);
			createChart(chartData);
		})
		.catch((error) => {
			console.error("Error loading chart data:", error);
		});
}

function formatDate(date) {
	const day = date.getDate();
	const monthNames = [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	];
	const month = monthNames[date.getMonth()];
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return {
		dateText: `${day} ${month} ${year} | `,
		timeText: `${hours}:${minutes}:${seconds}`,
	};
}

function updateClock() {
	const now = new Date();
	const formattedTime = formatDate(now);
	document.getElementById("current-time").textContent = formattedTime.dateText;
	document.getElementById("time-text").textContent = formattedTime.timeText;
}

setInterval(updateClock, 1000);

document.getElementById("daysFilter").addEventListener("change", function () {
	const days = this.value === "semua" ? "semua" : parseInt(this.value, 10);
	loadChartData(days);
	updateSummary();
});

loadChartData("semua");
updateSummary();
updateClock();
