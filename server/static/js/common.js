'use strict';

window.common = {
    record_page_url: "https://127.0.0.1:8082/record/page",
    record_input_count: 1,
    touch_pagination: function(page_index, page_size, count) {
        var first_page = 1;
        var last_page = Math.ceil(count / page_size);
        var $pagination = $('#pagination');
        $pagination.find('a[tag=pf],a[tag=pl]').closest('li').removeClass('disabled');
        var start_page = 1;
        if (page_index == first_page) {
            start_page = 1;
        } else if (page_index == last_page) {
            start_page = last_page - 2;
        } else {
            start_page = page_index - 1;
        }
        start_page = Math.max(start_page, 1);
        $pagination.find('a[tag=pf]').attr('pageno', 1);
        $pagination.find('a[tag=pg1]').attr('pageno', start_page).text(start_page);
        $pagination.find('a[tag=pg2]').attr('pageno', start_page + 1).text(start_page + 1);
        $pagination.find('a[tag=pg3]').attr('pageno', start_page + 2).text(start_page + 2);
        $pagination.find('a[tag=pl]').attr('pageno', last_page);

        $pagination.find('a[tag=pg1],a[tag=pg2],a[tag=pg3]').closest('li').addClass('disabled');
        $pagination.find('a[tag=pg1],a[tag=pg2],a[tag=pg3]').filter(function(){
            return $(this).attr('pageno') <= last_page;
        }).closest('li').removeClass('disabled');
    },
    bs_modal_message: function(message, title, callback) {
        var modal_html = [
            '<div class="modal" tabindex="-1" role="dialog" id="bs_modal_message">',
            '<div class="modal-dialog" role="document">',
            '<div class="modal-content">',
            '<div class="modal-header">',
            '<h5 class="modal-title">', title || '提示', '</h5>',
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">',
            '<span aria-hidden="true">&times;</span>',
            '</button>',
            '</div>',
            '<div class="modal-body">',
            '<p>', message, '</p>',
            '</div>',
            '<div class="modal-footer">',
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>',
        ].join('');
        var $bs_modal_message = $('#bs_modal_message');
        if($bs_modal_message.length > 0) {
            $bs_modal_message.modal('hide');
            $bs_modal_message.remove();
        }
        $(document.body).append(modal_html);
        $bs_modal_message = $('#bs_modal_message');
        $bs_modal_message.on('hide.bs.modal', function (event) {
            $bs_modal_message.remove();
            if (callback) callback();
        });
        // change the z_index to cover old modal
        var max_z_index = 1040;
        if( $('body>.modal-backdrop:last').length > 0) {
            var old_max_z_index = $('body>.modal-backdrop:last').css('z-index');
            old_max_z_index = parseInt(old_max_z_index);
            if (old_max_z_index) {
                max_z_index = Math.max(max_z_index, old_max_z_index);
            }
        }
        $bs_modal_message.modal('show');
        $('body>.modal-backdrop:last').css('z-index', max_z_index + 11);
        $bs_modal_message.css('z-index', max_z_index + 12);
    },
    bs_modal_confirm: function(message, title, yes_callback, no_callback) {
        var modal_html = [
            '<div class="modal" tabindex="-1" role="dialog" id="bs_modal_confirm">',
            '<div class="modal-dialog" role="document">',
            '<div class="modal-content">',
            '<div class="modal-header">',
            '<h5 class="modal-title">', title || '确认', '</h5>',
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">',
            '<span aria-hidden="true">&times;</span>',
            '</button>',
            '</div>',
            '<div class="modal-body">',
            '<p>', message, '</p>',
            '</div>',
            '<div class="modal-footer">',
            '<button type="button" class="btn btn-danger" tag="yes">确认</button>',
            '<button type="button" class="btn btn-secondary" data-dismiss="modal" tag="no">取消</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>',
        ].join('');
        var $bs_modal_confirm = $('#bs_modal_confirm');
        if($bs_modal_confirm.length > 0) {
            $bs_modal_confirm.modal('hide');
            $bs_modal_confirm.remove();
        }
        $(document.body).append(modal_html);
        $bs_modal_confirm = $('#bs_modal_confirm');
        $bs_modal_confirm.on('hide.bs.modal', function (event) {
            $bs_modal_confirm.remove();
        });
        $bs_modal_confirm.on('click', 'button[tag="yes"]', function(event) {
            if (yes_callback) yes_callback();
            $bs_modal_confirm.modal('hide');
        });
        // change the z_index to cover old modal
        var max_z_index = 1040;
        if( $('body>.modal-backdrop:last').length > 0) {
            var old_max_z_index = $('body>.modal-backdrop:last').css('z-index');
            old_max_z_index = parseInt(old_max_z_index);
            if (old_max_z_index) {
                max_z_index = Math.max(max_z_index, old_max_z_index);
            }
        }
        $bs_modal_confirm.modal('show');
        $('body>.modal-backdrop:last').css('z-index', max_z_index + 11);
        $bs_modal_confirm.css('z-index', max_z_index + 12);
    },

    add_record_input: function(previous, id, bind_value, has_record) {
        if(previous) {
            if(!bind_value) {
                bind_value = "";
            }
            id = id + '_' + this.record_input_count;
            var record_html = '<a class="btn btn-sm btn-outline-info mr-1 ai-btn" href="#" tag="record_input">录音</a>';
            if(!has_record) {
                record_html = '';
            }
            $(previous).after([
                '<div class="input-group mb-3" tag="dynamic_input_div">',
                    '<div class="input-group-prepend">',
                        '<span class="input-group-text">AI问题:</span>',

                    '</div>',
                    '<input type="text" class="form-control ai-input" id="' + id + '" value="' + bind_value + '">',
                    '<a class="btn btn-sm btn-outline-success mr-1 ai-btn" href="#" tag="add_input">添加</a>',
                    record_html,
                    '<a class="btn btn-sm btn-outline-danger mr-1 ai-btn" href="#" tag="remove_input">删除</a>',
                '</div>'
            ].join(''));
            this.record_input_count++;
        }
    },

    clear_dynamic_div: function() {
        $('div[tag="dynamic_input_div"]').remove();
    }
}
