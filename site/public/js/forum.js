function categoriesFormEvents(){
    $("#ui-category-list").sortable({
        items : '.category-sortable',
        handle: ".handle",
        update: function (event, ui) {
            reorderCategories();
        }
    });
    $("#ui-category-list").find(".fa-edit").click(function() {
        var item = $(this).parent().parent().parent();
        var category_desc = item.find(".categorylistitem-desc span").text().trim();
        item.find(".categorylistitem-editdesc input").val(category_desc);
        item.find(".categorylistitem-desc").hide();
        item.find(".categorylistitem-editdesc").show();

    });
    $("#ui-category-list").find(".fa-times").click(function() {
        var item = $(this).parent().parent().parent();
        item.find(".categorylistitem-editdesc").hide();
        item.find(".categorylistitem-desc").show();
    });

    var refresh_color_select = function(element) {
        $(element).css("background-color",$(element).val());
    }

    $(".category-color-picker").each(function(){
        refresh_color_select($(this));
    });
}

function openFileForum(directory, file, path ){
    var url = buildUrl({'component': 'misc', 'page': 'display_file', 'dir': directory, 'file': file, 'path': path});
    window.open(url,"_blank","toolbar=no,scrollbars=yes,resizable=yes, width=700, height=600");
}

function checkForumFileExtensions(files){
    var count = 0;
    for(var i = 0; i < files.length; i++){
        var extension = getFileExtension(files[i].name);
        if(extension == "gif" || extension == "png" || extension == "jpg" || extension == "jpeg" || extension == "bmp"){
            count++;
        }
    } return count == files.length;
}

function resetForumFileUploadAfterError(displayPostId){
    $('#file_name' + displayPostId).html('');
    document.getElementById('file_input_label' + displayPostId).style.border = "2px solid red";
    document.getElementById('file_input' + displayPostId).value = null;
}

function checkNumFilesForumUpload(input, post_id){
    var displayPostId = (typeof post_id !== "undefined") ? "_" + escape(post_id) : "";
    if(input.files.length > 5){
        displayError('Max file upload size is 5. Please try again.');
        resetForumFileUploadAfterError(displayPostId);
    } else {
        if(!checkForumFileExtensions(input.files)){
            displayError('Invalid file type. Please upload only image files. (PNG, JPG, GIF, BMP...)');
            resetForumFileUploadAfterError(displayPostId);
            return;
        }
        $('#file_name' + displayPostId).html('<p style="display:inline-block;">' + input.files.length + ' files selected.</p>');
        $('#messages').fadeOut();
        document.getElementById('file_input_label' + displayPostId).style.border = "";
    }
}

function testAndGetAttachments(post_box_id, dynamic_check) {
    var index = post_box_id - 1;
    // Files selected
    var files = [];
    for (var j = 0; j < file_array[index].length; j++) {
        if (file_array[index][j].name.indexOf("'") != -1 ||
            file_array[index][j].name.indexOf("\"") != -1) {
            alert("ERROR! You may not use quotes in your filename: " + file_array[index][j].name);
            return false;
        }
        else if (file_array[index][j].name.indexOf("\\\\") != -1 ||
            file_array[index][j].name.indexOf("/") != -1) {
            alert("ERROR! You may not use a slash in your filename: " + file_array[index][j].name);
            return false;
        }
        else if (file_array[index][j].name.indexOf("<") != -1 ||
            file_array[index][j].name.indexOf(">") != -1) {
            alert("ERROR! You may not use angle brackets in your filename: " + file_array[index][j].name);
            return false;
        }
        files.push(file_array[index][j]);
    }
    if(files.length > 5){
        if(dynamic_check) {
            displayError('Max file upload size is 5. Please remove attachments accordingly.');
        } else {
            displayError('Max file upload size is 5. Please try again.');
        }
        return false;
    } else {
        if(!checkForumFileExtensions(files)){
            displayError('Invalid file type. Please upload only image files. (PNG, JPG, GIF, BMP...)');
            return false;
        }
    }
    return files;
}

