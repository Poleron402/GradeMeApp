.PHONY: install-py build-app all

VENV_ENV = venv/bin/python
PYTHON = python3
DEL_COMMAND = rm -rf
# changing the virtual environment file path if not Unix
ifeq ($(OS),Windows_NT)
# 	DEL_COMMAND = rmdir /s /q
	PYTHON = python
	VENV_ENV = venv/Scripts/python
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
	$(VENV_ENV) -m PyInstaller --onefile ollama_code_analysis.py && \
	$(DEL_COMMAND) venv

build-app:
	$(DEL_COMMAND) dist dist-electron dist-react app-be/venv
	npm run transpile:electron
	npm run build
ifeq ($(OS),Windows_NT)
	npm run dist:win
else
ifeq ($(shell uname),Darwin)
	npm run dist:mac
else
	npm run dist:linux
endif
endif

restore-venv:
	cd app-be && \
	$(PYTHON) -m venv venv && \
	$(VENV_ENV) -m pip install -r requirements.txt
	
all: install-py build-app
