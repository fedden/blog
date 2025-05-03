# The version of Python to use for the analysis, atleast whats been tested.
PYTHON_VERSION = 3.10.13

PYTHON = python


# Name (usually the same) used for the project, the subfolder to analyze, and the kernel:
KERNEL_NAME = blog

# List all Makefile targets:
# Shamelessly borrowed ad modified from https://gist.github.com/pvdb/777954
# An alternative version for make 3.8.x:
# https://stackoverflow.com/questions/4219255/how-do-you-get-the-list-of-targets-in-a-makefile
.PHONY: list
list:
	@make -rpn | sed -n -e '/^$$/ { n ; /^[^ .#][^ ]*:/ { s/:.*$$// ; p ; } ; }' | sort -u


# Raise error if pyenv is not installed:
.PHONY: pyenv-exists
pyenv-exists:
	@command -v pyenv >/dev/null 2>&1 || { echo >&2 "pyenv is not installed. Aborting - install with: https://github.com/pyenv/pyenv?tab=readme-ov-file#installation"; exit 1; }
	# pyenv is installed, check if the required python version is available:
	@pyenv versions | grep $(PYTHON_VERSION) >/dev/null 2>&1 || { echo >&2 "Python $(PYTHON_VERSION) is not installed. Aborting. Install with: pyenv install $(PYTHON_VERSION)"; exit 1; }


.PHONY: venv-exists
venv-exists: pyenv-exists
	@echo "Checking Python executable:"
	@which python || true
	@python --version || true
	# First set to use the correct python version:
	pyenv local $(PYTHON_VERSION)
	# Then check if the venv exists:
	$(PYTHON) -m venv .venv; \
	. .venv/bin/activate; \
	$(PYTHON) -m pip install --upgrade pip; \


.PHONY: install-python
install-python: venv-exists
	echo "Installing python dependencies..."
	echo "Using python version: $(PYTHON_VERSION)"
	echo "Using python command: $(PYTHON)"
	echo "Using python path: $(shell which $(PYTHON))"
	# First set to use the correct python version:
	pyenv local $(PYTHON_VERSION)
	# Then activate the venv and install the requirements:
	. .venv/bin/activate; \
	$(PYTHON) -m pip install -r requirements.txt; \


.PHONY: init
init: install-python


.PHONY: build
build:
	@# First set to use the correct python version:
	pyenv local $(PYTHON_VERSION)
	@# First build the docs:
	.venv/bin/mkdocs build


.PHONY: deploy
deploy: build
	echo "Deploying..."

.PHONY: serve
serve:
	# First set to use the correct python version:
	pyenv local $(PYTHON_VERSION)
	# Then activate the venv and run the script:
	. .venv/bin/activate; \
	mkdocs serve


.PHONY: clean
clean: 
	# Remove the venv:
	rm -rf .venv

