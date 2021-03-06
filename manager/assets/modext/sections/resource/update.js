/**
 * Loads the resource update page
 *
 * @class MODx.page.UpdateResource
 * @extends MODx.Component
 * @param {Object} config An object of config properties
 * @xtype modx-page-resource-update
 */
MODx.page.UpdateResource = function(config) {
    config = config || {record:{}};
    config.record = config.record || {};
    Ext.apply(config.record,{
        'parent-cmb': config.record['parent']
    });
    Ext.applyIf(config,{
        url: MODx.config.connector_url
        ,which_editor: 'none'
        ,formpanel: 'modx-panel-resource'
        ,id: 'modx-page-update-resource'
        ,action: 'edit'
        ,actions: {
            'new': 'resource/create'
            ,edit: 'resource/update'
            ,preview: 'resource/preview'
            ,cancel: 'welcome'
        }
        ,components: [{
            xtype: config.panelXType || 'modx-panel-resource'
            ,renderTo: config.panelRenderTo || 'modx-panel-resource-div'
            ,resource: config.resource
            ,record: config.record || {}
            ,publish_document: config.publish_document
            ,access_permissions: config.access_permissions
            ,show_tvs: config.show_tvs
            ,mode: config.mode
            ,url: config.url
        }]
        ,buttons: this.getButtons(config)
    });
    MODx.page.UpdateResource.superclass.constructor.call(this,config);
    if (!Ext.isIE) {
        Ext.EventManager.on(window, 'beforeunload',function(e) {
            MODx.releaseLock(this.config.resource);
            MODx.sleep(400);
            return false;
        }, this);
    }
    new Ext.KeyMap(Ext.getBody(), {
        key: 'p'
        ,alt: true
        ,ctrl: true
        ,fn: this.preview
        ,scope: this
    });
};
Ext.extend(MODx.page.UpdateResource,MODx.Component,{
    preview: function() {
        window.open(this.config.preview_url);
        return false;
    }

    ,duplicateResource: function(btn,e) {
        MODx.msg.confirm({
            text: _('resource_duplicate_confirm')
            ,url: MODx.config.connector_url
            ,params: {
                action: 'resource/duplicate'
                ,id: this.config.resource
            }
            ,listeners: {
                success: {fn:function(r) {
                    MODx.loadPage('resource/update', 'id='+r.object.id);
                },scope:this}
            }
        });
    }

    ,deleteResource: function(btn,e) {
        MODx.msg.confirm({
            text: _('resource_delete_confirm')
            ,url: MODx.config.connector_url
            ,params: {
                action: 'resource/delete'
                ,id: this.config.resource
            }
            ,listeners: {
                success: {fn:function(r) {
                    MODx.loadPage('resource/update', 'id='+r.object.id);
                },scope:this}
            }
        });
    }

    ,cancel: function(btn,e) {
        var fp = Ext.getCmp(this.config.formpanel);
        if (fp && fp.isDirty()) {
            Ext.Msg.confirm(_('warning'),_('resource_cancel_dirty_confirm'),function(e) {
                if (e == 'yes') {
                    fp.warnUnsavedChanges = false;
                    MODx.releaseLock(MODx.request.id);
                    MODx.sleep(400);
                    MODx.loadPage('welcome');
                }
            },this);
        } else {
            MODx.releaseLock(MODx.request.id);
            MODx.loadPage('welcome');
        }
    }

    ,getButtons: function(cfg) {
        var btns = [];
        if (cfg.canSave == 1) {
            btns.push({
                process: 'resource/update'
                ,text: _('save')
                ,method: 'remote'
                ,checkDirty: MODx.request.reload ? false : true
                ,id: 'modx-abtn-save'
                ,keys: [{
                    key: MODx.config.keymap_save || 's'
                    ,ctrl: true
                }]
            });
            btns.push('-');
        } else if (cfg.locked) {
            btns.push({
                text: cfg.lockedText || _('locked')
                ,handler: Ext.emptyFn
                ,id: 'modx-abtn-locked'
                ,disabled: true
            });
            btns.push('-');
        }
        if (cfg.canDuplicate == 1) {
            btns.push({
                text: _('duplicate')
                ,handler: this.duplicateResource
                ,scope:this
                ,id: 'modx-abtn-duplicate'
            });
            btns.push('-');
        }
        if (cfg.canDelete == 1 && !cfg.locked) {
            btns.push({
                text: _('delete')
                ,handler: this.deleteResource
                ,scope:this
                ,id: 'modx-abtn-delete'
            });
            btns.push('-');
        }
        btns.push({
            text: _('view')
            ,handler: this.preview
            ,scope: this
            ,id: 'modx-abtn-preview'
        });
        btns.push('-');
        btns.push({
            text: _('cancel')
            ,handler: this.cancel
            ,scope: this
            ,id: 'modx-abtn-cancel'
        });
        /*btns.push('-');
        btns.push({
            text: _('help_ex')
            ,handler: MODx.loadHelpPane
            ,id: 'modx-abtn-help'
        });*/
        return btns;
    }
});
Ext.reg('modx-page-resource-update',MODx.page.UpdateResource);