function publishFormWithAttachments(form, test_category, error_message) {
    if(!form[0].checkValidity()) {
        form[0].reportValidity();
        return false;
    }
    if(test_category) {

        if((!form.prop("ignore-cat")) && form.find('.cat-selected').length == 0 && ($('.cat-buttons input').is(":checked") == false)) {
            alert("At least one category must be selected.");
            return false;
        }
    }
    var post_box_id = form.find(".thread-post-form").attr("post_box_id");
    var formData = new FormData(form[0]);

    var files = testAndGetAttachments(post_box_id, false);
    if(files === false) {
        return false;
    }
    for(var i = 0; i < files.length ; i++) {
        formData.append('file_input[]', files[i], files[i].name);
    }
    var submit_url = form.attr('action');

    $.ajax({
        url: submit_url,
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            try {
                var json = JSON.parse(data);

                if(json["error"]) {
                    var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json["error"] + '</div>';
                    $('#messages').append(message);
                    return;
                }

            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            window.location.href = json['next_page'];
        },
        error: function(){
            var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + error_message + '</div>';
            $('#messages').append(message);
            return;
        }
    });
    return false;
}

function createThread() {
    return publishFormWithAttachments($(this), true, "Something went wrong while creating thread. Please try again.");
}

function publishPost() {
    return publishFormWithAttachments($(this), false, "Something went wrong while publishing post. Please try again.");
}

function changeThreadStatus(thread_id) {
    var url = buildUrl({'component': 'forum', 'page': 'change_thread_status_resolve'});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            thread_id: thread_id
        },
        success: function(data) {
            try {
                var json = JSON.parse(data);
            } catch(err) {
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']) {
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            window.location.reload();
            var message ='<div class="inner-message alert alert-success" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-check-circle"></i>Thread marked as resolved.</div>';
            $('#messages').append(message);
        },
        error: function() {
            window.alert('Something went wrong when trying to mark this thread as resolved. Please try again.');
        }
    });
}

function editPost(post_id, thread_id, shouldEditThread, csrf_token) {
    if(!checkAreYouSureForm()) return;
    var form = $("#thread_form");
    var url = buildUrl({'component': 'forum', 'page': 'get_edit_post_content'});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            post_id: post_id,
            thread_id: thread_id,
            csrf_token: csrf_token
        },
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            var post_content = json.post;
            var lines = post_content.split(/\r|\r\n|\n/).length;
            var anon = json.anon;
            var change_anon = json.change_anon;
            var user_id = escapeSpecialChars(json.user);
            var time = Date.parse(json.post_time);
            if(!time) {
                // Timezone suffix ":00" might be missing
                time = Date.parse(json.post_time+":00");
            }
            time = new Date(time);
            var categories_ids = json.categories_ids;
            var date = time.toLocaleDateString();
            time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            var contentBox = form.find("[name=thread_post_content]")[0];
            contentBox.style.height = lines*14;
            var editUserPrompt = document.getElementById('edit_user_prompt');
            editUserPrompt.innerHTML = 'Editing a post by: ' + user_id + ' on ' + date + ' at ' + time;
            contentBox.value = post_content;
            document.getElementById('edit_post_id').value = post_id;
            document.getElementById('edit_thread_id').value = thread_id;
            if(change_anon) {
                $('#thread_post_anon_edit').prop('checked', anon);
            } else {
                $('label[for=Anon]').remove();
                $('#thread_post_anon_edit').remove();
            }
            $('#edit-user-post').css('display', 'block');

            $(".cat-buttons input").prop('checked', false);
            // If first post of thread
            if(shouldEditThread) {
                var thread_title = json.title;
                var thread_lock_date =  json.lock_thread_date;
                var thread_status = json.thread_status;
                $("#title").prop('disabled', false);
                $(".edit_thread").show();
                $('#label_lock_thread').show();
                $("#title").val(thread_title);
                $("#thread_status").val(thread_status);
                $('#lock_thread_date').val(thread_lock_date);
                // Categories
                $(".cat-buttons").removeClass('cat-selected');
                $.each(categories_ids, function(index, category_id) {
                    var cat_input = $(".cat-buttons input[value="+category_id+"]");
                    cat_input.prop('checked', true);
                    cat_input.parent().addClass('cat-selected');
                });
                $(".cat-buttons").trigger("eventChangeCatClass");
                $("#thread_form").prop("ignore-cat",false);
                $("#category-selection-container").show();
                $("#thread_status").show();
            } else {
                $("#title").prop('disabled', true);
                $(".edit_thread").hide();
                $('#label_lock_thread').hide();
                $("#thread_form").prop("ignore-cat",true);
                $("#category-selection-container").hide();
                $("#thread_status").hide();
            }
        },
        error: function(){
            window.alert("Something went wrong while trying to edit the post. Please try again.");
        }
    });
}


