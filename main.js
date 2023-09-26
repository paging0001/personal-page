class SiteData {
    title
    url
    time

    constructor() {
        this.title = "";
        this.url = "";
        this.time = new Date();
    }

    export() {
        const { title, url, time } = this;
        const data = [title, url, time.toString()];
        return JSON.stringify(data);
    }

    static import(json) {
        try {
            const retval = new SiteData();
            const data = JSON.parse(json);

            retval.title = data[0];
            retval.url = data[1];
            retval.time = new Date(data[2]);

            return retval;
        } catch (e) {
            return null;
        }
    }
}

class LocalFileSystem {
    static KEY = 'page_data'
    data

    constructor() {
        this.data = [];
    }

    add(site_data) {
        const { data } = this;
        data.push(site_data);
    }

    delete(site_data) {
        const { data } = this;
        const idx = data.findIndex((x) => x === site_data);

        if (idx == -1)
            return false;

        data.splice(idx, 1);
        return true;
    }

    save() {
        const { data } = this;
        const result = Array.from(data, (x) => x.export());
        localStorage.setItem(LocalFileSystem.KEY, JSON.stringify(result));
    }

    load() {
        try {
            const raw = JSON.parse(localStorage.getItem(LocalFileSystem.KEY));
            this.data = Array.from(raw, (x) => SiteData.import(x));
        } catch (e) {
            this.data = [];
        }
    }
}

class Config {
    static list
    static sample
    static button_add
    static file_system

    static init() {
        Config.list = document.getElementById('list-row');
        Config.sample = document.getElementById('sample-row');
        Config.sample.parentElement.removeChild(Config.sample);
        Config.button_add = document.getElementById('button-add');

        Config.file_system = new LocalFileSystem();
    }
}

function init() {
    Config.init();
    const { button_add } = Config;

    init_row();
    button_add.addEventListener('click', add_row);
}

function init_row() {
    const { list, file_system } = Config;
    file_system.load();

    for (const site_data of file_system.data) {
        const row = create_row(site_data);

        row.querySelector('#edit-title').value = site_data.title;
        row.querySelector('#edit-url').value = site_data.url;
        row.querySelector('#text-time').innerHTML = site_data.time.toLocaleString();

        list.appendChild(row);
    }
}

function add_row() {
    const { list, file_system } = Config;
    const site_data = new SiteData();
    file_system.add(site_data);

    const row = create_row(site_data);
    list.appendChild(row);
}

function create_row(site_data) {
    const { sample, file_system } = Config;
    const row = sample.cloneNode(true);

    const button_delete = row.querySelector('#button-delete');
    const check_edit = row.querySelector('#check-edit');
    const button_go = row.querySelector('#button-go');
    const edit_title = row.querySelector('#edit-title');
    const edit_url = row.querySelector('#edit-url');
    const text_time = row.querySelector('#text-time')

    text_time.innerHTML = site_data.time.toLocaleString();

    button_go.addEventListener('click', () => {
        if (!confirm('이동하시겠습니까?'))
            return;

        site_data.time = new Date();
        file_system.save();        
        location.href = site_data.url;
    });

    check_edit.addEventListener('click', () => {
        if (check_edit.checked) {
            edit_title.removeAttribute('disabled');
            edit_url.removeAttribute('disabled');
        }
        else {
            edit_title.setAttribute('disabled', true);
            edit_url.setAttribute('disabled', true);

            site_data.title = edit_title.value;
            site_data.url = edit_url.value;
            file_system.save();
        }
    });

    button_delete.addEventListener('click', () => {
        file_system.delete(site_data);
        row.remove();
        file_system.save();
    });

    return row;
}

window.addEventListener('load', init);