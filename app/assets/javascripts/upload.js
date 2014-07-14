(function() {
    function goodFormat(val) {
        return /^(\s*[0-9]\s+[0-9]+\s+[ATCG]\s+[ATCG][\s|\n]+)*[0-9]\s+[0-9]+\s+[ATCG]\s+[ATCG][\s|\n]*$/g.test(val);
    }
    
    $(function() {
        $('#inputData').on('input', function() {
	    
            if (goodFormat($('#inputData textarea').prop("value"))) {
                $(this).removeClass('has-error');
                $(this).addClass('has-success has-feedback');
                $('#inputData span').removeClass("glyphicon-remove");
                $('#inputData span').addClass("glyphicon-ok");
            } else {
                $(this).removeClass('has-success');
                $(this).addClass('has-error has-feedback');
                $('#inputData span').removeClass("glyphicon-ok");
                $('#inputData span').addClass("glyphicon-remove");
            }
	    
        });
	
	
        $("form").submit(function(e) {
            var url = "upload";
	    
            e.preventDefault();
	    
            var val = $('#inputData textarea').prop("value");
	    
            if (goodFormat(val)) {
                $.ajax(url, {
                    type: "POST",
                    data: $('#inputData textarea').serialize(),
                    success: function(data) {
                        console.log("server returned\n" + data);
			
                        $('#flash_msg').removeClass('bounceIn bounceOut');
                        $("#flash_msg").css("display", "block").addClass('bounceIn');
                        setTimeout(function() {
                            $("#flash_msg").addClass('bounceOut');
                            setTimeout(function() {
                                $("#flash_msg").css("display", "none");
				window.location.href = window.location.origin + "/result/" + data;
                            }, 750);
                        }, 3000);
			
                    }
                });
            } else {
                alert("Invalid input data");
            }
        });
    });
})();