function changeDisplayOptions(option, thread_id){
    document.cookie = "forum_display_option=" + option + ";";
    window.location.replace(buildUrl({'component': 'forum', 'page': 'view_thread', 'option': option, 'thread_id': thread_id}));
}

function dynamicScrollLoadPage(element, atEnd) {
    var load_page = $(element).attr(atEnd?"next_page":"prev_page");
    if(load_page == 0) {
        return false;
    }
    if($(element).data("dynamic_lock_load")) {
        return null;
    }
    var load_page_callback;
    var load_page_fail_callback;
    var arrow_up = $(element).find(".fa-caret-up");
    var arrow_down = $(element).find(".fa-caret-down");
    var spinner_up = arrow_up.prev();
    var spinner_down = arrow_down.next();
    $(element).data("dynamic_lock_load", true);
    if(atEnd){
        arrow_down.hide();
        spinner_down.show();
        load_page_callback = function(content, count) {
            spinner_down.hide();
            arrow_down.before(content);
            if(count == 0) {
                // Stop further loads
                $(element).attr("next_page", 0);
            } else {
                $(element).attr("next_page", parseInt(load_page) + 1);
                arrow_down.show();
            }
            dynamicScrollLoadIfScrollVisible($(element));
        };
        load_page_fail_callback = function(content, count) {
            spinner_down.hide();
        };
    }
    else {
        arrow_up.hide();
        spinner_up.show();
        load_page_callback = function(content, count) {
            spinner_up.hide();
            arrow_up.after(content);
            if(count == 0) {
                // Stop further loads
                $(element).attr("prev_page", 0);
            } else {
                var prev_page = parseInt(load_page) - 1;
                $(element).attr("prev_page", prev_page);
                if(prev_page >= 1) {
                    arrow_up.show();
                }
            }
            dynamicScrollLoadIfScrollVisible($(element));
        };
        load_page_fail_callback = function(content, count) {
            spinner_up.hide();
        };
    }

    var urlPattern = $(element).data("urlPattern");
    var currentThreadId = $(element).data("currentThreadId",);
    var currentCategoriesId = $(element).data("currentCategoriesId",);
    var course = $(element).data("course",);

    var next_url = urlPattern.replace("{{#}}", load_page);

    var categories_value = $("#thread_category").val();
    var thread_status_value = $("#thread_status_select").val();
    var unread_select_value = $("#unread").is(':checked');
    categories_value = (categories_value == null)?"":categories_value.join("|");
    thread_status_value = (thread_status_value == null)?"":thread_status_value.join("|");
    $.ajax({
        url: next_url,
        type: "POST",
        data: {
            thread_categories: categories_value,
            thread_status: thread_status_value,
            unread_select: unread_select_value,
            currentThreadId: currentThreadId,
            currentCategoriesId: currentCategoriesId,
        },
        success: function(r){
            var x = JSON.parse(r);
            var content = x.html;
            var count = x.count;
            content = `${content}`;
            $(element).data("dynamic_lock_load", false);
            load_page_callback(content, count);
        },
        error: function(){
            $(element).data("dynamic_lock_load", false);
            load_page_fail_callback();
            window.alert("Something went wrong while trying to load more threads. Please try again.");
        }
    });
    return true;
}

function dynamicScrollLoadIfScrollVisible(jElement) {
    if(jElement[0].scrollHeight <= jElement[0].clientHeight) {
        if(dynamicScrollLoadPage(jElement[0], true) === false) {
            dynamicScrollLoadPage(jElement[0], false);
        }
    }
}

function dynamicScrollContentOnDemand(jElement, urlPattern, currentThreadId, currentCategoriesId, course) {
    jElement.data("urlPattern",urlPattern);
    jElement.data("currentThreadId", currentThreadId);
    jElement.data("currentCategoriesId", currentCategoriesId);
    jElement.data("course", course);

    dynamicScrollLoadIfScrollVisible(jElement);
    $(jElement).scroll(function(){
        var element = $(this)[0];
        var sensitivity = 2;
        var isTop = element.scrollTop < sensitivity;
        var isBottom = (element.scrollHeight - element.offsetHeight - element.scrollTop) < sensitivity;
        if(isTop) {
            element.scrollTop = sensitivity;
            dynamicScrollLoadPage(element,false);
        } else if(isBottom) {
            dynamicScrollLoadPage(element,true);
        }

    });
}

