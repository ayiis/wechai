'use strict';

window.scene_script = {
    init: function() {
        var self = this;
        self.setting = {
            page_index: 1,
            page_size: 10,
            count: 0,
            scene_id: 0,
            scene_name: 0,
        };
        self.init_scene_list();
        self.bind_event();
        self.bind_input_event();
    },
    bind_event: function() {
        var self = this;
        $('#scene_ul').on('click', 'a', function(event) {
            var scene_id = $(this).closest('li').attr('scene_id');
            self.setting.scene_id = (scene_id || parseInt(scene_id) === 0) ? parseInt(scene_id) : scene_id;
            self.setting.scene_name = $(this).closest('li').text();
            self.setting.activate = $(this).closest('li').attr('activate') == 'true';
            self.init_scene_script_list(self.setting.scene_id, 1);
            if (self.setting.activate) {
                $('#btn_enable_scene').addClass('d-none');
                $('#btn_disable_scene').removeClass('d-none');
            } else {
                $('#btn_enable_scene').removeClass('d-none');
                $('#btn_disable_scene').addClass('d-none');
            }
            $('#scene_ul').find('a').removeClass('bg-white');
            $(this).addClass('bg-white');
            return false;
        });
        $('#pagination').on('click', 'a', function(event){
            var pageno = parseInt($(this).attr('pageno'));
            self.init_scene_script_list(self.setting.scene_id, pageno);
            return false;
        });
        $('#btn_upsert_scene').on('click', function(event){
            self.upsert_scene();
            return false;
        });
        $('#btn_edit_scene').on('click', function(event){
            $('#sceneModal').modal('show');
            $('#create_scene_name').val(self.setting.scene_name);
            $('#sceneModal').attr('scene_id', self.setting.scene_id);
            return false;
        });
        $('#sceneModal').on('hide.bs.modal', function (event) {
            $('#create_scene_name').val(null);
            $('#sceneModal').attr('scene_id', null);
        });
        $('#btn_remove_scene').on('click', function(event) {
            common.bs_modal_confirm('此知识库内的所有内容将被清空', null, function(){
                self.scene_delete(self.setting.scene_id);
            });
            return false;
        });
        $('#btn_search').on('click', function(event){
            self.init_scene_script_list(self.setting.scene_id, 1);
            return false;
        });
        $('#sceneScriptModal').on('show.bs.modal', function (event) {
            // var button = $(event.relatedTarget); // Button that triggered the modal
            self.init_modal();
        });
        $('#sceneScriptModal').on('hide.bs.modal', function (event) {
            $('#create_dialogue_name').val(null);
            $('#create_pre_conditions').val(null);
            $('#create_questions').val(null);
            $('#sceneScriptModal').attr('dialogue_id', null);
            $('#scene_script_answers_table>tbody').empty();
            common.clear_dynamic_div();
            $('.btn-outline-info[tag="record_input"]').hide();
            scene_script.bind_input_event();

        });
        $('#scene_script_table>tbody').on('click', 'a[tag="delete"]', function(event){
            var dialogue_id = $(this).closest("tr").attr("dialogue_id");
            self.scene_script_delete(dialogue_id);
            return false;
        });
        $('#scene_script_table>tbody').on('click', 'a[tag="edit"]', function(event){
            var dialogue_id = $(this).closest("tr").attr("dialogue_id");
            self.build_modal(dialogue_id);
            return false;
        });
        $('#create_scene_menu').on('click', 'a', function(event){
            $('#create_scene').attr('scene_id', $(this).attr('scene_id'));
            $('#create_scene').text($(this).text());
            return true; // go on to fire hide the dropdown menu
        });
        $('#btn_upsert_scene_script').on('click', function(){
            self.upsert_scene_script();
            return false;
        });
        $('#btn_enable_scene').on('click', function(){
            self.update_status(1);
        });
        $('#btn_disable_scene').on('click', function(){
            self.update_status(0);
        });

        $('#scene_script_answers_table').on('click', '.btn[tag="add"]', function(){
            $('#scene_script_answers_table>tbody').append([
                '<tr>',
                    '<td><textarea class="form-control" tag="details"></textarea></td>',
                    '<td><textarea class="form-control" tag="actions"></textarea></td>',
                    '<td>',
                        '<a class="btn btn-sm btn-outline-danger mr-2" href="#" tag="delete">', '删除', '</a>',
                    '</td>',
                '</tr>'
            ].join(''));
        });

        $('#scene_script_answers_table').on('click', '.btn[tag="delete"]', function(){
            $(this).closest('tr').remove();
        });
    },

    bind_input_event: function() {
        var dialogue_id = $('#sceneScriptModal').attr('dialogue_id');
        var has_record = true;
        if (!dialogue_id) {
            has_record = false;
        }
        $('.btn[tag="add_input"]').off('click').on('click',  function(){
            common.add_record_input($(this).parent(), "create_questions", "", has_record);
            scene_script.bind_input_event(); //重新绑定事件
        });

        $('.btn[tag="remove_input"]').off('click').on('click',  function(){
            $(this).parent().remove();
        });

        $('.btn[tag="record_input"]').off('click').on('click',  function(){
            var content = $(this).parent().find("input").val();
            content = $.trim(content);
            if($.trim(content) === "") {
                common.bs_modal_message('请输入内容后再进行录音');
                return;
            }
            //录音文件的key使用MD5加密录音内容生成
            var key = $('#sceneScriptModal').attr('dialogue_id') + "_" + md5(content);
            content = encodeURIComponent(content);
            var url = common.record_page_url + '?content=' + content + '&key=' + key;
            //$("#record_page").attr('src', url);  //iframe方式无法获取麦克风权限
            //$("#recordModal").modal('show');
            window.open(url, 'record_window');
        });

    },

    init_scene_list: function() {
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
                    var li_html = [];
                    $.each(json.data, function(i, item){
                        li_html.push([
                            '<li class="nav-item" scene_id="' + item.scene_id + '" activate="' + item.activate + '">',
                                '<a class="nav-link" href="#">',
                                    '<span data-feather="file-text"></span>',
                                    item.scene_name,
                                '</a>',
                            '</li>'
                        ].join(''));
                    });
                    $('#scene_ul').empty().append(li_html.join(''));
                    feather.replace();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    init_scene_script_list: function(scene_id, page_index) {
        var self = this;
        var data = {
            'dialogue_name': $('#input_dialogue_name').val() || '',
            'pre_conditions': $('#input_pre_conditions').val() || '',
            'questions': $('#input_questions').val() || '',

            'scene_id': scene_id,
            'page_index': page_index,
            'page_size': self.setting.page_size,
        }
        $.ajax({
            type: 'POST',
            url: '/api/scene_script_list_query',
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
                            '<tr dialogue_id="' + item.dialogue_id + '">',
                            '<td>', item.dialogue_name, '</td>',
                            '<td>',
                                '<span title="' + item.pre_conditions[0] + '">', item.pre_conditions[0] && item.pre_conditions[0].substr(0, 20), '</span>',
                                '<br>',
                                '<span title="' + item.pre_conditions[1] + '">', item.pre_conditions[1] && item.pre_conditions[1].substr(0, 20), '</span>',
                            '</td>',
                            '<td>',
                                '<span title="' + item.questions[0] + '">', item.questions[0] && item.questions[0].substr(0, 20), '</span>',
                                '<br>',
                                '<span title="' + item.questions[1] + '">', item.questions[1] && item.questions[1].substr(0, 20), '</span>',
                            '</td>',
                            '<td><span class="badge badge-primary badge-pill">', item.answers.length, '</span></td>',
                            '<td>',
                                '<a class="btn btn-sm btn-outline-primary mr-2" href="#" tag="edit">', '编辑', '</a>',
                                '<a class="btn btn-sm btn-outline-danger mr-2" href="#" tag="delete">', '删除', '</a>',
                            '</td>',
                            '</tr>',
                        ].join(''));
                    });
                    $('#scene_script_table>tbody').empty().append(tr_html.join('\r\n'));
                    $('#scene_name').text(self.setting.scene_name);
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
    scene_script_delete: function(dialogue_id) {
        var self = this;
        var data = {
            'dialogue_id': parseInt(dialogue_id),
        }
        if (!data['dialogue_id'] && data['dialogue_id'] !== 0) data['dialogue_id'] = dialogue_id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/scene_script_delete',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    common.bs_modal_message('删除成功，删除1条内容');
                    self.init_scene_script_list(self.setting.scene_id, self.setting.page_index);
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },
        });
    },
    init_modal: function() {
        var self = this;
        var data = {
            'id': 0,
        };

        $.ajax({
            type: 'POST',
            url: '/api/scene_list_query',
            data: JSON.stringify(data),
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
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    build_modal: function(dialogue_id) {
        var self = this;
        var data = {
            'dialogue_id': parseInt(dialogue_id),
        };
        if (!data['dialogue_id'] && data['dialogue_id'] !== 0) data['dialogue_id'] = dialogue_id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/scene_script_detail',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    $('.btn-outline-info[tag="record_input"]').show();
                    $('#create_dialogue_name').val(json.data.dialogue_name);
                    $('#create_pre_conditions').val(json.data.pre_conditions.join('\n'));
                    if(json.data.questions.length > 0) {
                        $('#create_questions').val(json.data.questions[0]);
                        for(var i=json.data.questions.length-1;i>0;i--) {
                            common.add_record_input($('#create_questions').parent(), 'create_questions', json.data.questions[i], true);
                        }
                    }
                    var tr_html = [];
                    $.each(json.data.answers, function(i, item){
                        tr_html.push([
                            '<tr>',
                                '<td><textarea class="form-control" tag="details">', item.details.join('\n'), '</textarea></td>',
                                '<td><textarea class="form-control" tag="actions">', item.actions.join('\n'), '</textarea></td>',
                                '<td>',
                                    '<a class="btn btn-sm btn-outline-danger mr-2" href="#" tag="delete">', '删除', '</a>',
                                '</td>',
                            '</tr>',
                        ].join(''));
                    });
                    $('#scene_script_answers_table>tbody').empty().append(tr_html.join('\r\n'));
                    $('#sceneScriptModal').modal('show');
                    $('#sceneScriptModal').attr('dialogue_id', json.data.dialogue_id);
                    self.bind_input_event();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    upsert_scene_script: function() {
        var self = this;
        var questions = [];
        $('.ai-input').each(function(){
            if($.trim($(this).val()) != '') {
                questions.push($.trim($(this).val()));
            }
        });

        var data = {
            'dialogue_name': $('#create_dialogue_name').val() || '',
            'pre_conditions': $('#create_pre_conditions').val() && $('#create_pre_conditions').val().split('\n') || '',
            'questions': questions || '',
            'scene_id': parseInt(self.setting.scene_id),
            'answers': [],
        }
        if (!data['scene_id'] && data['scene_id'] !== 0) data['scene_id'] = self.setting.scene_id;   // compatible with old data

        var ele_trs = $('#scene_script_answers_table>tbody>tr');
        for(var i = 0; i < ele_trs.length ; i++ ) {
            var $ele = ele_trs.eq(i);
            var details = $ele.find('textarea[tag="details"]').val();
            var actions = $ele.find('textarea[tag="actions"]').val();
            if (details && actions) {
                data.answers.push({
                    'answer_id': i,
                    'details': details.split('\n'),
                    'actions': actions.split('\n'),
                });
            } else {
                return common.bs_modal_message('场景触发未填写完整');
            }
        }

        var url = '/api/scene_script_create';
        var dialogue_id = $('#sceneScriptModal').attr('dialogue_id');
        if (dialogue_id) {
            url = '/api/scene_script_update';
            data['dialogue_id'] = parseInt(dialogue_id)
            data['dialogue_id'] = (data['dialogue_id'] || data['dialogue_id'] === 0) ? data['dialogue_id'] : dialogue_id;
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
                    if (dialogue_id || dialogue_id === 0 ){
                        common.bs_modal_message('修改成功');
                    } else {
                        common.bs_modal_message('创建成功');
                    }
                    $('#sceneScriptModal').modal('hide');
                    self.init_scene_script_list(self.setting.scene_id, self.setting.page_index);
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    update_status: function(status) {
        var self = this;
        var data = {
            'scene_id': self.setting.scene_id,
            'activate': status === 1,
        }
        $.ajax({
            type: 'POST',
            url: '/api/scene_update',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (!json.success) {
                    return common.bs_modal_message(json.message);
                } else {
                    common.bs_modal_message('修改成功', null, function(){
                        self.setting.activate = !self.setting.activate ;
                        if (self.setting.activate) {
                            $('#btn_enable_scene').addClass('d-none');
                            $('#btn_disable_scene').removeClass('d-none');
                        } else {
                            $('#btn_enable_scene').removeClass('d-none');
                            $('#btn_disable_scene').addClass('d-none');
                        }
                    });
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },
        });
    },
    upsert_scene: function() {
        var self = this;
        var data = {
            'scene_name': $('#create_scene_name').val() || '',
        }
        if(!data['scene_name']) {
            return common.bs_modal_message('知识库名称未填写');
        }

        var url = '/api/scene_create';
        var scene_id = $('#sceneModal').attr('scene_id');
        if (!!scene_id) {
            url = '/api/scene_update';
            data['scene_id'] = parseInt(scene_id)
            data['scene_id'] = (data['scene_id'] || data['scene_id'] === 0) ? data['scene_id'] : scene_id;
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
                    if (scene_id || scene_id === 0 ){
                        common.bs_modal_message('修改成功');
                    } else {
                        common.bs_modal_message('创建成功');
                    }
                    $('#sceneModal').modal('hide');
                    self.init_scene_list();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },

        });
    },
    scene_delete: function(scene_id) {
        var self = this;
        var data = {
            'scene_id': parseInt(scene_id),
        }
        if (!data['scene_id'] && data['scene_id'] !== 0) data['scene_id'] = scene_id;   // compatible with old data

        $.ajax({
            type: 'POST',
            url: '/api/scene_delete',
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
    }
}
