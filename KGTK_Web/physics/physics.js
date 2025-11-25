window.PhysicsModule = {
    init: function() {
        console.log('Physics Module đã khởi tạo');
        this.initPendulumSimulation();
        this.initWaveSimulation();
        
        this.setupTabs();

        if (this.redrawPendulum) {
            this.redrawPendulum();
        }
    },
    
    setupTabs: function() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId + '-tab').classList.add('active');
                
                if (tabId === 'pendulum' && window.PhysicsModule.redrawPendulum) {
                    window.PhysicsModule.redrawPendulum();
                } else if (tabId === 'wave' && window.PhysicsModule.redrawWave) {
                    window.PhysicsModule.redrawWave();
                }
            });
        });
        
        const defaultTabButton = document.querySelector('.tab-button[data-tab="pendulum"]');
        if (defaultTabButton) {
            defaultTabButton.classList.add('active');
            document.getElementById('pendulum-tab').classList.add('active');
        }
    },

    initPendulumSimulation: function() {
        const canvas = document.getElementById('pendulum-canvas');
        const ctx = canvas.getContext('2d');
        
        let animationId;
        let isRunning = false;
        let time = 0;
        
        let length = 1.5; 
        let initialAngle = 30 * Math.PI / 180; 
        let angle = initialAngle; 
        let mass = 1; 
        let gravity = 9.8; 
        
        let angularVelocity = 0;
        let initialTotalEnergy = 0;
        
        const lengthSlider = document.getElementById('pendulum-length');
        const angleSlider = document.getElementById('pendulum-angle');
        const massSlider = document.getElementById('pendulum-mass');
        const gravitySlider = document.getElementById('pendulum-gravity');
        const periodSlider = document.getElementById('pendulum-period');
        const frequencySlider = document.getElementById('pendulum-frequency');
        const angularFrequencySlider = document.getElementById('pendulum-angular-frequency');
        
        const lengthValue = document.getElementById('length-value');
        const angleValue = document.getElementById('angle-value');
        const massValue = document.getElementById('mass-value');
        const gravityValue = document.getElementById('gravity-value');
        const periodDisplay = document.getElementById('period-display');
        const frequencyDisplay = document.getElementById('frequency-display');
        const angularFrequencyDisplay = document.getElementById('angular-frequency-display');
        
        const startButton = document.getElementById('pendulum-start');
        const pauseButton = document.getElementById('pendulum-pause');
        const resetButton = document.getElementById('pendulum-reset');
        
        function calculatePhysicsParameters() {
            const period = 2 * Math.PI * Math.sqrt(length / gravity);
            const frequency = 1 / period;
            const angularFrequency = Math.sqrt(gravity / length);
            
            return { period, frequency, angularFrequency };
        }
        
        function calculateInitialEnergy() {
            const height = length * (1 - Math.cos(initialAngle));
            initialTotalEnergy = mass * gravity * height;
        }

        function updateInfo() {
            const { period, frequency, angularFrequency } = calculatePhysicsParameters();
            const currentAngleDeg = (angle * 180 / Math.PI).toFixed(2);
            
            document.getElementById('period-value').textContent = period.toFixed(2) + ' s';
            document.getElementById('frequency-value').textContent = frequency.toFixed(2) + ' Hz';
            document.getElementById('angular-frequency-value').textContent = angularFrequency.toFixed(2) + ' rad/s';
            document.getElementById('current-angle-value').textContent = currentAngleDeg + '°';
            
            const height = length * (1 - Math.cos(angle));
            const potentialEnergy = mass * gravity * height;
            
            const velocity = Math.abs(angularVelocity) * length;
            const kineticEnergy = 0.5 * mass * velocity * velocity;
            
            const currentTotalEnergy = potentialEnergy + kineticEnergy; 
            
            const totalEnergyReference = currentTotalEnergy > 0 ? currentTotalEnergy : initialTotalEnergy;
            
            const potentialPercent = (potentialEnergy / totalEnergyReference) * 100;
            const kineticPercent = (kineticEnergy / totalEnergyReference) * 100;
            
            const totalPercent = 100;
            
            document.getElementById('potential-energy').style.width = Math.min(100, Math.max(0, potentialPercent)) + '%';
            document.getElementById('kinetic-energy').style.width = Math.min(100, Math.max(0, kineticPercent)) + '%';
            document.getElementById('total-energy').style.width = Math.min(100, Math.max(0, totalPercent)) + '%';
            
            document.getElementById('potential-percent').textContent = Math.round(potentialPercent) + '%';
            document.getElementById('kinetic-percent').textContent = Math.round(kineticPercent) + '%';
            document.getElementById('total-percent').textContent = Math.round(totalPercent) + '%';
        }

        let trajectory = [];
        let showTrajectory = false;
        function drawPendulum() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (canvas.width <= 0 || canvas.height <= 0) return;

            const pivotX = canvas.width / 2;
            const pivotY = canvas.height / 4;
            const bobX = pivotX + length * 100 * Math.sin(angle);
            const bobY = pivotY + length * 100 * Math.cos(angle);
            
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(bobX, bobY);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const bobRadius = 15 + mass * 5;
            ctx.beginPath();
            ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const indicatorLength = length * 80;
            const indicatorX = pivotX + indicatorLength * Math.sin(initialAngle);
            const indicatorY = pivotY + indicatorLength * Math.cos(initialAngle);
            
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(indicatorX, indicatorY);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#3b82f6';
            ctx.font = '14px Arial';
            ctx.fillText(`θ = ${(initialAngle * 180 / Math.PI).toFixed(1)}°`, pivotX + 20, pivotY - 20);
            
            ctx.fillStyle = '#10b981';
            ctx.fillText(`θ hiện tại = ${(angle * 180 / Math.PI).toFixed(1)}°`, pivotX + 20, pivotY + 20);
            
            if (showTrajectory && trajectory.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                ctx.lineWidth = 2;
                ctx.moveTo(trajectory[0].x, trajectory[0].y);
                for (let i = 1; i < trajectory.length; i++) {
                    ctx.lineTo(trajectory[i].x, trajectory[i].y);
                }
                ctx.stroke();
            }
        }

        function resetSimulation() {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            time = 0;
            angle = initialAngle;
            angularVelocity = 0;
            calculateInitialEnergy();
            drawPendulum();
            updateInfo();
        }

        function animate() {
            if (!isRunning) return;
            
            const dt = 0.016; 
            
            //Sử dụng Runge-Kutta 4th Order (RK4) để tăng độ chính xác 
            
            function dydt(theta) {
                return -gravity / length * Math.sin(theta);
            }
            
            const k1_v = dydt(angle) * dt;
            const k1_a = angularVelocity * dt;

            const k2_v = dydt(angle + k1_a / 2) * dt;
            const k2_a = (angularVelocity + k1_v / 2) * dt;

            const k3_v = dydt(angle + k2_a / 2) * dt;
            const k3_a = (angularVelocity + k2_v / 2) * dt;
            
            const k4_v = dydt(angle + k3_a) * dt;
            const k4_a = (angularVelocity + k3_v) * dt;

            angularVelocity += (k1_v + 2 * k2_v + 2 * k3_v + k4_v) / 6;
            angle += (k1_a + 2 * k2_a + 2 * k3_a + k4_a) / 6;
            
            time += dt;
            
            if (showTrajectory) {
                const pivotX = canvas.width / 2;
                const pivotY = canvas.height / 4;
                trajectory.push({ x: pivotX + length * 100 * Math.sin(angle), y: pivotY + length * 100 * Math.cos(angle) });
                if (trajectory.length > 1000) trajectory.shift();
            }
            
            drawPendulum();
            updateInfo();
            
            animationId = requestAnimationFrame(animate);
        }
        
        const updatePhysicsSliders = () => {
            const { period, frequency, angularFrequency } = calculatePhysicsParameters();
            
            periodSlider.value = period.toFixed(1);
            frequencySlider.value = frequency.toFixed(2);
            angularFrequencySlider.value = angularFrequency.toFixed(1);
            
            periodDisplay.textContent = period.toFixed(1);
            frequencyDisplay.textContent = frequency.toFixed(2);
            angularFrequencyDisplay.textContent = angularFrequency.toFixed(1);
        };
        
        const updateLengthFromPhysics = (param, value) => {
            let newLength;
            
            switch(param) {
                case 'period':
                    newLength = (Math.pow(value, 2) * gravity) / (4 * Math.pow(Math.PI, 2));
                    break;
                case 'frequency':
                    newLength = gravity / (4 * Math.pow(Math.PI, 2) * Math.pow(value, 2));
                    break;
                case 'angularFrequency':
                    newLength = gravity / Math.pow(value, 2);
                    break;
                default:
                    return;
            }
            
            newLength = Math.max(0.5, Math.min(3, newLength));
            
            lengthSlider.value = newLength.toFixed(1);
            lengthValue.textContent = newLength.toFixed(1);
            length = newLength;
        };

        lengthSlider.addEventListener('input', () => {
            length = parseFloat(lengthSlider.value);
            lengthValue.textContent = length;
            updatePhysicsSliders();
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        angleSlider.addEventListener('input', () => {
            initialAngle = parseFloat(angleSlider.value) * Math.PI / 180;
            angle = initialAngle;
            angleValue.textContent = angleSlider.value;
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        massSlider.addEventListener('input', () => {
            mass = parseFloat(massSlider.value);
            massValue.textContent = mass;
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        gravitySlider.addEventListener('input', () => {
            gravity = parseFloat(gravitySlider.value);
            gravityValue.textContent = gravity;
            updatePhysicsSliders();
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        periodSlider.addEventListener('input', () => {
            const periodValue = parseFloat(periodSlider.value);
            periodDisplay.textContent = periodValue.toFixed(1);
            const frequencyValue = 1 / periodValue;
            const angularFrequencyValue = 2 * Math.PI / periodValue;
            frequencySlider.value = frequencyValue.toFixed(2);
            frequencyDisplay.textContent = frequencyValue.toFixed(2);
            angularFrequencySlider.value = angularFrequencyValue.toFixed(2);
            angularFrequencyDisplay.textContent = angularFrequencyValue.toFixed(2);
            updateLengthFromPhysics('period', periodValue);
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        frequencySlider.addEventListener('input', () => {
            const frequencyValue = parseFloat(frequencySlider.value);
            frequencyDisplay.textContent = frequencyValue.toFixed(2);
            const periodValue = 1 / frequencyValue;
            const angularFrequencyValue = 2 * Math.PI * frequencyValue;
            periodSlider.value = periodValue.toFixed(1);
            periodDisplay.textContent = periodValue.toFixed(1);
            angularFrequencySlider.value = angularFrequencyValue.toFixed(2);
            angularFrequencyDisplay.textContent = angularFrequencyValue.toFixed(2);
            updateLengthFromPhysics('frequency', frequencyValue);
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        angularFrequencySlider.addEventListener('input', () => {
            const angularFrequencyValue = parseFloat(angularFrequencySlider.value);
            angularFrequencyDisplay.textContent = angularFrequencyValue.toFixed(2);
            const periodValue = 2 * Math.PI / angularFrequencyValue;
            const frequencyValue = angularFrequencyValue / (2 * Math.PI);
            periodSlider.value = periodValue.toFixed(1);
            periodDisplay.textContent = periodValue.toFixed(1);
            frequencySlider.value = frequencyValue.toFixed(2);
            frequencyDisplay.textContent = frequencyValue.toFixed(2);
            updateLengthFromPhysics('angularFrequency', angularFrequencyValue);
            isRunning = false;
            showTrajectory = false;
            trajectory = [];
            resetSimulation();
        });
        
        startButton.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                showTrajectory = true;
                trajectory = [];
                animate();
            }
        });
        
        pauseButton.addEventListener('click', () => {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
        
        resetButton.addEventListener('click', () => {
            resetSimulation();
            showTrajectory = false;
            trajectory = [];
        });
        
        window.PhysicsModule.redrawPendulum = function() {
            const currentCanvas = document.getElementById('pendulum-canvas');
            if (currentCanvas.offsetWidth > 0) {
                currentCanvas.width = currentCanvas.offsetWidth;
                currentCanvas.height = currentCanvas.offsetHeight;
                calculateInitialEnergy();
                drawPendulum();
                updateInfo();
            }
        };
        window.addEventListener('resize', window.PhysicsModule.redrawPendulum);
        updatePhysicsSliders();
    },

    initWaveSimulation: function() {
        const canvas = document.getElementById('wave-canvas');
        const ctx = canvas.getContext('2d');
        
        let animationId;
        let isRunning = false;
        let time = 0;
        
        let frequency = 1.5;
        let amplitude = 5; 
        let harmonic = 1; 
        let tension = 5; 

        const frequencySlider = document.getElementById('wave-frequency');
        const amplitudeSlider = document.getElementById('wave-amplitude');
        const harmonicSlider = document.getElementById('wave-harmonic');
        const tensionSlider = document.getElementById('wave-tension');
        
        const frequencyDisplay = document.getElementById('wave-freq-display');
        const amplitudeDisplay = document.getElementById('amplitude-display');
        const harmonicDisplay = document.getElementById('harmonic-display');
        const tensionDisplay = document.getElementById('tension-display');
        
        const startButton = document.getElementById('wave-start');
        const pauseButton = document.getElementById('wave-pause');
        const resetButton = document.getElementById('wave-reset');

        function updateNodesDisplay(nodePositions) {
            const nodesContainer = document.getElementById('nodes-positions');
            nodesContainer.innerHTML = '';
            
            const stringLength = canvas.width - 100;
            nodePositions.forEach((pos, index) => {
                const nodeElement = document.createElement('div');
                nodeElement.className = 'node-position';
                const positionPercent = ((pos - 50) / stringLength * 100).toFixed(1);
                nodeElement.textContent = `Nút ${index + 1}: ${positionPercent}%`;
                nodesContainer.appendChild(nodeElement);
            });
        }
        
        function updateWaveInfo() {
            const stringLength = (canvas.width - 100) / 100; 
            const linearDensity = 0.01; 
            const waveVelocity = Math.sqrt(tension / linearDensity);
            const wavelength = 2 * stringLength / harmonic;
            
            document.getElementById('wavelength-value').textContent = wavelength.toFixed(1) + ' m';
            document.getElementById('velocity-value').textContent = waveVelocity.toFixed(1) + ' m/s';
            document.getElementById('wave-freq-value').textContent = frequency.toFixed(1) + ' Hz';
            document.getElementById('antinodes-value').textContent = harmonic;
            document.getElementById('nodes-value').textContent = harmonic + 1;
        }

        function drawWave() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const stringLength = canvas.width - 100;
            
            if (stringLength <= 0 || canvas.height <= 0) return;
            
            const angularFrequency = 2 * Math.PI * frequency;
            
            ctx.beginPath();
            ctx.arc(50, canvas.height / 2, 5, 0, Math.PI * 2);
            ctx.arc(canvas.width - 50, canvas.height / 2, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(50, canvas.height / 2);
            ctx.lineTo(canvas.width - 50, canvas.height / 2);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.beginPath();
            
            for (let x = 0; x <= stringLength; x++) {
                const position = x / stringLength;
                const y = amplitude * Math.sin(harmonic * Math.PI * position) * Math.cos(angularFrequency * time);
                
                const canvasX = 50 + x;
                const canvasY = canvas.height / 2 - y * 5; 
                
                if (x === 0) {
                    ctx.moveTo(canvasX, canvasY);
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            const nodePositions = [];
            const antinodeCount = harmonic;
            const nodeCount = harmonic + 1;
            
            for (let i = 0; i < nodeCount; i++) {
                const nodeX = 50 + (i * stringLength) / harmonic;
                nodePositions.push(nodeX);
                
                ctx.beginPath();
                ctx.arc(nodeX, canvas.height / 2, 5, 0, Math.PI * 2);
                ctx.fillStyle = i === 0 || i === nodeCount - 1 ? '#3b82f6' : '#10b981';
                ctx.fill();
            }
            
            for (let i = 0; i < antinodeCount; i++) {
                const antinodeX = 50 + ((i + 0.5) * stringLength) / harmonic;
                
                ctx.beginPath();
                ctx.arc(antinodeX, canvas.height / 2, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
            }
            
            updateNodesDisplay(nodePositions);
        }
        
        function animateWave() {
            if (!isRunning) return;
            
            const dt = 0.016; 
            time += dt;
            
            drawWave();
            
            animationId = requestAnimationFrame(animateWave);
        }

        frequencySlider.addEventListener('input', () => {
            frequency = parseFloat(frequencySlider.value);
            frequencyDisplay.textContent = frequency;
            updateWaveInfo();
            if (!isRunning) drawWave();
        });
        
        amplitudeSlider.addEventListener('input', () => {
            amplitude = parseFloat(amplitudeSlider.value);
            amplitudeDisplay.textContent = amplitude;
            if (!isRunning) drawWave();
        });
        
        harmonicSlider.addEventListener('input', () => {
            harmonic = parseInt(harmonicSlider.value);
            harmonicDisplay.textContent = harmonic;
            updateWaveInfo();
            if (!isRunning) drawWave();
        });
        
        tensionSlider.addEventListener('input', () => {
            tension = parseFloat(tensionSlider.value);
            tensionDisplay.textContent = tension;
            updateWaveInfo();
            if (!isRunning) drawWave();
        });

        startButton.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                animateWave();
            }
        });
        
        pauseButton.addEventListener('click', () => {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
        
        resetButton.addEventListener('click', () => {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            time = 0;
            drawWave();
        });

        window.PhysicsModule.redrawWave = function() {
            const currentCanvas = document.getElementById('wave-canvas');
            if (currentCanvas.offsetWidth > 0) {
                currentCanvas.width = currentCanvas.offsetWidth;
                currentCanvas.height = currentCanvas.offsetHeight;
                drawWave();
                updateWaveInfo();
            }
        };
        window.addEventListener('resize', window.PhysicsModule.redrawWave);
    }
};