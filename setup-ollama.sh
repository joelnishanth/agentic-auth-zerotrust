#!/bin/bash

echo "🤖 Setting up Ollama for Text-to-SQL AI"
echo "======================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   macOS: brew install ollama"
    echo "   Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "   Windows: Download from https://ollama.ai/download"
    exit 1
fi

echo "✅ Ollama is installed"

# Start Ollama service (if not already running)
echo "🚀 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait a moment for service to start
sleep 3

# Pull the required model
echo "📥 Pulling llama3.2:3b model (this may take a few minutes)..."
ollama pull llama3.2:3b

if [ $? -eq 0 ]; then
    echo "✅ Model downloaded successfully!"
    echo ""
    echo "🎯 Setup complete! You can now:"
    echo "   1. Run: docker-compose up"
    echo "   2. Go to: http://localhost:3000/demo"
    echo "   3. Login and try natural language queries"
    echo ""
    echo "💡 Example queries to try:"
    echo "   - 'Show me all patients'"
    echo "   - 'How many patients do we have?'"
    echo "   - 'List patients with their therapists'"
    echo "   - 'Show average outcome score'"
    echo ""
    echo "🔧 Ollama is running on: http://localhost:11434"
else
    echo "❌ Failed to download model. Please check your internet connection."
    exit 1
fi

# Keep Ollama running
echo "🔄 Ollama service is running (PID: $OLLAMA_PID)"
echo "   Press Ctrl+C to stop"
wait $OLLAMA_PID