$(function(){
    new FormValidator("profile-form",[
        {"name":"slug","rules":"alpha_numeric|min_length[1]|max_length[20]"},
        {"name":"email","rules":"valid_email"},
        {"name":"url","rules":"valid_url"}
    ],function(errors,e) {
        e.preventDefault();
        $('.invalid').hide();
        if(errors.length){
            $("#"+errors[0].id+"-invalid").removeClass("hide").show();
            return;
        }
        $('#profile').ajaxSubmit(function(json){
            if(json.status === "error"){
                alert(json.msg);
            }else{
                alertify.success("Profile saved")
            }
            return false;
        });
    })
});
