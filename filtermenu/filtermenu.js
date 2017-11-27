﻿define(['require', 'dialogHelper', 'loading', 'apphost', 'layoutManager', 'connectionManager', 'appRouter', 'globalize', 'userSettings', 'emby-checkbox', 'emby-input', 'paper-icon-button-light', 'emby-select', 'material-icons', 'css!./../formdialog', 'emby-button', 'emby-linkbutton', 'flexStyles'], function (require, dialogHelper, loading, appHost, layoutManager, connectionManager, appRouter, globalize, userSettings) {
    'use strict';

    function onSubmit(e) {

        e.preventDefault();
        return false;
    }

    function initEditor(context, settings) {

        context.querySelector('form').addEventListener('submit', onSubmit);

        var elems = context.querySelectorAll('.simpleFilter');

        for (var i = 0, length = elems.length; i < length; i++) {

            elems[i].querySelector('input').checked = settings[elems[i].getAttribute('data-settingname')] || false;
        }
    }

    function saveValues(context, settings, settingsKey) {

        var elems = context.querySelectorAll('.simpleFilter');
        for (var i = 0, length = elems.length; i < length; i++) {
            setBasicFilter(context, settingsKey + '-filter-' + elems[i].getAttribute('data-settingname'), elems[i].querySelector('input'));
        }
    }

    function setBasicFilter(context, key, elem) {

        var value = elem.checked;
        value = value ? value : null;
        userSettings.setFilter(key, value);
    }

    function centerFocus(elem, horiz, on) {
        require(['scrollHelper'], function (scrollHelper) {
            var fn = on ? 'on' : 'off';
            scrollHelper.centerFocus[fn](elem, horiz);
        });
    }

    function FilterMenu() {

    }

    FilterMenu.prototype.show = function (options) {

        return new Promise(function (resolve, reject) {

            require(['text!./filtermenu.template.html'], function (template) {

                var dialogOptions = {
                    removeOnClose: true,
                    scrollY: false
                };

                dialogOptions.size = 'fullscreen-border';

                var dlg = dialogHelper.createDialog(dialogOptions);

                dlg.classList.add('formDialog');

                var html = '';

                html += '<div class="formDialogHeader">';
                html += '<button is="paper-icon-button-light" class="btnCancel autoSize" tabindex="-1"><i class="md-icon">&#xE5C4;</i></button>';
                html += '<h3 class="formDialogHeaderTitle">${Filters}</h3>';

                html += '</div>';

                html += template;

                dlg.innerHTML = globalize.translateDocument(html, 'sharedcomponents');

                var settingElements = dlg.querySelectorAll('.viewSetting');
                for (var i = 0, length = settingElements.length; i < length; i++) {
                    if (options.visibleSettings.indexOf(settingElements[i].getAttribute('data-settingname')) === -1) {
                        settingElements[i].classList.add('hide');
                    } else {
                        settingElements[i].classList.remove('hide');
                    }
                }

                initEditor(dlg, options.settings);

                dlg.querySelector('.btnCancel').addEventListener('click', function () {

                    dialogHelper.close(dlg);
                });

                if (layoutManager.tv) {
                    centerFocus(dlg.querySelector('.formDialogContent'), false, true);
                }

                var submitted;

                dlg.querySelector('form').addEventListener('change', function () {

                    submitted = true;
                    if (options.onChange) {
                        saveValues(dlg, options.settings, options.settingsKey);
                        options.onChange();
                    }

                }, true);

                dialogHelper.open(dlg).then(function () {

                    if (layoutManager.tv) {
                        centerFocus(dlg.querySelector('.formDialogContent'), false, false);
                    }

                    if (submitted) {

                        if (!options.onChange) {
                            saveValues(dlg, options.settings, options.settingsKey);
                            resolve();
                        }
                        return;
                    }

                    reject();
                });
            });
        });
    };

    return FilterMenu;
});