function resetScrollPosition(id){
    if(sessionStorage.getItem(id+"_scrollTop") != 0) {
        sessionStorage.setItem(id+"_scrollTop", 0);
    }
}

function saveScrollLocationOnRefresh(id){
    var element = document.getElementById(id);
    $(element).scroll(function() {
        sessionStorage.setItem(id+"_scrollTop", $(element).scrollTop());
    });
    $(document).ready(function() {
        if(sessionStorage.getItem(id+"_scrollTop") !== null){
            $(element).scrollTop(sessionStorage.getItem(id+"_scrollTop"));
        }
    });
}

function checkAreYouSureForm() {
    var elements = $('form');
    if(elements.hasClass('dirty')) {
        if(confirm("You have unsaved changes! Do you want to continue?")) {
            elements.trigger('reinitialize.areYouSure');
            return true;
        } else {
            return false;
        }
    }
    return true;
}

function alterShowDeletedStatus(newStatus) {
    if(!checkAreYouSureForm()) return;
    document.cookie = "show_deleted=" + newStatus + "; path=/;";
    location.reload();
}

function alterShowMergeThreadStatus(newStatus, course) {
    if(!checkAreYouSureForm()) return;
    document.cookie = course + "_show_merged_thread=" + newStatus + "; path=/;";
    location.reload();
}

function modifyThreadList(currentThreadId, currentCategoriesId, course, loadFirstPage, success_callback){
    var categories_value = $("#thread_category").val();
    var thread_status_value = $("#thread_status_select").val();
    var unread_select_value = $("#unread").is(':checked');
    categories_value = (categories_value == null)?"":categories_value.join("|");
    thread_status_value = (thread_status_value == null)?"":thread_status_value.join("|");
    document.cookie = course + "_forum_categories=" + categories_value + ";";
    document.cookie = "forum_thread_status=" + thread_status_value + ";";
    document.cookie = "unread_select_value=" + unread_select_value + ";";
    var url = buildUrl({'component': 'forum', 'page': 'get_threads', 'page_number': (loadFirstPage?'1':'-1')});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            thread_categories: categories_value,
            thread_status: thread_status_value,
            unread_select: unread_select_value,
            currentThreadId: currentThreadId,
            currentCategoriesId: currentCategoriesId,
        },
        success: function(r){
            var x = JSON.parse(r);
            var page_number = parseInt(x.page_number);
            x = x.html;
            x = `${x}`;
            var jElement = $("#thread_list");
            jElement.children(":not(.fas)").remove();
            $("#thread_list .fa-caret-up").after(x);
            jElement.attr("prev_page", page_number - 1);
            jElement.attr("next_page", page_number + 1);
            jElement.data("dynamic_lock_load", false);
            $("#thread_list .fa-spinner").hide();
            if(loadFirstPage) {
                $("#thread_list .fa-caret-up").hide();
                $("#thread_list .fa-caret-down").show();
            } else {
                $("#thread_list .fa-caret-up").show();
                $("#thread_list .fa-caret-down").hide();
            }
            dynamicScrollLoadIfScrollVisible(jElement);
            if(success_callback != null) {
                success_callback();
            }
        },
        error: function(){
            window.alert("Something went wrong when trying to filter. Please try again.");
            document.cookie = course + "_forum_categories=;";
            document.cookie = "forum_thread_status=;";
        }
    })
}

function replyPost(post_id){
    if ( $('#'+ post_id + '-reply').css('display') == 'block' ){
        $('#'+ post_id + '-reply').css("display","none");
    } else {
        hideReplies();
        $('#'+ post_id + '-reply').css('display', 'block');
    }
}

