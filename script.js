const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const expanded = nav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', String(expanded));
  });
}

const placeholderVideo = document.querySelector('.video-placeholder');
if (placeholderVideo) {
  const videoId = placeholderVideo.dataset.videoId;
  if (videoId && videoId !== 'VIDEO_ID') {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = 'Видео об арт-терапии';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.className = 'video-embed';
    placeholderVideo.innerHTML = '';
    placeholderVideo.appendChild(iframe);
  }
}

const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    const antiSpam = form.querySelector('input[name="anti_spam"]');
    if (antiSpam && antiSpam.value.trim() !== '7') {
      event.preventDefault();
      antiSpam.setAttribute('aria-invalid', 'true');
      antiSpam.focus();
      alert('Проверка spam: введите число 7 в поле защиты от спама.');
    }
  });
}
