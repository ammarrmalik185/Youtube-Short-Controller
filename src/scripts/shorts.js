let video;

const NEAR_END_THRESHOLD = 0.5; // seconds
const DOUBLE_CLICK_THRESHOLD = 500; // milliseconds

let double_click_active = false
let double_stop_active = false;

let comments_open = false;
let description_open = false;
// let extra_menu_open = false;

let element_selectors = {
    video: 'video',
    like: '#button-bar > reel-action-bar-view-model > like-button-view-model > toggle-button-view-model > button-view-model > label > button',
    comments: '#button-bar > reel-action-bar-view-model > button-view-model:nth-child(3) > label > button',
    comments_close: '#visibility-button > ytd-button-renderer > yt-button-shape > button',
    mute: '#player-container > div.player-controls.style-scope.ytd-reel-video-renderer > ytd-shorts-player-controls > desktop-shorts-volume-controls > div:nth-child(2) > button',
    next: '#navigation-button-down > ytd-button-renderer > yt-button-shape > button',
    prev: '#navigation-button-up > ytd-button-renderer > yt-button-shape > button',
    extra_menu: '#button-shape > button',
    description: '#items > ytd-menu-service-item-renderer.style-scope.ytd-menu-popup-renderer.iron-selected',
    description_close: '#visibility-button > ytd-button-renderer > yt-button-shape > button',
    ambient_mode: '#items > ytd-toggle-menu-service-item-renderer',
    captions: '#items > yt-list-item-view-model:nth-child(4)',
    dont_recommend: '#items > ytd-menu-service-item-renderer:nth-child(5)',
}

function hookShortsVideo() {

    video.addEventListener('timeupdate', onVideoTimeUpdate);
    video.addEventListener('timeupdate', hookNextPrevListeners);
    hookNextPrevListeners();

    // Functions
    function hookNextPrevListeners(){
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler("play", () => handleEvent(events.play))
            navigator.mediaSession.setActionHandler("pause", () => handleEvent(events.pause));
            navigator.mediaSession.setActionHandler("stop", handleStop);
            navigator.mediaSession.setActionHandler('nexttrack', () => handleEvent(events.next));
            navigator.mediaSession.setActionHandler('previoustrack', () => handleEvent(events.prev));
        }
    }

    function handleStop(){
        logger.log("[YTShortEnhancer] Stop intercepted");
        handleEvent(events.stop);

        // Undo YouTube’s forced stop (prevent video reset)
        let current_status = video.paused;
        setTimeout(() => {
            video.play().catch(() => {});
            if (current_status) video.pause();
        }, 1);
    }

    // Events
    function onVideoTimeUpdate(event) {
        const video = event.currentTarget;
        if (!video || !isFinite(video.duration) || video.duration === 0) return;
        const remaining = video.duration - video.currentTime;
        if (remaining <= NEAR_END_THRESHOLD) {
            handleEvent(events.ended);
        }
    }

}

function handleEvent(event) {
    loadSettings(settings => {
        const action_list = settings.event_action_map[event];
        if (action_list) {
            handleActions(action_list);
        } else {
            logger.log(`No actions mapped for event: ${event}`);
        }
    })
}

function handleCustomEvent(key_name) {
    loadSettings(settings => {
        logger.log(`Custom key pressed: ${key_name}`);
        logger.log(settings.custom_actions);
        if (settings.custom_actions && settings.custom_actions[key_name]) {
            const action_list = settings.custom_actions[key_name];
            if (action_list && action_list.length > 0){
                handleActions(action_list);
            } else {
                logger.log(`No actions mapped for custom action: ${key_name}`);
            }
        }
    })
}