function generateCodeMirrorBlocks(container_element) {
    var codeSegments = container_element.querySelectorAll(".code");
    for (let element of codeSegments){
        var editor0 = CodeMirror.fromTextArea(element, {
            lineNumbers: true,
            readOnly: true,
            cursorHeight: 0.0,
            lineWrapping: true
        });

        var lineCount = editor0.lineCount();
        if (lineCount == 1) {
            editor0.setSize("100%", (editor0.defaultTextHeight() * 2) + "px");
        } else {
            //Default height for CodeMirror is 300px... 500px looks good
            var h = (editor0.defaultTextHeight()) * lineCount + 15;
            editor0.setSize("100%", (h > 500 ? 500 : h) + "px");
        }

        editor0.setOption("theme", "eclipse");
        editor0.refresh();

    }
}

function showHistory(post_id) {
    var url = buildUrl({'component': 'forum', 'page': 'get_history'});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            post_id: post_id
        },
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            $("#popup-post-history").show();
            $("#popup-post-history .post_box.history_box").remove();
            $("#popup-post-history .form-body").css("padding", "5px");
            var dummy_box = $($("#popup-post-history .post_box")[0]);
            for(var i = json.length - 1 ; i >= 0 ; i -= 1) {
                var post = json[i];
                box = dummy_box.clone();
                box.show();
                box.addClass("history_box");
                box.find(".post_content").html(post['content']);
                if(post.is_staff_post) {
                    box.addClass("important");
                }

                var first_name = post['user_info']['first_name'].trim();
                var last_name = post['user_info']['last_name'].trim();
                var author_user_id = post['user'];
                var visible_username = first_name + " " + ((last_name.length == 0) ? '' : (last_name.substr(0 , 1) + "."));
                var info_name = first_name + " " + last_name + " (" + author_user_id + ")";
                var visible_user_json = JSON.stringify(visible_username);
                info_name = JSON.stringify(info_name);
                var user_button_code = "<a style='margin-right:2px;display:inline-block; color:black;' onClick='changeName(this.parentNode, " + info_name + ", " + visible_user_json + ", false)' title='Show full user information'><i class='fas fa-eye' aria-hidden='true'></i></a>&nbsp;";
                box.find("h7").html("<strong>"+visible_username+"</strong> "+post['post_time']);
                box.find("h7").before(user_button_code);
                $("#popup-post-history .form-body").prepend(box);
            }
            generateCodeMirrorBlocks($("#popup-post-history")[0]);
        },
        error: function(){
            window.alert("Something went wrong while trying to display post history. Please try again.");
        }
    });
}

function addNewCategory(csrf_token){
    var newCategory = $("#new_category_text").val();
    var url = buildUrl({'component': 'forum', 'page': 'add_category'});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            newCategory: newCategory,
            csrf_token: csrf_token
        },
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            var message ='<div class="inner-message alert alert-success" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-check-circle"></i>Successfully created category "'+ escapeSpecialChars(newCategory) +'".</div>';
            $('#messages').append(message);
            $('#new_category_text').val("");
            // Create new item in #ui-category-list using dummy category
            var category_id = json['new_id'];
            var category_color_code = "#000080";
            var category_desc = escapeSpecialChars(newCategory);
            newelement = $($('#ui-category-list li')[0]).clone(true);
            newelement.attr('id',"categorylistitem-"+category_id);
            newelement.css('color',category_color_code);
            newelement.find(".categorylistitem-desc span").text(category_desc);
            newelement.find(".category-color-picker").val(category_color_code);
            newelement.show();
            newelement.addClass("category-sortable");
            newcatcolorpicker = newelement.find(".category-color-picker");
            newcatcolorpicker.css("background-color",newcatcolorpicker.val());
            $('#ui-category-list').append(newelement);
            $(".category-list-no-element").hide();
            refreshCategories();
        },
        error: function(){
            window.alert("Something went wrong while trying to add a new category. Please try again.");
        }
    })
}

function deleteCategory(category_id, category_desc, csrf_token){
    var url = buildUrl({'component': 'forum', 'page': 'delete_category'});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            deleteCategory: category_id,
            csrf_token: csrf_token
        },
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            var message ='<div class="inner-message alert alert-success" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-check-circle"></i>Successfully deleted category "'+ escapeSpecialChars(category_desc) +'"</div>';
            $('#messages').append(message);
            $('#categorylistitem-'+category_id).remove();
            refreshCategories();
        },
        error: function(){
            window.alert("Something went wrong while trying to add a new category. Please try again.");
        }
    })
}

