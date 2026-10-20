let actions = {
    nothing: 'nothing',
    play: 'play',
    pause: 'pause',
    play_pause: 'play_pause',
    stop: 'stop',
    mute: 'mute',
    next: 'next',
    prev: 'prev',
    like: 'like',
    comments: 'comments',
    reset: 'reset',
    fullscreen: 'fullscreen',
    description: 'description',
    ambient_mode: 'ambient_mode',
    do_not_recommend: 'do_not_recommend',
    captions: 'captions',
    seek_forward_one_frame: 'seek_forward_one_frame',
    seek_backward_one_frame: 'seek_backward_one_frame',
    seek_forward_10_seconds: 'seek_forward_10_seconds',
    seek_backward_10_seconds: 'seek_backward_10_seconds',
    increase_volume: 'increase_volume',
    decrease_volume: 'decrease_volume',
}

let events = {
    ended: 'ended',
    play: 'play',
    pause: 'pause',
    stop: 'stop',
    next: 'next',
    prev: 'prev',
    double_play: 'double_play',
    double_stop: 'double_stop',
}

let settings = {
    event_action_map: {
        ended: [actions.next],
        play: [actions.play],
        pause: [actions.pause],
        stop: [actions.stop],
        next: [actions.next],
        prev: [actions.prev],
        double_play: [actions.like],
        double_stop: [actions.comments],
    },
    custom_actions:{

    }
}

function loadSettings(onLoad) {
    chrome.storage.sync.get(["settings"]).then((result) => {
        if (result.settings) {
            settings = result.settings;
        }
        onLoad(settings);
    });
}

function saveSettings(onSave) {
    chrome.storage.sync.set({ settings: settings }).then(onSave);
}