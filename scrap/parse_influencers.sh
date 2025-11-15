#!/bin/bash
# Helper script to parse HTML tables with the virtual environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python"

# Check if virtual environment exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo "Error: Virtual environment not found at $SCRIPT_DIR/.venv"
    echo "Please run: python -m venv .venv && source .venv/bin/activate && pip install beautifulsoup4 lxml"
    exit 1
fi

# Run the parser script
"$VENV_PYTHON" "$SCRIPT_DIR/parse_html_table.py" "$@"
