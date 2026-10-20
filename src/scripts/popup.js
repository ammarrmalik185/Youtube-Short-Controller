loadSettings(() => {
    loadEventActionMap();
    loadCustomActions();
})

setupTabs();

function loadEventActionMap() {

    reloadEventActionList();

    let reset_button = document.getElementById("reset");
    reset_button.addEventListener("click", resetSettings);
}

function reloadEventActionList() {
    let action_map_editor = document.getElementById("event_action_map");

    for (let child of Array.from(action_map_editor.children)) {
        action_map_editor.removeChild(child);
    }

    for (let event in events) {

        let div = document.createElement("div");
        div.className = "event-action-pair";

        let label = document.createElement("label");
        label.innerText = event_string_map[event];
        label.htmlFor = `select_${event}`;
        label.className = "event-label";

        let select = document.createElement("select");
        select.id = `select_${event}`;
        select.name = `select_${event}`;
        select.className = "action-select";
        select.addEventListener("change", onEventActionChange)

        for (let action in actions) {
            let option = document.createElement("option");
            option.value = action;
            option.text = action_string_map[action];
            option.className = "action";
            select.appendChild(option);
            if (settings.event_action_map[event] && settings.event_action_map[event].includes(action)) {
                option.selected = true;
            }
        }

        div.appendChild(label);
        div.appendChild(select);
        action_map_editor.appendChild(div);

    }
}

function loadCustomActions() {

    reloadCustomActionList();

    let custom_action_options = document.getElementById("custom_action_options");
    for (let action in actions) {
        let option = document.createElement("option");
        option.value = action;
        option.text = action_string_map[action];
        option.className = "action";
        custom_action_options.appendChild(option);
    }
    let add_button = document.getElementById("add_custom_action");
    if (add_button) {
        add_button.addEventListener("click", () => {
            let key_input = document.getElementById("custom_action_key");
            let selected_action = custom_action_options.value;
            if (key_input && key_input.value && selected_action) {
                if (!settings.custom_actions) {
                    settings.custom_actions = {};
                }
                settings.custom_actions[key_input.value] = [selected_action];
                saveSettings(() => {
                    reloadCustomActionList();
                });
            }
        });
    }
}

function reloadCustomActionList() {
    loadSettings(settings => {
        let custom_actions_editor = document.getElementById("custom_event_action_map");
        console.log("Removing 1");
        console.log(settings.custom_actions)

        for (let child of Array.from(custom_actions_editor.children)) {
            custom_actions_editor.removeChild(child);
        }

        for (let key in settings.custom_actions) {

            let div = document.createElement("div");
            div.className = "event-action-pair";

            let label = document.createElement("label");
            label.innerText = `Key: ${key}`;
            label.htmlFor = `select_${key}`;
            label.className = "event-label";

            let select = document.createElement("select");
            select.id = `select_${key}`;
            select.name = `select_${key}`;
            select.className = "action-select";
            // select.addEventListener("change", onCustomActionChange)

            for (let action in actions) {
                let option = document.createElement("option");
                option.value = action;
                option.text = action_string_map[action];
                option.className = "action";
                select.appendChild(option);
                if (settings.custom_actions[key] && settings.custom_actions[key].includes(action)) {
                    option.selected = true;
                }
            }

            let delete_button = document.createElement("button");
            delete_button.innerText = "X";
            delete_button.className = "delete-button";
            delete_button.addEventListener("click", () => {
                delete settings.custom_actions[key];
                saveSettings(() => {
                    reloadCustomActionList();
                });
            })

            div.appendChild(label);
            div.appendChild(select);
            div.appendChild(delete_button);
            custom_actions_editor.appendChild(div);

        }
    })
}

function onEventActionChange() {
    let new_event_action_map = {};
    for (let event in events) {
        let select = document.getElementById(`select_${event}`);
        new_event_action_map[event] = Array.from(select.selectedOptions).map(option => option.value);
    }
    settings.event_action_map = new_event_action_map;
    saveSettings();
}

function resetSettings() {
    settings = {
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
    }
    saveSettings(() => {
        reloadEventActionList();
    });
}

function setupTabs() {
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].addEventListener("click", function (event) {
            let page = this.getAttribute("data-page");
            console.log(page);
            openPage(event, page);
        });
    }
    // Open default tab
    if (tablinks.length > 0) {
        tablinks[0].click();
    }
}

function openPage(event, page) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(page).style.display = "block";
    event.currentTarget.className += " active";
}