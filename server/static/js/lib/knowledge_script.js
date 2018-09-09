'use strict';

window.knowledge_script = {
    init: function() {
        var self = this;
        self.setting = {
            page_index: 1,
            page_size: 10,
            count: 0,
            group_id: 0,
            group_name: 0,
        };
        self.init_knowledge_list();
        self.bind_event();
        self.bind_input_event();
    },
    bind_event: function() {
        var self = this;
        $('#knowledge_ul').on('click', 'a', function(event){
            var group_id = $(this).closest('li').attr('group_id');
            var group_name = $(this).closest('li').text();
            group_id = (group_id || parseInt(group_id) === 0) ? parseInt(group_id) : group_id;
            self.setting.group_id = group_id;
            self.setting.group_name = group_name;
            self.init_knowledge_script_list(self.setting.group_id, 1);
            $('#knowledge_ul').find('a').removeClass('bg-white');
            $(this).addClass('bg-white');
            return false;
        });
        $('#pagination').on('click', 'a', function(event){
            var pageno = parseInt($(this).attr('pageno'));
            self.init_knowledge_script_list(self.setting.group_id, pageno);
            return false;
        });
        $('#btn_upsert_knowledge').on('click', function(event){
            self.upsert_knowledge();
            return false;
        });
        $('#btn_edit_knowledge').on('click', function(event){
            $('#knowledgeModal').modal('show');
            $('#create_group_name').val(self.setting.group_name);
            $('#knowledgeModal').attr('group_id', self.setting.group_id);
            return false;
        });
        $('#knowledgeModal').on('hide.bs.modal', function (event) {
            $('#create_group_name').val(null);
            $('#knowledgeModal').attr('group_id', null);
        });
        $('#btn_remove_knowledge').on('click', function(event) {
            common.bs_modal_confirm('此知识库内的所有内容将被清空', null, function(){
                self.knowledge_delete(self.setting.group_id);
            });
            return false;
        });
        $('#btn_search').on('click', function(event){
            self.init_knowledge_script_list(self.setting.group_id, 1);
            return false;
        });
        $('#knowledgeScriptModal').on('show.bs.modal', function (event) {
            // var button = $(event.relatedTarget); // Button that triggered the modal
            self.init_modal();
        });
        $('#knowledgeScriptModal').on('hide.bs.modal', function (event) {
            $('#create_name').val(null);
            $('#create_questions').val(null);
            $('#create_answers').val(null);
            $('#create_trigger').val(null);
            $('#create_scene').attr('scene_id', null);
            $('#create_scene_menu').attr('scene_id', null);
            $('#create_scene_menu').text(null);
            $('#create_scene').text('场景触发');
            $('#knowledgeScriptModal').attr('knowledge_script_id', null);
            common.clear_dynamic_div();
            $('.btn-outline-info[tag="record_input"]').hide();
            knowledge_script.bind_input_event();
        });
        $('#knowledge_script_table>tbody').on('click', 'a[tag="delete"]', function(event){
            var id = $(this).closest("tr").attr("dialogue_id");
            self.knowledge_script_delete(id);
            return false;
        });
        $('#knowledge_script_table>tbody').on('click', 'a[tag="edit"]', function(event){
            var id = $(this).closest("tr").attr("dialogue_id");
            self.build_modal(id);
            return false;
        });
        $('#create_scene_menu').on('click', 'a', function(event){
            $('#create_scene').attr('scene_id', $(this).attr('scene_id'));
            $('#create_scene').text($(this).text());
            return true; // go on to fire hide the dropdown menu
        });
        $('#btn_upsert_knowledge_script').on('click', function(){
            self.upsert_knowledge_script();
            return false;
        });
    },

    bind_input_event: function() {

        var knowledge_script_id = $('#knowledgeScriptModal').attr('knowledge_script_id');
        var hasRecord = true;
        if (!knowledge_script_id) {
            hasRecord = false;
        }
        $('.btn[tag="add_input"]').off('click').on('click',  function(){
            common.add_record_input($(this).parent(), "create_answer", "", hasRecord);
            knowledge_script.bind_input_event(); //重新绑定事件
        });

        $('.btn[tag="remove_input"]').off('click').on('click',  function(){
            $(this).parent().remove();
        });

        $('.btn[tag="record_input"]').off('click').on('click',  function(){
            var content = $(this).parent().find("input").val();
            content = $.trim(content);
            if(content === "") {
                common.bs_modal_message('请输入内容后再进行录音');
                return;
            }
            //录音文件的key使用MD5加密录音内容生成
            var key = $('#knowledgeScriptModal').attr('knowledge_script_id') + "_" + md5(content);
            content = encodeURIComponent(content);
            var url = common.record_page_url + '?content=' + content + '&key=' + key;
            //$("#record_page").attr('src', url);  //iframe方式无法获取麦克风权限
            //$("#recordModal").modal('show');
            window.open(url, 'record_window');
        });

    },

    init_knowledge_list: function() {
        var self = this;
        $.ajax({
            type: 'POST',
            url: '/api/knowledge_list_query',
            data: '{}',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    var li_html = [];
                    $.each(json.data, function(i, item){
                        li_html.push([
                            '<li class="nav-item" group_id="' + item.group_id + '">',
                                '<a class="nav-link" href="#">',
                                    '<span data-feather="file-text"></span>',
                                    item.group_name,
                                '</a>',
                            '</li>'
                        ].join(''));
                    });
                    $('#knowledge_ul').empty().append(li_html.join(''));
                    feather.replace();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    init_knowledge_script_list: function(group_id, page_index) {
        var self = this;
        var data = {

            'name': $('#input_name').val() || '',
            'questions': $('#input_questions').val() || '',
            'answers': $('#input_answers').val() || '',
            'trigger': $('#input_trigger').val() || '',

            'group_id': group_id,
            'page_index': page_index,
            'page_size': self.setting.page_size,
        }
        $.ajax({
            type: 'POST',
            url: '/api/knowledge_script_list_query',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    var tr_html = [];
                    $.each(json.data, function(i, item){
                        tr_html.push([
                            '<tr dialogue_id="' + item.id + '">',
                            '<td>', item.name, '</td>',
                            '<td>',
                                '<span title="' + item.questions[0] + '">', item.questions[0] && item.questions[0].substr(0, 20), '</span>',
                                '<br>',
                                '<span title="' + item.questions[1] + '">', item.questions[1] && item.questions[1].substr(0, 20), '</span>',
                            '</td>',
                            '<td>',
                                '<span title="' + item.answers[0] + '">', item.answers[0] && item.answers[0].substr(0, 20), '</span>',
                                '<br>',
                                '<span title="' + item.answers[1] + '">', item.answers[1] && item.answers[1].substr(0, 20), '</span>',
                            '</td>',
                            '<td>',
                                item.trigger && item.trigger.scene_id,
                                '<br>',
                                item.trigger && item.trigger.actions && item.trigger.actions.join(", "),
                            '</td>',
                            '<td class="row btn-group">',
                                '<a class="btn btn-sm btn-outline-primary mr-2" href="#" tag="edit">', '编辑', '</a>',
                                '<a class="btn btn-sm btn-outline-danger mr-2" href="#" tag="delete">', '删除', '</a>',
                            '</td>',
                            '</tr>',
                        ].join(''));
                    });
                    $('#group_name').text(self.setting.group_name);
                    $('#knowledge_script_table>tbody').empty().append(tr_html.join('\r\n'));
                    self.setting.page_index = page_index;
                    self.setting.count = json.count;
                    common.touch_pagination(self.setting.page_index, self.setting.page_size, self.setting.count);
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    knowledge_script_delete: function(id) {
        var self = this;
        var data = {
            'id': parseInt(id),
        }
        if (!data['id'] && data['id'] !== 0) data['id'] = id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/knowledge_script_delete',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    common.bs_modal_message('删除成功，删除1条内容');
                    self.init_knowledge_script_list(self.setting.group_id, self.setting.page_index);
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    init_modal: function() {
        var self = this;
        $.ajax({
            type: 'POST',
            url: '/api/scene_list_query',
            data: '{}',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    var div_html = [];
                    $.each(json.data, function(i, item){
                        div_html.push([
                            '<a class="dropdown-item" href="#" scene_id="', item.scene_id, '">', item.scene_name, '</a>'
                        ].join(''))
                    });
                    $('#create_scene_menu').empty().append(div_html.join(''));
                    var scene_id = $('#create_scene_menu').attr('scene_id');
                    $('#create_scene_menu').find('a[scene_id="' + scene_id + '"]').click();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    build_modal: function(id) {
        var self = this;
        var data = {
            'id': parseInt(id),
        }

        if (!data['id'] && data['id'] !== 0) data['id'] = id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/knowledge_script_detail',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    $('.btn-outline-info[tag="record_input"]').show();
                    $('#create_name').val(json.data.name);
                    $('#create_questions').val(json.data.questions.join('\n'));
                    //$('#create_answers').val(json.data.answers.join('\n'));
                    if(json.data.answers.length > 0) {
                        $('#create_answers').val(json.data.answers[0]);
                        for(var i=json.data.answers.length-1;i>0;i--) {  //倒叙插入
                            common.add_record_input($('#create_answers').parent(), 'create_answers', json.data.answers[i], true);
                        }
                    }
                    if (json.data.trigger) {
                        $('#create_scene_menu').attr('scene_id', json.data.trigger.scene_id);
                        $('#create_scene').attr('scene_id', json.data.trigger.scene_id);
                        $('#create_trigger').val(json.data.trigger.actions.join('\n'));
                    }
                    $('#knowledgeScriptModal').modal('show');
                    $('#knowledgeScriptModal').attr('knowledge_script_id', json.data.id);
                    self.bind_input_event();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    upsert_knowledge_script: function() {
        var self = this;
        var answers = [];
        $('.ai-input').each(function(){
            if($.trim($(this).val()) != '') {
                answers.push($.trim($(this).val()));
            }
        });
        var data = {
            'name': $('#create_name').val() || '',
            'questions': $('#create_questions').val() && $('#create_questions').val().split('\n') || '',
            'answers': answers || '',
            'group_id': parseInt(self.setting.group_id),
        }
        var actions = $('#create_trigger').val();
        var scene_id = $('#create_scene').attr('scene_id');
        if (actions && scene_id) {
            data.trigger = {
                'scene_id': $('#create_scene').attr('scene_id'),
                'actions': actions.split('\n'),
            }
        } else if (actions || scene_id) {
            return common.bs_modal_message('场景触发未填写完整');
        }

        var url = '/api/knowledge_script_create';
        var knowledge_script_id = $('#knowledgeScriptModal').attr('knowledge_script_id');
        if (knowledge_script_id) {
            url = '/api/knowledge_script_update';
            data['id'] = parseInt(knowledge_script_id)
            data['id'] = (data['id'] || data['id'] === 0) ? data['id'] : knowledge_script_id;
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    if (knowledge_script_id || knowledge_script_id === 0 ){
                        common.bs_modal_message('修改成功');
                    } else {
                        common.bs_modal_message('创建成功');
                    }
                    $('#knowledgeScriptModal').modal('hide');
                    self.init_knowledge_script_list(self.setting.group_id, self.setting.page_index);
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    upsert_knowledge: function() {
        var self = this;
        var data = {
            'group_name': $('#create_group_name').val() || '',
        }
        if(!data['group_name']) {
            return common.bs_modal_message('知识库名称未填写');
        }

        var url = '/api/knowledge_create';
        var group_id = $('#knowledgeModal').attr('group_id');
        if (!!group_id) {
            url = '/api/knowledge_update';
            data['group_id'] = parseInt(group_id)
            data['group_id'] = (data['group_id'] || data['group_id'] === 0) ? data['group_id'] : group_id;
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    if (group_id || group_id === 0 ){
                        common.bs_modal_message('修改成功');
                    } else {
                        common.bs_modal_message('创建成功');
                    }
                    $('#knowledgeModal').modal('hide');
                    self.init_knowledge_list();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    knowledge_delete: function(group_id) {
        var self = this;
        var data = {
            'group_id': parseInt(group_id),
        }
        if (!data['group_id'] && data['group_id'] !== 0) data['group_id'] = group_id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/knowledge_delete',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    common.bs_modal_message('删除成功，删除' + json['count'] + '条内容', null, function(){
                        window.location.reload();
                    });
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },
        });
    },
}
