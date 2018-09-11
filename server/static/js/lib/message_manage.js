'use strict';

window.message_manage = {
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
    },
    bind_event: function() {
        var self = this;
        $('#knowledge_ul').on('click', 'a', function(event){
            var group_id = $(this).closest('li').attr('group_id');
            var group_name = $(this).closest('li').text();
            self.setting.group_id = group_id;
            self.setting.group_name = group_name;
            $('#knowledge_ul').find('a').removeClass('bg-white');
            $(this).addClass('bg-white');
            self.init_contact_detail();
            setInterval(function(){self.init_contact_detail();}, 3000);
            return false;
        });
        $('#pagination').on('click', 'a', function(event){
            var pageno = parseInt($(this).attr('pageno'));
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
            self.init_message_manage_list(self.setting.group_id, 1);
            return false;
        });
        $('#knowledgeScriptModal').on('show.bs.modal', function (event) {
            // var button = $(event.relatedTarget); // Button that triggered the modal
            // self.init_modal();
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
            $('#knowledgeScriptModal').attr('message_manage_id', null);
            common.clear_dynamic_div();
            $('.btn-outline-info[tag="record_input"]').hide();
        });
        $('#message_manage_table>tbody').on('click', 'a[tag="delete"]', function(event){
            var id = $(this).closest("tr").attr("dialogue_id");
            self.message_manage_delete(id);
            return false;
        });
        $('#message_manage_table>tbody').on('click', 'a[tag="edit"]', function(event){
            var id = $(this).closest("tr").attr("dialogue_id");
            self.build_modal(id);
            return false;
        });
        $('#create_scene_menu').on('click', 'a', function(event){
            $('#create_scene').attr('scene_id', $(this).attr('scene_id'));
            $('#create_scene').text($(this).text());
            return true; // go on to fire hide the dropdown menu
        });
        $('#btn_upsert_message_manage').on('click', function(){
            self.upsert_message_manage();
            return false;
        });
        $('#msgbox').on('keydown', function(event){
            if (event.ctrlKey && event.keyCode == 13)  {
                self.send_message();
            }
        });
    },
    init_knowledge_list: function() {
        var self = this;
        $.ajax({
            type: 'POST',
            url: '/api/contact_list_query',
            data: '{}',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (json.code !== 200) {
                    return common.bs_modal_message(json.message);
                } else {
                    var li_html = [];
                    $.each(json.data, function(i, item){
                        li_html.push([
                            '<li class="nav-item" group_id="' + item.wxid + '">',
                                '<a class="nav-link" href="#">',
                                    '<span data-feather="file-text"></span>',
                                    item.nick_name,
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
    send_message: function() {
        var self = this;
        var data = {
            'type': "message",
            'to_id': self.setting.group_id,
            'text': $('#msgbox').val(),
        }
        $('#msgbox').val(null);

        $.ajax({
            type: 'POST',
            url: '/api/send_any_message',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (json.code !== 200) {
                    return common.bs_modal_message(json.message);
                } else {
                    // common.bs_modal_message('发送成功');
                    // self.init_contact_detail();
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },
        });
    },
    init_contact_detail: function() {
        var self = this;
        if(!self.setting.group_id){
            return;
        }
        var data = {
            'wxid': self.setting.group_id,
        }
        $.ajax({
            type: 'POST',
            url: '/api/message_list_query',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                if (json.code !== 200) {
                    return common.bs_modal_message(json.message);
                } else {
                    var html = [];
                    $.each(json.data, function(i, item) {
                        var li = [
                        '<li>',
                            '<p class="time"> <span>', item.date ,'</span> </p>',
                            '<div class="main ', item.self && 'self' ,'"> <img class="avatar" width="30" height="30" src="/static/img/2.png">',
                                '<div class="text">', item.text ,'</div>',
                            '</div>',
                        '</li>',
                        ];
                        html.unshift(li.join(""));
                    });
                    $('#chatroom ul').empty().append(html.join(""));
                }
            },
            error: function(error) {
                return common.bs_modal_message(error);
            },
        });
    },
}
