document.addEventListener('DOMContentLoaded', function() {
    initializeTranscript();
});

function initializeTranscript() {
    setupVideos();
    setupImageHandling();
    setupTimestamps();
}

function setupVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // Add standard HTML5 video controls
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.borderRadius = '8px';
        
        // Create container structure
        const container = createVideoContainer(video);
        
        // Set video attributes for better compatibility
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('preload', 'metadata');
        
        // Set proper MIME type if not already set
        if (!video.getAttribute('type')) {
            const extension = video.getAttribute('src').split('.').pop().toLowerCase();
            const mimeTypes = {
                'mp4': 'video/mp4',
                'webm': 'video/webm',
                'ogg': 'video/ogg'
            };
            video.setAttribute('type', mimeTypes[extension] || 'video/mp4');
        }

        // Add download controls
        addVideoControls(container, video);

        // Error handling
        video.addEventListener('error', () => handleVideoError(video));
        
        // Add loading indicator
        video.addEventListener('loadstart', () => {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'video-loading';
            loadingDiv.textContent = 'Video yükleniyor...';
            container.appendChild(loadingDiv);
        });

        video.addEventListener('canplay', () => {
            const loadingDiv = container.querySelector('.video-loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        });
    });
}

function createVideoContainer(video) {
    const container = document.createElement('div');
    container.className = 'video-container';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    
    // Video elementini wrapper'a taşı
    video.parentNode.insertBefore(container, video);
    wrapper.appendChild(video);
    container.appendChild(wrapper);
    
    return container;
}

function addVideoControls(container, video) {
    const controls = document.createElement('div');
    controls.className = 'download-controls';
    
    // Download butonu
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-button';
    downloadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12l-4-4h3V3h2v5h3L8 12z"/><path d="M14 13v1H2v-1h12z"/></svg> İndir';
    downloadBtn.onclick = () => downloadVideo(video.querySelector('source').src);
    
    controls.appendChild(downloadBtn);
    container.appendChild(controls);
}

function downloadVideo(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleVideoError(video) {
    const container = video.closest('.video-container');
    if (container) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'video-error';
        errorMsg.textContent = 'Video yüklenirken bir hata oluştu.';
        container.appendChild(errorMsg);
    }
}

function setupImageHandling() {
    const images = document.querySelectorAll('img:not(.message-avatar)');
    images.forEach(img => {
        img.addEventListener('error', handleImageError);
        makeImageClickable(img);
    });
}

function handleImageError(event) {
    const img = event.target;
    img.src = '../assets/error-image.png';
    img.alt = 'Resim yüklenemedi';
}

function makeImageClickable(img) {
    if (!img.closest('a')) {
        const link = document.createElement('a');
        link.href = img.src;
        link.target = '_blank';
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);
    }
}

function setupTimestamps() {
    const timestamps = document.querySelectorAll('.message-timestamp');
    timestamps.forEach(convertTimestamp);
}

function convertTimestamp(element) {
    const timestamp = element.getAttribute('data-timestamp');
    if (timestamp) {
        const date = new Date(parseInt(timestamp));
        element.textContent = formatDate(date);
    }
}

function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return `Bugün ${formatTime(date)}`;
    } else if (isSameDay(date, yesterday)) {
        return `Dün ${formatTime(date)}`;
    } else {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${formatTime(date)}`;
    }
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}