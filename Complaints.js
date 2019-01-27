import $ from 'jquery';
import '../less/Complaints.less';

let i18n = {
    en: {
        title: 'Complaint sending',
        cancel: 'Cancel',
        submit: 'Send',
        UNKNOWN_LANGUAGE: 'Unknown language',
        TECHNICAL_ERROR: 'Technical error',
        PORN: 'Porn',
        WRONG_ANNOTATION: 'Wrong annotation',
        OUT_OF_COMPETENCE: 'Out of competence',
        OTHER: 'Other',
        cause_is_required: 'Cause is required',
        cause_is_not_found: 'Cause was not found',
        comment_is_required: 'Comment is required',
        comment: 'Comment',
        error_while_sending_complaint: 'Error. Please try again later.',
        title_completed: 'Message',
        text_completed: 'Complaint was successfully send, thank you.',
        close: 'Close'
    },
    ru: {
        title: 'Отправка жалобы',
        cancel: 'Отмена',
        submit: 'Отправить',
        UNKNOWN_LANGUAGE: 'Незнакомый язык',
        TECHNICAL_ERROR: 'Техническая ошибка',
        PORN: 'Порно!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        WRONG_ANNOTATION: 'Обновить аннотацию',
        OUT_OF_COMPETENCE: 'Недостаточно компетенции',
        OTHER: 'Другое',
        cause_is_required: 'Причина обязательна для заполнения',
        cause_is_not_found: 'Причина не найдена',
        comment_is_required: 'Комментарий обязателен для заполнения',
        comment: 'Комментарий',
        error_while_sending_complaint: 'Ошибка. Пожалуйста попробуйте позже.',
        title_completed: 'Сообщение',
        complaint_send: 'Жалоба на задание отправлена, спасибо.',
        close: 'Закрыть'
    },
};

let translate, causes = [
    {
        "name": "UNKNOWN_LANGUAGE",
        "commentRequired": false
    },
    {
        "name": "TECHNICAL_ERROR",
        "commentRequired": true
    },
    {
        "name": "PORN",
        "commentRequired": false
    },
    {
        "name": "WRONG_ANNOTATION",
        "commentRequired": true
    },
    {
        "name": "OUT_OF_COMPETENCE",
        "commentRequired": true
    },
    {
        "name": "OTHER",
        "commentRequired": true
    }
], initialized = false;

function translateFactory(language='en') {
    if (!i18n[language]) {
        throw `Undefined language "${language}"`;
    }
    return function(code) {
        return i18n[language][code] || code;
    }
}

function render(markup, data) {
    return markup.replace(/#\{([a-zA-Z0-9._]*)\}/g, (match, fields)  =>{
        let value = data;
        fields.split('.').forEach(field => value = value[field]);
        return value;
    });
}

// Cached regex to split keys for `delegate`.
let delegateEventSplitter = /^(\S+)\s*(.*)$/;

class ComplaintDTO {

    constructor({namespace}) {
        this._data = {
            client: 'yang',
            complaints: [{
                namespace,
                login: '',
                timestampUtc: Math.floor(Date.now() / 1000)
            }]
        };
    }

    getData() {
        return this._data;
    }

    setCause(cause) {
        this._data.complaints[0]['cause'] = cause;
        return this;
    }

    setComment(comment) {
        this._data.complaints[0]['comment'] = comment;
        return this;
    }

    setMetaData(metaData) {
        this._data.complaints[0]['metaData'] = metaData;
        return this;
    }

    setRequestId(requestId) {
        this._data['requestId'] = requestId;
    }

    validate() {
        if (this._data.complaints[0]['comment']) return;
        if (!this._data.complaints[0]['cause']) return translate('cause_is_required');
        let foundCause = causes.find(cause => {
            return cause.name === this._data.complaints[0]['cause'];
        });
        if (!foundCause) return translate('cause_is_not_found');
        if (foundCause.commentRequired) return translate('comment_is_required');
    }

}

let html = {
    popup: `
<div class="modal-popup__frame modal-popup__frame_shown" id="complaints_base_h39sk">!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
<div class="modal-popup complaint-popup">
    <div class="modal-popup__header">#{title}</div>
    <div class="alert alert_size_M alert_type_crit alert_position_static">
        <div class="alert__content"></div>
    </div>
    <div class="modal-popup__body" style="max-height: 1181px;">
        <span class="btn select-wrap">
            <select class="select"></select>
            <span class="select-focus"></span>
        </span>
        <textarea placeholder="#{comment}" rows="3" class="small-input comment" name="comment"></textarea>
    </div>
    <div class="modal-popup__footer">
        <span class="link js-close">#{cancel}</span>
        <button class="btn active js-submit"><span class="button__label">#{submit}</span></button>
    </div>
</div>
</div>
`,
    option: '<option value="#{name}">#{label}</option>',
    completePopup: `
<div class="modal-popup__frame modal-popup__frame_shown" id="complaints_base_h39sk">
<div class="modal-popup complaint-popup">
    <div class="modal-popup__header">#{title_completed}</div>
    <div class="modal-popup__body">
        #{complaint_send}
    </div>
    <div class="modal-popup__footer">
        <span class="link js-close">#{close}</span>
    </div>
</div>
</div>
`
};