function editCategory(category_id, category_desc, category_color, csrf_token) {
    if(category_desc === null && category_color === null) {
        return;
    }
    var data = {category_id: category_id, csrf_token: csrf_token};
    if(category_desc !== null) {
        data['category_desc'] = category_desc;
    }
    if(category_color !== null) {
        data['category_color'] = category_color;
    }
    var url = buildUrl({'component': 'forum', 'page': 'edit_category'});
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            var message ='<div class="inner-message alert alert-success" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-check-circle"></i>Successfully updated!</div>';
            $('#messages').append(message);
            setTimeout(function() {removeMessagePopup('theid');}, 1000);
            if(category_color !== null) {
                $("#categorylistitem-"+category_id).css("color",category_color);
            }
            if(category_desc !== null) {
                $("#categorylistitem-"+category_id).find(".categorylistitem-desc span").text(category_desc);
            }
            refreshCategories();
        },
        error: function(){
            window.alert("Something went wrong while trying to add a new category. Please try again.");
        }
    });
}

function refreshCategories() {
    if($('#ui-category-list').length) {
        // Refresh cat-buttons from #ui-category-list

        var data = $('#ui-category-list').sortable('serialize');
        if(!data.trim()) {
            return;
        }
        data = data.split("&");
        var order = [];
        for(var i = 0; i<data.length; i+=1) {
            var category_id = parseInt(data[i].split('=')[1]);
            var category_desc = $("#categorylistitem-"+category_id+" .categorylistitem-desc span").text().trim();
            var category_color = $("#categorylistitem-"+category_id+" select").val();
            order.push([category_id, category_desc, category_color]);
        }

        // Obtain current selected category
        var selected_button = new Set();
        var category_pick_buttons = $('.cat-buttons');
        for(var i = 0; i<category_pick_buttons.length; i+=1) {
            var cat_button_checkbox = $(category_pick_buttons[i]).find("input");
            var category_id = parseInt(cat_button_checkbox.val());
            if(cat_button_checkbox.prop("checked")) {
                selected_button.add(category_id);
            }
        }

        // Refresh selected categories
        $('#categories-pick-list').empty();
        order.forEach(function(category) {
            var category_id = category[0];
            var category_desc = category[1];
            var category_color = category[2];
            var selection_class = "";
            if(selected_button.has(category_id)) {
                selection_class = "cat-selected";
            }
            var element = ' <a class="btn cat-buttons '+selection_class+'" cat-color="'+category_color+'">'+category_desc+'\
                                <input type="checkbox" name="cat[]" value="'+category_id+'">\
                            </a>';
            $('#categories-pick-list').append(element);
        });

        $(".cat-buttons input[type='checkbox']").each(function() {
            if($(this).parent().hasClass("cat-selected")) {
                $(this).prop("checked",true);
            }
        });
    }

    // Selectors for categories pick up
    // If JS enabled hide checkbox
    $("a.cat-buttons input").hide();

    $(".cat-buttons").click(function() {
        if($(this).hasClass("cat-selected")) {
            $(this).removeClass("cat-selected");
            $(this).find("input[type='checkbox']").prop("checked", false);
        } else {
            $(this).addClass("cat-selected");
            $(this).find("input[type='checkbox']").prop("checked", true);
        }
        $(this).trigger("eventChangeCatClass");
    });

    $(".cat-buttons").bind("eventChangeCatClass", function(){
        var cat_color = $(this).attr('cat-color');
        $(this).css("border-color",cat_color);
        if($(this).hasClass("cat-selected")) {
            $(this).css("background-color",cat_color);
            $(this).css("color","white");
        } else {
            $(this).css("background-color","white");
            $(this).css("color",cat_color);
        }
    });
    $(".cat-buttons").trigger("eventChangeCatClass");
}

function reorderCategories(){
    var data = $('#ui-category-list').sortable('serialize');
    var url = buildUrl({'component': 'forum', 'page': 'reorder_categories'});
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        success: function(data){
            try {
                var json = JSON.parse(data);
            } catch (err){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                $('#messages').append(message);
                return;
            }
            if(json['error']){
                var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                $('#messages').append(message);
                return;
            }
            var message ='<div class="inner-message alert alert-success" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-check-circle"></i>Successfully reordered categories.';
            $('#messages').append(message);
            setTimeout(function() {removeMessagePopup('theid');}, 1000);
            refreshCategories();
        },
        error: function(){
            window.alert("Something went wrong while trying to reordering categories. Please try again.");
        }
    });
}

