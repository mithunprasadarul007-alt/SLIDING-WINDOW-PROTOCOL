# Sliding Window Flow Control Simulator for Reliable Data Transmission

A beginner-friendly, interactive web project built for a 2nd-unit Computer Networks mini project. This project visually demonstrates how the **Sliding Window Protocol** works to ensure reliable, flow-controlled data transmission over a network link.

---

## 📁 Project Folder Structure

```text
cn project/
│
├── app.py                  # Flask Python backend server
├── README.md               # Project documentation & run guide
│
├── templates/
│   └── index.html          # HTML structure & visual layout
│
└── static/
    ├── style.css           # Styling system & dark theme UI
    └── script.js           # Simulation engine & frame animation logic
```

---

## 🛠️ Technologies Used

* **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6)
* **Backend**: Python 3.x with Flask Framework
* **Dependencies**: Flask (`pip install flask`)
* **No Database or external server required** — runs 100% locally!

---

## ⚙️ Installation & Running Instructions

### Step 1: Install Flask
Open your terminal (Command Prompt, Windows PowerShell, or VS Code Terminal) and execute:

```bash
pip install flask
```

### Step 2: Navigate to Project Directory
Make sure your terminal is inside the project directory:

```bash
cd "c:\Users\mithu\OneDrive\Desktop\cn project"
```

### Step 3: Start the Flask Server
Run the application using Python:

```bash
python app.py
```

You should see output similar to:
```text
============================================================
 Sliding Window Flow Control Simulator Started!
 Access URL in your web browser: http://127.0.0.1:5000
 Press CTRL+C to stop the server.
============================================================
 * Running on http://127.0.0.1:5000
```

### Step 4: Open in Web Browser
Open your web browser (Google Chrome, Microsoft Edge, Firefox) and go to:

👉 **`http://127.0.0.1:5000`**

---

## 📄 File Responsibilities

1. **`app.py`**: Lightweight Python Flask web server. Serves the web interface (`index.html`) and static assets. Also contains a calculation API route `/api/calculate` for computing theoretical network metrics.
2. **`templates/index.html`**: Defines the user interface, including input fields, simulation control buttons, Sender section, channel tracks, Receiver section, metrics cards, and event log.
3. **`static/style.css`**: Provides a modern, dark-themed user interface using CSS Grid, Flexbox, glassmorphism, color-coded frame badges, glowing status indicators, and responsive layouts.
4. **`static/script.js`**: Contains the core simulation engine. Manages frame state transitions (`Waiting` ➔ `In Window` ➔ `Sent` ➔ `Acknowledged`), animates moving packet elements across the channel, updates live network statistics, and slides the window forward.
5. **`README.md`**: Complete instructions on setting up, running, testing, and understanding the project.

---

## 🔄 How Sliding Window Protocol Works in This Project

In reliable data transmission, **Flow Control** prevents a fast sender from overwhelming a slow receiver. The **Sliding Window Protocol** achieves this as follows:

1. **Window Size ($N$)**: The sender is permitted to transmit up to $N$ frames without waiting for an acknowledgement (ACK).
2. **Initial Window**: If $N = 3$, the initial window contains frames `[1 2 3]`.
3. **Transmission**: The sender transmits frames in the active window sequentially:
   `Sender ➔ Frame 1 ➔ Receiver`
4. **Acknowledgement (ACK)**: When the receiver accepts Frame 1, it sends back `ACK 1`:
   `Receiver ➔ ACK 1 ➔ Sender`
5. **Window Sliding**: Once the sender receives `ACK 1`, Frame 1 is marked `Acknowledged`, and the window **slides forward by 1 position**:
   `[1 2 3] ➔ [2 3 4]`
   Frame 4 enters the sliding window and is ready for transmission.
6. **Efficiency Calculation**:
   $$\text{Efficiency (\%)} = \left( \frac{\text{Successful ACKs Received}}{\text{Total Frame Transmissions Attempted}} \right) \times 100$$

---

## 🧪 Testing the Simulator with Sample Values

Try the following test configurations to see how changing parameters impacts transmission:

### Test Case 1: Standard Run
* **Total Frames**: `8`
* **Window Size**: `3`
* **Frame Transmission Time**: `1000` ms
* **Network Delay**: `1000` ms
* **Expected Result**: Window slides from `[1 2 3]` to `[2 3 4]`, `[3 4 5]`, up to `[6 7 8]`. Final efficiency will reach **100%**.

### Test Case 2: Larger Window Size
* **Total Frames**: `10`
* **Window Size**: `5`
* **Frame Transmission Time**: `800` ms
* **Network Delay**: `1000` ms
* **Expected Result**: Frames `[1 2 3 4 5]` enter the window together. Observe faster pipeline throughput!

---

## 🛑 How to Stop the Project

To stop the Flask server, go back to your terminal window and press:
`CTRL + C`