function handleActions(action_list) {
    action_list.forEach(action => {
        switch (action) {
            case actions.play: doPlay(); break;
            case actions.pause: doPause(); break;
            case actions.play_pause: video.paused ? doPlay() : doPause(); break;
            case actions.stop: doStop(); break;
            case actions.mute: doMute(); break;
            case actions.next: doNext(); break;
            case actions.prev: doPrev(); break;
            case actions.like: doLike(); break;
            case actions.comments: toggleComments(); break;
            case actions.reset: video.currentTime = 0; break;
            case actions.fullscreen: document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); break;
            case actions.description: toggleDescription(); break;
            case actions.ambient_mode: toggleAmbientMode(); break;
            case actions.do_not_recommend: doNotRecommend(); break;
            case actions.captions: toggleCaptions(); break;
            case actions.seek_forward_one_frame: doSeek(1/30); break;
            case actions.seek_backward_one_frame: doSeek(-1/30); break;
            case actions.seek_forward_10_seconds: doSeek(10); break;
            case actions.seek_backward_10_seconds: doSeek(-10); break;
            case actions.increase_volume: if (video.volume < 1) video.volume = Math.min(1, video.volume + 0.1); break;
            case actions.decrease_volume: if (video.volume > 0) video.volume = Math.max(0, video.volume - 0.1); break;
            case actions.nothing: break;
            default: logger.log(`Unknown action: ${action}`);
        }
    });
    // Actions
    function doPlay(){
        if (video.paused) {
            logger.log("Playing video");
            video.play();
        } else {
            logger.log("Video already playing");
        }
        checkDoubleClick();
    }
    function doPause(){
        if (!video.paused) {
            logger.log("Pausing video");
            video.pause();
        } else {
            logger.log("Video already paused");
        }
        checkDoubleClick();
    }
    function doStop(){
        video.pause();
        checkStopDoubleClick();
    }
    function doMute(){
        const muteButton = document.querySelector(element_selectors.mute);
        if (muteButton) {
            logger.log("Toggling mute");
            muteButton.click();
        }
    }
    function doNext(){
        const nextButton = document.querySelector(element_selectors.next);
        if (nextButton) {
            logger.log("Moving to next video");
            nextButton.click();
        }
    }
    function doPrev(){
        const prevButton = document.querySelector(element_selectors.prev);
        if (prevButton) {
            logger.log("Moving to previous video");
            prevButton.click();
        }
    }
    function doLike(){
        const like_button = document.querySelector(element_selectors.like);
        if (like_button) {
            logger.log("Liking video");
            like_button.click();
        }
    }
    function toggleComments(){

        if (comments_open){
            const comment_button_close = document.querySelector(element_selectors.comments_close);
            if (comment_button_close){
                logger.log("Closing comments section");
                comment_button_close.click();
                comments_open = false;
            }
        } else {
            const comment_button = document.querySelector(element_selectors.comments);
            if (comment_button) {
                logger.log("Opening comments section");
                comment_button.click();
                comments_open = true;
            }
        }
    }
    function toggleDescription(){
        if (description_open){
            const description_button = document.querySelector(element_selectors.description_close);
            if (description_button) {
                logger.log("Closing description");
                description_button.click();
                description_open = false;
            }
        } else {
            const description_button = document.querySelector(element_selectors.description);
            if (description_button) {
                logger.log("Opening description");
                description_button.click();
                description_open = true;
            }
        }
    }
    function toggleAmbientMode(){
        const ambient_mode_button = document.querySelector(element_selectors.ambient_mode);
        if (ambient_mode_button) {
            logger.log("Toggling ambient mode");
            ambient_mode_button.click();
        }
    }
    function doNotRecommend(){
        const dont_recommend_button = document.querySelector(element_selectors.dont_recommend);
        if (dont_recommend_button) {
            logger.log("Not recommending channel");
            dont_recommend_button.click();
        }
    }
    function toggleCaptions(){
        const captions_button = document.querySelector(element_selectors.captions);
        if (captions_button) {
            logger.log("Toggling captions");
            captions_button.click();
        }
    }
    function doSeek(seconds){
        let new_time = video.currentTime + seconds;
        if (new_time < 0) new_time = 0;
        if (new_time > video.duration) new_time = video.duration;
        video.currentTime = new_time;
    }
}

function checkDoubleClick(){
    if (double_click_active) {
        handleEvent(events.double_play)
        double_click_active = false;
    } else {
        double_click_active = true;
        setTimeout(() => {
            double_click_active = false;
        }, DOUBLE_CLICK_THRESHOLD)
    }
}

function checkStopDoubleClick(){
    if (double_stop_active) {
        handleEvent(events.double_stop)
        double_stop_active = false;
    } else {
        double_stop_active = true;
        setTimeout(() => {
            double_stop_active = false;
        }, DOUBLE_CLICK_THRESHOLD)
    }
}

setInterval(() => {
    const newVideo = document.querySelector(element_selectors.video);
    if ((newVideo && newVideo !== video) || (newVideo && !video)) {
        video = newVideo;
        hookShortsVideo();
    }
}, 100)

window.addEventListener("keydown", (event) => {
    logger.log(event.key, event.code);
    handleCustomEvent(event.key);
});

// document.onload(() => {
//     setTimeout(() => {
//         document.querySelector(element_selectors.extra_menu).click();
//         setTimeout(() => {
//             document.querySelector(element_selectors.extra_menu).click();
//         }, 500)
//     }, 500)
// })