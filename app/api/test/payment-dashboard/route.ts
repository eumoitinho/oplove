import { type NextRequest, NextResponse } from "next/server"

// Prevent running in production
if (process.env.NODE_ENV === "production") {
  throw new Error("Test routes are not allowed in production")
}

export async function GET(request: NextRequest) {
  // Environment check
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Test routes are only available in development environment" },
      { status: 403 }
    )
  }

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenLove - Payment Testing Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        purple: {
                            600: '#9333ea',
                            700: '#7c3aed',
                            800: '#6b21a8'
                        },
                        pink: {
                            500: '#ec4899',
                            600: '#db2777'
                        },
                        cyan: {
                            600: '#0891b2'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-purple-400 mb-2">OpenLove Payment Testing Dashboard</h1>
            <p class="text-gray-400">Test payment integrations for Stripe and AbacatePay</p>
            <div class="mt-2 px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full inline-block text-sm">
                🚧 Development Environment Only
            </div>
        </div>

        <!-- Test Results -->
        <div id="results" class="mb-8 hidden">
            <h2 class="text-xl font-semibold mb-4">Test Results</h2>
            <div id="result-content" class="bg-gray-800 rounded-lg p-4 border"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Stripe Testing -->
            <div class="bg-gray-800 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <h2 class="text-xl font-semibold text-purple-400">Stripe Subscription Test</h2>
                    <span class="ml-2 px-2 py-1 bg-purple-600 text-xs rounded">International Cards</span>
                </div>
                
                <form id="stripe-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Plan</label>
                        <select name="plan" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            <option value="gold">Gold - R$ 25,00/mês</option>
                            <option value="diamond">Diamond - R$ 45,00/mês</option>
                            <option value="couple">Couple - R$ 69,90/mês</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Test Scenario</label>
                        <select name="test_scenario" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            <option value="success">✅ Success (4242424242424242)</option>
                            <option value="decline_generic">❌ Generic Decline</option>
                            <option value="decline_insufficient_funds">💳 Insufficient Funds</option>
                            <option value="decline_lost_card">🚫 Lost Card</option>
                            <option value="decline_stolen_card">🚫 Stolen Card</option>
                            <option value="require_authentication">🔐 Requires 3D Secure</option>
                            <option value="charge_dispute">⚖️ Future Dispute</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Customer Email</label>
                        <input type="email" name="customer_email" value="test@openlove.com" 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Billing Cycle</label>
                        <select name="billing_cycle" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <button type="submit" 
                            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
                        Test Stripe Subscription
                    </button>
                </form>

                <div class="mt-4 p-3 bg-gray-700 rounded text-sm">
                    <h4 class="font-medium mb-2">Test Card Numbers:</h4>
                    <ul class="space-y-1 text-xs text-gray-300">
                        <li>✅ Success: 4242 4242 4242 4242</li>
                        <li>❌ Generic Decline: 4000 0000 0000 0002</li>
                        <li>💳 Insufficient Funds: 4000 0000 0000 9995</li>
                        <li>🔐 3D Secure: 4000 0025 0000 3155</li>
                    </ul>
                </div>
            </div>

            <!-- AbacatePay PIX Testing -->
            <div class="bg-gray-800 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <h2 class="text-xl font-semibold text-cyan-400">AbacatePay PIX Test</h2>
                    <span class="ml-2 px-2 py-1 bg-cyan-600 text-xs rounded">Brazilian PIX</span>
                </div>
                
                <form id="pix-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Plan</label>
                        <select name="plan" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            <option value="gold">Gold - R$ 25,00/mês</option>
                            <option value="diamond">Diamond - R$ 45,00/mês</option>
                            <option value="couple">Couple - R$ 69,90/mês</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Customer Name</label>
                        <input type="text" name="customer_name" value="João da Silva Test" 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Customer Email</label>
                        <input type="email" name="customer_email" value="test@openlove.com" 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Customer CPF (Optional)</label>
                        <input type="text" name="customer_document" value="12345678900" 
                               placeholder="11 digits"
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Billing Cycle</label>
                        <select name="billing_cycle" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input type="checkbox" name="simulate_payment" checked 
                                   class="mr-2 bg-gray-700 border-gray-600">
                            Auto-simulate payment
                        </label>
                        <div class="flex items-center">
                            <label class="text-sm mr-2">Delay:</label>
                            <input type="number" name="simulate_delay" value="30" min="5" max="300"
                                   class="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                            <span class="text-xs text-gray-400 ml-1">seconds</span>
                        </div>
                    </div>

                    <button type="submit" 
                            class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded transition-colors">
                        Create PIX Payment
                    </button>
                </form>

                <div class="mt-4 p-3 bg-gray-700 rounded text-sm">
                    <h4 class="font-medium mb-2">PIX Testing Features:</h4>
                    <ul class="space-y-1 text-xs text-gray-300">
                        <li>🎯 Real PIX QR code generation</li>
                        <li>⏰ Auto-payment simulation with delay</li>
                        <li>📱 Functional QR codes for testing</li>
                        <li>🔄 Manual payment completion option</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Manual PIX Simulation -->
        <div class="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-pink-400 mb-4">Manual PIX Payment Simulation</h2>
            <div class="flex space-x-4">
                <input type="text" id="payment-id-input" placeholder="Enter PIX Payment ID" 
                       class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2">
                <button onclick="simulatePixPayment()" 
                        class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded transition-colors">
                    Simulate Payment
                </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">Use this to manually complete a PIX payment for testing webhook integration</p>
        </div>

        <!-- Test History -->
        <div class="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Recent Tests</h2>
            <div id="test-history" class="space-y-2">
                <p class="text-gray-400 text-sm">No tests run yet in this session.</p>
            </div>
            <button onclick="clearHistory()" 
                    class="mt-4 bg-gray-600 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded transition-colors">
                Clear History
            </button>
        </div>
    </div>

    <script>
        let testHistory = [];

        function addToHistory(type, data) {
            const timestamp = new Date().toLocaleString('pt-BR');
            testHistory.unshift({
                timestamp,
                type,
                data,
                success: data.success
            });
            
            if (testHistory.length > 10) {
                testHistory = testHistory.slice(0, 10);
            }
            
            updateHistoryDisplay();
        }

        function updateHistoryDisplay() {
            const historyDiv = document.getElementById('test-history');
            
            if (testHistory.length === 0) {
                historyDiv.innerHTML = '<p class="text-gray-400 text-sm">No tests run yet in this session.</p>';
                return;
            }

            historyDiv.innerHTML = testHistory.map(test => {
                const statusIcon = test.success ? '✅' : '❌';
                const statusClass = test.success ? 'text-green-400' : 'text-red-400';
                
                return \`
                    <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <div class="flex items-center space-x-3">
                            <span class="\${statusClass}">\${statusIcon}</span>
                            <span class="text-sm font-medium">\${test.type}</span>
                            <span class="text-xs text-gray-400">\${test.timestamp}</span>
                        </div>
                        <button onclick="showTestDetails(\${testHistory.indexOf(test)})" 
                                class="text-xs text-blue-400 hover:text-blue-300">
                            View Details
                        </button>
                    </div>
                \`;
            }).join('');
        }

        function showTestDetails(index) {
            const test = testHistory[index];
            showResults(test.data, test.type);
        }

        function clearHistory() {
            testHistory = [];
            updateHistoryDisplay();
        }

        function showResults(data, title) {
            const resultsDiv = document.getElementById('results');
            const contentDiv = document.getElementById('result-content');
            
            const statusClass = data.success ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20';
            const statusIcon = data.success ? '✅' : '❌';
            
            let content = \`
                <div class="mb-4">
                    <h3 class="text-lg font-medium flex items-center">
                        \${statusIcon} \${title} Results
                    </h3>
                </div>
            \`;

            if (data.success && data.data) {
                if (title.includes('Stripe')) {
                    content += \`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 class="font-medium text-purple-400 mb-2">Subscription Details</h4>
                                <ul class="space-y-1 text-sm">
                                    <li><strong>ID:</strong> \${data.data.subscription_id}</li>
                                    <li><strong>Status:</strong> \${data.data.status}</li>
                                    <li><strong>Invoice:</strong> \${data.data.latest_invoice.id}</li>
                                    <li><strong>Amount:</strong> R$ \${(data.data.latest_invoice.amount_paid / 100).toFixed(2)}</li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-medium text-purple-400 mb-2">Payment Intent</h4>
                                <ul class="space-y-1 text-sm">
                                    <li><strong>ID:</strong> \${data.data.latest_invoice.payment_intent.id}</li>
                                    <li><strong>Status:</strong> \${data.data.latest_invoice.payment_intent.status}</li>
                                    \${data.data.client_secret ? \`<li><strong>Client Secret:</strong> \${data.data.client_secret.substring(0, 20)}...</li>\` : ''}
                                </ul>
                            </div>
                        </div>
                    \`;
                } else if (title.includes('PIX')) {
                    content += \`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 class="font-medium text-cyan-400 mb-2">Payment Details</h4>
                                <ul class="space-y-1 text-sm">
                                    <li><strong>ID:</strong> \${data.data.payment_id}</li>
                                    <li><strong>Amount:</strong> R$ \${data.data.amount.toFixed(2)}</li>
                                    <li><strong>Status:</strong> \${data.data.status}</li>
                                    <li><strong>Expires:</strong> \${new Date(data.data.expires_at).toLocaleString('pt-BR')}</li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-medium text-cyan-400 mb-2">PIX Code</h4>
                                <div class="bg-white p-2 rounded">
                                    <img src="\${data.data.qr_code_image}" alt="QR Code" class="w-24 h-24 mx-auto">
                                </div>
                                <button onclick="copyPixCode('\${data.data.pix_code}')" 
                                        class="mt-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white py-1 px-2 rounded">
                                    Copy PIX Code
                                </button>
                            </div>
                        </div>
                    \`;

                    if (data.data.simulation) {
                        content += \`
                            <div class="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <h4 class="font-medium text-yellow-400 mb-1">Simulation Active</h4>
                                <p class="text-sm">Payment will be automatically completed in \${data.data.simulation.simulate_after_seconds} seconds</p>
                            </div>
                        \`;
                    }
                }
            }

            if (data.error) {
                content += \`
                    <div class="mb-4 p-3 bg-red-900/30 border border-red-600 rounded">
                        <h4 class="font-medium text-red-400 mb-1">Error</h4>
                        <p class="text-sm">\${data.error}</p>
                    </div>
                \`;
            }

            if (data.logs && data.logs.length > 0) {
                content += \`
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">Detailed Logs</h4>
                        <div class="bg-black rounded p-3 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            \${data.logs.map(log => {
                                if (log.startsWith('ERROR:')) return \`<div class="text-red-400">\${log}</div>\`;
                                if (log.startsWith('SUCCESS:')) return \`<div class="text-green-400">\${log}</div>\`;
                                if (log.startsWith('WARNING:')) return \`<div class="text-yellow-400">\${log}</div>\`;
                                if (log.startsWith('STEP')) return \`<div class="text-blue-400 font-bold">\${log}</div>\`;
                                return \`<div class="text-gray-300">\${log}</div>\`;
                            }).join('')}
                        </div>
                    </div>
                \`;
            }

            contentDiv.innerHTML = content;
            contentDiv.className = \`bg-gray-800 rounded-lg p-4 border \${statusClass}\`;
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }

        function copyPixCode(pixCode) {
            navigator.clipboard.writeText(pixCode).then(() => {
                alert('PIX code copied to clipboard!');
            });
        }

        async function simulatePixPayment() {
            const paymentId = document.getElementById('payment-id-input').value.trim();
            
            if (!paymentId) {
                alert('Please enter a Payment ID');
                return;
            }

            try {
                const response = await fetch(\`/api/test/abacatepay-pix?payment_id=\${paymentId}\`, {
                    method: 'PUT'
                });
                
                const data = await response.json();
                showResults(data, 'Manual PIX Simulation');
                addToHistory('Manual PIX Simulation', data);
                
                if (data.success) {
                    document.getElementById('payment-id-input').value = '';
                }
            } catch (error) {
                showResults({
                    success: false,
                    error: error.message,
                    logs: [\`ERROR: \${error.message}\`]
                }, 'Manual PIX Simulation');
            }
        }

        // Stripe form handler
        document.getElementById('stripe-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/test/stripe-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                showResults(result, 'Stripe Subscription Test');
                addToHistory('Stripe Test', result);
            } catch (error) {
                showResults({
                    success: false,
                    error: error.message,
                    logs: [\`ERROR: \${error.message}\`]
                }, 'Stripe Subscription Test');
            }
        });

        // PIX form handler
        document.getElementById('pix-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Convert checkbox and number values
            data.simulate_payment = formData.has('simulate_payment');
            data.simulate_delay = parseInt(data.simulate_delay);
            
            try {
                const response = await fetch('/api/test/abacatepay-pix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                showResults(result, 'AbacatePay PIX Test');
                addToHistory('PIX Test', result);
            } catch (error) {
                showResults({
                    success: false,
                    error: error.message,
                    logs: [\`ERROR: \${error.message}\`]
                }, 'AbacatePay PIX Test');
            }
        });
    </script>
</body>
</html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}