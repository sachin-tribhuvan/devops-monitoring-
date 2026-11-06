
// ==========================================
// LOCAL DEVOPS MONITORING SYSTEM
// Complete JavaScript File
// ==========================================


// ==========================================
// 1. LIVE DASHBOARD MONITORING
// ==========================================

async function updateDashboard() {

    try {

        const response = await fetch("/api/metrics");

        if (!response.ok) {
            throw new Error("Metrics API failed");
        }

        const data = await response.json();

        // CPU DETAILS
        document.getElementById("cpu").textContent =
            data.cpu.usage.toFixed(1) + "%";

        document.getElementById("cpu-bar").style.width =
            data.cpu.usage + "%";

        document.getElementById("cores").textContent =
            data.cpu.cores + " CPU Cores";


        // RAM DETAILS
        document.getElementById("ram").textContent =
            data.memory.percentage.toFixed(1) + "%";

        document.getElementById("ram-bar").style.width =
            data.memory.percentage + "%";

        document.getElementById("ram-details").textContent =
            data.memory.used + " GB / " +
            data.memory.total + " GB";


        // DISK DETAILS
        document.getElementById("disk").textContent =
            data.disk.percentage.toFixed(1) + "%";

        document.getElementById("disk-bar").style.width =
            data.disk.percentage + "%";

        document.getElementById("disk-details").textContent =
            data.disk.used + " GB / " +
            data.disk.total + " GB";


        // SYSTEM INFORMATION
        document.getElementById("hostname").textContent =
            data.system.hostname;

        document.getElementById("os").textContent =
            data.system.os;

        document.getElementById("version").textContent =
            data.system.os_version;

        document.getElementById("python").textContent =
            data.system.python_version;

        document.getElementById("processor").textContent =
            data.system.processor;

        document.getElementById("uptime").textContent =
            data.uptime;


    } catch (error) {

        console.error("Dashboard Error:", error);

    }

}



// ==========================================
// 2. LOAD MONITORING HISTORY
// ==========================================

async function loadHistory() {

    try {

        const response = await fetch("/api/history");

        if (!response.ok) {
            throw new Error("History API failed");
        }

        const records = await response.json();

        drawHistoryChart(
            "cpuChart",
            records,
            "cpu",
            "CPU Usage"
        );

        drawHistoryChart(
            "ramChart",
            records,
            "ram",
            "RAM Usage"
        );

        drawHistoryChart(
            "diskChart",
            records,
            "disk",
            "Disk Usage"
        );


    } catch (error) {

        console.error("History Error:", error);

    }

}



// ==========================================
// 3. DRAW MONITORING GRAPHS
// ==========================================

function drawHistoryChart(canvasId, records, key, title) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        console.error("Canvas not found:", canvasId);
        return;
    }

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const padding = 55;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;


    // BACKGROUND
    ctx.fillStyle = "#111827";

    ctx.fillRect(0, 0, width, height);


    // TITLE
    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 16px Arial";

    ctx.fillText(title, padding, 25);


    // NO DATA
    if (!records || records.length === 0) {

        ctx.fillStyle = "white";

        ctx.font = "16px Arial";

        ctx.fillText(
            "No history data available",
            padding,
            height / 2
        );

        return;
    }


    // GET VALUES
    const values = records.map(record => {

        return Number(record[key]) || 0;

    });


    // DYNAMIC SCALE
    let minValue = Math.max(
        0,
        Math.floor(Math.min(...values) - 2)
    );

    let maxValue = Math.min(
        100,
        Math.ceil(Math.max(...values) + 2)
    );


    if (maxValue - minValue < 4) {

        minValue = Math.max(0, minValue - 2);

        maxValue = Math.min(100, maxValue + 2);

    }


    // GRID
    ctx.strokeStyle = "#374151";

    ctx.lineWidth = 1;

    ctx.font = "12px Arial";


    for (let i = 0; i <= 4; i++) {

        const y = padding + (chartHeight / 4) * i;

        ctx.beginPath();

        ctx.moveTo(padding, y);

        ctx.lineTo(width - padding, y);

        ctx.stroke();


        const label = (
            maxValue -
            (i / 4) * (maxValue - minValue)
        ).toFixed(1);


        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            label + "%",
            5,
            y + 4
        );

    }



    // DRAW GRAPH LINE
    ctx.strokeStyle = "#38bdf8";

    ctx.lineWidth = 3;

    ctx.lineJoin = "round";

    ctx.lineCap = "round";

    ctx.beginPath();


    values.forEach((value, index) => {

        const x = padding + (

            values.length === 1
                ? chartWidth / 2
                : (index / (values.length - 1)) * chartWidth

        );


        const y = padding +
            chartHeight -
            (
                (value - minValue) /
                (maxValue - minValue)
            ) * chartHeight;


        if (index === 0) {

            ctx.moveTo(x, y);

        } else {

            ctx.lineTo(x, y);

        }

    });


    ctx.stroke();



    // DRAW DATA POINTS
    values.forEach((value, index) => {

        const x = padding + (

            values.length === 1
                ? chartWidth / 2
                : (index / (values.length - 1)) * chartWidth

        );


        const y = padding +
            chartHeight -
            (
                (value - minValue) /
                (maxValue - minValue)
            ) * chartHeight;


        ctx.beginPath();

        ctx.arc(x, y, 4, 0, Math.PI * 2);

        ctx.fillStyle = "#38bdf8";

        ctx.fill();

    });



    // CURRENT VALUE
    const latestValue = values[values.length - 1];

    ctx.fillStyle = "#38bdf8";

    ctx.font = "bold 14px Arial";

    ctx.fillText(
        "Current: " + latestValue.toFixed(1) + "%",
        width - 180,
        25
    );

}



// ==========================================
// 4. AUTOMATIC REFRESH
// ==========================================


// Initial loading
updateDashboard();

loadHistory();


// Live metrics every 2 seconds
setInterval(updateDashboard, 2000);


// Graph history every 5 seconds
setInterval(loadHistory, 5000);


// Console message
console.log("Local DevOps Monitor Started Successfully");
