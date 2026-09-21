from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Route to render the main HTML page
@app.route('/')
def index():
    return render_template('index.html')

# API Route for calculating theoretical network efficiency (Optional backend utility)
@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        total_frames = int(data.get('total_frames', 8))
        window_size = int(data.get('window_size', 3))
        transmission_time = float(data.get('transmission_time', 1000)) # in ms
        network_delay = float(data.get('network_delay', 1000))         # propagation delay in ms

        # Calculate Round Trip Time (RTT) ~ 2 * network_delay
        rtt = 2 * network_delay
        # Ratio 'a' = Propagation Delay / Transmission Time
        a = network_delay / transmission_time if transmission_time > 0 else 0
        
        # Maximum Theoretical Efficiency = W / (1 + 2a)
        theoretical_efficiency = min(100.0, round((window_size / (1 + 2 * a)) * 100, 2))
        
        return jsonify({
            'success': True,
            'total_frames': total_frames,
            'window_size': window_size,
            'rtt': rtt,
            'theoretical_efficiency': theoretical_efficiency
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    print("=" * 60)
    print(" Sliding Window Flow Control Simulator Started!")
    print(" Access URL in your web browser: http://127.0.0.1:5000")
    print(" Press CTRL+C to stop the server.")
    print("=" * 60)
    app.run(debug=True, host='127.0.0.1', port=5000)
