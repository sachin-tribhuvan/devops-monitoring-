import sqlite3
from database import DB_NAME
from database import create_table, save_metrics
from flask import Flask, render_template, jsonify
import psutil
import platform
import socket
import time
import os

app = Flask(__name__)
create_table()

@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/api/metrics")
def get_metrics():

    cpu_usage = psutil.cpu_percent(interval=0.2)

    memory = psutil.virtual_memory()

    drive = os.environ.get("SystemDrive", "C:") + "\\"
    disk = psutil.disk_usage(drive)

    system_info = {
        "hostname": socket.gethostname(),
        "os": platform.system(),
        "os_version": platform.release(),
        "python_version": platform.python_version(),
        "processor": platform.processor()
    }

    uptime_seconds = int(time.time() - psutil.boot_time())

    days = uptime_seconds // 86400
    hours = (uptime_seconds % 86400) // 3600
    minutes = (uptime_seconds % 3600) // 60

    save_metrics(cpu_usage, memory.percent, disk.percent)

    return jsonify({

        "cpu": {
            "usage": cpu_usage,
            "cores": psutil.cpu_count()
        },

        "memory": {
            "total": round(memory.total / (1024 ** 3), 2),
            "used": round(memory.used / (1024 ** 3), 2),
            "percentage": memory.percent
        },

        "disk": {
            "total": round(disk.total / (1024 ** 3), 2),
            "used": round(disk.used / (1024 ** 3), 2),
            "percentage": disk.percent
        },

        "system": system_info,

        "uptime": f"{days}d {hours}h {minutes}m"

    })

@app.route("/api/history")
def get_history():

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT cpu, ram, disk, timestamp
        FROM metrics
        ORDER BY id DESC
        LIMIT 20
    """)

    rows = cursor.fetchall()
    conn.close()

    history = [dict(row) for row in reversed(rows)]

    return jsonify(history)
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)