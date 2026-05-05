class ScoreAPI {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async saveScore(title, musicxml, data) {
        const scoreData = {
            title: title,
            musicxml: musicxml,
            data: data
        };

        if (data.id) {
            return this.request(`/save/${data.id}`, {
                method: 'PUT',
                body: JSON.stringify(scoreData)
            });
        } else {
            return this.request('/save', {
                method: 'POST',
                body: JSON.stringify(scoreData)
            });
        }
    }

    async loadScore(id) {
        return this.request(`/load/${id}`, {
            method: 'GET'
        });
    }

    async listScores() {
        return this.request('/list', {
            method: 'GET'
        });
    }

    async deleteScore(id) {
        return this.request(`/delete/${id}`, {
            method: 'DELETE'
        });
    }

    async exportPNG(svgData, width = 1200, height = 800) {
        return this.request('/export/png', {
            method: 'POST',
            body: JSON.stringify({
                svgData: svgData,
                width: width,
                height: height
            })
        });
    }

    async exportPNGDirect(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'score.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve({ success: true });
            }, 'image/png');
        });
    }
}

const scoreAPI = new ScoreAPI();
