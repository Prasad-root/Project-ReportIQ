class BloodReportAnalyzer {
    constructor() {
        this.selectedFile = null;
        this.currentPage = 'home';
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.homePage = document.getElementById('home-page');
        this.loadingPage = document.getElementById('loading-page');
        this.resultsPage = document.getElementById('results-page');

        this.fileInput = document.getElementById('file-input');
        this.uploadArea = document.getElementById('upload-area');
        this.uploadSection = document.getElementById('upload-section');
        this.selectedFileSection = document.getElementById('selected-file-section');
        this.chooseFileBtn = document.getElementById('choose-file-btn');
        this.removeFileBtn = document.getElementById('remove-file-btn');
        this.changeFileBtn = document.getElementById('change-file-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.analyzeBtnContainer = document.getElementById('analyze-button-container');

        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');

        this.backBtn = document.getElementById('back-btn');
        this.resultsFilename = document.getElementById('results-filename');
        this.resultsContent = document.getElementById('results-content');
    }

    attachEventListeners() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.chooseFileBtn.addEventListener('click', () => this.fileInput.click());
        this.changeFileBtn.addEventListener('click', () => this.fileInput.click());
        this.removeFileBtn.addEventListener('click', () => this.removeFile());

        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        this.analyzeBtn.addEventListener('click', () => this.analyzeFile());
        this.backBtn.addEventListener('click', () => this.goToHome());

        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        if (!this.uploadArea.contains(event.relatedTarget)) {
            this.uploadArea.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        
        if (!validTypes.includes(file.type)) {
            this.showAlert('Please select a valid file (PDF, JPG, PNG)', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showAlert('File size must be less than 10MB', 'error');
            return;
        }

        this.selectedFile = file;
        this.updateFileDisplay();
    }

    updateFileDisplay() {
        if (this.selectedFile) {
            this.fileName.textContent = this.selectedFile.name;
            this.fileSize.textContent = `${(this.selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
            
            this.uploadSection.style.display = 'none';
            this.selectedFileSection.style.display = 'block';
            this.analyzeBtnContainer.style.display = 'block';
        } else {
            this.uploadSection.style.display = 'block';
            this.selectedFileSection.style.display = 'none';
            this.analyzeBtnContainer.style.display = 'none';
        }
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.updateFileDisplay();
    }

    async analyzeFile() {
        if (!this.selectedFile) {
            this.showAlert('Please select a file first', 'error');
            return;
        }

        this.showPage('loading');

        const formData = new FormData();
        formData.append("file", this.selectedFile);

        try {
            const response = await fetch("/explain", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.error) {
                this.showAlert(result.error, "error");
                this.showPage("home");
                return;
            }

            // Update results page
            this.resultsFilename.textContent = `Report: ${result.filename}`;
            this.resultsContent.textContent = result.explanation;

            this.showPage("explain");

        } catch (err) {
            console.error(err);
            this.showAlert("Something went wrong", "error");
            this.showPage("home");
        }
    }

    goToHome() {
        this.showPage('home');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        document.getElementById(`${pageId}-page`).classList.add('active');
        this.currentPage = pageId;
        window.scrollTo(0, 0);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background-color: ${type === 'error' ? '#ef4444' : '#22c55e'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            font-size: 0.875rem;
            max-width: 300px;
        `;
        alertDiv.textContent = message;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getFileIcon(file) {
        if (file.type === 'application/pdf') {
            return `<svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`;
        } else if (file.type.startsWith('image/')) {
            return `<svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>`;
        }
        return `<svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new BloodReportAnalyzer();
});

function animateProgressBar() {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        let width = 0;
        const targetWidth = parseFloat(progressBar.getAttribute("data-target")) || 0; 
        const increment = targetWidth / 30;  // controls animation speed
        
        const animate = () => {
            width += increment;
            progressBar.style.width = Math.min(width, targetWidth) + '%';
            if (width < targetWidth) requestAnimationFrame(animate);
        };
        setTimeout(() => requestAnimationFrame(animate), 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const resultsPage = document.getElementById('results-page');
                if (resultsPage && resultsPage.classList.contains('active')) {
                    animateProgressBar();
                }
            }
        });
    });
    const resultsPage = document.getElementById('results-page');
    if (resultsPage) observer.observe(resultsPage, { attributes: true });
});
