/*jslint unparam: true, regexp: true */
/*global window, $ */

$(document).bind('drop dragover', function(e) {
    e.preventDefault();
});

$(function() {
    $('#file_upload').fileupload({
        url: "upload",
        dataType: 'json',
        done: function(e, data) {
	    
            x_data = data;
	    
            console.log("server returned: " + data.result);
	    
            $('#file_dropzone>div').html(data.result);
	    
	    setTimeout(function() {
		window.location.href = window.location.origin + "/result/" + data.result.id;
	    }, 500);
        },
        progress: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#upload_progress>div.progress-bar').css('width', progress + '%');
        },
        dropZone: $('#file_dropzone')
    });
});

$('#file_dropzone')
    .on('dragover', function(e) {
        $(this).css('border-color', 'rgb(48, 99, 139)');
    })
    .on('dragleave', function(e) {
        $(this).css('border-color', '#c3c3c3');
    })
    .on('drop', function(e) {
        $('#file_dropzone>div').html("Uploading...");
    });
