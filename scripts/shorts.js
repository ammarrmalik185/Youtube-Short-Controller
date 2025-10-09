let video;
function hookShortsVideo() {
    const NEAR_END_THRESHOLD = 0.5; // seconds

    video.addEventListener('timeupdate', onVideoTimeUpdate);
    video.addEventListener('play', hookNextPrevListeners);
    video.addEventListener('timeupdate', hookNextPrevListeners);

    hookNextPrevListeners();

    function onVideoTimeUpdate(event) {
        const video = event.currentTarget;
        if (!video || !isFinite(video.duration) || video.duration === 0) return;
        const remaining = video.duration - video.currentTime;
        if (remaining <= NEAR_END_THRESHOLD) {
            const nextButton = document.querySelector('#navigation-button-down > ytd-button-renderer > yt-button-shape > button');
            if (nextButton) {
                console.log("[YTShortEnhancer] Shorts video ended, moving to next. Clicking next button.");
                nextButton.click();
            }
        }
    }

    function hookNextPrevListeners(){
        if ('mediaSession' in navigator) {
            console.log('[YTShortEnhancer] Handlers attached');

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                console.log('[YTShortEnhancer] Next pressed');
                const nextButton = document.querySelector('#navigation-button-down > ytd-button-renderer > yt-button-shape > button');
                if (nextButton) {
                    console.log("[YTShortEnhancer] Shorts video ended, moving to next. Clicking next button.");
                    nextButton.click();
                }
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log('[YTShortEnhancer] Previous pressed');
                const prevButton = document.querySelector('#navigation-button-up > ytd-button-renderer > yt-button-shape > button');
                if (prevButton) {
                    console.log("[YTShortEnhancer] Shorts video ended, moving to next. Clicking prev button.");
                    prevButton.click();
                }
            });
        }
    }
}


setInterval(() => {
    const newVideo = document.querySelector('video');
    // console.log("Checking for new video element...");
    if (newVideo && newVideo !== video) {
        video = newVideo;
        hookShortsVideo();
    }
}, 100)