let Complaints = {

    events: {
        'click .js-close': 'close',
        'click .js-submit': 'submit'
    },

    uiSelectors: {
        select: '.select',
        comment: '.comment',
        alertContent: '.alert__content',
        alertBox: '.alert'
    },

    ui: {},

    initialize(options) {
        this._complaintDto = new ComplaintDTO({
            namespace: options.namespace
        });
        this._setAPIUrl(options.api);
        this.language = options.language || 'ru';
        translate = translateFactory(options.language);
        initialized = true;
        this.ajax = options.ajax;
        if (!this.ajax) {
            throw 'ajax url is undefined.'
        }
    },

    open(taskData, assignmentId) {
        if (!initialized) {
            throw 'Init Complaint first before open a popup.'
        }
        if (this.$el) {
            this.$el.remove();
            this._undelegateEvents();
        }
        this.$el = $(render(html.popup, i18n[this.language]));
        this._ensureUi();

        this._fetchCauses().then(function() {
            $('body').append(this.$el);
            this.ui.select.empty();
            causes.forEach(cause => {
                cause.label = translate(cause.name);
                this.ui.select.append(render(html.option, cause));
            });
            this._delegateEvents();

            this._complaintDto.setMetaData(taskData);
            this._complaintDto.setRequestId(`${assignmentId}_${+ new Date()}`);
        }.bind(this)).catch(function(error) {
            console.error('Error while fetch complaints.', error);
        });
    },

    submit() {
        this._complaintDto
            .setCause(this.ui.select.val())
            .setComment(this.ui.comment.val());
        let error = this._complaintDto.validate();
        if (error) {
            this._showError(error);
            return;
        }
        this._hideError();
        this.ajax({
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(this._complaintDto.getData()),
            url: this.url
        }).then(() => {
            this.close();
            this.showCompletePopup();
        }).catch(() => {
            this._showError(translate('error_while_sending_complaint'));
        });
    },

    close() {
        this._undelegateEvents();
        this.$el.remove();
    },

    showCompletePopup() {
        this.$el = $(render(html.completePopup, i18n[this.language]));
        $('body').append(this.$el);
        this._delegateEvents();
    },

    _setAPIUrl(apiOptions) {
        if (apiOptions.url) {
            this.url = apiOptions.url.replace('${assignmentId}', apiOptions.assignmentId || '');

            return;
        }

        this.url = `${apiOptions.origin}/api/proxy/${apiOptions.proxyName}/v0/complaint/submit?assignmentId=${encodeURIComponent(apiOptions.assignmentId)}`;
    },

    _fetchCauses() {
        if (causes) return Promise.resolve(causes);

        return Promise.resolve($.ajax({
            url: '/front/complaint/causes'
        })).then(function(data) {
            causes = data;
        }, function() {
            console.error('Unable to fetch complaints');
        })
    },

    _ensureUi() {
        for (var name in this.uiSelectors) {
            if (!this.uiSelectors.hasOwnProperty(name)) continue;
            this.ui[name] = this.$el.find(this.uiSelectors[name]);
        }
    },

    _showError(error) {
        console.log('error', error);
        this.ui.alertContent.empty().text(error);
        this.ui.alertBox.show();
    },

    _hideError() {
        this.ui.alertBox.hide();
    },

    // Stole from Backbone
    _delegateEvents() {
        if (!this.events) return this;
        this._undelegateEvents();
        for (let key in this.events) {
            let method = this.events[key];
            if (!$.isFunction(method)) method = this[this.events[key]];
            if (!method) continue;

            let match = key.match(delegateEventSplitter);
            let eventName = match[1], selector = match[2];
            method = method.bind(this);
            eventName += '.delegateEvents' + this.cid;
            if (selector === '') {
                this.$el.on(eventName, method);
            } else {
                this.$el.on(eventName, selector, method);
            }
        }
    },

    _undelegateEvents() {
        this.$el.off('.delegateEvents' + this.cid);
    }
}

export default Complaints;
