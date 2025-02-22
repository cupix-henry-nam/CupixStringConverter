document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const downloadLink = document.getElementById('download-link');
    const radioOptions = document.getElementsByName('json-format');

    // 드래그 앤 드롭을 지원하기 위한 이벤트 리스너
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'blue';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ccc';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const selectedFormat = getSelectedFormat();
            const json = csvToJson(csv, selectedFormat);
            downloadJson(json, file.name);
        };
        reader.readAsText(file);
    }

    function getSelectedFormat() {
        for (let i = 0; i < radioOptions.length; i++) {
            if (radioOptions[i].checked) {
                return radioOptions[i].value;
            }
        }
        return 'default';
    }

    function csvToJson(csv, format) {
        const lines = csv.split('\r\n').filter(line => line.trim().length > 0);
        const headers = parseCsvLine(lines[0]);

        switch (format) {
            case 'en-US':
                return jsonify(lines, headers.indexOf('en-US'));
            case 'ko-KR':
                return jsonify(lines, headers.indexOf('ko-KR'));
            case 'ja-JP':
                return jsonify(lines, headers.indexOf('ja-JP'));
            default:
                return
        }
    }

    function jsonify(lines, localeIndex) {
        if (localeIndex === -1) {
            alert(`Locale ${locale} not found in the CSV file.`);
            return null;
        }

        let result = {};

        for (let i = 1; i < lines.length; i++) {
            let currentline = parseCsvLine(lines[i]);
            let key = currentline[0];

            let keys = key.split('.'); // Assuming first column contains the key path
            let value = currentline[localeIndex];
            assignNestedValue(result, keys, value);
        }

        return JSON.stringify(result, null, 2);
    }

    function assignNestedValue(obj, keys, value) {
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => 
            obj[key] = obj[key] || {}, obj); 
        lastObj[lastKey] = value;
    }

    function downloadJson(json, originalFileName) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = originalFileName.replace('.csv', '.json');
        downloadLink.style.display = 'block';
        downloadLink.textContent = 'Download JSON';
    }
    function parseCsvLine(line) {
    const result = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    // Handle escaped quotes
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                // End of the current field
                result.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }
    
    // Push the last field
    result.push(currentField);
    
    return result;
}

});