/*This function ensures that only one reply box is open at a time*/
function hideReplies(){
    var hide_replies = document.getElementsByClassName("reply-box");
    for(var i = 0; i < hide_replies.length; i++){
        hide_replies[i].style.display = "none";
    }
}

/*This function makes sure that only posts with children will have the collapse function*/
function addCollapsable(){
    var posts = $(".post_box").toArray();
    for(var i = 1; i < posts.length; i++){
        if(parseInt($(posts[i]).next().next().attr("reply-level")) > parseInt($(posts[i]).attr("reply-level"))){
            $(posts[i]).find(".expand")[0].innerHTML = "Hide Replies";
        } else {
            var button = $(posts[i]).find(".expand")[0];
            $(button).hide();
        }
    }
}

function hidePosts(text, id) {
    var currentLevel = parseInt($(text).parent().parent().attr("reply-level")); //The double parent is here because the button is in a span, which is a child of the main post.
    var selector = $(text).parent().parent().next().next();
    var counter = 0;
    var parent_status = "Hide Replies";``
    if (text.innerHTML != "Hide Replies") {
        text.innerHTML = "Hide Replies";
        while (selector.attr("reply-level") > currentLevel) {
            $(selector).show();
            if($(selector).find(".expand")[0].innerHTML != "Hide Replies"){
                var nextLvl = parseInt($(selector).next().next().attr("reply-level"));
                while(nextLvl > (currentLevel+1)){
                    selector = $(selector).next().next();
                    nextLvl = $(selector).next().next().attr("reply-level");
                }
            }
            selector = $(selector).next().next();
        }

    } else {
        while (selector.attr("reply-level") > currentLevel) {
            $(selector).hide();
            selector = $(selector).next().next();
            counter++;
        }
        if(counter != 0){
            text.innerHTML = "Show " + ((counter > 1) ? (counter + " Replies") : "Reply");
        } else {
            text.innerHTML = "Hide Replies";
        }
    }

}

function deletePostToggle(isDeletion, thread_id, post_id, author, time, csrf_token){
    if(!checkAreYouSureForm()) return;
    var page = (isDeletion?"delete_post":"undelete_post");
    var message = (isDeletion?"delete":"undelete");

    var confirm = window.confirm("Are you sure you would like to " + message + " this post?: \n\nWritten by:  " + author + "  @  " + time + "\n\nPlease note: The replies to this comment will also be " + message + "d. \n\nIf you are " + message + " the first post in a thread this will " + message + " the entire thread.");
    if(confirm){
        var url = buildUrl({'component': 'forum', 'page': page});
        $.ajax({
            url: url,
            type: "POST",
            data: {
                post_id: post_id,
                thread_id: thread_id,
                csrf_token: csrf_token
            },
            success: function(data){
                try {
                    var json = JSON.parse(data);
                } catch (err){
                    var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                    $('#messages').append(message);
                    return;
                }
                if(json['error']){
                    var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                    $('#messages').append(message);
                    return;
                }
                var new_url = "";
                switch(json['type']){
                    case "thread":
                    default:
                        new_url = buildUrl({'component': 'forum', 'page': 'view_thread'});
                        break;

                    case "post":
                        new_url = buildUrl({'component': 'forum', 'page': 'view_thread', 'thread_id': thread_id});
                        break;
                }
                window.location.replace(new_url);
            },
            error: function(){
                window.alert("Something went wrong while trying to delete/undelete a post. Please try again.");
            }
        })
    }
}

function alterAnnouncement(thread_id, confirmString, url, csrf_token){
    var confirm = window.confirm(confirmString);
    if(confirm){
        var url = buildUrl({'component': 'forum', 'page': url});
        $.ajax({
            url: url,
            type: "POST",
            data: {
                thread_id: thread_id,
                csrf_token: csrf_token

            },
            success: function(data){
                window.location.replace(buildUrl({'component': 'forum', 'page': 'view_thread', 'thread_id': thread_id}));
            },
            error: function(){
                window.alert("Something went wrong while trying to remove announcement. Please try again.");
            }
        })
    }
}

