.PHONY: install-py build-app all

VENV_ENV = venv/bin/python
PYTHON = python3

# changing the virtual environment file path if not Unix
ifeq ($(OS),Windows_NT)
	PYTHON = python
	VENV_ENV = /venv/Scripts/python
endif

# Builds the app to run on local
start-dev:
	cd app-be && \
	$(PYTHON) -m venv venv && \
	$(VENV_ENV) -m pip install -r requirements.txt && \
	npm run transpile:electron
	npm run build
	npm run dev

# compile python files into binaries
install-py:
	cd app-be && \
	$(PYTHON) -m venv venv && \
	$(VENV_ENV) -m pip install -r requirements.txt && \
	$(VENV_ENV) -m PyInstaller --onefile main.py && \
	$(VENV_ENV) -m PyInstaller --onefile ollama_rubric_generation.py && \
	$(VENV_ENV) -m PyInstaller --onefile ollama_code_analysis.py && rm -rf venv

build-app:
	rm -rf dist dist-electron dist-react app-be/venv
	npm run transpile:electron
	npm run build
	npm run dist:linux

restore-venv:
	cd app-be && \
	$(PYTHON) -m venv venv && \
	$(VENV_ENV) -m pip install -r requirements.txt
	
all: install-py build-app
