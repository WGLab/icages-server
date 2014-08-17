 (function() {
     function goodDataFormat(val) {
         return /^(\s*[XY0-9]+\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s|\n]+)*[XY0-9]+\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s|\n]*$/g.test(val);
     }

     function goodEmailFormat(val) {
         return /[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|edu)\b/g.test(val);
     }

     function showBootstrapIndicator(container, input, indicator, validator, html5) {

         var html5 = html5 || false;

         var changeClasses = function(that, remove, add, in_remove, in_add) {
             $(that).removeClass(remove);
             $(that).addClass(add);
             $(indicator).removeClass(in_remove);
             $(indicator).addClass(in_add);
         };

         var validState = document.querySelector(input).validity;
         if (validState && html5) {
             $(container).on('input', function() {
                 if (validState.valid) {
                     changeClasses(this, 'has-error', 'has-success has-feedback', "glyphicon-remove", "glyphicon glyphicon-ok form-control-feedback");
                 } else {
                     changeClasses(this, 'has-success', 'has-error has-feedback', "glyphicon-ok", "glyphicon glyphicon-remove form-control-feedback");
                 }
             });
         } else {
             $(container).on('input', function() {

                 if (validator($(input).val())) {
                     changeClasses(this, 'has-error', 'has-success has-feedback', "glyphicon-remove", "glyphicon glyphicon-ok form-control-feedback");
                 } else {
                     changeClasses(this, 'has-success', 'has-error has-feedback', "glyphicon-ok", "glyphicon glyphicon-remove form-control-feedback");
                 }
             });
         }

     }

     $('#ex_button').popover({
        container: 'body',
	html: true,
	placement: 'bottom',
	title: "Example <a id='ex_popover_close' class='close'> &times;</a>",
	template: "<div class='popover example' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>"
     }).click(function(e) {
	e.stopPropagation();
     });

     $(document).click(function(e) {
	if ($(e.target).is('#ex_popover_close')) {
	   $('#ex_button').popover('hide');
        }
     }); 

     $(function() {
         showBootstrapIndicator('#data_input', '#data_input textarea', "#data_input .input-indicator", goodDataFormat);
         showBootstrapIndicator('#email_input', '#email_input input', "#email_input .input-indicator", goodEmailFormat);


         $("#submit_text").click(function(e) {
             var url = "/upload";

             e.preventDefault();

             var text_val = $('#data_input textarea').val();
             var email_val = $('#email_input input').val();

             var goodData = goodDataFormat(text_val);
             var goodEmail = goodEmailFormat(email_val);
             if (!goodEmail) {
		alert("Please enter a valid email address.");
                return;
             }

             if (goodData) {
                 $.ajax(url, {
                     type: "POST",
                     data: {
                         email: goodEmail ? email_val : "",
                         inputData: $('#data_input textarea').val()
                     },
                     success: function(data) {
                         console.log("server returned\n" + data.msg);

                         $('#flash_msg').removeClass('bounceIn bounceOut');
                         $("#flash_msg").css("display", "block").addClass('bounceIn');
                         setTimeout(function() {
                             $("#flash_msg").addClass('bounceOut');
                             setTimeout(function() {
                                 $("#flash_msg").css("display", "none");
				 window.location.href = window.location.origin + "/result/" + data.id;
                             }, 750);
                         }, 3000);

                     }
                 });
             } else {
                 alert("Invalid input data");
             }
         });
     });

     /*jslint unparam: true, regexp: true */
     /*global window, $ */

     $(document).bind('drop dragover', function(e) {
         e.preventDefault();
     });
     $(function() {
         $('#file_upload').fileupload({
             url: "/upload",
             dataType: 'json',
             add: function(e, data) {
                 $('#file_dropzone>div').html("<i class='glyphicon glyphicon-file'></i>" + data.files[0].name);
                 $('#submit_file').on("click", function() {
                     var email_val = $('#email_input input').val();
		     var goodEmail = goodEmailFormat(email_val);
		     if (!goodEmail) {
			alert("Please enter a valid email address.");
                        return;	
                     }
		     data.formData = {email: goodEmail ? email_val : ''};
                     data.submit();
                });
             },
             done: function(e, data) {
                 x_data = data;
                 console.log("server returned: " + data.result.msg);
                 $('#file_dropzone>div').html(data.result.msg);
		 window.location.href = window.location.origin + "/result/" + data.result.id;
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
         });
 })();

