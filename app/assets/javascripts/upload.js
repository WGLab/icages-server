 (function() {
     function goodDataFormat(val) {
         return /^(\s*([0-9]{1,2}|[XY])\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s\n]+)*\s*([0-9]{1,2}|[XY])\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s\n]*$/g.test(val) || /^[\n]*##fileformat=VCFv[\S\n\s]+$/g.test(val);
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

     function addPopover(prefix) {
         $('#' + prefix + '_btn').popover({
             container: 'body',
             html: true,
             placement: 'bottom',
             title: "Example <a id='" + prefix + "_close' class='close'> &times;</a>",
             template: "<div class='popover example' role='tooltip'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div></div>"
         }).click(function(e) {
             e.stopPropagation();
         });

         $(document).click(function(e) {
             if ($(e.target).is("#" + prefix + "_close")) {
                 $('#' + prefix + '_btn').popover('hide');
             }
         });
     }

     
     addPopover('an_ex');
     addPopover('vcf_ex'); 


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
     $('#sample_btn').click(function() {
                            $('#data_input textarea').val("1\s12919840\s12919840\sT\sC\n1\s35332717\s35332717\sC\sA\n1\s55148456\s55148456\sG\sT\n1\s70504789\s70504789\sC\sT\n1\s167059520\s167059520\sA\sT\n1\s182496864\s182496864\sA\sT\n1\s197073351\s197073351\sC\sT\n1\s216373211\s216373211\sG\sT\n10\s37490170\s37490170\sG\sA\n10\s56089432\s56089432\sA\sC\n10\s69957135\s69957135\sA\sT\n10\s125601918\s125601918\sC\sA\n10\s125804220\s125804220\sC\sA\n10\s134649656\s134649656\sC\sA\n11\s5172737\s5172737\sG\sT\n11\s5905898\s5905898\sG\sT\n11\s6942832\s6942832\sC\sA\n11\s16068172\s16068172\sC\sT\n11\s44297060\s44297060\sG\sA\n11\s48328274\s48328274\sG\sC\n11\s89409330\s89409330\sA\sG\n11\s107965601\s107965601\sT\sG\n11\s120180145\s120180145\sC\sA\n12\s32481489\s32481489\sG\sA\n12\s67699695\s67699695\sG\sT\n12\s96883571\s96883571\sT\sC\n12\s119968739\s119968739\sG\sC\n13\s32340125\s32340125\sC\sA\n13\s36521559\s36521559\sG\sA\n14\s20529107\s20529107\sC\sT\n14\s36154270\s36154270\sT\sC\n14\s59112264\s59112264\sG\sC\n14\s63174963\s63174963\sC\sA\n14\s94007023\s94007023\sA\sT\n14\s95557552\s95557552\sG\sA\n14\s105410443\s105410443\sC\sG\n15\s20739706\s20739706\sT\sC\n15\s30054548\s30054548\sA\sG\n16\s20376770\s20376770\sG\sT\n16\s66422268\s66422268\sC\sA\n17\s7125396\s7125396\sA\sG\n17\s21731175\s21731175\sC\sA\n17\s26958542\s26958542\sC\sT\n17\s41836054\s41836054\sC\sT\n18\s14852153\s14852153\sG\sT\n18\s55319937\s55319937\sG\sA\n18\s58039082\s58039082\sC\sA\n18\s61170854\s61170854\sC\sT\n19\s13249152\s13249152\sG\sT\n19\s52938422\s52938422\sC\sA\n19\s53770704\s53770704\sC\sG\n19\s53911857\s53911857\sC\sT\n19\s57286834\s57286834\sA\sT\n2\s84940277\s84940277\sG\sT\n2\s112945031\s112945031\sA\sT\n2\s136552307\s136552307\sT\sG\n2\s157332699\s157332699\sG\sT\n2\s179588352\s179588352\sC\sA\n2\s187627271\s187627271\sG\sT\n2\s189863400\s189863400\sG\sT\n2\s189910616\s189910616\sA\sG\n2\s201533514\s201533514\sT\sC\n2\s238245127\s238245127\sC\sA\n20\s23473695\s23473695\sC\sG\n20\s29956465\s29956465\sG\sA\n20\s47266080\s47266080\sG\sC\n22\s30661003\s30661003\sG\sC\n3\s10157495\s10157495\sA\sG\n3\s11064098\s11064098\sA\sT\n3\s13413467\s13413467\sC\sA\n3\s51690015\s51690015\sC\sT\n3\s52417509\s52417509\sG\sT\n3\s63821060\s63821060\sT\sA\n3\s100087931\s100087931\sT\sC\n3\s112998777\s112998777\sC\sT\n3\s118621763\s118621763\sG\sT\n4\s13617077\s13617077\sC\sA\n4\s20533629\s20533629\sA\sG\n4\s147830310\s147830310\sG\sC\n4\s173269688\s173269688\sT\sA\n5\s19483542\s19483542\sG\sT\n5\s37326041\s37326041\sC\sA\n5\s55110949\s55110949\sC\sT\n5\s75596562\s75596562\sC\sA\n5\s140536091\s140536091\sC\sG\n5\s140616128\s140616128\sC\sG\n5\s140723876\s140723876\sG\sT\n5\s159686516\s159686516\sG\sA\n6\s7368953\s7368953\sG\sC\n6\s49808692\s49808692\sG\sC\n6\s109752383\s109752383\sC\sT\n6\s137329736\s137329736\sC\sT\n7\s47867026\s47867026\sG\sT\n7\s69583198\s69583198\sC\sA\n7\s93518498\s93518498\sG\sA\n7\s149475905\s149475905\sC\sA\n8\s3076901\s3076901\sG\sA\n8\s11995670\s11995670\sG\sT\n8\s37704629\s37704629\sC\sT\n8\s71068967\s71068967\sC\sA\n8\s77764912\s77764912\sG\sC\n8\s77775920\s77775920\sC\sA\n8\s79510674\s79510674\sA\sC\n8\s88363968\s88363968\sC\sA\n8\s89179974\s89179974\sG\sA\n8\s105503431\s105503431\sC\sA\n8\s118819526\s118819526\sG\sA\n8\s118831993\s118831993\sC\sA\n9\s17409334\s17409334\sA\sG\n9\s21201831\s21201831\sG\sT\n9\s43627065\s43627065\sC\sT\n9\s79325065\s79325065\sC\sA\n9\s104171019\s104171019\sA\sT\n9\s105767273\s105767273\sC\sA\nX\s47426121\s47426121\sC\sG\nX\s48213490\s48213490\sC\sA\nX\s54020144\s54020144\sG\sT\nX\s55249114\s55249114\sG\sT\nX\s64140039\s64140039\sT\sA\nX\s71802303\s71802303\sA\sT\nX\s75004601\s75004601\sC\sG\nX\s76939716\s76939716\sG\sA\nX\s78216983\s78216983\sT\sA\nX\s100513426\s100513426\sG\sT\nX\s118717207\s118717207\sC\sT\nX\s130416606\s130416606\sG\sT");
     });
 })();