function pinThread(thread_id, url){
    var url = buildUrl({'component': 'forum', 'page': url});
    $.ajax({
        url: url,
        type: "POST",
        data: {
            thread_id: thread_id
        },
        success: function(data){
            window.location.replace(buildUrl({'component': 'forum', 'page': 'view_thread', 'thread_id': thread_id}));
        },
        error: function(){
            window.alert("Something went wrong while trying on pin/unpin thread. Please try again.");
        }
    });
}


function addMarkdownCode(type, divTitle){
    var cursor = $(divTitle).prop('selectionStart');
    var text = $(divTitle).val();
    var insert = "";
    if(type == 1) {
        insert = "[display text](url)";
    } else if(type == 0){
        insert = "```language" +
            "\ncode\n```";
    }
    $(divTitle).val(text.substring(0, cursor) + insert + text.substring(cursor));
}

function checkInputMaxLength(obj){
    if($(obj).val().length == $(obj).attr('maxLength')){
        alert('Maximum input length reached!');
        $(obj).val($(obj).val().substr(0, $(obj).val().length));
    }
}

function sortTable(sort_element_index, reverse=false){
    var table = document.getElementById("forum_stats_table");
    var switching = true;
    while(switching){
        switching=false;
        var rows = table.getElementsByTagName("TBODY");
        for(var i=1;i<rows.length-1;i++){

            var a = rows[i].getElementsByTagName("TR")[0].getElementsByTagName("TD")[sort_element_index];
            var b = rows[i+1].getElementsByTagName("TR")[0].getElementsByTagName("TD")[sort_element_index];
            if (reverse){
                if (sort_element_index == 0 ? a.innerHTML<b.innerHTML : parseInt(a.innerHTML) > parseInt(b.innerHTML)){
                    rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
                    switching=true;
                }
            } else {
                if(sort_element_index == 0 ? a.innerHTML>b.innerHTML : parseInt(a.innerHTML) < parseInt(b.innerHTML)){
                    rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
                    switching=true;
                }
            }
        }

    }

    var row0 = table.getElementsByTagName("TBODY")[0].getElementsByTagName("TR")[0];
    var headers = row0.getElementsByTagName("TD");

    for(var i = 0;i<headers.length;i++){
        var index = headers[i].innerHTML.indexOf(' ↓');
        var reverse_index = headers[i].innerHTML.indexOf(' ↑');

        if(index > -1 || reverse_index > -1){
            headers[i].innerHTML = headers[i].innerHTML.slice(0, -2);
        }
    }
    if (reverse) {
        headers[sort_element_index].innerHTML = headers[sort_element_index].innerHTML + ' ↑';
    } else {
        headers[sort_element_index].innerHTML = headers[sort_element_index].innerHTML + ' ↓';
    }
}

function loadThreadHandler(){
    $("a.thread_box_link").click(function(event){
        event.preventDefault();
        var obj = this;

        var thread_id = $(obj).attr("data");

        var url = buildUrl({'component': 'forum', 'page': 'view_thread'}) + "&thread_id=" + thread_id;
        $.ajax({
            url: url,
            type: "POST",
            data: {
                thread_id: thread_id,
                ajax: "true"
            },
            success: function(data){
                try {
                    var json = JSON.parse(data);
                } catch (err){
                    var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>Error parsing data. Please try again.</div>';
                    $('#messages').append(message);
                    return;
                }
                if(json['error']){
                    var message ='<div class="inner-message alert alert-error" style="position: fixed;top: 40px;left: 50%;width: 40%;margin-left: -20%;" id="theid"><a class="fas fa-times message-close" onClick="removeMessagePopup(\'theid\');"></a><i class="fas fa-times-circle"></i>' + json['error'] + '</div>';
                    $('#messages').append(message);
                    return;
                }

                $('.thread_box').removeClass('active');

                $(obj).children("div.thread_box").addClass('active');

                $('#posts_list').empty().html(JSON.parse(json.data.html));
                window.history.pushState({"pageTitle":document.title},"", url);

                enableTabsInTextArea('.post_content_reply');
                saveScrollLocationOnRefresh('posts_list');
                addCollapsable();

                $(".post_reply_from").submit(publishPost);

            },
            error: function(){
                window.alert("Something went wrong while trying to display thread details. Please try again.");
            }
        });
    });
}