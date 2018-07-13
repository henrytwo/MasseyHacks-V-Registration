$(document).ready(function () {

    var bgresize = function () {

        var windowz = $(window);

        if ($(window).width() <= 1230) {
            $("#login-box").addClass("col-10");
            $("#login-box").removeClass("col-3");

            $("#login-box").removeClass("fadeInLeft");
            $("#login-box").addClass("fadeInUp");


            $("#global-spacer").height($("#cover").height() / 2 - $("#login-box").height() / 2);

        } else {
            $("#login-box").removeClass("col-10");
            $("#login-box").addClass("col-3");

            $("#login-box").removeClass("fadeInUp");
            $("#login-box").addClass("fadeInLeft")

            $("#global-spacer").height(0);
        }

    };

    $("#login-submit").click(function() {
        var email = $("#email-login").val();
        var password = $("#password-login").val();

        $("#error").html("");
        $("#error").attr("hidden", true);

        $.ajax({
            type: "POST",
            url:'/auth/login',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: function (data) {

                swal("Success!", data, "success");
            
            },
            error: function(data) {
                console.log(data.responseText);
                $("#error").attr("hidden", false);
                $("#error").html(JSON.parse(data.responseText)['error']);
            }
        })
    });

    $("#register-submit").click(function() {
        var email = $("#email-register").val();

        var password1 = $("#password-register-1").val();
        var password2 = $("#password-register-2").val();

        var firstName = $("#first-name-register").val();
        var lastName = $("#last-name-register").val();

        $("#error").html("");
        $("#error").attr("hidden", true);

        if (password1 != password2) {
            $("#error").attr("hidden", false);
            $("#error").html("Idiot! Your passwords don't match!");
        } else {
            $.ajax({
                type: "POST",
                url: '/auth/register',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({
                    email: email,
                    password: password1,
                    firstName: firstName,
                    lastName: lastName
                }),
                success: function (data) {
                    console.log(data);
                    swal("Success!", data, "success");
                },
                error: function (data) {
                    $("#error").attr("hidden", false);
                    $("#error").html(JSON.parse(data.responseText)['error']);
                }
            });
        }
    });

    // Toggle between states
    $("#register-switch").click(function() {
        $("#register-core").attr("hidden", false);
        $("#login-core").attr("hidden", true);
    });

    $("#login-switch").click(function() {
        $("#register-core").attr("hidden", true);
        $("#login-core").attr("hidden", false);
    });

    bgresize();
    $(window).resize(bgresize);
    $(window).on("orientationchange", bgresize);
});