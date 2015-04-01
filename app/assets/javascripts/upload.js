(function() {
    function goodDataFormat(val) {
        return /^(\t*([0-9]{1,2}|[XY])\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s\n]+)*\s*([0-9]{1,2}|[XY])\s+[0-9]+\s+[0-9]+\s+[ATCG]\s+[ATCG][\s\n]*$/g.test(val) || /^[\n]*##fileformat=VCFv[\S\n\s]+$/g.test(val);
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
                    data.formData = {
                        email: goodEmail ? email_val : ''
                    };
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
        $('#data_input textarea').val("1\t12919840\t12919840\tT\tC\n1\t35332717\t35332717\tC\tA\n1\t55148456\t55148456\tG\tT\n1\t70504789\t70504789\tC\tT\n1\t167059520\t167059520\tA\tT\n1\t182496864\t182496864\tA\tT\n1\t197073351\t197073351\tC\tT\n1\t216373211\t216373211\tG\tT\n10\t37490170\t37490170\tG\tA\n10\t56089432\t56089432\tA\tC\n10\t69957135\t69957135\tA\tT\n10\t125601918\t125601918\tC\tA\n10\t125804220\t125804220\tC\tA\n10\t134649656\t134649656\tC\tA\n11\t5172737\t5172737\tG\tT\n11\t5905898\t5905898\tG\tT\n11\t6942832\t6942832\tC\tA\n11\t16068172\t16068172\tC\tT\n11\t44297060\t44297060\tG\tA\n11\t48328274\t48328274\tG\tC\n11\t89409330\t89409330\tA\tG\n11\t107965601\t107965601\tT\tG\n11\t120180145\t120180145\tC\tA\n12\t32481489\t32481489\tG\tA\n12\t67699695\t67699695\tG\tT\n12\t96883571\t96883571\tT\tC\n12\t119968739\t119968739\tG\tC\n13\t32340125\t32340125\tC\tA\n13\t36521559\t36521559\tG\tA\n14\t20529107\t20529107\tC\tT\n14\t36154270\t36154270\tT\tC\n14\t59112264\t59112264\tG\tC\n14\t63174963\t63174963\tC\tA\n14\t94007023\t94007023\tA\tT\n14\t95557552\t95557552\tG\tA\n14\t105410443\t105410443\tC\tG\n15\t20739706\t20739706\tT\tC\n15\t30054548\t30054548\tA\tG\n16\t20376770\t20376770\tG\tT\n16\t66422268\t66422268\tC\tA\n17\t7125396\t7125396\tA\tG\n17\t21731175\t21731175\tC\tA\n17\t26958542\t26958542\tC\tT\n17\t41836054\t41836054\tC\tT\n18\t14852153\t14852153\tG\tT\n18\t55319937\t55319937\tG\tA\n18\t58039082\t58039082\tC\tA\n18\t61170854\t61170854\tC\tT\n19\t13249152\t13249152\tG\tT\n19\t52938422\t52938422\tC\tA\n19\t53770704\t53770704\tC\tG\n19\t53911857\t53911857\tC\tT\n19\t57286834\t57286834\tA\tT\n2\t84940277\t84940277\tG\tT\n2\t112945031\t112945031\tA\tT\n2\t136552307\t136552307\tT\tG\n2\t157332699\t157332699\tG\tT\n2\t179588352\t179588352\tC\tA\n2\t187627271\t187627271\tG\tT\n2\t189863400\t189863400\tG\tT\n2\t189910616\t189910616\tA\tG\n2\t201533514\t201533514\tT\tC\n2\t238245127\t238245127\tC\tA\n20\t23473695\t23473695\tC\tG\n20\t29956465\t29956465\tG\tA\n20\t47266080\t47266080\tG\tC\n22\t30661003\t30661003\tG\tC\n3\t10157495\t10157495\tA\tG\n3\t11064098\t11064098\tA\tT\n3\t13413467\t13413467\tC\tA\n3\t51690015\t51690015\tC\tT\n3\t52417509\t52417509\tG\tT\n3\t63821060\t63821060\tT\tA\n3\t100087931\t100087931\tT\tC\n3\t112998777\t112998777\tC\tT\n3\t118621763\t118621763\tG\tT\n4\t13617077\t13617077\tC\tA\n4\t20533629\t20533629\tA\tG\n4\t147830310\t147830310\tG\tC\n4\t173269688\t173269688\tT\tA\n5\t19483542\t19483542\tG\tT\n5\t37326041\t37326041\tC\tA\n5\t55110949\t55110949\tC\tT\n5\t75596562\t75596562\tC\tA\n5\t140536091\t140536091\tC\tG\n5\t140616128\t140616128\tC\tG\n5\t140723876\t140723876\tG\tT\n5\t159686516\t159686516\tG\tA\n6\t7368953\t7368953\tG\tC\n6\t49808692\t49808692\tG\tC\n6\t109752383\t109752383\tC\tT\n6\t137329736\t137329736\tC\tT\n7\t47867026\t47867026\tG\tT\n7\t69583198\t69583198\tC\tA\n7\t93518498\t93518498\tG\tA\n7\t149475905\t149475905\tC\tA\n8\t3076901\t3076901\tG\tA\n8\t11995670\t11995670\tG\tT\n8\t37704629\t37704629\tC\tT\n8\t71068967\t71068967\tC\tA\n8\t77764912\t77764912\tG\tC\n8\t77775920\t77775920\tC\tA\n8\t79510674\t79510674\tA\tC\n8\t88363968\t88363968\tC\tA\n8\t89179974\t89179974\tG\tA\n8\t105503431\t105503431\tC\tA\n8\t118819526\t118819526\tG\tA\n8\t118831993\t118831993\tC\tA\n9\t17409334\t17409334\tA\tG\n9\t21201831\t21201831\tG\tT\n9\t43627065\t43627065\tC\tT\n9\t79325065\t79325065\tC\tA\n9\t104171019\t104171019\tA\tT\n9\t105767273\t105767273\tC\tA\nX\t47426121\t47426121\tC\tG\nX\t48213490\t48213490\tC\tA\nX\t54020144\t54020144\tG\tT\nX\t55249114\t55249114\tG\tT\nX\t64140039\t64140039\tT\tA\nX\t71802303\t71802303\tA\tT\nX\t75004601\t75004601\tC\tG\nX\t76939716\t76939716\tG\tA\nX\t78216983\t78216983\tT\tA\nX\t100513426\t100513426\tG\tT\nX\t118717207\t118717207\tC\tT\nX\t130416606\t130416606\tG\tT");
    });


    //------------- Cancer subtype select UI -------------------

    var subtypes = ["Acute Myeloid Leukemia [LAML]", "Adrenocortical carcinoma [ACC]", "Bladder Urothelial Carcinoma [BLCA]", "Brain Lower Grade Glioma [LGG]", "Breast invasive carcinoma [BRCA]", "Cervical squamous cell carcinoma and endocervical adenocarcinoma [CESC]", "Cholangiocarcinoma [CHOL]", "Colon adenocarcinoma [COAD]", "Esophageal carcinoma [ESCA]", "FFPE Pilot Phase II [FPPP]", "Glioblastoma multiforme [GBM]", "Head and Neck squamous cell carcinoma [HNSC]", "Kidney Chromophobe [KICH]", "Kidney renal clear cell carcinoma [KIRC]", "Kidney renal papillary cell carcinoma [KIRP]", "Liver hepatocellular carcinoma [LIHC]", "Lung adenocarcinoma [LUAD]", "Lung squamous cell carcinoma [LUSC]", "Lymphoid Neoplasm Diffuse Large B-cell Lymphoma [DLBC]", "Mesothelioma [MESO]", "Ovarian serous cystadenocarcinoma [OV]", "Pancreatic adenocarcinoma [PAAD]", "Pheochromocytoma and Paraganglioma [PCPG]", "Prostate adenocarcinoma [PRAD]", "Rectum adenocarcinoma [READ]", "Sarcoma [SARC]", "Skin Cutaneous Melanoma [SKCM]", "Stomach adenocarcinoma [STAD]", "Testicular Germ Cell Tumors [TGCT]", "Thymoma [THYM]", "Thyroid carcinoma [THCA]", "Uterine Carcinosarcoma [UCS]", "Uterine Corpus Endometrial Carcinoma [UCEC]", "Uveal Melanoma [UVM]"];


    subtypes = subtypes.map(function(d) {
        var match = /([^\[\]]*) *\[(.*)\]/g.exec(d);
        return {
            label: match[1].trim(),
            value: match[2]
        };
    });

    var _selectedSubTypes = [];

    $('#cancer_subtype_input').autocomplete({
        source: subtypes,
        autoFocus: true,
        position: {
            my: "left bottom",
            at: "left top",
            collision: "none"
        },
        select: function(event, ui) {
            event.preventDefault();


            _selectedSubTypes.push(ui.item.value);

            var icon = $('<i></i>', {
                "class": "glyphicon glyphicon-remove-circle"
            });
            

            var div = $('<div></div>', {
                html: [ui.item.value, icon],
                title: ui.item.label,
                "class": "hz-tag",
            });

            icon.click(function() {
                _selectedSubTypes.splice(_selectedSubTypes.indexOf(ui.item.value), 1);
                $(div).remove();
            });

            div.hover(function() {
                icon.show();
            }, function() {
                icon.hide();
            })

            $('#tags_container').append(div);

            $('#cancer_subtype_input').focus();
        },
        change: function(event, ui) {
            event.preventDefault();
        }
    });

})();
