/**
 * Sliding Window Flow Control Simulator
 * JavaScript Logic & Animation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const totalFramesInput = document.getElementById('totalFrames');
    const windowSizeInput = document.getElementById('windowSize');
    const transTimeInput = document.getElementById('transTime');
    const netDelayInput = document.getElementById('netDelay');

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');

    const senderFramesQueue = document.getElementById('senderFramesQueue');
    const receiverFramesQueue = document.getElementById('receiverFramesQueue');
    const frameLane = document.getElementById('frameLane');
    const ackLane = document.getElementById('ackLane');
    const windowRangeTag = document.getElementById('windowRangeTag');

    const statTotalFrames = document.getElementById('statTotalFrames');
    const statWindowSize = document.getElementById('statWindowSize');
    const statSentCount = document.getElementById('statSentCount');
    const statAckCount = document.getElementById('statAckCount');
    const statRounds = document.getElementById('statRounds');
    const statEfficiency = document.getElementById('statEfficiency');
    const efficiencyBarFill = document.getElementById('efficiencyBarFill');
    const eventLog = document.getElementById('eventLog');

    // --- Simulation State Variables ---
    let totalFrames = 8;
    let windowSize = 3;
    let transTime = 1000; // ms
    let netDelay = 1000;   // ms

    let framesState = []; // Array of { id, status: 'waiting' | 'in-window' | 'sent' | 'ack' }
    let windowStart = 0;
    let nextFrameToSend = 0;
    
    let isRunning = false;
    let isPaused = false;
    
    let sentCount = 0;
    let ackCount = 0;
    let roundsCount = 0;
    
    let activeTimers = [];

    // --- Initialize Simulator ---
    initSimulation();

    // Event Listeners for Control Buttons
    startBtn.addEventListener('click', handleStart);
    pauseBtn.addEventListener('click', handlePause);
    resetBtn.addEventListener('click', initSimulation);
    clearLogBtn.addEventListener('click', () => {
        eventLog.innerHTML = '';
        addLogEntry('Log cleared.', 'log-system');
    });

    // Input Change Listeners
    [totalFramesInput, windowSizeInput, transTimeInput, netDelayInput].forEach(input => {
        input.addEventListener('change', () => {
            if (!isRunning) {
                initSimulation();
            }
        });
    });

    /**
     * Resets state and prepares UI for a fresh simulation run
     */
    function initSimulation() {
        // Clear active timers
        activeTimers.forEach(timer => clearTimeout(timer));
        activeTimers = [];

        isRunning = false;
        isPaused = false;

        // Read and sanitize input values
        totalFrames = Math.max(1, Math.min(20, parseInt(totalFramesInput.value) || 8));
        windowSize = Math.max(1, Math.min(totalFrames, parseInt(windowSizeInput.value) || 3));
        transTime = Math.max(200, parseInt(transTimeInput.value) || 1000);
        netDelay = Math.max(200, parseInt(netDelayInput.value) || 1000);

        // Normalize inputs in UI
        totalFramesInput.value = totalFrames;
        windowSizeInput.value = windowSize;

        // Reset Counters
        sentCount = 0;
        ackCount = 0;
        roundsCount = 0;
        windowStart = 0;
        nextFrameToSend = 0;

        // Initialize frame state list
        framesState = [];
        for (let i = 1; i <= totalFrames; i++) {
            framesState.push({
                id: i,
                status: i <= windowSize ? 'in-window' : 'waiting'
            });
        }

        // Reset UI Elements
        updateButtons(false);
        renderSenderFrames();
        renderReceiverFrames([]);
        clearAnimationLanes();
        updateStats();
        updateWindowRangeTag();

        eventLog.innerHTML = '';
        addLogEntry(`Simulator initialized: ${totalFrames} frames, Window Size = ${windowSize}`, 'log-system');
    }

    /**
     * Start / Resume Simulation
     */
    function handleStart() {
        if (!isRunning) {
            isRunning = true;
            isPaused = false;
            updateButtons(true);
            addLogEntry(`Starting Sliding Window simulation...`, 'log-system');
            processSimulationStep();
        } else if (isPaused) {
            isPaused = false;
            pauseBtn.innerHTML = '<span>⏸</span> Pause';
            pauseBtn.classList.remove('btn-primary');
            pauseBtn.classList.add('btn-secondary');
            addLogEntry(`Simulation resumed.`, 'log-system');
            processSimulationStep();
        }
    }

    /**
     * Pause Simulation
     */
    function handlePause() {
        if (!isRunning) return;

        if (!isPaused) {
            isPaused = true;
            pauseBtn.innerHTML = '<span>▶</span> Resume';
            pauseBtn.classList.remove('btn-secondary');
            pauseBtn.classList.add('btn-primary');
            addLogEntry(`Simulation paused by user.`, 'log-system');
        } else {
            handleStart();
        }
    }

    /**
     * Main Simulation Step Controller
     * Sends frames within current sliding window sequentially
     */
    function processSimulationStep() {
        if (!isRunning || isPaused) return;

        // Check if all frames have been acknowledged
        if (ackCount >= totalFrames) {
            isRunning = false;
            updateButtons(false);
            addLogEntry(`🎉 All ${totalFrames} frames successfully transmitted and acknowledged!`, 'log-ack');
            calculateEfficiency();
            return;
        }

        // Find available frame inside current window to transmit
        const windowEnd = Math.min(windowStart + windowSize, totalFrames);
        
        if (nextFrameToSend < windowEnd) {
            const frameIndex = nextFrameToSend;
            const frameId = framesState[frameIndex].id;

            // Increment transmission stats
            sentCount++;
            if (nextFrameToSend === windowStart) {
                roundsCount++;
            }

            framesState[frameIndex].status = 'sent';
            renderSenderFrames();
            updateStats();

            addLogEntry(`[Round ${roundsCount}] Sender -> Transmitting Frame ${frameId}`, 'log-sent');

            // Move to next frame in window
            nextFrameToSend++;

            // Trigger visual frame animation on channel track
            animateFrameTransmission(frameId, () => {
                if (!isRunning) return;
                
                // Frame reached receiver
                addLogEntry(`Receiver <- Received Frame ${frameId}. Generating ACK ${frameId}...`, 'log-system');
                addReceiverFrame(frameId);

                // Animate ACK returning from Receiver to Sender
                animateAckReturn(frameId, () => {
                    if (!isRunning) return;

                    // ACK received at Sender
                    ackCount++;
                    framesState[frameIndex].status = 'ack';
                    addLogEntry(`Sender <- Received ACK ${frameId}`, 'log-ack');

                    // Slide window forward if this is the leftmost frame in window
                    slideWindowIfPossible();

                    renderSenderFrames();
                    updateStats();
                    updateWindowRangeTag();

                    // Continue simulation loop
                    const timer = setTimeout(processSimulationStep, 400);
                    activeTimers.push(timer);
                });
            });

            // Schedule next frame in window transmission if available
            if (nextFrameToSend < windowEnd) {
                const timer = setTimeout(processSimulationStep, transTime * 0.6);
                activeTimers.push(timer);
            }
        }
    }

    /**
     * Slides window forward as long as leading frames are acknowledged
     */
    function slideWindowIfPossible() {
        let prevStart = windowStart;

        while (windowStart < totalFrames && framesState[windowStart].status === 'ack') {
            windowStart++;
        }

        if (windowStart > prevStart) {
            // Update frame statuses for new frames entering the window
            const newWindowEnd = Math.min(windowStart + windowSize, totalFrames);
            for (let i = windowStart; i < newWindowEnd; i++) {
                if (framesState[i].status === 'waiting') {
                    framesState[i].status = 'in-window';
                }
            }

            const currentWindowRange = getWindowRangeString();
            addLogEntry(`▶ Window Slid Forward! New Active Window: ${currentWindowRange}`, 'log-slide');
        }
    }

    /**
     * Animates Frame packet traveling from Sender (Left) to Receiver (Right)
     */
    function animateFrameTransmission(frameId, onComplete) {
        const packet = document.createElement('div');
        packet.className = 'packet packet-frame';
        packet.innerHTML = `📦 Frame ${frameId}`;
        packet.style.left = '0%';
        frameLane.appendChild(packet);

        const duration = transTime + netDelay;
        const startTime = Date.now();

        function step() {
            if (isPaused) {
                // Hold animation while paused
                const timer = setTimeout(step, 100);
                activeTimers.push(timer);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            packet.style.left = `${progress * 85}%`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                packet.remove();
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Animates ACK packet traveling from Receiver (Right) to Sender (Left)
     */
    function animateAckReturn(frameId, onComplete) {
        const packet = document.createElement('div');
        packet.className = 'packet packet-ack';
        packet.innerHTML = `✅ ACK ${frameId}`;
        packet.style.right = '0%';
        ackLane.appendChild(packet);

        const duration = netDelay;
        const startTime = Date.now();

        function step() {
            if (isPaused) {
                const timer = setTimeout(step, 100);
                activeTimers.push(timer);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            packet.style.right = `${progress * 85}%`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                packet.remove();
                if (onComplete) onComplete();
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Render Frame Boxes in Sender Section
     */
    function renderSenderFrames() {
        senderFramesQueue.innerHTML = '';
        framesState.forEach(frame => {
            const box = document.createElement('div');
            box.className = `frame-box ${frame.status}`;
            box.id = `sender-frame-${frame.id}`;
            
            let statusLabel = frame.status.replace('-', ' ');
            if (frame.status === 'ack') statusLabel = 'ACK\'d';
            
            box.innerHTML = `
                <div class="frame-num">F${frame.id}</div>
                <div class="frame-status-lbl">${statusLabel}</div>
            `;
            senderFramesQueue.appendChild(box);
        });
    }

    /**
     * Add frame box to Receiver Section
     */
    function addReceiverFrame(frameId) {
        let box = document.getElementById(`receiver-frame-${frameId}`);
        if (!box) {
            box = document.createElement('div');
            box.className = 'frame-box ack';
            box.id = `receiver-frame-${frameId}`;
            box.innerHTML = `
                <div class="frame-num">F${frameId}</div>
                <div class="frame-status-lbl">Received</div>
            `;
            receiverFramesQueue.appendChild(box);
        }
    }

    function renderReceiverFrames(list) {
        receiverFramesQueue.innerHTML = '';
    }

    function clearAnimationLanes() {
        frameLane.innerHTML = '';
        ackLane.innerHTML = '';
    }

    /**
     * Update Statistics Summary
     */
    function updateStats() {
        statTotalFrames.textContent = totalFrames;
        statWindowSize.textContent = windowSize;
        statSentCount.textContent = sentCount;
        statAckCount.textContent = ackCount;
        statRounds.textContent = roundsCount;

        calculateEfficiency();
    }

    /**
     * Calculate and display Network Efficiency
     * Efficiency = (Successful Transmissions / Total Transmissions) * 100
     */
    function calculateEfficiency() {
        let eff = 0;
        if (sentCount > 0) {
            eff = Math.round((ackCount / sentCount) * 100);
        }
        statEfficiency.textContent = `${eff}%`;
        efficiencyBarFill.style.width = `${eff}%`;
    }

    /**
     * Update Window Range Tag [1 2 3]
     */
    function updateWindowRangeTag() {
        windowRangeTag.textContent = `Window: ${getWindowRangeString()}`;
    }

    function getWindowRangeString() {
        const activeFrames = [];
        const windowEnd = Math.min(windowStart + windowSize, totalFrames);
        for (let i = windowStart; i < windowEnd; i++) {
            activeFrames.push(framesState[i].id);
        }
        return activeFrames.length > 0 ? `[${activeFrames.join(' ')}]` : '[Done]';
    }

    /**
     * Helper to update UI Buttons state
     */
    function updateButtons(running) {
        startBtn.disabled = running && !isPaused;
        pauseBtn.disabled = !running;
        totalFramesInput.disabled = running;
        windowSizeInput.disabled = running;
    }

    /**
     * Log Entry Helper
     */
    function addLogEntry(message, typeClass = 'log-system') {
        const time = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = `log-entry ${typeClass}`;
        entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
        eventLog.appendChild(entry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }
});
