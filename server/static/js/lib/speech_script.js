'use strict'

window.speech_script = {
    init: function() {
        var self = this;
        self.init_data();
    },
    init_data: function() {

        var data = {}
        $.ajax({
            type: 'POST',
            url: '/api/123123',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {

                if (json.code == 20000) {
                    console.log("good");
                } else {
                    console.log("bad");
                }

            },
            error: function(error) {
                console.log(error);
            },

        });
    }
}
